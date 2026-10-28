import sobreImage from "../../assets/img/sobre.jpg";

export type AboutBlock =
  | { type: "p"; html: string }
  | { type: "h3"; text: string }
  | { type: "ol"; items: string[] }
  | { type: "ul"; items: string[] };

/**
 * Bloco de seção institucional, estruturalmente compatível com o bloco
 * editorial de `features/articles` — o que permite reaproveitar o `ArticleBody`.
 */
export interface AboutSection {
  title: string;
  blocks: AboutBlock[];
}

export interface AboutProjectContent {
  title: string;
  kicker: string;
  description: string;
  image: string;
  leadTitle: string;
  lead: string;
  sections: AboutSection[];
  references: string[];
}

/** Conteúdo da página "Sobre o projeto", transposto do protótipo. */
export const ABOUT_PROJECT: AboutProjectContent = {
  title: "Uma visão sobre a cultura afro-brasileira",
  kicker: "Sobre o projeto",
  description: "Análise do projeto de cadastramento dos terreiros de matriz africana da Região Metropolitana de João Pessoa.",
  image: sobreImage,
  leadTitle: "Entidade Executora",
  lead: "A execução do cadastramento na Paraíba, conforme delineado no Processo Seletivo nº 01/2018 (Projeto BRA/15/010), foi confiada à Casa de Cultura Ilê Asé D'Osoguiã (CCIAO). Esta Organização da Sociedade Civil (OSC) foi selecionada para conduzir o projeto, possuindo experiência prévia na área, tendo realizado um mapeamento inicial similar no município de João Pessoa entre 2011 e 2012.",
  sections: [
    {
      title: "Patrocínio e Apoio Institucional",
      blocks: [
        {
          type: "p",
          html: "O projeto de cadastramento insere-se em um contexto mais amplo de cooperação técnica, estabelecido entre o Ministério dos Direitos Humanos (MDH) e o Programa das Nações Unidas para o Desenvolvimento (PNUD), formalizado pelo Acordo de Cooperação Técnica BRA/15/010. Esta parceria visa ao fortalecimento e expansão do Sistema Nacional de Promoção da Igualdade Racial. É relevante mencionar que o mapeamento pioneiro realizado pela CCIAO em João Pessoa (2011/2012) contou com o apoio institucional do Ministério da Cultura (MinC), do Ministério do Desenvolvimento Social (MDS) e da Fundação Cultural de João Pessoa (FUNJOPE/PB), cujo suporte inicial foi crucial para a viabilização daquela etapa."
        }
      ]
    },
    {
      title: "Objetivos do Projeto",
      blocks: [
        {
          type: "p",
          html: "O objetivo central do projeto é realizar o cadastramento sistemático dos terreiros de religiões de matriz africana, seguido pela disseminação e divulgação dos dados coletados. Esta ação visa alcançar múltiplos propósitos:"
        },
        {
          type: "ol",
          items: [
            "<b>Conferir Visibilidade:</b> Identificar e localizar os terreiros, promovendo o reconhecimento formal de sua existência e atuação.",
            "<b>Fortalecer as Comunidades:</b> Oferecer suporte e fortalecer os membros das comunidades religiosas de matriz africana.",
            "<b>Combater a Discriminação:</b> Contribuir para a erradicação da intolerância religiosa e do racismo institucional.",
            "<b>Valorizar o Patrimônio Cultural:</b> Reconhecer e valorizar a cultura afro-brasileira como componente essencial da identidade nacional.",
            "<b>Assegurar Direitos:</b> Auxiliar na garantia dos direitos culturais, sociais e territoriais destas comunidades, conforme previsto na legislação.",
            "<b>Subsidiar Políticas Públicas:</b> Gerar dados qualificados que sirvam de base para a formulação e implementação de políticas públicas afirmativas e eficazes."
          ]
        }
      ]
    },
    {
      title: "Importância Estratégica",
      blocks: [
        {
          type: "p",
          html: "A relevância deste cadastramento transcende a mera coleta de dados. Historicamente, as comunidades e religiões de matriz africana enfrentaram repressão, marginalização e estigmatização, reflexo de um racismo estrutural e etnocentrismo religioso. Estas comunidades são depositárias de um vasto patrimônio cultural imaterial e de saberes ancestrais que contribuíram significativamente para a formação sociocultural brasileira."
        },
        {
          type: "p",
          html: "Nesse sentido, o projeto representa um passo fundamental para:"
        },
        {
          type: "ul",
          items: [
            "<b>Reconhecimento Formal:</b> Afirmar a existência, a resistência e o valor intrínseco dessas comunidades perante o Estado e a sociedade.",
            "<b>Reparação Histórica:</b> Contribuir para a reparação das injustiças históricas sofridas pelas populações afrodescendentes e praticantes de religiões de matriz africana.",
            "<b>Promoção da Cidadania:</b> Reforçar o status de cidadania plena dos membros dessas comunidades, assegurando-lhes os mesmos direitos e deveres dos demais brasileiros.",
            "<b> Proteção Cultural:</b> Implementar mecanismos de proteção ao patrimônio cultural afro-brasileiro contra a intolerância, a discriminação e a violência, fenômenos ainda presentes, como indicam dados sobre violência contra a população negra.",
            "<b>Desenvolvimento Inclusivo:</b> Fomentar a construção de uma sociedade mais justa, equitativa e que valorize sua diversidade étnico-racial e religiosa."
          ]
        },
        {
          type: "p",
          html: "O Termo de Referência que fundamenta o projeto evoca marcos legais importantes, como o Estatuto da Igualdade Racial (Lei nº 12.288/2010) e a Constituição Federal de 1988 (Art. 5º, inc. VI), que garantem a liberdade de consciência, de crença e o livre exercício dos cultos religiosos, reforçando a legitimidade e a necessidade da iniciativa. Portanto, o cadastramento dos terreiros configura-se como uma ação estratégica de reconhecimento, valorização cultural e promoção da igualdade racial, essencial para a consolidação de um Estado Democrático de Direito mais inclusivo no Brasil."
        },
        {
          type: "h3",
          text: "Referências:"
        }
      ]
    }
  ],
  references: [
    "Termo de Referência Padronizado – Anexo II, Cadastramento dos Espaços das Religiões de Matriz Africana, Processo Seletivo nº 01/2018 – Projeto BRA/15/010 – Produto 3.2 (Documento fornecido)."
  ],
};
