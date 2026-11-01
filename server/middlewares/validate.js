// Usage: validate({ body: schema, params: schema, query: schema })
const validate = (schemas) => (req, res, next) => {
  for (const key of ["params", "body", "query"]) {
    if (!schemas[key]) continue;
    const result = schemas[key].safeParse(req[key]);
    if (!result.success) return next(result.error);

    if (key === "query") req.validatedQuery = result.data; // req.query is read-only in Express 5
    else req[key] = result.data; // cleaned (trimmed) values
  }
  next();
};

module.exports = validate;