import { Expose, Transform } from "class-transformer";

export class ReligiousCommunitiesGetByUserIdDTO {
  @Expose()
  @Transform((value) => value.obj._id)
  id!: string;

  @Expose()
  religiousSpaceName!: string;

  @Expose()
  censusStep!: string;

  @Expose()
  religiousSpaceNation!: string;

  @Expose()
  communityType!: string;
}
