import { Expose, Transform } from "class-transformer";
import slugify from "slugify";

export class ReligiousCommunitiesGetRamdomDTO {
  @Expose({ name: "id" })
  @Transform((value) => value.obj._id)
  id!: string;

  @Expose({ name: "religious_space_name" })
  @Transform((value) => {
    return value.obj.religious_space_name
      .toLowerCase()
      .split(" ")
      .map((s: string) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(" ");
  })
  religiousSpaceName!: string;

  @Expose()
  @Transform((value) =>
    slugify(value.obj.religious_space_name, { lower: true })
  )
  slugify!: string;

  @Expose({ name: "religious_space_year_foundation" })
  religiousSpaceYearFoundation!: number;

  @Expose({ name: "religious_space_nation" })
  religiousSpaceNation!: string;

  @Expose({ name: "community_address" })
  @Transform((value) => {
    const parts = [
      value.obj.community_address.street,
      value.obj.community_address.number,
      value.obj.community_address.neighborhood,
      value.obj.community_address.city,
      value.obj.community_address.state,
      value.obj.community_address.zipcode,
    ];
    return parts.filter(Boolean).join(", ");
  })
  fullAddress!: string;

  @Expose()
  @Transform((value) => value.obj.community_google_api_localization.lat)
  lat!: number;

  @Expose()
  @Transform((value) => value.obj.community_google_api_localization.long)
  long!: number;
}
