<script setup>
import imgLanguages from "@/assets/img/languages.png";
</script>

<template>
  <v-container fluid class="bg-grey-lighten-5 pa-sm-4 pa-md-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card class="pa-6 mb-6" elevation="2" rounded="lg">
          <v-card-title class="text-h4 font-weight-regular">
            As linguagens do Candomblé
          </v-card-title>

          <v-card-subtitle class="text-h6 font-weight-regular text-black">
            As Línguas Africanas nas Religiões de Matriz Africana no Brasil
          </v-card-subtitle>

          <cad-share />

          <cad-emphasis
            title="Os dialetos nas Religiões de Matriz Africana no Brasil"
            text="As religiões de matriz africana no Brasil constituem um rico
              mosaico cultural e espiritual, profundamente marcado pela herança
              linguística dos povos trazidos à força durante o período da
              escravidão. Diversas línguas africanas, embora não sejam mais de
              uso corrente na comunicação cotidiana, preservam-se como veículos
              sagrados em rituais, cânticos e invocações, conectando os
              praticantes à sua ancestralidade e às divindades. Este artigo
              explora brevemente quatro dessas línguas – Iorubá, Quicongo,
              Umbundo e o grupo Ewe-Fon – e seu papel fundamental nas práticas
              religiosas afro-brasileiras."
          />

          <div id="image" class="pa-4">
            <v-img
              :src="imgLanguages"
              cover=""
              height="400"
              class="mb-6"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
            >
              <v-card-title
                class="text-h4 font-weight-bold text-white"
                style="position: absolute; bottom: 20px; left: 20px"
              >
                A bi omo Êfon lati dun
              </v-card-title>
            </v-img>
          </div>

          <div id="body-blog">
            <h2 class="text-h4 pa-4">Iorubá (Nagô)</h2>
            <p class="pa-4">
              A língua Iorubá, originária do sudoeste da atual Nigéria e regiões
              adjacentes, pertence à família linguística nígero-congolesa. No
              Brasil, é frequentemente referida como "Nagô". Sua influência é
              particularmente proeminente no Candomblé de nação Queto (Ketu),
              mas também se manifesta na Umbanda e em outras vertentes. O Iorubá
              é a língua dos Orixás, utilizada em saudações, cânticos (orins),
              rezas (aduras) e na nomenclatura de divindades, objetos rituais e
              conceitos teológicos. A preservação do Iorubá litúrgico é
              essencial para a transmissão dos conhecimentos e para a correta
              execução dos rituais, sendo reconhecida, inclusive, como
              patrimônio imaterial em alguns estados brasileiros, como o Rio de
              Janeiro, dada sua profunda conexão cultural e religiosa.
            </p>

            <h2 class="text-h4 pa-4">Quicongo (Kikongo)</h2>
            <p class="pa-4">
              O Quicongo (Kikongo) é uma língua Bantu falada pelo povo Congo
              (Bakongo) em Angola, na República Democrática do Congo e na
              República do Congo. No Brasil, sua influência é marcante nas
              nações de Candomblé de origem Bantu, como Angola e Congo. Termos
              em Quicongo são empregados para designar divindades (Inquices -
              Nkisis), saudações, elementos rituais e cânticos específicos
              dessas tradições. A estrutura linguística Bantu, com seu sistema
              de classes nominais, reflete-se na forma como o sagrado é
              concebido e expresso nessas vertentes religiosas, evidenciando a
              memória e a resistência cultural dos povos de origem Congo no
              Brasil.
            </p>

            <h2 class="text-h4 pa-4">Umbundo</h2>
            <p class="pa-4">
              Também pertencente ao grupo Bantu e originária de Angola, a língua
              Umbundo é associada principalmente ao povo Ovimbundo. Assim como o
              Quicongo, o Umbundo contribuiu significativamente para o léxico
              das religiões afro-brasileiras de raiz Bantu. Embora por vezes
              menos documentada em estudos linguísticos focados no uso religioso
              em comparação ao Iorubá ou Quicongo, sua presença é afirmada por
              praticantes e alguns estudos como uma "linguagem sagrada"
              utilizada na comunicação com as divindades dentro de certas casas
              de Candomblé e, potencialmente, na Umbanda. Vocábulos Umbundo
              integram o universo lexical dessas religiões, nomeando entidades,
              ritos e conceitos.
            </p>

            <h2 class="text-h4 pa-4">Ewe-Fon (Jeje)</h2>
            <p class="pa-4">
              grupo linguístico Gbe, que inclui as línguas Ewe e Fon, é
              originário de regiões que hoje correspondem a Gana, Togo e Benim.
              No Brasil, os falantes dessas línguas foram frequentemente
              agrupados sob a denominação "Jeje". Sua influência é central no
              Candomblé de nação Jeje (Djeje), notadamente nas casas como a Casa
              das Minas (Querebentã de Zomadonu), no Maranhão, e em terreiros
              Jeje Mahi e Jeje Savalu. As línguas Ewe e Fon são empregadas nos
              cânticos, invocações e na nomenclatura dos Voduns, as divindades
              cultuadas nessa nação. A preservação dessas línguas nos rituais
              Jeje é vital para a manutenção da identidade e das práticas
              específicas dessa importante vertente religiosa afro-brasileira.
            </p>

            <h2 class="text-h4 pa-4">Considerações Finais</h2>
            <p class="pa-4">
              A presença e o uso litúrgico das línguas Iorubá, Quicongo, Umbundo
              e Ewe-Fon nas religiões de matriz africana no Brasil são
              testemunhos da resiliência cultural e espiritual dos povos
              africanos e seus descendentes. Essas línguas não são meros
              resquícios do passado, mas elementos vivos e dinâmicos que
              continuam a moldar a identidade, a cosmologia e as práticas
              rituais, garantindo a conexão com a ancestralidade e a transmissão
              de saberes essenciais para a continuidade dessas tradições
              religiosas.
            </p>

            <v-divider class="my-6"></v-divider>

            <h3 class="text-h5 mb-4 pa-4">Referências:</h3>
            <v-list dense>
              <v-list-item>
                <v-list-item-content>
                  <div class="reference-item">
                    Fontes consultadas incluem informações gerais de plataformas
                    como Wikipédia, Brasil Escola, Mundo Educação, Politize,
                    Museu da Língua Portuguesa, MultiRio, além de artigos e
                    menções em sites especializados como Carta Capital, Geledés,
                    O Prelo, Savalu, e portais acadêmicos como UERJ e UFF, que
                    abordam a história, cultura e linguística dos povos
                    africanos e sua influência no Brasil.
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
