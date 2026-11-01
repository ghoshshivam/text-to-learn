class AppError extends Error {
  constructor(message, { statusCode = 500, code = "INTERNAL_ERROR", cause } = {}) {
    super(message, { cause });
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

class AIGenerationError extends AppError {
  constructor(message, { cause, statusCode = 502 } = {}) {
    super(message, {
      statusCode,
      code: statusCode === 400 ? "INVALID_TOPIC" : "AI_GENERATION_FAILED",
      cause,
    });
    this.name = "AIGenerationError";
  }
}

module.exports = { AppError, AIGenerationError };