/**
 * Validation Middleware
 * Input sanitization and validation
 */

const Joi = require('joi');

/**
 * Validate request body against Joi schema
 */
function validateInput(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    req.body = value;
    next();
  };
}

/**
 * Sanitize code input
 * Remove potentially dangerous patterns
 */
function sanitizeCode(code) {
  // Remove null bytes
  let sanitized = code.replace(/\0/g, '');

  // Limit line length
  const lines = sanitized.split('\n');
  if (lines.length > 10000) {
    throw new Error('Code exceeds maximum line count (10000)');
  }

  // Check for binary content
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(sanitized)) {
    throw new Error('Binary content detected');
  }

  return sanitized;
}

/**
 * Rate limit check
 */
function checkRateLimit(req, res, next) {
  // Rate limiting is handled by express-rate-limit middleware
  // This is a placeholder for additional custom logic
  next();
}

module.exports = {
  validateInput,
  sanitizeCode,
  checkRateLimit
};
