import { Expose, Transform } from "class-transformer";
import slugify from "slugify";

export class ReligiousCommunitiesGetRamdomDTO {
  @Expose({ name: "id" })
  @Transform((value) => value.obj._id)
  id!: string;

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
  @Transform((value) => slugify(value.obj.religiousSpaceName, { lower: true }))
  slugify!: string;

  @Expose()
  religiousSpaceYearFoundation!: number;

  @Expose()
  religiousSpaceNation!: string;

  @Expose()
  @Transform((value) => {
    const parts = [
      value.obj.communityAddress.street,
      value.obj.communityAddress.number,
      value.obj.communityAddress.neighborhood,
      value.obj.communityAddress.city,
      value.obj.communityAddress.state,
      value.obj.communityAddress.zipcode,
    ];
    return parts.filter(Boolean).join(", ");
  })
  fullAddress!: string;

  @Expose()
  @Transform((value) => value.obj.communityGoogleApiLocalization.lat)
  lat!: number;

  @Expose()
  @Transform((value) => value.obj.communityGoogleApiLocalization.long)
  long!: number;
}
