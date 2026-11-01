// Usage: validate({ body: schema, params: schema })
const validate = (schemas) => (req, res, next) => {
  for (const key of ["params", "body"]) {
    if (!schemas[key]) continue;
    const result = schemas[key].safeParse(req[key]);
    if (!result.success) return next(result.error);
    req[key] = result.data; // cleaned (trimmed) values
  }
  next();
};

module.exports = validate;