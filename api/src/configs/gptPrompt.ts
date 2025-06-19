import { IReligiousCommunity } from "../schemas/ReligiousCommunity";

const PROMPT_MAPPED = {
  bio: "Gere uma biografia institucional e informativa com base no seguinte JSON. O texto deve ser escrito de forma respeitosa, clara e profissional. Não utilize ícones, emojis ou símbolos gráficos. Foque em contar a história, localização, liderança e origens do espaço religioso. O tom deve ser neutro, com um leve destaque à importância cultural e histórica do espaço religioso, não inclua telefones, emails, níveis de escolaridade ou outros contatos pessoais na descrição",
};

export const gptPrompt = (
  prompt: keyof typeof PROMPT_MAPPED,
  religiousCommunity: IReligiousCommunity
) => {
  return `${PROMPT_MAPPED[prompt]} ${JSON.stringify(religiousCommunity)}`;
};
