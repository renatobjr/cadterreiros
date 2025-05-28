import { Client } from "@googlemaps/google-maps-services-js";
import type { ICommunityAddress } from "../schemas/ReligiousCommunity";

const client = new Client({});

async function getAddressFromLatLon(lat: number, long: number) {
  try {
    const response = await client.reverseGeocode({
      params: {
        key: process.env.GOOGLE_MAPS_API as string,
        latlng: [lat, long],
      },
    });

    return {
      fullAddress: response.data.results[0]?.formatted_address,
      number: response.data.results[0].address_components[0]?.long_name,
      street: response.data.results[0].address_components[1]?.long_name,
      neighborhood: response.data.results[0].address_components[2]?.long_name,
      city: response.data.results[0].address_components[3]?.long_name,
      state: response.data.results[0].address_components[4]?.long_name,
      zipcode:
        response.data.results[0].address_components[6]?.long_name ??
        "58000-000",
    } as ICommunityAddress;
  } catch (error) {
    throw new Error(error as string);
  }
}

export { getAddressFromLatLon };
