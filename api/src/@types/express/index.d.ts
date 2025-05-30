declare namespace Express {
  import { ResponseType } from "../responsesTypes";
  interface Response {
    apiResponse: ResponseType;
  }
}
