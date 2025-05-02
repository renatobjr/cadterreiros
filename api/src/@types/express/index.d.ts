declare namespace Express {
  type ErrorInfo = {
    code?: string;
    details: string;
  };

  interface Response {
    success: (HttpStatusCode: number, data: T) => void;
    error: (HttpStatusCode: number, error: ErrorInfo) => void;
  }
}
