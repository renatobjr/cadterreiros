<script setup>
import logoCciao from "@/assets/svg/logo_no_name.svg";
</script>

<template>
  <v-footer class="bg-white">
    <v-container>
      <v-row justify="center" align="center">
        <!-- Container para logo e texto lado a lado -->
        <v-col cols="12" md="10" lg="8">
          <v-row align="center" justify="center">
            <!-- Logo -->
            <v-col
              cols="12"
              sm="4"
              md="3"
              class="d-flex justify-center justify-sm-end"
            >
              <v-img
                :src="logoCciao"
                max-width="150"
                contain
                class="my-4"
                alt="Logo Casa de Cultura Ilê Asé D'Osoguian"
              ></v-img>
            </v-col>

            <!-- Texto -->
            <v-col cols="12" sm="8" md="9" class="text-center text-sm-left">
              <p class="text-body-1 font-weight-light">
                A Casa de Cultura Ilê Asé D'Osoguian é uma organização sem fins
                lucrativos que busca promover o conhecimento e a preservação da
                cultura afro brasileira, promovendo a igualdade e a preservação
                do patrimônio cultural imaterial brasileiro.
              </p>
            </v-col>
          </v-row>

          <!-- Ícones de redes sociais -->
          <v-row justify="center" class="mt-0">
            <v-col cols="auto">
              <div class="d-flex justify-center">
                <v-btn
                  icon
                  color="primary"
                  href="#"
                  target="_blank"
                  class="mx-2"
                  aria-label="Facebook"
                >
                  <v-icon>mdi-facebook</v-icon>
                </v-btn>
                <v-btn
                  icon
                  color="primary"
                  href="#"
                  target="_blank"
                  class="mx-2"
                  aria-label="Instagram"
                >
                  <v-icon>mdi-instagram</v-icon>
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<style scoped>
.v-footer {
  border-top: 1px solid #eee;
  padding: 40px 0;
}

@media (max-width: 599px) {
  .v-footer {
    padding: 20px 0;
  }
}
</style>
