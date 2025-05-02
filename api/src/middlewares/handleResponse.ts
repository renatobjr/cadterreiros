import type { Handler } from "express";

type ErrorResponse = Express.ErrorInfo;

const handleResponse: Handler = (req, res, next) => {
  res.success = <T>(HttpStatusCode: number, data: T) => {
    return res.status(HttpStatusCode).json({
      success: data,
      url: req.originalUrl,
      date: new Date(),
    });
  };

  res.error = <T>(HttpStatusCode: number, error: ErrorResponse) => {
    return res.status(HttpStatusCode).json({
      error: error,
      url: req.originalUrl,
      date: new Date(),
    });
  };

  next();
};

export default handleResponse;
