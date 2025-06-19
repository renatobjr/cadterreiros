import { Expose, Transform } from "class-transformer";
import slugify from "slugify";

export class ReligiousCommunitiesListDTO {
  @Expose({ name: "id" })
  id!: string;

  @Expose()
  @Transform((value) =>
    slugify(value.obj.religious_space_name, { lower: true })
  )
  slugify!: string;

  @Expose()
  @Transform((value) => value.obj.community_google_api_localization.lat)
  lat!: number;

  @Expose()
  @Transform((value) => value.obj.community_google_api_localization.long)
  long!: number;

  @Expose({ name: "community_type" })
  communityType!: string;

  @Expose({ name: "religious_space_year_foundation" })
  religiousSpaceYearFoundation!: string;

  @Expose({ name: "religious_space_nation" })
  religiousSpaceNation!: string;

  @Expose({ name: "religious_space_pratical_languages" })
  religiousSpacePraticalLanguages!: string;

  @Expose({ name: "religious_space_name" })
  religiousSpaceName!: string;

  @Expose()
  @Transform((value) => value.obj.community_address.neighborhood)
  neighborhood!: string;

  @Expose()
  @Transform((value) => value.obj.community_address.city)
  city!: string;
}
