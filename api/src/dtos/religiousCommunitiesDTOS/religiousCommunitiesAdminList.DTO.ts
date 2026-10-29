import { Expose, Transform } from "class-transformer";
import slugify from "slugify";

/**
 * Lista administrativa (`GET /religious-communities/list`): inclui os campos
 * de controle da curadoria que não devem aparecer na listagem pública.
 */
export class ReligiousCommunitiesAdminListDTO {
  @Expose()
  @Transform((value) => value.obj._id)
  id!: string;

  @Expose()
  @Transform((value) => slugify(value.obj.religiousSpaceName, { lower: true }))
  slugify!: string;

  @Expose()
  religiousSpaceName!: string;

  @Expose()
  @Transform((value) => value.obj.communityType ?? null)
  communityType!: string | null;

  @Expose()
  religiousSpaceNation!: string;

  @Expose()
  religiousSpacePraticalLanguages?: string;

  @Expose()
  @Transform((value) =>
    value.obj.religiousSpaceYearFoundation !== undefined &&
    value.obj.religiousSpaceYearFoundation !== null
      ? String(value.obj.religiousSpaceYearFoundation)
      : null
  )
  religiousSpaceYearFoundation!: string | null;

  @Expose()
  @Transform((value) => value.obj.communityAddress?.neighborhood ?? null)
  neighborhood!: string | null;

  @Expose()
  @Transform((value) => value.obj.communityAddress?.city ?? null)
  city!: string | null;

  @Expose()
  @Transform((value) => value.obj.religiousSpaceMainPicture ?? null)
  religiousSpaceMainPicture?: string | null;

  @Expose()
  @Transform((value) => value.obj.registeredVoluntarily ?? false)
  registeredVoluntarily!: boolean;

  @Expose()
  censusStep!: string;

  @Expose()
  @Transform((value) => value.obj.censusTaker?.fullname ?? null)
  censusTakerFullname!: string | null;

  @Expose()
  @Transform((value) => value.obj.leaderContacts ?? null)
  leaderContacts!: { email?: string; phone?: string } | null;

  @Expose()
  @Transform((value) => value.obj.censusTaker?._id ?? null)
  censusTakerId!: string | null;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;
}
