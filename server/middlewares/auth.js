const { auth } = require("express-oauth2-jwt-bearer");
const { AppError } = require("../utils/errors");

const devBypass =
  process.env.AUTH_DISABLED === "true" && process.env.NODE_ENV !== "production";

if (devBypass) {
  console.warn("[auth] AUTH_DISABLED=true: all requests run as 'dev-user'. Never use in production.");
}

// Verifies signature, issuer, audience and expiry of the Bearer token
const checkJwt = devBypass
  ? (req, res, next) => next()
  : auth({
      issuerBaseURL: process.env.AUTH0_ISSUER,
      audience: process.env.AUTH0_AUDIENCE,
      tokenSigningAlg: "RS256",
    });

// Puts the user's identity on req.user
const attachUser = (req, res, next) => {
  if (devBypass) {
    req.user = { sub: "dev-user", email: "dev@example.com", name: "Dev User" };
    return next();
  }
  const payload = req.auth?.payload;
  if (!payload?.sub) {
    return next(new AppError("Unauthorized", { statusCode: 401, code: "UNAUTHORIZED" }));
  }
  req.user = { sub: payload.sub, email: payload.email, name: payload.name };
  next();
};

const protect = [checkJwt, attachUser];

module.exports = { protect };