import { HttpStatusCode } from "../enum/HttpStatusCode.enum";

export type ResponseType<T> = (
  httpStatus: HttpStatusCode,
  response?: T,
  error?: T
) => void;

export interface ApiResponseType<T> {
  data?: T;
  /** Falhas trafegam como mensagem/erro, não como dado de sucesso. */
  error?: T | string;
  status: boolean;
}
