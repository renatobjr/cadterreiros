import { ReligiousCommunity } from "@/api/schemas/ReligiousCommunity";
import { initialData } from "@/api/db/data/initialData";
import { getAddressFromLatLon } from "../configs/geocoder";

const religiousCommunitySeed = async () => {
  for (const community of initialData) {
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

      await ReligiousCommunity.create(community);
    } catch (error) {
      throw new Error(error as string);
    }
  }
};

export default religiousCommunitySeed;
