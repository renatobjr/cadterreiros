import { HttpStatusCode } from "../enum/HttpStatusCode.enum";

export type ApiResponseType<T> = (
  httpStatus: HttpStatusCode,
  response?: T,
  error?: T
) => void;

export interface Response<T> {
  data?: T;
  error?: T;
  status: boolean;
}
