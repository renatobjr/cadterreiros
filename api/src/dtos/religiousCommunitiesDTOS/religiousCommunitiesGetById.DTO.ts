import { Expose, Transform } from "class-transformer";
import slugify from "slugify";

/**
 * Ficha pública de uma comunidade (`GET /public/:id`).
 *
 * Mantém o contrato do mock: identidade (`id`, `slugify`), localização
 * (`communityAddress` achatado em `neighborhood`/`city`), ficha do censo
 * (nação, idioma, tipo, fundação) e coordenadas para o mapa.
 */
export class ReligiousCommunitiesGetByIdDTO {
  @Expose()
  @Transform((value) => value.obj._id)
  id!: string;

  @Expose()
  @Transform((value) => slugify(value.obj.religiousSpaceName, { lower: true }))
  slugify!: string;

  @Expose()
  @Transform((value) => {
    return value.obj.religiousSpaceName
      .toLowerCase()
      .split(" ")
      .map((s: string) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(" ");
  })
  religiousSpaceName!: string;

  @Expose()
  @Transform((value) => value.obj.communityGoogleApiLocalization?.lat ?? null)
  lat!: number | null;

  @Expose()
  @Transform((value) => value.obj.communityGoogleApiLocalization?.long ?? null)
  long!: number | null;

  @Expose()
  religiousSpaceYearFoundation!: number;

  @Expose()
  @Transform((value) => value.obj.communityType ?? null)
  communityType!: string | null;

  @Expose()
  religiousSpaceNation!: string;

  @Expose()
  religiousSpacePraticalLanguages?: string;

  @Expose()
  @Transform((value) => value.obj.communityAddress?.neighborhood ?? null)
  neighborhood!: string | null;

  @Expose()
  @Transform((value) => value.obj.communityAddress?.city ?? null)
  city!: string | null;

  @Expose()
  @Transform((value) => value.obj.communityAddress?.fullAddress ?? null)
  fullAddress!: string | null;

  @Expose()
  @Transform((value) => value.obj.religiousSpaceMainPicture ?? null)
  religiousSpaceMainPicture?: string | null;

  @Expose()
  @Transform((value) => value.obj.bio ?? null)
  bio!: string | null;

  @Expose()
  createdAt!: Date;
}
