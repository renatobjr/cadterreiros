import {
  ECensusStep,
  EReligiousSpaceStatus,
  ICommunityAddress,
  IGeoLocation,
  IReligiousCommunity,
  ReligiousCommunity,
} from "@/api/schemas/ReligiousCommunity";
import { ApiResponseType } from "@/api/@types/responsesTypes";
import { geocodeAddress } from "../configs/geocoder";
import { PipelineStage, Types } from "mongoose";
import { ERole, IUser, User } from "../schemas/User";
import fileUtils from "../utils/file.utils";
import fs from "fs";
import mailUtils from "../utils/mail.utils";
import { EMailTypes } from "../enum/EmailTYpes.enum";

type searchType = {
  search: string;
  censusStep?: ECensusStep;
};

interface SearchCondition {
  [key: string]: any;
}

export interface NationStats {
  nation: string;
  count: number;
}

export interface CityStats {
  city: string;
  count: number;
}

export interface DecadeStats {
  decade: string;
  count: number;
}

export interface TypeByNationStats {
  nation: string;
  african: number;
  traditional: number;
}

export interface TypeStats {
  type: string;
  count: number;
}

export interface GenderStats {
  gender: string;
  count: number;
}

export interface EthnicityStats {
  ethnicity: string;
  count: number;
}

export interface LanguageStats {
  language: string;
  count: number;
}

export interface NeighborhoodStats {
  neighborhood: string;
  count: number;
}

export interface PhotoCoverageStats {
  withPhoto: number;
  withoutPhoto: number;
  total: number;
}

export interface CensusStepStats {
  approved: number;
  pending: number;
  rejected: number;
  total: number;
}

export interface SpaceStatusStats {
  active: number;
  inactive: number;
  total: number;
}

export interface EducationalLevelStats {
  educationalLevel: string;
  count: number;
}

export interface BioCoverageStats {
  withBio: number;
  withoutBio: number;
  total: number;
}

export interface VoluntaryRegistrationStats {
  registeredVoluntarily: number;
  notRegisteredVoluntarily: number;
  total: number;
}

type AggregatedCount = {
  _id: unknown;
  count: number;
};

/** Filtro base de todos os stats públicos: apenas censo aprovado. */
const approvedMatch: PipelineStage = {
  $match: { censusStep: ECensusStep.APPROVED },
};

const TOP_NEIGHBORHOODS = 10;

/** Pipeline padrão de contagem por um único campo, sem buckets vazios. */
const groupCountByField = (field: string): PipelineStage[] => [
  approvedMatch,
  { $group: { _id: `$${field}`, count: { $sum: 1 } } },
  { $match: { _id: { $nin: [null, ""] } } },
  { $sort: { count: -1, _id: 1 } },
];

/**
 * Contagem por campo considerando todos os registros (sem filtro de censo).
 * Usada apenas pelas agregações administrativas.
 */
const groupCountAllByField = (field: string): PipelineStage[] => [
  { $group: { _id: `$${field}`, count: { $sum: 1 } } },
  { $match: { _id: { $nin: [null, ""] } } },
  { $sort: { count: -1, _id: 1 } },
];

/** Situação do espaço com fallback para o default do schema (`active`). */
const spaceStatusValue = {
  $ifNull: ["$religiousSpaceStatus", EReligiousSpaceStatus.ACTIVE],
};

/** Coordenadas úteis: números finitos e que não sejam o par 0,0. */
const hasUsefulCoordinates = (
  localization?: Partial<IGeoLocation> | null
): localization is IGeoLocation => {
  const lat = Number(localization?.lat);
  const long = Number(localization?.long);
  return (
    Number.isFinite(lat) &&
    Number.isFinite(long) &&
    !(lat === 0 && long === 0)
  );
};

/** Endereço usado no geocoding: endereço completo ou "bairro, cidade, PB". */
const geocodingQuery = (address?: Partial<ICommunityAddress>): string => {
  const fullAddress = address?.fullAddress?.trim();
  if (fullAddress) return fullAddress;

  const parts = [address?.neighborhood, address?.city]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean);

  if (parts.length === 0) return "";

  return [...parts, "PB"].join(", ");
};

/**
 * Localização enviada pelo cliente ou, na ausência dela, geocodificada
 * pelo Nominatim. Sem coordenadas válidas, grava 0,0.
 */
const resolveLocalization = async (
  community: Partial<IReligiousCommunity>
): Promise<IGeoLocation> => {
  const given = community.communityGoogleApiLocalization;

  if (hasUsefulCoordinates(given)) {
    return { lat: Number(given.lat), long: Number(given.long) };
  }

  const query = geocodingQuery(community.communityAddress);
  if (!query) return { lat: 0, long: 0 };

  const geocoded = await geocodeAddress(query);

  return geocoded ?? { lat: 0, long: 0 };
};

/** Quem executou a decisão (vem do `isAuth`). */
export interface DecisionActor {
  id?: string | null;
  fullname?: string | null;
}

/** Entrada de auditoria — mantém no máximo 50 decisões por cadastro. */
export function buildDecisionEntry(
  action: string,
  actor?: DecisionActor,
  reason?: string
) {
  return {
    action,
    byId: actor?.id ?? null,
    byName: actor?.fullname ?? null,
    at: new Date(),
    ...(reason ? { reason } : {}),
  };
}

const decisionPush = (
  action: string,
  actor?: DecisionActor,
  reason?: string
) => ({
  decisionLog: {
    $each: [buildDecisionEntry(action, actor, reason)],
    $slice: -50,
  },
});

export const religiousCommunityService = {
  /**
   * Um registro só pode ser editado pelo admin ou pelo recenseador dono dele.
   * Recenseadores podem *ver* todos (list/detail), mas não alterar de terceiros.
   */
  canUserEdit: async (
    id: string,
    userId: string,
    role: string
  ): Promise<boolean> => {
    if (role === ERole.ADMIN) return true;

    try {
      const record = await ReligiousCommunity.findById(id).select(
        "censusTaker"
      );
      if (!record) return false;
      return String(record.censusTaker ?? "") === String(userId);
    } catch {
      return false;
    }
  },

  createReligiousCommunity: async (
    religiousCommunity: Partial<IReligiousCommunity>,
    userId: string
  ): Promise<ApiResponseType<IReligiousCommunity>> => {
    try {
      religiousCommunity.censusTaker = new Types.ObjectId(userId);
      religiousCommunity.censusStep = ECensusStep.PENDING;

      const createdCommunity = await ReligiousCommunity.create(
        religiousCommunity
      );

      const user = await User.findById(userId);
      const adminUsers = await User.find({
        role: ERole.ADMIN,
      });

      const html = await mailUtils.template({
        type: EMailTypes.ADD_COMMUNITY,
        data: {
          communityName: createdCommunity.religiousSpaceName,
          censusTaker: user?.fullname ?? user?.email,
          fullAddress: createdCommunity.communityAddress.fullAddress,
        },
      });

      const mappedAdmins = adminUsers.map((user) => {
        return {
          address: user.email,
        };
      });

      void mailUtils
        .sendMail({
          to: mappedAdmins,
          subject: "Nova comunidade aguardando análise",
          html: html,
        })
        .catch((error: any) => {
          console.error(
            "[✖] Falha ao enviar e-mail:",
            error?.message ?? error
          );
        });

      return {
        data: createdCommunity,
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  createPublicReligiousCommunity: async (
    religiousCommunity: Partial<IReligiousCommunity>
  ): Promise<ApiResponseType<IReligiousCommunity>> => {
    try {
      const createdCommunity = await ReligiousCommunity.create({
        ...religiousCommunity,
        communityGoogleApiLocalization: await resolveLocalization(
          religiousCommunity
        ),
        censusTaker: null,
        censusStep: ECensusStep.PENDING,
        registeredVoluntarily: true,
      });

      return {
        data: createdCommunity,
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  updateReligiousCommunity: async (
    communityId: string,
    religiousCommunity: Partial<IReligiousCommunity>
  ) => {
    try {
      const community = await ReligiousCommunity.findById(communityId);

      if (!community) {
        return {
          error: "Religious Community not found",
          status: false,
        };
      }

      religiousCommunity.censusStep = ECensusStep.PENDING;

      const parts = [
        religiousCommunity.communityAddress?.street,
        religiousCommunity.communityAddress?.number,
        religiousCommunity.communityAddress?.neighborhood,
        religiousCommunity.communityAddress?.city,
        religiousCommunity.communityAddress?.state,
        religiousCommunity.communityAddress?.zipcode,
      ];

      religiousCommunity.communityAddress = {
        ...religiousCommunity.communityAddress,
        fullAddress: parts.join(" - "),
      } as ICommunityAddress;

      await community.updateOne(religiousCommunity);

      const user = await User.findById(community.censusTaker);
      const adminUsers = await User.find({
        role: ERole.ADMIN,
      });

      const html = await mailUtils.template({
        type: EMailTypes.UPDATE_COMMUNITY,
        data: {
          communityName: community.religiousSpaceName,
          censusTaker: user?.fullname ?? user?.email,
          fullAddress: community.communityAddress.fullAddress,
        },
      });

      const mappedAdmins = adminUsers.map((user) => {
        return {
          address: user.email,
        };
      });

      void mailUtils
        .sendMail({
          to: mappedAdmins,
          subject: "Cadastro atualizado — aguardando análise",
          html: html,
        })
        .catch((error: any) => {
          console.error(
            "[✖] Falha ao enviar e-mail:",
            error?.message ?? error
          );
        });

      return {
        data: community,
        status: true,
      };
    } catch (error) {
      return {
        error: error,
        status: false,
      };
    }
  },

  list: async (
    options: searchType
  ): Promise<ApiResponseType<IReligiousCommunity[]>> => {
    try {
      let searchTerm = {};

      if (options.search) {
        const searchValue = options.search.trim();
        const isYear = /^\d{4}$/.test(searchValue);

        const orConditions: SearchCondition[] = [
          { religiousSpaceName: { $regex: searchValue, $options: "i" } },
          {
            "communityAddress.neighborhood": {
              $regex: searchValue,
              $options: "i",
            },
          },
          {
            "communityAddress.city": {
              $regex: searchValue,
              $options: "i",
            },
          },
          {
            religiousSpaceNation: {
              $regex: searchValue,
              $options: "i",
            },
          },
          {
            communityType: {
              $regex: searchValue,
              $options: "i",
            },
          },
        ];

        if (isYear) {
          orConditions.push({
            religiousSpaceYearFoundation: parseInt(searchValue, 10),
          });
        }

        const user = await User.findOne({
          fullname: { $regex: searchValue, $options: "i" },
        });

        if (user) {
          orConditions.push({ censusTaker: user._id });
        }

        searchTerm = { $or: orConditions };
      }

      if (options.censusStep !== undefined) {
        if (Object.keys(searchTerm).length === 0) {
          searchTerm = { censusStep: options.censusStep };
        } else {
          searchTerm = {
            $and: [searchTerm, { censusStep: options.censusStep }],
          };
        }
      }

      const religiousCommunities = await ReligiousCommunity.aggregate([
        {
          $match: searchTerm,
        },
        {
          $lookup: {
            from: "users",
            localField: "censusTaker",
            foreignField: "_id",
            as: "censusTaker",
          },
        },
        {
          $unwind: { path: "$censusTaker", preserveNullAndEmptyArrays: true },
        },
      ]);

      return {
        data: religiousCommunities,
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  getOldest: async (): Promise<ApiResponseType<IReligiousCommunity[]>> => {
    try {
      const oldestCommunities = await ReligiousCommunity.aggregate([
        { $match: { censusStep: ECensusStep.APPROVED } },
        { $sort: { religiousSpaceYearFoundation: 1, religiousSpaceName: 1 } },
        { $limit: 9 },
      ]);

      return {
        data: oldestCommunities,
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  /**
   * Totais públicos do mapeamento.
   * Conta apenas comunidades com censo aprovado.
   */
  getStatsSummary: async (): Promise<
    ApiResponseType<{
      totalReligiousCommunities: number;
      totalCities: number;
      totalNeighborhoods: number;
    }>
  > => {
    try {
      const countApproved = async (field?: string): Promise<number> => {
        const match: Record<string, unknown> = {
          censusStep: ECensusStep.APPROVED,
        };

        if (field) {
          match[field] = { $nin: [null, ""] };
        }

        const pipeline: PipelineStage[] = [
          { $match: match } as PipelineStage,
        ];

        if (field) {
          pipeline.push({ $group: { _id: `$${field}` } });
        }

        pipeline.push({ $count: "total" });

        const result = await ReligiousCommunity.aggregate(pipeline);

        return result[0]?.total ?? 0;
      };

      const [totalReligiousCommunities, totalCities, totalNeighborhoods] =
        await Promise.all([
          countApproved(),
          countApproved("communityAddress.city"),
          countApproved("communityAddress.neighborhood"),
        ]);

      return {
        data: {
          totalReligiousCommunities,
          totalCities,
          totalNeighborhoods,
        },
        status: true,
      };
    } catch (error: any) {
      console.log(error);
      return {
        error: error,
        status: false,
      };
    }
  },

  /** Contagem de comunidades aprovadas por nação. */
  getStatsByNation: async (): Promise<ApiResponseType<NationStats[]>> => {
    try {
      const rows = (await ReligiousCommunity.aggregate(
        groupCountByField("religiousSpaceNation")
      )) as AggregatedCount[];

      return {
        data: rows.map((row) => ({
          nation: String(row._id),
          count: row.count ?? 0,
        })),
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  /** Contagem de comunidades aprovadas por cidade. */
  getStatsByCity: async (): Promise<ApiResponseType<CityStats[]>> => {
    try {
      const rows = (await ReligiousCommunity.aggregate(
        groupCountByField("communityAddress.city")
      )) as AggregatedCount[];

      return {
        data: rows.map((row) => ({
          city: String(row._id),
          count: row.count ?? 0,
        })),
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  /**
   * Contagem de comunidades aprovadas por década de fundação.
   * Anos implausíveis (< 1000 ou > 2100) ficam fora, como no mapeamento público.
   */
  getStatsByDecade: async (): Promise<ApiResponseType<DecadeStats[]>> => {
    try {
      const rows = (await ReligiousCommunity.aggregate([
        {
          $match: {
            censusStep: ECensusStep.APPROVED,
            religiousSpaceYearFoundation: { $gte: 1000, $lte: 2100 },
          },
        },
        {
          $group: {
            _id: {
              $multiply: [
                { $floor: { $divide: ["$religiousSpaceYearFoundation", 10] } },
                10,
              ],
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])) as AggregatedCount[];

      return {
        data: rows.map((row) => ({
          decade: `${Number(row._id)}s`,
          count: row.count ?? 0,
        })),
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  /** Contagem de comunidades aprovadas por tipo × nação. */
  getStatsByTypeAndNation: async (): Promise<
    ApiResponseType<TypeByNationStats[]>
  > => {
    try {
      const rows = (await ReligiousCommunity.aggregate([
        approvedMatch,
        {
          $group: {
            _id: "$religiousSpaceNation",
            african: {
              $sum: {
                $cond: [{ $eq: ["$communityType", "matriz africana"] }, 1, 0],
              },
            },
            traditional: {
              $sum: {
                $cond: [
                  { $eq: ["$communityType", "comunidade de terreiro"] },
                  1,
                  0,
                ],
              },
            },
            total: { $sum: 1 },
          },
        },
        { $match: { _id: { $nin: [null, ""] } } },
        { $sort: { total: -1, _id: 1 } },
      ])) as Array<AggregatedCount & { african: number; traditional: number }>;

      return {
        data: rows.map((row) => ({
          nation: String(row._id),
          african: row.african ?? 0,
          traditional: row.traditional ?? 0,
        })),
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  /** Contagem de comunidades aprovadas por tipo de comunidade. */
  getStatsByType: async (): Promise<ApiResponseType<TypeStats[]>> => {
    try {
      const rows = (await ReligiousCommunity.aggregate(
        groupCountByField("communityType")
      )) as AggregatedCount[];

      return {
        data: rows.map((row) => ({
          type: String(row._id),
          count: row.count ?? 0,
        })),
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  /** Contagem de comunidades aprovadas por gênero do líder. */
  getStatsByLeaderGender: async (): Promise<ApiResponseType<GenderStats[]>> => {
    try {
      const rows = (await ReligiousCommunity.aggregate(
        groupCountByField("leaderGender")
      )) as AggregatedCount[];

      return {
        data: rows.map((row) => ({
          gender: String(row._id),
          count: row.count ?? 0,
        })),
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  /** Contagem de comunidades aprovadas por etnia do líder. */
  getStatsByLeaderEthnicity: async (): Promise<
    ApiResponseType<EthnicityStats[]>
  > => {
    try {
      const rows = (await ReligiousCommunity.aggregate(
        groupCountByField("leaderEthnicity")
      )) as AggregatedCount[];

      return {
        data: rows.map((row) => ({
          ethnicity: String(row._id),
          count: row.count ?? 0,
        })),
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  /** Contagem de comunidades aprovadas por idioma praticado. */
  getStatsByLanguage: async (): Promise<ApiResponseType<LanguageStats[]>> => {
    try {
      const rows = (await ReligiousCommunity.aggregate(
        groupCountByField("religiousSpacePraticalLanguages")
      )) as AggregatedCount[];

      return {
        data: rows.map((row) => ({
          language: String(row._id),
          count: row.count ?? 0,
        })),
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  /**
   * Top 10 bairros por número de comunidades aprovadas.
   * O excedente é somado em um único bucket `outros`.
   */
  getStatsByNeighborhood: async (): Promise<
    ApiResponseType<NeighborhoodStats[]>
  > => {
    try {
      const rows = (await ReligiousCommunity.aggregate(
        groupCountByField("communityAddress.neighborhood")
      )) as AggregatedCount[];

      const data: NeighborhoodStats[] = rows
        .slice(0, TOP_NEIGHBORHOODS)
        .map((row) => ({
          neighborhood: String(row._id),
          count: row.count ?? 0,
        }));

      const remaining = rows.slice(TOP_NEIGHBORHOODS);

      if (remaining.length > 0) {
        data.push({
          neighborhood: "outros",
          count: remaining.reduce((total, row) => total + (row.count ?? 0), 0),
        });
      }

      return {
        data,
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  /** Cobertura fotográfica das comunidades aprovadas. */
  getStatsByPhotoCoverage: async (): Promise<
    ApiResponseType<PhotoCoverageStats>
  > => {
    try {
      const rows = await ReligiousCommunity.aggregate([
        approvedMatch,
        {
          $group: {
            _id: null,
            withPhoto: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      { $ifNull: ["$religiousSpaceMainPicture", ""] },
                      "",
                    ],
                  },
                  0,
                  1,
                ],
              },
            },
            withoutPhoto: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      { $ifNull: ["$religiousSpaceMainPicture", ""] },
                      "",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            total: { $sum: 1 },
          },
        },
      ]);

      return {
        data: {
          withPhoto: rows[0]?.withPhoto ?? 0,
          withoutPhoto: rows[0]?.withoutPhoto ?? 0,
          total: rows[0]?.total ?? 0,
        },
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  /**
   * Contagem administrativa por etapa do censo.
   * Considera todos os registros (sem filtro de APPROVED).
   */
  getStatsByCensusStep: async (): Promise<ApiResponseType<CensusStepStats>> => {
    try {
      const rows = await ReligiousCommunity.aggregate([
        {
          $group: {
            _id: null,
            approved: {
              $sum: {
                $cond: [{ $eq: ["$censusStep", ECensusStep.APPROVED] }, 1, 0],
              },
            },
            pending: {
              $sum: {
                $cond: [{ $eq: ["$censusStep", ECensusStep.PENDING] }, 1, 0],
              },
            },
            rejected: {
              $sum: {
                $cond: [{ $eq: ["$censusStep", ECensusStep.REJECTED] }, 1, 0],
              },
            },
            total: { $sum: 1 },
          },
        },
      ]);

      return {
        data: {
          approved: rows[0]?.approved ?? 0,
          pending: rows[0]?.pending ?? 0,
          rejected: rows[0]?.rejected ?? 0,
          total: rows[0]?.total ?? 0,
        },
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  /**
   * Contagem administrativa por situação do espaço religioso.
   * Considera todos os registros (sem filtro de APPROVED).
   */
  getStatsByStatus: async (): Promise<ApiResponseType<SpaceStatusStats>> => {
    try {
      const rows = await ReligiousCommunity.aggregate([
        {
          $group: {
            _id: null,
            active: {
              $sum: {
                $cond: [
                  { $eq: [spaceStatusValue, EReligiousSpaceStatus.ACTIVE] },
                  1,
                  0,
                ],
              },
            },
            inactive: {
              $sum: {
                $cond: [
                  { $eq: [spaceStatusValue, EReligiousSpaceStatus.INACTIVE] },
                  1,
                  0,
                ],
              },
            },
            total: { $sum: 1 },
          },
        },
      ]);

      return {
        data: {
          active: rows[0]?.active ?? 0,
          inactive: rows[0]?.inactive ?? 0,
          total: rows[0]?.total ?? 0,
        },
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  /**
   * Contagem administrativa por nível educacional do líder.
   * Considera todos os registros (sem filtro de APPROVED).
   */
  getStatsByEducationalLevel: async (): Promise<
    ApiResponseType<EducationalLevelStats[]>
  > => {
    try {
      const rows = (await ReligiousCommunity.aggregate(
        groupCountAllByField("leaderEducationalLevel")
      )) as AggregatedCount[];

      return {
        data: rows.map((row) => ({
          educationalLevel: String(row._id),
          count: row.count ?? 0,
        })),
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  /**
   * Cobertura de bio considerando todos os registros (sem filtro de APPROVED).
   */
  getStatsBioCoverage: async (): Promise<ApiResponseType<BioCoverageStats>> => {
    try {
      const rows = await ReligiousCommunity.aggregate([
        {
          $group: {
            _id: null,
            withBio: {
              $sum: {
                $cond: [{ $eq: [{ $ifNull: ["$bio", ""] }, ""] }, 0, 1],
              },
            },
            withoutBio: {
              $sum: {
                $cond: [{ $eq: [{ $ifNull: ["$bio", ""] }, ""] }, 1, 0],
              },
            },
            total: { $sum: 1 },
          },
        },
      ]);

      return {
        data: {
          withBio: rows[0]?.withBio ?? 0,
          withoutBio: rows[0]?.withoutBio ?? 0,
          total: rows[0]?.total ?? 0,
        },
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  /**
   * Contagem administrativa de cadastros voluntários.
   * Considera todos os registros (sem filtro de APPROVED).
   */
  getStatsVoluntaryRegistrations: async (): Promise<
    ApiResponseType<VoluntaryRegistrationStats>
  > => {
    try {
      const rows = await ReligiousCommunity.aggregate([
        {
          $group: {
            _id: null,
            registeredVoluntarily: {
              $sum: {
                $cond: [{ $eq: ["$registeredVoluntarily", true] }, 1, 0],
              },
            },
            notRegisteredVoluntarily: {
              $sum: {
                $cond: [{ $eq: ["$registeredVoluntarily", true] }, 0, 1],
              },
            },
            total: { $sum: 1 },
          },
        },
      ]);

      return {
        data: {
          registeredVoluntarily: rows[0]?.registeredVoluntarily ?? 0,
          notRegisteredVoluntarily: rows[0]?.notRegisteredVoluntarily ?? 0,
          total: rows[0]?.total ?? 0,
        },
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  getCommunityById: async (
    id: string,
    options?: { approvedOnly?: boolean }
  ): Promise<ApiResponseType<IReligiousCommunity | string>> => {
    try {
      const religiousCommunity = await ReligiousCommunity.findById(id);

      // A ficha pública só expõe registros aprovados no censo.
      if (
        !religiousCommunity ||
        (options?.approvedOnly &&
          religiousCommunity.censusStep !== ECensusStep.APPROVED)
      ) {
        return {
          error: "Religious Community not found",
          status: false,
        };
      }

      // A ficha pública nunca gera conteúdo sob demanda: sem bio, a resposta
      // devolve `undefined` e a interface mostra "não informado no censo".
      const aggregateReligiousCommunity: any =
        await ReligiousCommunity.aggregate([
          {
            $match: {
              _id: new Types.ObjectId(id),
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "censusTaker",
              foreignField: "_id",
              as: "censusTaker",
            },
          },
          {
            $unwind: { path: "$censusTaker", preserveNullAndEmptyArrays: true },
          },
        ]);

      // O aggregate devolve uma lista; a ficha pública expõe um único registro.
      return {
        data: aggregateReligiousCommunity[0],
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },
  countReligiousCommunitiesByUserId: async (
    userId: string
  ): Promise<
    ApiResponseType<{
      rejected: number;
      pending: number;
      approved: number;
    }>
  > => {
    try {
      const result = await ReligiousCommunity.aggregate([
        { $match: { censusTaker: new Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            rejected: {
              $sum: { $cond: [{ $eq: ["$censusStep", "rejected"] }, 1, 0] },
            },
            pending: {
              $sum: { $cond: [{ $eq: ["$censusStep", "pending"] }, 1, 0] },
            },
            approved: {
              $sum: { $cond: [{ $eq: ["$censusStep", "approved"] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            rejected: 1,
            pending: 1,
            approved: 1,
          },
        },
      ]);

      const counts =
        result.length > 0
          ? result[0]
          : { rejected: 0, pending: 0, approved: 0 };

      return {
        status: true,
        data: {
          rejected: counts.rejected,
          pending: counts.pending,
          approved: counts.approved,
        },
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  getReligiousCommunitiesByUserId: async (
    userId: string
  ): Promise<ApiResponseType<IReligiousCommunity[]>> => {
    try {
      const response = await ReligiousCommunity.find({
        censusTaker: new Types.ObjectId(userId),
      }).sort({ censusStep: -1 });

      return {
        data: response,
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  postUpdateMainPicture: async (
    id: string,
    file: any
  ): Promise<Record<string, boolean | string>> => {
    try {
      const ext = fileUtils.getFileExtension(file[0].originalname);
      const originalPath = fileUtils.getPublicPath(file[0].filename);

      const filename = `${file[0].filename}.${ext}`;
      fs.renameSync(originalPath, fileUtils.getPublicPath(filename));

      await ReligiousCommunity.updateOne(
        { _id: new Types.ObjectId(id) },
        { $set: { religiousSpaceMainPicture: filename } }
      );

      return {
        data: filename,
        status: true,
      };
    } catch (error) {
      return {
        error: error as string,
        status: false,
      };
    }
  },

  assignOwner: async (
    communityId: string,
    userId: string,
    keepStatus: boolean
  ): Promise<Record<string, boolean | string>> => {
    console.log(communityId, userId, keepStatus);
    try {
      const updatedComnunity: any = {
        censusTaker: new Types.ObjectId(userId),
      };

      if (!keepStatus) {
        updatedComnunity.censusStep = ECensusStep.PENDING;
      }

      const community = await ReligiousCommunity.findOneAndUpdate(
        { _id: new Types.ObjectId(communityId) },
        {
          $set: updatedComnunity,
        }
      );

      const userData = await User.findOne({ _id: userId });

      const html = await mailUtils.template({
        type: EMailTypes.ASSIGN_OWNER,
        data: {
          censusTakerName: userData?.fullname,
          communityName: community?.religiousSpaceName,
          fullAddress: community?.communityAddress.fullAddress,
        },
      });

      void mailUtils
        .sendMail({
          to: userData?.email,
          subject: "Você é responsável por uma atualização",
          html: html,
        })
        .catch((error: any) => {
          console.error(
            "[✖] Falha ao enviar e-mail:",
            error?.message ?? error
          );
        });

      return {
        data: true,
        status: true,
      };
    } catch (error) {
      return {
        error: error as string,
        status: false,
      };
    }
  },

  setCensusStep: async (
    communityId: string,
    step: ECensusStep,
    rejectedReason?: string,
    actor?: DecisionActor
  ): Promise<Record<string, boolean | string>> => {
    try {
      await ReligiousCommunity.findOneAndUpdate(
        { _id: new Types.ObjectId(communityId) },
        {
          $set: {
            censusStep: step,
            rejectedReason: rejectedReason,
          },
          $push: decisionPush(step, actor, rejectedReason),
        }
      );

      return {
        data: true,
        status: true,
      };
    } catch (error) {
      return {
        error: error as string,
        status: false,
      };
    }
  },


  /**
   * Avisa sobre correções: usa o e-mail de contato do cadastro voluntário
   * quando existir e, na falta dele, o e-mail do recenseador responsável.
   */
  notifyCorrection: async (
    community: IReligiousCommunity | null,
    reason: string,
    subject: string,
    context: "corrections" | "rejected" = "corrections"
  ): Promise<void> => {
    if (!community) return;

    const contactEmail = community.leaderContacts?.email;
    const censusTaker = community.censusTaker
      ? await User.findById(community.censusTaker)
      : null;
    const to = contactEmail || censusTaker?.email || "";

    if (!to) return;

    const isRejected = context === "rejected";
    const html = await mailUtils.template({
      type: EMailTypes.CORRECTION_REQUEST,
      data: {
        censusTakerName:
          community.religiousSpaceLeaderName?.split(" ")[0] ?? "liderança",
        communityName: community.religiousSpaceName,
        fullAddress: community.communityAddress?.fullAddress,
        correctionNotes: reason,
        emailTitle: isRejected
          ? "Cadastro rejeitado pela curadoria"
          : "Precisamos de ajustes no cadastro",
        emailIntro: isRejected
          ? "O cadastro da comunidade abaixo foi rejeitado pela curadoria. O motivo está registrado na ficha."
          : "Analisamos o cadastro da comunidade abaixo e precisamos de alguns ajustes antes de publicá-lo no acervo.",
        nextStep: isRejected
          ? "Se os ajustes forem possíveis, envie o cadastro novamente pelo site ou responda esta mensagem para falar com a curadoria."
          : "Ajuste os dados indicados e envie novamente pelo site. Assim que chegarem, a curadoria retoma a análise.",
      },
    });

    void mailUtils
      .sendMail({ to, subject, html })
      .catch((error: any) => {
        console.error("[✖] Falha ao enviar e-mail:", error?.message ?? error);
      });
  },

  requestCorrections: async (
    communityId: string,
    userId: string,
    rejectedReason: string,
    actor?: DecisionActor
  ) => {
    try {
      const community = await ReligiousCommunity.findOneAndUpdate(
        { _id: new Types.ObjectId(communityId) },
        {
          $set: {
            censusStep: ECensusStep.REJECTED,
            censusTaker: new Types.ObjectId(userId),
            rejectedReason: rejectedReason,
          },
          $push: decisionPush("corrections", actor, rejectedReason),
        },
        { new: true }
      );

      // Avisa quem enviou o cadastro (contato voluntário ou recenseador).
      await religiousCommunityService.notifyCorrection(
        community,
        rejectedReason,
        "Correções solicitadas no cadastro",
        "corrections"
      );

      return {
        data: true,
        status: true,
      };
    } catch (error) {
      return {
        error: error as string,
        status: false,
      };
    }
  },

  approveCensus: async (communityId: string, actor?: DecisionActor) => {
    try {
      await ReligiousCommunity.findOneAndUpdate(
        { _id: new Types.ObjectId(communityId) },
        {
          $set: {
            censusStep: ECensusStep.APPROVED,
            rejectedReason: undefined,
          },
          $push: decisionPush(ECensusStep.APPROVED, actor),
        }
      );

      return {
        data: true,
        status: true,
      };
    } catch (error) {
      return {
        error: error as string,
        status: false,
      };
    }
  },

  rejectCensus: async (
    communityId: string,
    rejectedReason: string,
    actor?: DecisionActor
  ) => {
    try {
      const community = await ReligiousCommunity.findOneAndUpdate(
        { _id: new Types.ObjectId(communityId) },
        {
          $set: {
            censusStep: ECensusStep.REJECTED,
            rejectedReason: rejectedReason,
          },
          $push: decisionPush(ECensusStep.REJECTED, actor, rejectedReason),
        },
        { new: true }
      );

      await religiousCommunityService.notifyCorrection(
        community,
        rejectedReason,
        "Cadastro rejeitado pela curadoria",
        "rejected"
      );

      return {
        data: true,
        status: true,
      };
    } catch (error) {
      return {
        error: error as string,
        status: false,
      };
    }
  },
};
