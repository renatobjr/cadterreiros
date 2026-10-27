import path from "path";
import { Resend } from "resend";
import fileUtils from "./file.utils";
import Mustache from "mustache";

/**
 * Envio de e-mail transacional via Resend (https://resend.com).
 *
 * Configuração (api/.env):
 * - `RESEND_API_KEY`: chave da API (obrigatória);
 * - `MAIL_FROM`: remetente verificado no domínio, ex.:
 *   `Cadterreiros <suporte@cciao.org>`.
 *
 * Sem a chave, `sendMail` falha com erro explícito; os chamadores já tratam
 * a falha em segundo plano, então a API não cai nem vaza o motivo ao cliente.
 */

const API_KEY = process.env.RESEND_API_KEY;
const FALLBACK_FROM = "Cadterreiros <suporte@cciao.org>";

const resend = API_KEY ? new Resend(API_KEY) : null;

/** Aceita `"a@b.com"`, `{ address }` ou lista de ambos (formato legado). */
function normalizeRecipients(to: unknown): string[] {
  const list = Array.isArray(to) ? to : [to];
  return list
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "address" in item) {
        return String((item as { address?: unknown }).address ?? "");
      }
      return "";
    })
    .map((address) => address.trim())
    .filter(Boolean);
}

const mailUtils = {
  sendMail: async (options: {
    to: unknown;
    subject: string;
    html: string;
    from?: string;
  }): Promise<void> => {
    if (!resend) {
      throw new Error(
        "Envio de e-mail não configurado: defina RESEND_API_KEY em api/.env"
      );
    }

    const recipients = normalizeRecipients(options.to);
    if (recipients.length === 0) {
      throw new Error("Nenhum destinatário informado para o e-mail");
    }

    const { data, error } = await resend.emails.send({
      from: options.from ?? process.env.MAIL_FROM ?? FALLBACK_FROM,
      to: recipients,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      throw new Error(error.message ?? "Falha no envio via Resend");
    }

    if (data?.id) {
      console.log(
        `[✔] E-mail enviado via Resend (${data.id}) para ${recipients.join(", ")}`
      );
    }
  },

  template: async (options: any) => {
    const { type, data } = options;
    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      `${type}.mustache`
    );

    const template = await fileUtils.read(templatePath);
    const html = Mustache.render(template, data);

    return html;
  },
};

export default mailUtils;
