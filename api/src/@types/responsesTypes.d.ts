import { HttpStatusCode } from "../enum/HttpStatusCode.enum";

export type ResponseType<T> = (
  httpStatus: HttpStatusCode,
  response?: T,
  error?: T
) => void;

export interface ApiResponseType<T> {
  data?: T;
  error?: T;
  status: boolean;
}
