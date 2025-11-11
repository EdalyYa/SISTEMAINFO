/**
 * Clase de error personalizada para manejar errores de API con códigos de estado.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - El código de estado HTTP.
   * @param {string} message - El mensaje de error.
   */
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

module.exports = ApiError;