import { Expose, Transform, Type } from "class-transformer";

class LeaderContactDTO {
  @Expose()
  phone?: string | number | undefined;

  @Expose()
  mobile?: string | number | undefined;

  @Expose()
  email?: string | undefined;
}

export class ReligiousCommunitiesGetByIdDTO {
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
  @Transform((value) => value.obj.communityGoogleApiLocalization.lat)
  lat!: number;

  @Expose()
  @Transform((value) => value.obj.communityGoogleApiLocalization.long)
  long!: number;

  @Expose()
  religiousSpaceYearFoundation!: number;

  @Expose()
  communityType!: number;

  @Expose()
  religiousSpaceNation!: string;

  @Expose({ name: "leaderContacts" })
  @Type(() => LeaderContactDTO)
  leaderContacts!: LeaderContactDTO;

  @Expose()
  religiousSpaceMainPicture!: string;

  @Expose()
  @Transform((value) => value.obj.bio)
  bio!: string;

  @Expose()
  @Transform((value) => {
    return value.obj.censusTaker.fullname;
  })
  censusTaker!: string;

  @Expose()
  createdAt!: Date;
}
