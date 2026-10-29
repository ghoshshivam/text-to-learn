class AIGenerationError extends Error {
  constructor(message, { cause, statusCode = 502 } = {}) {
    super(message, { cause });
    this.name = "AIGenerationError";
    this.statusCode = statusCode;
  }
}

module.exports = { AIGenerationError };