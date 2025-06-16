import type { Handler } from "express";

const HandleResponse: Handler = (req, res, next) => {
  res.apiResponse = <T>(httpStatus: number, response: T) => {
    res.status(httpStatus).send({
      data: response,
      url: req.originalUrl,
      date: new Date(),
    });
  };

  next();
};

export default HandleResponse;
