import { Expose, Transform } from "class-transformer";
import slugify from "slugify";

export class ReligiousCommunitiesListDTO {
  @Expose()
  @Transform((value) => value.obj._id)
  id!: string;

  @Expose()
  @Transform((value) => slugify(value.obj.religiousSpaceName, { lower: true }))
  slugify!: string;

  @Expose()
  @Transform((value) => value.obj.communityGoogleApiLocalization.lat)
  lat!: number;

  @Expose()
  @Transform((value) => value.obj.communityGoogleApiLocalization.long)
  long!: number;

  @Expose()
  communityType!: string;

  @Expose()
  religiousSpaceYearFoundation!: string;

  @Expose()
  religiousSpaceNation!: string;

  @Expose()
  religiousSpacePraticalLanguages!: string;

  @Expose()
  religiousSpaceName!: string;

  @Expose()
  @Transform((value) => value.obj.communityAddress.neighborhood)
  neighborhood!: string;

  @Expose()
  @Transform((value) => value.obj.communityAddress.city)
  city!: string;

  @Expose()
  censusStep!: string;

  @Expose()
  @Transform((value) => value.obj.censusTaker._id)
  censusTakerId!: string;

  @Expose()
  @Transform((value) => value.obj.censusTaker.fullname)
  censusTakerFullname!: string;
}
