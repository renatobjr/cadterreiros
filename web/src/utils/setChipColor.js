import { ECommunityTypes } from "@/enum/ECommunityTypes";
import { ENations } from "@/enum/ENations";

export const setChipColor = (type) => {

  switch (type) {
    case ENations.ANGOLA:
    case ENations.EKITI_EFON:
    case ENations.JEJE:
    case ENations.KETU:
    case ENations.NAGO:
    case ENations.QUIMBANDA:
    case ENations.TAMBOR_DE_MINA:
    case ENations.UMBANDA:
    case ENations.OUTROS:
      return type.replace(" ", "-").toLowerCase();
    case ECommunityTypes.AFRICAN:
      return 'african';
    case ECommunityTypes.TRADITIONAL:
      return 'tradicional';
  }
}
