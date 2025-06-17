<script setup>
import router from "@/router";
import { baseRoute } from "@/router/base";
import { useReligiousCommunitiesStore } from "@/stores/religiousCommunities.store";
import normalizer from "@/utils/normalizer";

const religiousCommunitiesStore = useReligiousCommunitiesStore();

const communitiesToday = computed(() => {
  return religiousCommunitiesStore.ramdomReligiousCommunityList;
});

const goToCommunity = (slug, id) => {
  router.push({ name: baseRoute.community, params: { id, slug } });
};
</script>

<template>
  <v-container class="mx-auto cad-container" max-width="160vh">
    <p class="text-h4 text-md-h4 font-weight-bold text-black mb-2">
      Conheça alguns dos terreiros cadastrado
    </p>
    <v-row class="mt-10" align="stretch">
      <v-col
        cols="12"
        sm="6"
        md="4"
        v-for="community in communitiesToday"
        :key="community"
      >
        <v-card
          class="d-flex flex-column h-100 pa-2 rounded-lg"
          color="grey-lighten-5"
          elevation="2"
        >
          <div class="d-flex flex-column justify-space-between">
            <v-card-title
              class="text-h6"
              v-html="normalizer.break(community.religiousSpaceName)"
            />

            <v-card-subtitle>
              <v-chip label variant="outlined" class="text-capitalize mr-2">
                {{ `Fundado em ${community.religiousSpaceYearFoundation}` }}
              </v-chip>

              <cad-chip :community="community.religiousSpaceNation" />
            </v-card-subtitle>

            <v-card-text v-html="normalizer.break(community.fullAddress)" />
          </div>

          <v-card-actions class="mt-auto">
            <v-btn
              class="bg-persimmon text-white"
              text="Saiba mais"
              @click="goToCommunity(community.slugify, community.id)"
            />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
