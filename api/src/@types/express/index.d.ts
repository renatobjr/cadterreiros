declare namespace Express {
  import { ApiResponseType } from "../responsesTypes";
  interface Response {
    apiResponse: ApiResponseType;
  }
}
