<script setup>
import imgAbout from "@/assets/img/about.jpeg";
</script>

<template>
  <v-container fluid class="bg-grey-lighten-5 pa-sm-4 pa-md-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card class="pa-6 mb-6" elevation="2" rounded="lg">
          <v-card-title class="text-h4 font-weight-regular">
            Uma Visão Sobre a Cultura Afro Brasileira
          </v-card-title>

          <v-card-subtitle class="text-h6 font-weight-regular text-black">
            Análise do Projeto de Cadastramento dos Terreiros de Matriz
            Africana.
          </v-card-subtitle>

          <cad-share />

          <cad-emphasis
            title="Entidade Executora"
            text="A execução do cadastramento na Paraíba, conforme delineado no
            Processo Seletivo nº 01/2018 (Projeto BRA/15/010), foi confiada à
            Casa de Cultura Ilê Asé D'Osoguiã (CCIAO). Esta Organização da
            Sociedade Civil (OSC) foi selecionada para conduzir o projeto,
            possuindo experiência prévia na área, tendo realizado um
            mapeamento inicial similar no município de João Pessoa entre 2011
            e 2012."
          />

          <div id="image" class="pa-4">
            <v-img
              :src="imgAbout"
              cover=""
              height="400"
              class="mb-6"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
            >
              <v-card-title
                class="text-h4 font-weight-bold text-white"
                style="position: absolute; bottom: 20px; left: 20px"
              >
                Uma Visão Sobre a Cultura Afro Brasileira
              </v-card-title>
            </v-img>
          </div>

          <div id="body-blog">
            <h2 class="text-h4 pa-4">Patrocínio e Apoio Institucional</h2>
            <p class="pa-4">
              O projeto de cadastramento insere-se em um contexto mais amplo de
              cooperação técnica, estabelecido entre o Ministério dos Direitos
              Humanos (MDH) e o Programa das Nações Unidas para o
              Desenvolvimento (PNUD), formalizado pelo Acordo de Cooperação
              Técnica BRA/15/010. Esta parceria visa ao fortalecimento e
              expansão do Sistema Nacional de Promoção da Igualdade Racial.
              </br>
              É relevante mencionar que o mapeamento pioneiro realizado pela
              CCIAO em João Pessoa (2011/2012) contou com o apoio institucional
              do Ministério da Cultura (MinC), do Ministério do Desenvolvimento
              Social (MDS) e da Fundação Cultural de João Pessoa (FUNJOPE/PB),
              cujo suporte inicial foi crucial para a viabilização daquela
              etapa.
            </p>

            <h2 class="text-h4 pa-4">
              Objetivos do Projeto
            </h2>
            <p class="pa-4">
              O objetivo central do projeto é realizar o cadastramento
              sistemático dos terreiros de religiões de matriz africana, seguido
              pela disseminação e divulgação dos dados coletados. Esta ação visa
              alcançar múltiplos propósitos:
            </p>
            <ol class="ml-4 pa-4">
              <li>
                <b>Conferir Visibilidade:</b> Identificar e localizar os terreiros,
                promovendo o reconhecimento formal de sua existência e atuação.
              </li>
              <li>
                <b>Fortalecer as Comunidades:</b> Oferecer suporte e fortalecer os
                membros das comunidades religiosas de matriz africana.
              </li>
              <li>
                <b>Combater a Discriminação:</b> Contribuir para a erradicação da
                intolerância religiosa e do racismo institucional.
              </li>
              <li>
                <b>Valorizar o Patrimônio Cultural:</b> Reconhecer e valorizar a
                cultura afro-brasileira como componente essencial da identidade
                nacional.
              </li>
              <li>
                <b>Assegurar Direitos:</b> Auxiliar na garantia dos direitos culturais,
                sociais e territoriais destas comunidades, conforme previsto na
                legislação.
              </li>
              <li>
                <b>Subsidiar Políticas Públicas:</b> Gerar dados qualificados que
                sirvam de base para a formulação e implementação de políticas
                públicas afirmativas e eficazes.
              </li>
            </ol>

            <h2 class="text-h4 pa-4">
              Importância Estratégica
            </h2>
            <p class="mb-4 pa-4">
              A relevância deste cadastramento transcende a mera coleta de
              dados. Historicamente, as comunidades e religiões de matriz
              africana enfrentaram repressão, marginalização e estigmatização,
              reflexo de um racismo estrutural e etnocentrismo religioso. Estas
              comunidades são depositárias de um vasto patrimônio cultural
              imaterial e de saberes ancestrais que contribuíram
              significativamente para a formação sociocultural brasileira.
            </p>

            <p class="pa-4">
              Nesse sentido, o projeto representa um passo fundamental para:
            </p>
            <ul class="ml-4 pa-4">
              <li>
                <b>Reconhecimento Formal:</b> Afirmar a existência, a
                resistência e o valor intrínseco dessas comunidades perante o
                Estado e a sociedade.
              </li>
              <li>
                <b>Reparação Histórica:</b> Contribuir para a reparação das
                injustiças históricas sofridas pelas populações afrodescendentes
                e praticantes de religiões de matriz africana.
              </li>
              <li>
                <b>Promoção da Cidadania:</b> Reforçar o status de cidadania
                plena dos membros dessas comunidades, assegurando-lhes os mesmos
                direitos e deveres dos demais brasileiros.
              </li>
              <li>
                <b> Proteção Cultural:</b> Implementar mecanismos de proteção ao
                patrimônio cultural afro-brasileiro contra a intolerância, a
                discriminação e a violência, fenômenos ainda presentes, como
                indicam dados sobre violência contra a população negra.
              </li>
              <li>
                <b>Desenvolvimento Inclusivo:</b> Fomentar a construção de uma
                sociedade mais justa, equitativa e que valorize sua diversidade
                étnico-racial e religiosa.
              </li>
              ``
            </ul>
            <p class="mb-4 pa-4">
              O Termo de Referência que fundamenta o projeto evoca marcos legais
              importantes, como o Estatuto da Igualdade Racial (Lei nº
              12.288/2010) e a Constituição Federal de 1988 (Art. 5º, inc. VI),
              que garantem a liberdade de consciência, de crença e o livre
              exercício dos cultos religiosos, reforçando a legitimidade e a
              necessidade da iniciativa. Portanto, o cadastramento dos terreiros
              configura-se como uma ação estratégica de reconhecimento,
              valorização cultural e promoção da igualdade racial, essencial
              para a consolidação de um Estado Democrático de Direito mais
              inclusivo no Brasil.
            </p>

            <v-divider class="my-6"></v-divider>

            <h3 class="text-h5 mb-4 pa-4">
              Referências:
            </h3>
            <v-list dense>
              <v-list-item>
                <v-list-item-content>
                  <div class="reference-item">
                    Termo de Referência Padronizado – Anexo II, Cadastramento
                    dos Espaços das Religiões de Matriz Africana, Processo
                    Seletivo nº 01/2018 – Projeto BRA/15/010 – Produto 3.2
                    (Documento fornecido).
                  </div>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>


