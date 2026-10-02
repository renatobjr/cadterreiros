<script setup>
import { useReligiousCommunitiesStore } from "@/stores/religiousCommunities.store";
import CadMap from "@/components/common/CadMap.vue";
import CadAddressAutocomplete from "@/components/common/CadAddressAutocomplete.vue";
import { reverseGeocode } from "@/utils/geocoding";
import {
  communityLanguage,
  communitySpaceNation,
  communityType,
} from "@/components/forms/selectFormDefault";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const religiousCommunitiesStore = useReligiousCommunitiesStore();
const form = ref();

const menu = ref(false);
const selectedDate = ref(null);

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

const mapCenter = computed(() => ({
  lat: community.communityGoogleApiLocalization.lat,
  lng: community.communityGoogleApiLocalization.long,
}));

const mapMarkers = computed(() => [
  {
    lat: community.communityGoogleApiLocalization.lat,
    lng: community.communityGoogleApiLocalization.long,
  },
]);

const fillAddress = (address) => {
  Object.assign(community.communityAddress, {
    fullAddress: address.fullAddress,
    street: address.street,
    number: address.number,
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
    zipcode: address.zipcode,
  });
};

const updateMarkerLocation = (lat, lng) => {
  community.communityGoogleApiLocalization.lat = lat;
  community.communityGoogleApiLocalization.long = lng;
};

const onAddressSelect = (address) => {
  fillAddress(address);

  if (Number.isFinite(address.lat) && Number.isFinite(address.lng)) {
    updateMarkerLocation(address.lat, address.lng);
  }
};

const onMapClick = async ({ lat, lng }) => {
  updateMarkerLocation(lat, lng);

  try {
    const address = await reverseGeocode(lat, lng);
    if (address) fillAddress(address);
  } catch (error) {
    console.error("[CommunityRegister] reverseGeocode", error);
  }
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
        Voce pode cadastat um terreiro de forma voluntária para ajudar a
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

        <CadAddressAutocomplete
          v-model:search="community.communityAddress.fullAddress"
          :latitude="community.communityGoogleApiLocalization.lat"
          :longitude="community.communityGoogleApiLocalization.long"
          @select="onAddressSelect"
        />
        <CadMap
          class="map rounded-lg elevation-3"
          :center="mapCenter"
          :zoom="13"
          :markers="mapMarkers"
          @map-click="onMapClick"
        />

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
