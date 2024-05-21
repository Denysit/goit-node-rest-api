
const validateBody = (schema) => {
  const func = (req, _, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return next({ status: 400, message: error.message });
    }
    next();
  };

  return func;
};

export default validateBody;