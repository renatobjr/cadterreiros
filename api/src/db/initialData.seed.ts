import bcryptjs from "bcryptjs";
import { getAddressFromLatLon } from "@/api/configs/geocoder";
import {
  ECensusStep,
  EReligiousSpaceStatus,
  ReligiousCommunity,
} from "@/api/schemas/ReligiousCommunity";
import {
  ReligiousCommunityInitialData,
  UserInitialData,
} from "./data/initialData";
import { User } from "@/api/schemas/User";
import { UserEmailToInsert } from "./data/userEmailToInsert";
import { ObjectId } from "mongoose";

const initialDataSeed = async () => {
  const hasUserData = await User.countDocuments();
  const hasReligiousData = await ReligiousCommunity.countDocuments();

  if (hasUserData === 0) {
    try {
      for (const user of UserInitialData) {
        user.password = bcryptjs.hashSync("test.password", 10);
        await User.create(user);
      }
      console.log("[✔] User Data has been seeded successfully.");
    } catch (error) {
      console.error("[✖] Failed to seed User Data:", error);
      throw new Error("Failed to seed User Data.");
    }
  }

  if (hasReligiousData === 0) {
    for (const [index, community] of ReligiousCommunityInitialData.entries()) {
      const fetchIdFromEmail = await User.findOne({
        email: UserEmailToInsert[index].email,
      }).select("_id");

      try {
        if (community.community_google_api_localization) {
          const googleAddressFromLatLon = await getAddressFromLatLon(
            community.community_google_api_localization.lat,
            community.community_google_api_localization.long
          );

          if (googleAddressFromLatLon) {
            community.community_address = {
              fullAddress: googleAddressFromLatLon.fullAddress,
              street: googleAddressFromLatLon.street,
              number: googleAddressFromLatLon.number,
              neighborhood: googleAddressFromLatLon.neighborhood,
              city: googleAddressFromLatLon.city,
              state: googleAddressFromLatLon.state,
              zipcode: googleAddressFromLatLon.zipcode,
            };
          }
        }

        community.religious_space_status = EReligiousSpaceStatus.ACTIVE;
        community.censusStep = ECensusStep.APPROVED;
        community.censusTaker = fetchIdFromEmail?._id as ObjectId;

        await ReligiousCommunity.create(community);
      } catch (error) {
        throw new Error(error as string);
      } finally {
        console.log("[✔] Religious Community Data has been seeded.");
      }
    }
  }
};

export default initialDataSeed;
