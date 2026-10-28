import artigoComunidades from "../../assets/img/artigo-comunidades.jpg";
import artigoLinguas from "../../assets/img/artigo-linguas.jpg";
import artigoNacoes from "../../assets/img/artigo-nacoes.jpg";

export type ArticleBlock =
  | { type: "p"; html: string }
  | { type: "h3"; text: string }
  | { type: "ol"; items: string[] }
  | { type: "ul"; items: string[] };

export interface ArticleSection {
  title: string;
  blocks: ArticleBlock[];
}

export interface Article {
  slug: string;
  title: string;
  kicker: string;
  description: string;
  image: string;
  leadTitle: string;
  lead: string;
  sections: ArticleSection[];
  references: string[];
}

/** Conteúdo editorial dos artigos, transposto do protótipo. */
export const ARTICLES: Article[] = [
  {
    slug: "comunidades-tradicionais",
    title: "O que são Comunidades Tradicionais?",
    kicker: "Mergulhando nas Raízes",
    description: "Um olhar sobre as comunidades tradicionais de matriz africana e de terreiro no Brasil.",
    image: artigoComunidades,
    leadTitle: "Diversidade Religiosa",
    lead: "O Brasil é um país tecido por uma diversidade cultural imensa, e parte fundamental dessa riqueza reside nas comunidades tradicionais de matriz africana e nas comunidades de terreiro. Estes grupos, guardiões de saberes ancestrais e protagonistas de uma história de resistência, representam a força viva da herança africana em nosso território. Compreender sua organização, sua importância cultural e os desafios que enfrentam é essencial para valorizar a pluralidade que nos constitui e combater o preconceito que ainda as aflige.",
    sections: [
      {
        title: "Entendendo as Comunidades Tradicionais de Matriz Africana",
        blocks: [
          {
            type: "p",
            html: "Quando falamos em \"Povos e Comunidades Tradicionais de Matriz Africana\", referimo-nos a grupos que se reconhecem e se organizam social e culturalmente a partir de valores civilizatórios, cosmovisões e práticas trazidas da África durante o período da diáspora forçada. Sua identidade está profundamente ligada a uma ancestralidade comum e a uma história marcada pela luta contra a escravização e pela preservação de suas tradições em solo brasileiro. Documentos como o Plano Nacional de Desenvolvimento Sustentável dos Povos e Comunidades Tradicionais de Matriz Africana (IPHAN) definem esses grupos pela sua organização baseada nesses valores e cosmovisões africanas. A própria formação de territórios de resistência, como os quilombos, está intrinsecamente ligada à manutenção dessas culturas."
          },
          {
            type: "p",
            html: "É importante notar, como aponta a análise acadêmica (Morais, 2017), que a própria expressão \"Povos e Comunidades Tradicionais de Matriz Africana\" também emergiu como uma categoria discursiva e política significativa. Ela foi construída e mobilizada pelos movimentos negro e afro-religioso, especialmente a partir do início dos anos 2000, no contexto da criação de políticas públicas como a de Promoção da Igualdade Racial. O objetivo era dar visibilidade a esses grupos, garantir seus direitos e inseri-los na agenda nacional de diversidade cultural, contrapondo-se a séculos de invisibilidade e perseguição."
          }
        ]
      },
      {
        title: "O Coração da Resistência: As Comunidades de Terreiro",
        blocks: [
          {
            type: "p",
            html: "Dentro do universo das comunidades de matriz africana, as \"Comunidades de Terreiro\" ocupam um lugar central. O terreiro é muito mais do que um espaço físico; é o local sagrado onde se praticam e se vivenciam as religiões de matriz africana, como o Candomblé e a Umbanda, entre outras manifestações. É ali que a comunidade se reúne, organizada em torno de lideranças espirituais – os pais e mães de santo – formando uma verdadeira \"família de santo\", unida por laços de fé, respeito e aprendizado mútuo."
          },
          {
            type: "p",
            html: "Contudo, o papel do terreiro transcende o aspecto puramente religioso. Como reconhecido por diversas fontes, incluindo documentos governamentais e pesquisas (gov.br, museucerrado.com.br), esses espaços são fundamentais para o desenvolvimento social e local. São centros de preservação da cultura oral, da memória ancestral, de conhecimentos sobre ervas medicinais, de práticas de saúde comunitária, de línguas africanas e de expressões artísticas como a música e a dança. O terreiro é, portanto, um patrimônio vivo, um núcleo de resistência cultural e social que pulsa no coração de muitas comunidades brasileiras."
          }
        ]
      },
      {
        title: "A Riqueza Cultural e os Desafios Contemporâneos",
        blocks: [
          {
            type: "p",
            html: "A importância das comunidades tradicionais de matriz africana e de terreiro para a cultura brasileira é inestimável. Elas são as principais responsáveis pela manutenção e transmissão de saberes, rituais, tecnologias sociais e modos de vida que enriquecem nossa identidade nacional. Sua resiliência ao longo dos séculos, enfrentando a violência da escravidão, a imposição cultural e a perseguição religiosa, demonstra uma força extraordinária."
          },
          {
            type: "p",
            html: "No entanto, essas comunidades ainda enfrentam desafios significativos. A intolerância e o racismo religioso, muitas vezes alimentados por desinformação e preconceito, continuam sendo uma realidade dolorosa, manifestando-se em ataques a terreiros, discriminação contra seus membros e discursos de ódio. A análise de Morais (2017) destaca como a luta contra essa intolerância, vinda inclusive de outros grupos religiosos, foi um motor para a organização política e a busca por reconhecimento estatal. Além disso, a luta por direitos territoriais, pela segurança alimentar e nutricional e pelo reconhecimento pleno de suas práticas como parte essencial do patrimônio cultural brasileiro são pautas constantes."
          },
          {
            type: "p",
            html: "A criação de políticas públicas específicas, como a Política Nacional para Povos e Comunidades Tradicionais de Terreiro e de Matriz Africana, instituída recentemente (gov.br, 2024/2025), representa um avanço importante, mas a sua implementação efetiva e a garantia de direitos ainda exigem vigilância e mobilização contínuas."
          }
        ]
      },
      {
        title: "Conclusão: Valorizar, Respeitar, Conhecer",
        blocks: [
          {
            type: "p",
            html: "As comunidades tradicionais de matriz africana e de terreiro são pilares da diversidade cultural brasileira. Sua história é de resistência, sua prática é de preservação e sua existência enriquece a todos nós. Conhecer sua realidade, valorizar seus saberes e combater ativamente o racismo e a intolerância religiosa são passos fundamentais para construirmos um Brasil verdadeiramente plural e justo. Que possamos olhar para essas comunidades não com estranhamento, mas com o respeito e a admiração que merecem, reconhecendo nelas a força ancestral que ajuda a moldar a identidade do nosso país."
          },
          {
            type: "h3",
            text: "Referências:"
          }
        ]
      }
    ],
    references: [
      "Morais, M. R. (2017). Povos e comunidades tradicionais de matriz africana: Uma análise sobre o processo de construção de uma categoria discursiva. <em>Civitas - Revista de Ciências Sociais</em>, 17(2), 256-271. Recuperado de <a href=\"https://www.scielo.br/j/civitas/a/RjnJ89KdHyv6b4jyd4YfcMG/\" rel=\"noopener\" target=\"_blank\">https://www.scielo.br/j/civitas/a/RjnJ89KdHyv6b4jyd4YfcMG/</a>",
      "Instituto do Patrimônio Histórico e Artístico Nacional (IPHAN). <em>Plano Nacional de Desenvolvimento Sustentável dos Povos e Comunidades Tradicionais de Matriz Africana</em>. Recuperado de <a href=\"http://portal.iphan.gov.br/uploads/ckfinder/arquivos/plano_nacional_desen_sustentavel_povos_comunidades_trad_matriz_africana.pdf\" rel=\"noopener\" target=\"_blank\">http://portal.iphan.gov.br/uploads/ckfinder/arquivos/plano_nacional_desen_sustentavel_povos_comunidades_trad_matriz_africana.pdf</a>",
      "Governo Federal do Brasil. <em>Política Nacional para Povos e Comunidades Tradicionais de Terreiro e de Matriz Africana</em>. Recuperado de <a href=\"https://www.gov.br/igualdaderacial/pt-br/assuntos/politica-nacional-para-povos-e-comunidades-tradicionais-de-terreiro-e-matriz-africana\" rel=\"noopener\" target=\"_blank\">https://www.gov.br/igualdaderacial/pt-br/assuntos/politica-nacional-para-povos-e-comunidades-tradicionais-de-terreiro-e-matriz-africana</a> e <a href=\"https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/decreto/d12278.htm\" rel=\"noopener\" target=\"_blank\">https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/decreto/d12278.htm</a>",
      "Museu do Cerrado. <em>Povos de terreiro</em>. Recuperado de <a href=\"https://museucerrado.com.br/culturas-cerratenses/comunidades-tradicionais/povos-terreiro/\" rel=\"noopener\" target=\"_blank\">https://museucerrado.com.br/culturas-cerratenses/comunidades-tradicionais/povos-terreiro/</a>"
    ]
  },
  {
    slug: "linguas-do-candomble",
    title: "Quais as linguagens do Candomblé?",
    kicker: "As linguagens do Candomblé",
    description: "As línguas africanas nas religiões de matriz africana no Brasil.",
    image: artigoLinguas,
    leadTitle: "Os dialetos nas Religiões de Matriz Africana no Brasil",
    lead: "As religiões de matriz africana no Brasil constituem um rico mosaico cultural e espiritual, profundamente marcado pela herança linguística dos povos trazidos à força durante o período da escravidão. Diversas línguas africanas, embora não sejam mais de uso corrente na comunicação cotidiana, preservam-se como veículos sagrados em rituais, cânticos e invocações, conectando os praticantes à sua ancestralidade e às divindades. Este artigo explora brevemente quatro dessas línguas – Iorubá, Quicongo, Umbundo e o grupo Ewe-Fon – e seu papel fundamental nas práticas religiosas afro-brasileiras.",
    sections: [
      {
        title: "Iorubá (Nagô)",
        blocks: [
          {
            type: "p",
            html: "A língua Iorubá, originária do sudoeste da atual Nigéria e regiões adjacentes, pertence à família linguística nígero-congolesa. No Brasil, é frequentemente referida como \"Nagô\". Sua influência é particularmente proeminente no Candomblé de nação Queto (Ketu), mas também se manifesta na Umbanda e em outras vertentes. O Iorubá é a língua dos Orixás, utilizada em saudações, cânticos (orins), rezas (aduras) e na nomenclatura de divindades, objetos rituais e conceitos teológicos. A preservação do Iorubá litúrgico é essencial para a transmissão dos conhecimentos e para a correta execução dos rituais, sendo reconhecida, inclusive, como patrimônio imaterial em alguns estados brasileiros, como o Rio de Janeiro, dada sua profunda conexão cultural e religiosa."
          }
        ]
      },
      {
        title: "Quicongo (Kikongo)",
        blocks: [
          {
            type: "p",
            html: "O Quicongo (Kikongo) é uma língua Bantu falada pelo povo Congo (Bakongo) em Angola, na República Democrática do Congo e na República do Congo. No Brasil, sua influência é marcante nas nações de Candomblé de origem Bantu, como Angola e Congo. Termos em Quicongo são empregados para designar divindades (Inquices - Nkisis), saudações, elementos rituais e cânticos específicos dessas tradições. A estrutura linguística Bantu, com seu sistema de classes nominais, reflete-se na forma como o sagrado é concebido e expresso nessas vertentes religiosas, evidenciando a memória e a resistência cultural dos povos de origem Congo no Brasil."
          }
        ]
      },
      {
        title: "Umbundo",
        blocks: [
          {
            type: "p",
            html: "Também pertencente ao grupo Bantu e originária de Angola, a língua Umbundo é associada principalmente ao povo Ovimbundo. Assim como o Quicongo, o Umbundo contribuiu significativamente para o léxico das religiões afro-brasileiras de raiz Bantu. Embora por vezes menos documentada em estudos linguísticos focados no uso religioso em comparação ao Iorubá ou Quicongo, sua presença é afirmada por praticantes e alguns estudos como uma \"linguagem sagrada\" utilizada na comunicação com as divindades dentro de certas casas de Candomblé e, potencialmente, na Umbanda. Vocábulos Umbundo integram o universo lexical dessas religiões, nomeando entidades, ritos e conceitos."
          }
        ]
      },
      {
        title: "Ewe-Fon (Jeje)",
        blocks: [
          {
            type: "p",
            html: "grupo linguístico Gbe, que inclui as línguas Ewe e Fon, é originário de regiões que hoje correspondem a Gana, Togo e Benim. No Brasil, os falantes dessas línguas foram frequentemente agrupados sob a denominação \"Jeje\". Sua influência é central no Candomblé de nação Jeje (Djeje), notadamente nas casas como a Casa das Minas (Querebentã de Zomadonu), no Maranhão, e em terreiros Jeje Mahi e Jeje Savalu. As línguas Ewe e Fon são empregadas nos cânticos, invocações e na nomenclatura dos Voduns, as divindades cultuadas nessa nação. A preservação dessas línguas nos rituais Jeje é vital para a manutenção da identidade e das práticas específicas dessa importante vertente religiosa afro-brasileira."
          }
        ]
      },
      {
        title: "Considerações Finais",
        blocks: [
          {
            type: "p",
            html: "A presença e o uso litúrgico das línguas Iorubá, Quicongo, Umbundo e Ewe-Fon nas religiões de matriz africana no Brasil são testemunhos da resiliência cultural e espiritual dos povos africanos e seus descendentes. Essas línguas não são meros resquícios do passado, mas elementos vivos e dinâmicos que continuam a moldar a identidade, a cosmologia e as práticas rituais, garantindo a conexão com a ancestralidade e a transmissão de saberes essenciais para a continuidade dessas tradições religiosas."
          },
          {
            type: "h3",
            text: "Referências:"
          }
        ]
      }
    ],
    references: [
      "Fontes consultadas incluem informações gerais de plataformas como Wikipédia, Brasil Escola, Mundo Educação, Politize, Museu da Língua Portuguesa, MultiRio, além de artigos e menções em sites especializados como Carta Capital, Geledés, O Prelo, Savalu, e portais acadêmicos como UERJ e UFF, que abordam a história, cultura e linguística dos povos africanos e sua influência no Brasil."
    ]
  },
  {
    slug: "nacoes-do-candomble",
    title: "Quais as nações do Candomblé no Brasil?",
    kicker: "As nações do Candomblé no Brasil",
    description: "Origens, divindades e práticas religiosas das nações do Candomblé.",
    image: artigoNacoes,
    leadTitle: "Angola, Efon, Jeje, Ketu e Nagô: As Raízes do Candomblé no Brasil",
    lead: "O Candomblé, uma das mais ricas e complexas religiões de matriz africana no Brasil, é um universo de crenças, rituais e tradições que reflete a diversidade cultural dos povos africanos trazidos para o país. Organizado em diferentes nações, o Candomblé preserva e adapta os cultos ancestrais, cada qual com suas particularidades de origem, divindades e práticas. Este artigo explora as principais nações do Candomblé no Brasil – Angola, Eketí Efon, Jeje, Ketu e Nagô – detalhando suas origens, as divindades cultuadas e as práticas religiosas que as caracterizam.",
    sections: [
      {
        title: "Nação Angola",
        blocks: [
          {
            type: "p",
            html: "O Candomblé Banto, Candomblé de Congo-Angola ou simplesmente Candomblé de Angola é uma das maiores nações de candomblé no Brasil. Desenvolveu-se entre escravos que falavam quicongo, umbundo e principalmente quimbundo, línguas de povos bantos da África Central e Austral. O termo 'banto' é uma reconstrução linguística que significa 'gente', e é usado para identificar os povos da África subsariana que falavam línguas bantas, que foram trazidos ao Brasil como escravos."
          },
          {
            type: "h3",
            text: "História no Brasil"
          },
          {
            type: "p",
            html: "A história do Candomblé Angola no Brasil está intrinsecamente ligada à chegada dos povos bantos escravizados, principalmente de regiões como Angola e Congo. Esses povos trouxeram consigo suas tradições religiosas, que foram adaptadas e recriadas no novo ambiente, resultando na formação da nação Angola do Candomblé. A resistência cultural e religiosa desses grupos foi fundamental para a preservação e desenvolvimento de suas práticas no Brasil, muitas vezes de forma sincrética com elementos do catolicismo popular para sobreviver à repressão. Os primeiros terreiros de Angola surgiram em comunidades quilombolas e áreas rurais, espalhando-se posteriormente para os centros urbanos."
          },
          {
            type: "h3",
            text: "Principais Orixás Cultuados"
          },
          {
            type: "p",
            html: "No Candomblé Angola, as divindades são chamadas de Inquices, que correspondem aos Orixás de outras nações. Temos como exemplo o culto ã Nzambi (ser supremo) e os inquices como Kavungo (Obaluaiê), Kitembo (equivalente a Iroko)."
          },
          {
            type: "h3",
            text: "Principais Ritos e Práticas"
          },
          {
            type: "p",
            html: "Os ritos do Candomblé Angola são marcados por uma forte conexão com a natureza e a ancestralidade."
          },
          {
            type: "h3",
            text: "Maior Incidência nas Regiões do Brasil"
          },
          {
            type: "p",
            html: "A mais tradicional casa angoleira do Brasil foi fundada em Salvador por Maria Genoveva do Bonfim, a Mameto Tuenda dia N’Zambi, conhecida por Maria Neném. Em São Paulo, na cidade de Itapecerica da Serra, há uma casa que é sua herdeira, a Kua Dianda Inzo Ia Tumbansi Tua Nzambi Ngana Kavungu, dirigida por Walmir Damasceno, o Tata Takuvanjensi."
          }
        ]
      },
      {
        title: "Nação Ekiti-Éfon",
        blocks: [
          {
            type: "p",
            html: "A nação efon (ou, mais raramente, nação efã) é uma nação de candomblé de origem nagô (iorubá). Como nas demais nações de origem iorubana (Queto, ijexá e Nagô-Vodum), a nação efon cultua as divindades africanas chamadas orixás. Um dos vários aspectos que distingue essa nação das suas irmãs é o culto ao orixá Oloroquê, um orixá funfum masculino considerado patrono da nação juntamente com Oxum."
          },
          {
            type: "h3",
            text: "História no Brasil"
          },
          {
            type: "p",
            html: "A nação efon remonta ao antigo Reino de Efon, um pequeno reino iorubá (do subgrupo equiti) que atualmente é a cidade de Efon-Alaaye, Estado de Ekiti, Nigéria. Dessa região chegaram a Salvador, no século XIX, dois africanos escravizados: José Firmino dos Santos, apelidado “Tio Firmo”, e Maria Bernarda da Paixão, apelidada “Maria Violão”. Foram Tio Firmo e Maria Violão que fundaram o Terreiro do Oloroquê no Bairro Engenho Velho de Brotas (Salvador-BA), em 1901, a matriz da qual descendem todas as casas de efon. Hoje, ambos são considerados fundadores da nação efon e seus orixás (Oxum e Oloroquê, respectivamente) são os patronos da nação. Após o encerramento da casa matriz, muitos descendentes da Casa do Oloroquê mantêm o axé efon, com destaque para o Ilê Ogun Anaeji Igbele Ni Oman, ou Axé Pantanal, em Duque de Caxias, RJ, hoje o principal terreiro de candomblé efon do Brasil."
          },
          {
            type: "h3",
            text: "Principais Orixás Cultuados"
          },
          {
            type: "p",
            html: "A nação efã cultua os Orixás Exu, Ogum, Oxóssi, Omolu, Oxumarê, Oçânhim, Nanã, Xangô, Obá, Oiá, Ieuá, Logunedé, Oxum, Iemanjá, Irocô, Oxaguiã e Oxalufã, além do orixás específicos de efã (Oloroquê e Jagum) e do culto a ori. Oloroquê é o orixá das montanhas, colinas, cumes e elevações, considerado pai de Oxum na cosmologia da nação efon."
          },
          {
            type: "h3",
            text: "Principais Ritos e Práticas"
          },
          {
            type: "p",
            html: "O culto a Oloroquê no Brasil só existe na nação efon e seu louvor durante as festas públicas, chamado “roda de Oloquê”, é o alicerce que sustenta a identidade da nação efon. Trata-se de um orixá funfum (que veste roupas brancas). Olôke é reverenciado pelo menos, em cinco momentos na liturgia do candomblé efon: nas narrativas míticas, nas adurá (termo iorubá que designa reza), nos ritmos ijexá e alujá emitidos através dos toques dos atabaques, nos orin (cânticos) que invocam o seu nome; e nos assentamentos do orixá."
          },
          {
            type: "h3",
            text: "Maior Incidência nas Regiões do Brasil"
          },
          {
            type: "p",
            html: "Originalmente concentrado em Salvador, Bahia, a nação Efon se expandiu para a Região Sudeste, com o Axé Pantanal em Duque de Caxias, RJ, sendo um dos principais centros."
          }
        ]
      },
      {
        title: "Nação Jeje",
        blocks: [
          {
            type: "p",
            html: "O Candomblé Jeje cultua os voduns do Reino do Daomé (atual Benim) e foi trazido para o Brasil por africanos escravizados de diversas regiões da África Ocidental e Central. As divindades são da mitologia fon. Os grupos étnicos como fon, jeje, fântis e axante, ao chegarem no Brasil, eram chamados de <em>djedje</em> (do iorubá <em>àjèjì</em>, 'estrangeiro, estranho'), designação que os iorubás no Daomé atribuíam aos povos vizinhos. Sua entrada no Brasil ocorreu em meados do século XVII."
          },
          {
            type: "h3",
            text: "História no Brasil"
          },
          {
            type: "p",
            html: "No Brasil, a organização do culto aos Voduns como conhecemos hoje começou em 1821, em São Luís do Maranhão, com a chegada de Dona Francisca da Rocha, uma africana livre que trouxe consigo as tradições do Vodum. O Jeje-Mahi foi fundamentado no Brasil pela africana Ludovina Pessoa, da cidade de Mahi. Os Jejes tiveram um papel fundamental na gênese do candomblé na Bahia e do tambor de mina no Maranhão."
          },
          {
            type: "h3",
            text: "Principais Voduns (Orixás) Cultuados"
          },
          {
            type: "p",
            html: "Os espíritos Jeje são chamados Voduns (sing. Vodum). Voduns são organizados em famílias, como Dan, Yewá, Fá, Togun, Tohossou, Nohê Aikunguman, Tobossi, Sakpata, Voduns da Riqueza, Hevioso, Aveji-Dá, Nanã, Naés Marinhas, Naés de Água Doce, Eku e Awun, Mawu-Lisa, Hohos. Voduns Jeje são por vezes cultuados em casas de outras nações com nomes diferentes. Por exemplo, o Vodum Dan ou Bessen é chamado Oxumarê no Candomblé Ketu. Inversamente, os Orixás Ketu podem ser cultuados em casas Jeje, mas mantêm seus nomes."
          },
          {
            type: "h3",
            text: "Principais Ritos e Práticas"
          },
          {
            type: "p",
            html: "As informações sobre ritos e práticas específicas do Candomblé Jeje não foram detalhadas nas fontes consultadas, mas são centradas no culto aos Voduns e em rituais que buscam a conexão com essas divindades, com forte ênfase na ancestralidade e na natureza."
          },
          {
            type: "h3",
            text: "Maior Incidência nas Regiões do Brasil"
          },
          {
            type: "p",
            html: "O Candomblé Jeje tem forte presença na Bahia, especialmente em Salvador e Cachoeira, e no Maranhão, onde se mistura com o Tambor de Mina."
          }
        ]
      },
      {
        title: "Nação Ketu",
        blocks: [
          {
            type: "p",
            html: "O Candomblé Ketu (ou Queto) é a maior e mais popular \"nação\" do Candomblé no Brasil, com origens nas tradições dos povos da região de Ketu, incluídos entre os iorubás (\"nagôs\"). A mitologia iorubá, com Olorum (Olodumarê) como Deus supremo e criador dos Orixás, é a base dessa nação. O grupo étnico iorubá é subdividido em vários subgrupos, como Queto, Oió, Ijexá, Ifé, Ifom, Ebá, Efom, etc., que deram origem à religião dos orixás na diáspora."
          },
          {
            type: "h3",
            text: "História no Brasil"
          },
          {
            type: "p",
            html: "No início do século XIX, as etnias africanas eram separadas por confrarias da Igreja Católica na região de Salvador, na Bahia. Dentre os escravos pertencentes ao grupo dos Nagôs, estavam os iorubás. Suas crenças e rituais são parecidos com os de outras nações do candomblé em termos gerais, mas diferentes em quase todos os detalhes. Teve início em Salvador, na Bahia. De acordo com as lendas contadas pelos mais velhos, algumas princesas vindas de Oió e Queto na condição de escravas fundaram um terreiro num engenho de cana-de-açúcar. Posteriormente, passaram a reunir-se num local denominado Barroquinha, onde fundaram uma comunidade de Jeje-Nagô pretextando a construção e manutenção da primitiva Capela da Confraria de Nossa Senhora da Barroquinha. As sacerdotisas de Queto, que construíram o Candomblé da Barroquinha, depois se transferiram para o Engenho Velho, passando a se chamar Ilê Axé Iá Nassô, mais conhecido como Casa Branca do Engenho Velho, sendo a primeira casa da nação Queto no Brasil. Desta, saíram as Ialorixás que fundaram o Ilê Axé Opô Afonjá e o Ilê Iá Omim Axé Iamassé, o Terreiro do Gantois."
          },
          {
            type: "h3",
            text: "Principais Orixás Cultuados"
          },
          {
            type: "p",
            html: "Os Orixás do Queto são basicamente os da Mitologia iorubá. Olorum, também chamado Olodumarê, é o Deus supremo, que criou as divindades ou Orixás (em iorubá: Òrìsà). As centenas de orixás ainda cultuados na África, ficou reduzida a um pequeno número que são invocados em cerimônias, como Exu, Orixá guardião dos templos, encruzilhadas, passagens, casas, cidade, e Oxóssi, o senhor da caça e dos caçadores."
          },
          {
            type: "h3",
            text: "Principais Ritos e Práticas"
          },
          {
            type: "p",
            html: "A nação Ketu mantém grande fidelidade às práticas africanas, valorizando a hierarquia e a tradição. Os rituais são complexos e envolvem cânticos, danças, oferendas e sacrifícios para cultuar os Orixás. A \"feitura de santo\" (iniciação) é um processo longo e rigoroso. O sincretismo religioso com o catolicismo é uma característica presente, mas a essência das práticas iorubás é preservada. A música e a dança são elementos fundamentais nas cerimônias, com o uso de atabaques e cânticos em iorubá."
          },
          {
            type: "h3",
            text: "Maior Incidência nas Regiões do Brasil"
          },
          {
            type: "p",
            html: "O Candomblé Queto ficou concentrado em Salvador, Bahia, e é a maior e mais popular nação no Brasil."
          }
        ]
      },
      {
        title: "Nação Nagô",
        blocks: [
          {
            type: "p",
            html: "Nagô é um termo que se refere aos povos de língua iorubá e seus dialetos. O Candomblé de rito nagô é a maior e a mais popular \"nação\" do candomblé, uma das religiões afro- brasileiras, tendo origens nas tradições dos povos da região de Queto, incluídos entre os iorubás (\"nagôs\"). A nação Ketu é uma das nações Nagô, sendo a mais proeminente e conhecida no Brasil."
          },
          {
            type: "h3",
            text: "História no Brasil"
          },
          {
            type: "p",
            html: "No início do século XIX, as etnias africanas eram separadas por confrarias da Igreja Católica na região de Salvador, na Bahia. Dentre os escravos pertencentes ao grupo dos Nagôs, estavam os iorubás. Suas crenças e rituais são parecidos com os de outras nações do candomblé em termos gerais, mas diferentes em quase todos os detalhes. Teve início em Salvador, na Bahia, com a fundação de terreiros por princesas escravas vindas de Oió e Queto. A comunidade Jeje-Nagô da Barroquinha, em Salvador, foi um marco importante. O Candomblé Nagô (Ketu) ficou concentrado em Salvador, Bahia, e é a maior e mais popular nação no Brasil."
          },
          {
            type: "h3",
            text: "Principais Orixás Cultuados"
          },
          {
            type: "p",
            html: "Os Orixás do Candomblé Nagô são basicamente os da Mitologia iorubá. Olorum (Olodumarê) é o Deus supremo, que criou as divindades ou Orixás (Òrìsà). Entre os orixás cultuados estão Exu, o Orixá guardião dos templos e comunicador, e Oxóssi, o senhor da caça e dos caçadores, entre muitos outros orixás iorubás."
          },
          {
            type: "h3",
            text: "Principais Ritos e Práticas"
          },
          {
            type: "p",
            html: "Os ritos e práticas do Candomblé Nagô são centrados no culto aos orixás, com rituais que incluem cânticos, danças, toques de atabaques, oferendas e sacrifícios de animais. A comunicação com os orixás ocorre através da possessão de médiuns. A hierarquia nos terreiros é bem definida, com o Babalorixá (pai de santo) ou Iyalorixá (mãe de santo) como líderes espirituais."
          },
          {
            type: "h3",
            text: "Maior Incidência nas Regiões do Brasil"
          },
          {
            type: "p",
            html: "O Candomblé Nagô tem sua maior incidência na Bahia, especialmente em Salvador, sendo a maior e mais popular nação no Brasil, com forte presença também em outras regiões do Sudeste e Nordeste."
          }
        ]
      },
      {
        title: "Quimbanda",
        blocks: [
          {
            type: "p",
            html: "Quimbanda, também grafada Kimbanda, é uma religião afro-brasileira praticada principalmente nos centros urbanos do Brasil. A Quimbanda foca em espíritos masculinos chamados Exus, bem como em suas contrapartes femininas, Pombagiras. As Pombagiras são frequentemente consideradas espíritos de mulheres falecidas que trabalharam como prostitutas ou em outras posições tradicionalmente consideradas imorais na sociedade católica brasileira. As práticas da Quimbanda são frequentemente focadas no sucesso mundano em relação a dinheiro e sexo. O termo Quimbanda veio da palavra Kimbundu kimbanda, que significa \"curandeiro\" ou \"mago\"."
          },
          {
            type: "h3",
            text: "História no Brasil"
          },
          {
            type: "p",
            html: "A Quimbanda emergiu no Brasil, influenciada pelo Espiritismo Kardecista, catolicismo popular e religiões afro-brasileiras como o Candomblé. Historicamente, o termo Quimbanda tem sido usado por praticantes da Umbanda para caracterizar as práticas religiosas que eles se opunham, servindo como uma imagem espelhada para os umbandistas. As fronteiras entre Umbanda e Quimbanda não são sempre claras, com vários médiuns espirituais engajando ou promovendo práticas associadas a ambas."
          },
          {
            type: "h3",
            text: "Principais Entidades Cultuados"
          },
          {
            type: "p",
            html: "Na Quimbanda, os espíritos masculinos são conhecidos como Exus, considerados espíritos muito poderosos. Exus referem-se à falange de espíritos que lidam com questões humanas e materiais. As contrapartes femininas dos Exus são as Pombagiras, consideradas espíritos de mulheres imorais, associadas à sexualidade, sangue, morte e cemitérios. Elas são frequentemente apresentadas como atrevidas e sedutoras, falando em eufemismos sexuais. Ogum, o orixá da guerra e do metal, também é uma figura importante, atuando como uma figura intermediária entre os rituais de Exu na Quimbanda e os rituais da Umbanda."
          },
          {
            type: "h3",
            text: "Principais Ritos e Práticas"
          },
          {
            type: "p",
            html: "Um ritual de Quimbanda, chamado trabalho, consiste tipicamente em várias partes: um motivo, dedicação a um espírito, um local marginal, o material de metal ou argila (terroso), uma bebida alcoólica, perfume e comida (geralmente uma mistura de farinha de pimenta e azeite de dendê, às vezes chamada miamiami). O sacrifício animal, geralmente evitado na Umbanda, é comum na Quimbanda, assim como em muitas religiões afro-brasileiras. As espécies sacrificadas incluem pombos, galinhas, cabras, ovelhas e touros. As canções que os Quimbandistas cantam para as divindades são comumente chamadas de pontos."
          },
          {
            type: "h3",
            text: "Maior Incidência nas Regiões do Brasil"
          },
          {
            type: "p",
            html: "A Quimbanda é praticada principalmente nos centros urbanos do Brasil."
          }
        ]
      },
      {
        title: "Tambor de Mina",
        blocks: [
          {
            type: "p",
            html: "Tambor de Mina é uma tradição religiosa afro-brasileira, praticada principalmente nos estados brasileiros do Maranhão, Piauí, Pará e na floresta amazônica. O termo \"Tambor\" refere-se à importância do elemento rítmico para o culto, e \"Mina\" deriva do nome São Jorge da Mina (Elmina Castle), referindo-se a uma designação dada a escravos africanos."
          },
          {
            type: "h3",
            text: "História no Brasil"
          },
          {
            type: "p",
            html: "A escravidão no Maranhão concentrou-se no Vale do Itapecuru, na Baixada Maranhense e em São Luís. As plantações de algodão e cana-de-açúcar contribuíram fortemente para o desenvolvimento de cidades maiores. Casas coloniais foram construídas com trabalho escravo, com seu design único influenciado pela harmonia, beleza e coreografia de canções originárias da África antiga. Os dois principais modelos de Tambor de Mina no Maranhão são Jeje e Nagô. O primeiro parece ser o mais antigo e se estabeleceu em torno da Casa Grande das Minas Jeje, mais conhecida como Casa das Minas (Querebentã de Tói Zomadônu), o templo mais antigo, fundado em São Luís na década de 1840. O outro, quase contemporâneo, se estabeleceu em torno da Casa de Nagô."
          },
          {
            type: "h3",
            text: "Principais Voduns e Entidades Cultuados"
          },
          {
            type: "p",
            html: "O Tambor de Mina cultua voduns, orixás e entidades (também chamadas Encantados, espíritos de pessoas) que são chamadas de gentis (se são reis, príncipes e nobres europeus, como o Rei Sebastião de Portugal) ou caboclos (se são de origem nativa, ouTurcos de origem moura, ou povos indígenas). Os voduns, deuses do povo fon ou jeje, são forças da natureza e ancestrais humanos deificados. Alguns voduns jovens chamados toquém ou toquenos cumprem a função de guias, mensageiros, ajudantes dos outros voduns. Tobóssis são divindades femininas infantis, consideradas filhas de voduns. Os voduns são agrupados em 5 famílias: Davice, Quevioçô, Dambirá, Aladanu e Savaluno. Os encantados são entidades de pessoas que não morreram, mas desapareceram misteriosamente, tornando-se invisíveis ou transformando-se em animais ou plantas, vivendo em um reino mágico chamado Encantaria. Os encantados são organizados em famílias no Tambor de Mina: Lençol, Codó, Turquia, Bandeira, Gama, Bahia, Surrupira, entre outros."
          },
          {
            type: "h3",
            text: "Principais Ritos e Práticas"
          },
          {
            type: "p",
            html: "O Tambor de Mina é uma mistura de religiões do Daomé, Fon (jeje), Iorubá (nagô), Fante- Ashanti, Ketu, Agrono ou Cambinda (Angola-Congo), tradições indígenas americanas e europeias (catolicismo romano). Devido à riqueza cultural e ao sincretismo presentes no culto, esses elementos coexistem de forma harmoniosa. É comum a realização de festas e celebrações da cultura popular maranhense, como a Festa do Divino Espírito Santo, Bumba-meu-boi e Tambor de Crioula, que são por vezes solicitadas pelas entidades espirituais. O Terecô é uma derivação do Tambor de Mina, praticado em Codó e Teresina."
          },
          {
            type: "h3",
            text: "Maior Incidência nas Regiões do Brasil"
          },
          {
            type: "p",
            html: "O Tambor de Mina é praticado principalmente nos estados do Maranhão, Piauí, Pará e na floresta amazônica, com forte concentração em São Luís, Maranhão."
          }
        ]
      },
      {
        title: "Umbanda",
        blocks: [
          {
            type: "p",
            html: "Umbanda é uma religião que surgiu no Brasil durante a década de 1920. Derivando em grande parte do Espiritismo, também combina elementos de tradições afro-brasileiras como o Candomblé, bem como do Catolicismo Romano. Não há uma autoridade central no controle da Umbanda, que é organizada em torno de locais de culto autônomos denominados centros ou terreiros, cujos seguidores são chamados de Umbandistas."
          },
          {
            type: "h3",
            text: "História no Brasil"
          },
          {
            type: "p",
            html: "O Catolicismo Romano era a religião dominante no Brasil no início do século XX, mas minorias consideráveis praticavam tradições afro-brasileiras ou Espiritismo, uma versão francesa do Espiritualismo desenvolvida por Allan Kardec. Por volta da década de 1920,vários grupos podem ter combinado práticas espíritas e afro-brasileiras, formando a base da Umbanda. O grupo mais importante foi o estabelecido por Zélio Fernandino de Moraes e seus colaboradores em Niterói, Rio de Janeiro. Ele havia se envolvido com o Espiritismo, mas desaprovava a atitude negativa que muitos espíritas tinham em relação ao contato com pretos velhos e caboclos. Refletindo o crescimento da Umbanda, em 1939 de Moraes formou uma federação umbandista e em 1941 realizou o primeiro congresso umbandista. A Umbanda ganhou maior reconhecimento social e respeitabilidade durante a ditadura militar de 1964 a 1985, apesar da crescente oposição da Igreja Católica Romana e de grupos pentecostais. Desde a década de 1970, a Umbanda tem visto algum declínio devido à ressurgente popularidade do Candomblé."
          },
          {
            type: "h3",
            text: "Principais Entidades Cultuadas"
          },
          {
            type: "p",
            html: "Os adeptos desta religião monoteísta acreditam em um único Deus que está distante da humanidade. Abaixo desta entidade estão poderosos espíritos não-humanos chamados orixás. Na ala mais orientada para o Espiritismo da religião, a Umbanda Branca, estes são vistos como energias divinas ou forças da natureza; em formas mais africanizadas, são vistos como divindades da África Ocidental e são oferecidos sacrifícios de animais. Os emissários dos orixás são os pretos velhos e caboclos, espíritos de africanos escravizados e de indígenas brasileiros, respectivamente, e estas são as principais entidades tratadas pelos umbandistas. Em rituais umbandistas, médiuns cantam e dançam na esperança de serem possuídos por esses espíritos, através dos quais as congregações recebem orientação, conselhos e cura."
          },
          {
            type: "h3",
            text: "Principais Ritos e Práticas"
          },
          {
            type: "p",
            html: "A Umbanda ensina uma cosmologia complexa envolvendo um sistema de reencarnação de acordo com a lei do carma. A ética da religião enfatiza a caridade e a fraternidade social. Os umbandistas também procuram reverter os danos que atribuem aos praticantes de uma tradição relacionada, a Quimbanda. Os grupos umbandistas existem em um espectro, desde aqueles que enfatizam as conexões espíritas até aqueles que enfatizam os laços com o Candomblé e religiões afro-brasileiras relacionadas. Na prática, as religiões afro-brasileiras frequentemente se misturam, em vez de existirem em formas puras."
          },
          {
            type: "h3",
            text: "Maior Incidência nas Regiões do Brasil"
          },
          {
            type: "p",
            html: "Em seu auge nas décadas de 1960 e 1970, estimava-se que a Umbanda tinha entre 10 e 20 milhões de seguidores no Brasil. A Umbanda é encontrada principalmente em áreas urbanas do sul do Brasil, embora tenha se espalhado por todo o país e para outras partes das Américas."
          }
        ]
      }
    ],
    references: [
      "Prandi, Reginaldo. <i>Segredos Guardados: Orixás na Alma Brasileira</i>. São Paulo: Companhia das Letras, 2005.",
      "Lody, Raul. <i>Candomblé: Religião do Corpo e da Alma</i>. Rio de Janeiro: Pallas, 1992.",
      "Cardoso, Edson Luís Ribeiro. <i>Inquices, Voduns e Orixás: Estudo sobre o Sincretismo Religioso no Brasil</i>. Salvador: EDUFBA, 2005.",
      "Lima, Vivaldo da Costa. <i>A Família de Santo nos Candomblés Jeje-Nagôs da Bahia</i>. Salvador: Corrupio, 2002.",
      "Moura, Carlos Eugênio Marcondes de. <i>Os Bantos: Identidade e Religiosidade no Brasil</i>. São Paulo: Edusp, 2001.",
      "Verger, Pierre. <i>Notas Sobre o Culto aos Orixás e Voduns na Bahia de Todos os Santos no Século XIX</i>. Salvador: Corrupio, 1981.",
      "Augras, Monique. <i>O Candomblé da Barroquinha: Um Terreiro de Jeje na Bahia</i>. Rio de Janeiro: Pallas, 1998.",
      "Verger, Pierre. <i>Orixás: Deuses Iorubás na África e no Novo Mundo</i>. Salvador: Corrupio, 1995.",
      "Elbein dos Santos, Juana. <i>Os Nagô e a Morte: Pade, Asese e o Culto Egum</i>. Petrópolis: Vozes, 1976.",
      "Alencastro, Luiz Felipe de Alencastro. <i>O Trato dos Viventes: Formação do Brasil no Atlântico Sul</i>. São Paulo: Companhia das Letras, 2000.",
      "Gomes, Flávio dos Santos. <i>Histórias de Cativeiro e Liberdade: Africanos no Brasil</i>. São Paulo: Editora Contexto, 2006."
    ]
  }
];

export const ARTICLE_BY_SLUG: Record<string, Article> = Object.fromEntries(
  ARTICLES.map((article) => [article.slug, article]),
);

export function getArticle(slug: string | undefined): Article | undefined {
  if (!slug) return undefined;
  return ARTICLE_BY_SLUG[slug];
}
