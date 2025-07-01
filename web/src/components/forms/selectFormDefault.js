import { ECommunityTypes } from "@/enum/ECommunityTypes";
import { ELanguages } from "@/enum/ELanguages";
import { ENations } from "@/enum/ENations";

const communityType = [
  {
    title: "Comunidade de Terreiro",
    value: ECommunityTypes.TRADITIONAL,
  },
  {
    title: "Matriz Africana",
    value: ECommunityTypes.AFRICAN,
  },
];

const communitySpaceNation = [
  {
    title: "Angola",
    value: ENations.ANGOLA,
  },
  {
    title: "Ekiti Efon",
    value: ENations.EKITI_EFON,
  },
  {
    title: "Jeje",
    value: ENations.JEJE,
  },
  {
    title: "Ketu",
    value: ENations.KETU,
  },
  {
    title: "Nagô",
    value: ENations.NAGO,
  },
  {
    title: "Quimbanda",
    value: ENations.QUIMBANDA,
  },
  {
    title: "Tambor de Mina",
    value: ENations.TAMBOR_DE_MINA,
  },
  {
    title: "Umbanda",
    value: ENations.UMBANDA,
  },
  {
    title: "Outros",
    value: ENations.OUTROS,
  },
];

const communityLanguage = [
  {
    title: "Yoruba",
    value: ELanguages.YORUBA,
  },
  {
    title: "Quicongo",
    value: ELanguages.QUICONGO,
  },
  {
    title: "Umbundo",
    value: ELanguages.UMBUNDO,
  },
  {
    title: "Ewe Fon",
    value: ELanguages.EWE_FONO,
  },
  {
    title: "Outros",
    value: ELanguages.OUTROS,
  },
];

export { communityType, communitySpaceNation, communityLanguage };
