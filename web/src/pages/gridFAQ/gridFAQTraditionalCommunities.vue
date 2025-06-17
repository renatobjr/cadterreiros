<script setup>
import imgTradicionalCommunities from "@/assets/img/tradicional-communities.jpg";
</script>

<template>
  <v-container fluid class="bg-grey-lighten-5 pa-sm-4 pa-md-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card class="pa-6 mb-6" elevation="2" rounded="lg">
          <v-card-title class="text-h4 font-weight-regular">
            Mergulhando nas Raízes
          </v-card-title>

          <v-card-subtitle class="text-h6 font-weight-regular text-black">
            Um Olhar sobre as Comunidades Tradicionais de Matriz Africana e de
            Terreiro no Brasil
          </v-card-subtitle>

          <cad-share />

          <cad-emphasis
            title="Diversidade Religiosa"
            text="O Brasil é um país tecido por uma diversidade cultural imensa, e
              parte fundamental dessa riqueza reside nas comunidades
              tradicionais de matriz africana e nas comunidades de terreiro.
              Estes grupos, guardiões de saberes ancestrais e protagonistas de
              uma história de resistência, representam a força viva da herança
              africana em nosso território. Compreender sua organização, sua
              importância cultural e os desafios que enfrentam é essencial para
              valorizar a pluralidade que nos constitui e combater o preconceito
              que ainda as aflige."
          />

          <div id="image" class="pa-4">
            <v-img
              :src="imgTradicionalCommunities"
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
            <h2 class="text-h4 pa-4">
              Entendendo as Comunidades Tradicionais de Matriz Africana
            </h2>
            <p class="pa-4">
              Quando falamos em "Povos e Comunidades Tradicionais de Matriz
              Africana", referimo-nos a grupos que se reconhecem e se organizam
              social e culturalmente a partir de valores civilizatórios,
              cosmovisões e práticas trazidas da África durante o período da
              diáspora forçada. Sua identidade está profundamente ligada a uma
              ancestralidade comum e a uma história marcada pela luta contra a
              escravização e pela preservação de suas tradições em solo
              brasileiro. Documentos como o Plano Nacional de Desenvolvimento
              Sustentável dos Povos e Comunidades Tradicionais de Matriz
              Africana (IPHAN) definem esses grupos pela sua organização baseada
              nesses valores e cosmovisões africanas. A própria formação de
              territórios de resistência, como os quilombos, está
              intrinsecamente ligada à manutenção dessas culturas.
            </p>
            <p class="pa-4">
              É importante notar, como aponta a análise acadêmica (Morais,
              2017), que a própria expressão "Povos e Comunidades Tradicionais
              de Matriz Africana" também emergiu como uma categoria discursiva e
              política significativa. Ela foi construída e mobilizada pelos
              movimentos negro e afro-religioso, especialmente a partir do
              início dos anos 2000, no contexto da criação de políticas públicas
              como a de Promoção da Igualdade Racial. O objetivo era dar
              visibilidade a esses grupos, garantir seus direitos e inseri-los
              na agenda nacional de diversidade cultural, contrapondo-se a
              séculos de invisibilidade e perseguição.
            </p>

            <h2 class="text-h4 pa-4">
              O Coração da Resistência: As Comunidades de Terreiro
            </h2>
            <p class="pa-4">
              Dentro do universo das comunidades de matriz africana, as
              "Comunidades de Terreiro" ocupam um lugar central. O terreiro é
              muito mais do que um espaço físico; é o local sagrado onde se
              praticam e se vivenciam as religiões de matriz africana, como o
              Candomblé e a Umbanda, entre outras manifestações. É ali que a
              comunidade se reúne, organizada em torno de lideranças espirituais
              – os pais e mães de santo – formando uma verdadeira "família de
              santo", unida por laços de fé, respeito e aprendizado mútuo.
            </p>
            <p class="pa-4">
              Contudo, o papel do terreiro transcende o aspecto puramente
              religioso. Como reconhecido por diversas fontes, incluindo
              documentos governamentais e pesquisas (gov.br,
              museucerrado.com.br), esses espaços são fundamentais para o
              desenvolvimento social e local. São centros de preservação da
              cultura oral, da memória ancestral, de conhecimentos sobre ervas
              medicinais, de práticas de saúde comunitária, de línguas africanas
              e de expressões artísticas como a música e a dança. O terreiro é,
              portanto, um patrimônio vivo, um núcleo de resistência cultural e
              social que pulsa no coração de muitas comunidades brasileiras.
            </p>

            <h2 class="text-h4 pa-4">
              A Riqueza Cultural e os Desafios Contemporâneos
            </h2>
            <p class="pa-4">
              A importância das comunidades tradicionais de matriz africana e de
              terreiro para a cultura brasileira é inestimável. Elas são as
              principais responsáveis pela manutenção e transmissão de saberes,
              rituais, tecnologias sociais e modos de vida que enriquecem nossa
              identidade nacional. Sua resiliência ao longo dos séculos,
              enfrentando a violência da escravidão, a imposição cultural e a
              perseguição religiosa, demonstra uma força extraordinária.
            </p>
            <p class="pa-4">
              No entanto, essas comunidades ainda enfrentam desafios
              significativos. A intolerância e o racismo religioso, muitas vezes
              alimentados por desinformação e preconceito, continuam sendo uma
              realidade dolorosa, manifestando-se em ataques a terreiros,
              discriminação contra seus membros e discursos de ódio. A análise
              de Morais (2017) destaca como a luta contra essa intolerância,
              vinda inclusive de outros grupos religiosos, foi um motor para a
              organização política e a busca por reconhecimento estatal. Além
              disso, a luta por direitos territoriais, pela segurança alimentar
              e nutricional e pelo reconhecimento pleno de suas práticas como
              parte essencial do patrimônio cultural brasileiro são pautas
              constantes.
            </p>
            <p class="pa-4">
              A criação de políticas públicas específicas, como a Política
              Nacional para Povos e Comunidades Tradicionais de Terreiro e de
              Matriz Africana, instituída recentemente (gov.br, 2024/2025),
              representa um avanço importante, mas a sua implementação efetiva e
              a garantia de direitos ainda exigem vigilância e mobilização
              contínuas.
            </p>

            <h2 class="text-h4 pa-4">
              Conclusão: Valorizar, Respeitar, Conhecer
            </h2>
            <p class="pa-4">
              As comunidades tradicionais de matriz africana e de terreiro são
              pilares da diversidade cultural brasileira. Sua história é de
              resistência, sua prática é de preservação e sua existência
              enriquece a todos nós. Conhecer sua realidade, valorizar seus
              saberes e combater ativamente o racismo e a intolerância religiosa
              são passos fundamentais para construirmos um Brasil
              verdadeiramente plural e justo. Que possamos olhar para essas
              comunidades não com estranhamento, mas com o respeito e a
              admiração que merecem, reconhecendo nelas a força ancestral que
              ajuda a moldar a identidade do nosso país.
            </p>

            <v-divider class="my-6"></v-divider>

            <h3 class="text-h5 mb-4 pa-4">Referências:</h3>
            <v-list dense>
              <v-list-item>
                <v-list-item-content>
                  <div class="reference-item">
                    Morais, M. R. (2017). Povos e comunidades tradicionais de
                    matriz africana: Uma análise sobre o processo de construção
                    de uma categoria discursiva.
                    <em>Civitas - Revista de Ciências Sociais</em>, 17(2),
                    256-271. Recuperado de
                    <a
                      href="https://www.scielo.br/j/civitas/a/RjnJ89KdHyv6b4jyd4YfcMG/"
                      target="_blank"
                      class="deep-purple--text text--darken-1"
                      >https://www.scielo.br/j/civitas/a/RjnJ89KdHyv6b4jyd4YfcMG/</a
                    >
                  </div>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <div class="reference-item">
                    Instituto do Patrimônio Histórico e Artístico Nacional
                    (IPHAN).
                    <em
                      >Plano Nacional de Desenvolvimento Sustentável dos Povos e
                      Comunidades Tradicionais de Matriz Africana</em
                    >. Recuperado de
                    <a
                      href="http://portal.iphan.gov.br/uploads/ckfinder/arquivos/plano_nacional_desen_sustentavel_povos_comunidades_trad_matriz_africana.pdf"
                      target="_blank"
                      class="deep-purple--text text--darken-1"
                      >http://portal.iphan.gov.br/uploads/ckfinder/arquivos/plano_nacional_desen_sustentavel_povos_comunidades_trad_matriz_africana.pdf</a
                    >
                  </div>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <div class="reference-item">
                    Governo Federal do Brasil.
                    <em
                      >Política Nacional para Povos e Comunidades Tradicionais
                      de Terreiro e de Matriz Africana</em
                    >. Recuperado de
                    <a
                      href="https://www.gov.br/igualdaderacial/pt-br/assuntos/politica-nacional-para-povos-e-comunidades-tradicionais-de-terreiro-e-matriz-africana"
                      target="_blank"
                      class="deep-purple--text text--darken-1"
                      >https://www.gov.br/igualdaderacial/pt-br/assuntos/politica-nacional-para-povos-e-comunidades-tradicionais-de-terreiro-e-matriz-africana</a
                    >
                    e
                    <a
                      href="https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/decreto/d12278.htm"
                      target="_blank"
                      class="deep-purple--text text--darken-1"
                      >https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/decreto/d12278.htm</a
                    >
                  </div>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <div class="reference-item">
                    Museu do Cerrado. <em>Povos de terreiro</em>. Recuperado de
                    <a
                      href="https://museucerrado.com.br/culturas-cerratenses/comunidades-tradicionais/povos-terreiro/"
                      target="_blank"
                      class="deep-purple--text text--darken-1"
                      >https://museucerrado.com.br/culturas-cerratenses/comunidades-tradicionais/povos-terreiro/</a
                    >
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
