<script setup>
import dayjs from "dayjs";

const props = defineProps({
  community: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div class="pa-4">
    <p class="text-h6">Biografia:</p>
    <p class="text-body-1">{{ community.bio }}</p>
    <v-table class="mt-4">
      <p class="text-h6">Informações sobre a Casa Tradicional</p>
      <tbody>
        <tr>
          <td>Nome da Liderança:</td>
          <td>{{ community.religiousSpaceLeaderName }}</td>
        </tr>
        <tr>
          <td>Cargo da Liderança:</td>
          <td class="text-capitalize">
            {{ community.religiousSpacePositionName }}
          </td>
        </tr>
        <tr>
          <td>Identificação da Casa:</td>
          <td class="text-capitalize">{{ community.communityType }}</td>
        </tr>
        <tr>
          <td>Linhas/Nações:</td>
          <td class="text-capitalize">{{ community.religiousSpaceNation }}</td>
        </tr>
        <tr>
          <td>Liguas Práticadas:</td>
          <td class="text-capitalize">
            {{ community.religiousSpacePraticalLanguages }}
          </td>
        </tr>
        <tr>
          <td>Ano de Fundaçào da Casa/Ilê</td>
          <td>{{ community.religiousSpaceYearFoundation }}</td>
        </tr>
        <tr>
          <td>Fundador da Casa/Ilê</td>
          <td>{{ community.religiousSpaceLeaderFoundation }}</td>
        </tr>
        <tr>
          <td>Por quem foi iniciado e data da iniciação:</td>
          <td>
            {{ community.religiousSpaceStartedBy }}<br />
            {{
              dayjs(community.religiousSpaceNameDateStartedBy).format(
                "DD/MM/YYYY"
              )
            }}
          </td>
        </tr>
      </tbody>
    </v-table>

    <v-table class="mt-4">
      <p class="text-h6">Informações Sócias da Liderança</p>
      <tbody>
        <tr>
          <td>Contatos:</td>
          <td>
            Email: {{ community.leaderContacts.email ?? "N/A" }}<br />
            Telefone:
            {{
              community.leaderContacts.phone !== undefined
                ? community.leaderContacts.phone
                : "N/A"
            }}
            <br />
            Celular: {{ community.leaderContacts.mobile ?? "N/A" }}
          </td>
        </tr>
        <tr>
          <td>Raça/cor:</td>
          <td>{{ community.leaderEthnicity }}</td>
        </tr>
        <tr>
          <td>Sexo:</td>
          <td>{{ community.leaderGender }}</td>
        </tr>
        <tr>
          <td>Grau de Escolaridade:</td>
          <td>{{ community.leaderEducationalLevel }}</td>
        </tr>
        <tr>
          <td>Participação em Programas Sociais:</td>
          <td>
            <template
              v-if="
                community.leaderSocialProgram &&
                community.leaderSocialProgram.length > 0
              "
            >
              <div
                v-for="(program, index) in community.leaderSocialProgram"
                :key="index"
                style="margin-bottom: 4px"
              >
                {{ program }}
              </div>
            </template>
            <template v-else>
              <span>Sem participações registradas</span>
            </template>
          </td>
        </tr>

        <tr>
          <td>Já sofreu racismo?</td>
          <td>{{ community.leaderSufferedRacism === true ? "Sim" : "Nao" }}</td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>
