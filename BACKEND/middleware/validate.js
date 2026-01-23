import { ZodError } from "zod";
import AppError from "../utils/AppError.js";

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.errors.map(e => e.message).join(", ");
      return next(new AppError(message, 400));
    }
    next(error);
  }
};

export default validate;
