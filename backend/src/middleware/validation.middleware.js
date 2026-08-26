import { ZodError } from "zod";

export default (schema) => (req, res, next) => {
  try {
    const data = {
      body: req.body,
      params: req.params,
      query: req.query,
    };
    schema.parse(data);
    next();
  } catch (err) {
    if (err instanceof ZodError)
      return res
        .status(422)
        .json({
          success: false,
          message: err.errors.map((e) => e.message).join("; "),
        });
    next(err);
  }
};
