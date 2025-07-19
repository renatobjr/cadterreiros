import nodemailer from "nodemailer";
import path from "path";
import fileUtils from "./file.utils";
import Mustache from "mustache";

const GOOGLE_APP = process.env.GOOGLE_APP;
const mailUtils = {
  sendMail: async (options: any) => {
    try {
      const transport = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: "suporte@cciao.org",
          pass: GOOGLE_APP,
        },
      });

      await transport.sendMail({
        from: "suporte@cciao.org",
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
    } catch (error) {
      throw error;
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
