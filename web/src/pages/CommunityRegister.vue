<script setup>
import { useReligiousCommunitiesStore } from "@/stores/religiousCommunities.store";
import { GoogleMap, Marker } from "vue3-google-map";
import cadMarkerSimple from "@/assets/svg/marker.simple.svg";
import {
  communityLanguage,
  communitySpaceNation,
  communityType,
} from "@/components/forms/selectFormDefault";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const GOOGLE_MAP_API_KEY = import.meta.env.VITE_GOOGLE_MAPS;

const religiousCommunitiesStore = useReligiousCommunitiesStore();
const form = ref();

const menu = ref(false);
const selectedDate = ref(null);

const autocompleteGoogleMapsInput = ref(null);
let autocompleteGoogleMaps;

const community = reactive({
  authorization: true,
  communityGoogleApiLocalization: {
    lat: -7.11532,
    long: -34.861,
  },
  communityAddress: {
    fullAddress: undefined,
    street: undefined,
    number: undefined,
    neighborhood: undefined,
    city: undefined,
    state: undefined,
    zipcode: undefined,
  },
  religiousSpaceName: undefined,
  religiousSpaceLeaderName: undefined,
  communityType: undefined,
  religiousSpaceNation: undefined,
  religiousSpacePraticalLanguages: undefined,
  religiousSpaceYearFoundation: undefined,
  religiousSpaceLeaderFoundation: undefined,
  religiousSpacePositionName: undefined,
  religiousSpaceStartedBy: undefined,
  religiousSpaceNameDateStartedBy: undefined,
  leaderContacts: {
    phone: undefined,
    mobile: undefined,
    email: undefined,
  },
});

const geocoder = new google.maps.Geocoder();

const initAutocomplete = async () => {
  if (!autocompleteGoogleMapsInput.value || autocompleteGoogleMaps) return;
  await nextTick();

  const input = autocompleteGoogleMapsInput.value.$el.querySelector("input");

  if (!input) {
    console.error("Elemento de input não encontrado para o autocomplete.");
    return;
  }

  if (typeof google === "undefined" || !google.maps || !google.maps.places) {
    console.error(
      "API Google Maps Places não carregada. Certifique-se de que a biblioteca 'places' está incluída."
    );
    return;
  }

  const options = {
    componentRestrictions: { country: "br" },
    fields: ["address_components", "geometry", "formatted_address"],
  };

  autocompleteGoogleMaps = new google.maps.places.Autocomplete(input, options);

  autocompleteGoogleMaps.addListener("place_changed", () => {
    const place = autocompleteGoogleMaps.getPlace();

    if (!place.geometry) {
      console.warn(
        "Autocomplete não retornou geometria para o local selecionado."
      );
      return;
    }

    const { lat, lng } = place.geometry.location;
    updateMarkerLocation(lat(), lng());
    fillAddress(place);
  });
};

const fillAddress = (place) => {
  community.communityAddress.fullAddress = place.formatted_address;

  const address = {
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    zipcode: "",
  };

  place.address_components.forEach((component) => {
    const types = component.types;

    if (types.includes("route")) address.street = component.long_name;
    if (types.includes("street_number")) address.number = component.long_name;
    if (types.includes("sublocality") || types.includes("sublocality_level_1"))
      address.neighborhood = component.long_name;
    if (types.includes("administrative_area_level_2"))
      address.city = component.long_name;
    if (types.includes("administrative_area_level_1"))
      address.state = component.short_name;
    if (types.includes("postal_code")) address.zipcode = component.long_name;
  });

  Object.assign(community.communityAddress, address);
};

const updateMarkerLocation = (lat, lng) => {
  community.communityGoogleApiLocalization.lat = lat;
  community.communityGoogleApiLocalization.long = lng;
};

const onMapClick = (event) => {
  const lat = event.latLng.lat();
  const lng = event.latLng.lng();

  updateMarkerLocation(lat, lng);

  geocoder.geocode({ location: { lat, lng } }, (results, status) => {
    if (status === "OK" && results[0]) {
      fillAddress(results[0]);
    }
  });
};

const saveDate = (date) => {
  selectedDate.value = date;
  menu.value = false;
  if (date) {
    community.religiousSpaceNameDateStartedBy = format(
      new Date(date),
      "dd/MM/yyyy",
      {
        locale: ptBR,
      }
    );
  }
};

onMounted(() => {
  initAutocomplete();
});
</script>

<template>
  <v-container class="mx-auto cad-container" max-width="100vh">
    <v-card
      class="d-flex flex-column h-100 pa-4 rounded-lg"
      color="grey-lighten-5"
      elevation="0"
    >
      <v-card-title class="text-h5 font-weight-regular">
        Cadastro voluntário
      </v-card-title>

      <p class="pa-4">
        Voce pode cadastar um terreiro de forma voluntária para ajudar a
        divulgar as comunidades de matriz africana e de terreiro. Antes de
        começar é importante ressaltar que o cadastramento voluntário será
        avaliado pela Equipe de Curadoria da CCIAO.
      </p>

      <v-form ref="form" class="pa-10">
        <v-checkbox
          class="d-flex align-start"
          v-model="community.authorization"
        >
          <template v-slot:label>
            <span>
              Eu estou ciente que o cadastramento voluntário é avaliado pela
              Equipe de Curadoria da CCIAO e que meus nome e e-mail serão
              utilizados apenas para divulgação das comunidades de matriz
              africana e de terreiro.
            </span>
          </template>
        </v-checkbox>

        <v-spacer class="my-12"></v-spacer>

        <v-text-field
          v-model="community.communityAddress.fullAddress"
          ref="autocompleteGoogleMapsInput"
          label="Digite o endereço"
          density="compact"
          variant="outlined"
          clearable
          rounded="lg"
          color="sealbronw"
        />
        <GoogleMap
          class="map rounded-lg elevation-3"
          disableDefaultUi="false"
          :api-key="GOOGLE_MAP_API_KEY"
          :center="{
            lat: community.communityGoogleApiLocalization.lat,
            lng: community.communityGoogleApiLocalization.long,
          }"
          :zoom="13"
          @click="onMapClick"
        >
          <Marker
            :options="{
              position: {
                lat: community.communityGoogleApiLocalization.lat,
                lng: community.communityGoogleApiLocalization.long,
              },
              icon: {
                url: cadMarkerSimple,
                scaledSize: { width: 40, height: 40 },
              },
            }"
          />
        </GoogleMap>

        <v-spacer class="my-12"></v-spacer>

        <v-text-field
          v-model="community.religiousSpaceName"
          density="compact"
          variant="outlined"
          label="Nome da comunidade de terreiro ou matriz africana"
          rounded="lg"
          color="sealbronw"
        />

        <v-text-field
          v-model="community.religiousSpaceLeaderName"
          density="compact"
          variant="outlined"
          label="Nome do liderança da comunidade"
          rounded="lg"
          color="sealbronw"
        />

        <v-select
          v-model="community.communityType"
          density="compact"
          variant="outlined"
          :items="communityType"
          item-title="title"
          item-value="value"
          label="Selecione o tipo da comunidade"
          rounded="lg"
          color="sealbronw"
        />

        <v-select
          v-model="community.religiousSpaceNation"
          density="compact"
          variant="outlined"
          :items="communitySpaceNation"
          item-title="title"
          item-value="value"
          label="Selecione a nação que pertence a comunidade"
          rounded="lg"
          color="sealbronw"
        />

        <v-select
          v-model="community.religiousSpacePraticalLanguages"
          density="compact"
          variant="outlined"
          :items="communityLanguage"
          item-title="title"
          item-value="value"
          label="Selecione a linguagem práticada pela comunidade"
          rounded="lg"
          color="sealbronw"
        />

        <v-text-field
          v-model="community.religiousSpaceName"
          density="compact"
          variant="outlined"
          label="Nome da comunidade de terreiro ou matriz africana"
          rounded="lg"
          color="sealbronw"
        />
        <v-text-field
          v-model="community.religiousSpaceLeaderName"
          density="compact"
          variant="outlined"
          label="Nome do liderança da comunidade"
          rounded="lg"
          color="sealbronw"
        />

        <v-number-input
          v-model="community.religiousSpaceYearFoundation"
          density="compact"
          variant="outlined"
          label="Informe o ano de fundaçào da comunidade ou terreiro"
          rounded="lg"
          min="0"
          color="sealbronw"
        />

        <v-text-field
          v-model="community.religiousSpaceLeaderFoundation"
          density="compact"
          variant="outlined"
          label="Informe o nome do fundador da comunidade ou terreiro"
          rounded="lg"
          color="sealbronw"
        />

        <v-text-field
          v-model="community.religiousSpacePositionName"
          density="compact"
          variant="outlined"
          label="Qual o cargo ocupado pela liderança do terreiro"
          rounded="lg"
          color="sealbronw"
        />

        <v-text-field
          v-model="community.religiousSpaceStartedBy"
          density="compact"
          variant="outlined"
          label="Informe (se possível) quem iniciou a liderança da comunidade"
          rounded="lg"
          color="sealbronw"
        />

        <v-menu
          v-model="menu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template #activator="{ props }">
            <v-text-field
              v-bind="props"
              v-model="community.religiousSpaceNameDateStartedBy"
              density="compact"
              variant="outlined"
              label="Informe (se possível) a data de iniciação da liderança da comunidade"
              readonly
              rounded="lg"
              color="sealbronw"
            />
          </template>

          <v-date-picker
            @update:model-value="saveDate"
            locale="pt"
            color="sealbronw"
          ></v-date-picker>
        </v-menu>

        <v-text-field
          v-model="community.leaderContacts.email"
          density="compact"
          variant="outlined"
          label="Informe (se possível) um email para contato com a liderança da comunidade"
          rounded="lg"
          color="sealbronw"
        />

        <v-text-field
          v-model="community.leaderContacts.mobile"
          density="compact"
          variant="outlined"
          label="Informe (se possível) um telefone para contato com a liderança da comunidade"
          rounded="lg"
          color="sealbronw"
        />

        <v-btn class="mt-2 bg-persimmon" type="submit" block
          >Enviar para análise</v-btn
        >
      </v-form>
    </v-card>
  </v-container>
</template>
