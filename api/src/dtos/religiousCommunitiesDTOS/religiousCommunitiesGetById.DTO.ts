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
  @Transform((value) => value.obj.community_google_api_localization.lat)
  lat!: number;

  @Expose()
  @Transform((value) => value.obj.community_google_api_localization.long)
  long!: number;

  @Expose({ name: "religious_space_year_foundation" })
  religiousSpaceYearFoundation!: number;

  @Expose({ name: "community_type" })
  communityType!: number;

  @Expose({ name: "religious_space_nation" })
  religiousSpaceNation!: string;

  @Expose({ name: "leader_contacts" })
  @Type(() => LeaderContactDTO)
  leaderContacts!: LeaderContactDTO;

  @Expose({ name: "religious_space_main_picture" })
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
