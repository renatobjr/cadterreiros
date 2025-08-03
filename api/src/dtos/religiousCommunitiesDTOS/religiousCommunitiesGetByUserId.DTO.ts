import {
  ECensusStep,
  EReligiousSpaceStatus,
  ICommunityAddress,
  IContacts,
  IGeoLocation,
} from "@/api/schemas/ReligiousCommunity";
import { Expose, Transform } from "class-transformer";
import { ObjectId } from "mongoose";

export class ReligiousCommunitiesGetByUserIdDTO {
  @Expose()
  @Transform((value) => value.obj._id)
  id!: ObjectId;

  @Expose()
  authorization!: number;

  @Expose()
  communityGoogleApiLocalization!: IGeoLocation;

  @Expose()
  communityAddress!: ICommunityAddress;

  @Expose()
  communityType!: string;

  @Expose()
  @Transform((value) => value.obj.religiousSpaceYearFoundation.toString())
  religiousSpaceYearFoundation!: string;

  @Expose()
  religiousSpaceLeaderFoundation!: string;

  @Expose()
  religiousSpaceNation!: string;

  @Expose()
  religiousSpacePraticalLanguages!: string;

  @Expose()
  religiousSpaceName!: string;

  @Expose()
  religiousSpaceLeaderName!: string;

  @Expose()
  religiousSpacePositionName!: string;

  @Expose()
  religiousSpaceStartedBy!: string;

  @Expose()
  religiousSpaceNameDateStartedBy!: Date | string;

  @Expose()
  leaderContacts!: IContacts;

  @Expose()
  leaderEthnicity!: string;

  @Expose()
  leaderGender!: string;

  @Expose()
  leaderEducationalLevel!: string;

  @Expose()
  leaderSocialProgram!: string | null;

  @Expose()
  leaderSufferedRacism!: boolean;

  @Expose()
  religiousSpaceMainPicture!: string;

  @Expose()
  religiousSpaceStatus!: EReligiousSpaceStatus;

  @Expose()
  censusStep!: ECensusStep;

  @Expose()
  @Transform((value) => value.obj.censusTaker._id)
  censusTaker!: ObjectId;

  @Expose()
  @Transform((value) => value.obj.censusTaker.fullname)
  censusTakerFullname!: string;

  @Expose()
  rejectedReason!: string;

  @Expose()
  religiousSpaceEvents!: [];

  @Expose()
  createdAt!: Date | string;
}
