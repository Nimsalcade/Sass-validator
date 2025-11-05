import Joi from 'joi';

export const scrapeRequestSchema = Joi.object({
  url: Joi.string().uri().required().messages({
    'string.uri': 'URL must be a valid URI',
    'any.required': 'URL is required',
  }),
  user: Joi.string().optional(),
  project: Joi.string().optional(),
  userAgent: Joi.string().optional(),
  timeout: Joi.number().integer().min(1000).max(300000).optional().messages({
    'number.min': 'Timeout must be at least 1000ms',
    'number.max': 'Timeout must not exceed 300000ms (5 minutes)',
  }),
  maxRedirects: Joi.number().integer().min(0).max(20).optional().messages({
    'number.min': 'Max redirects must be non-negative',
    'number.max': 'Max redirects must not exceed 20',
  }),
});

export const auditLogsQuerySchema = Joi.object({
  userId: Joi.string().optional(),
  projectId: Joi.string().optional(),
  url: Joi.string().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
  limit: Joi.number().integer().min(1).max(1000).default(100).optional(),
  offset: Joi.number().integer().min(0).default(0).optional(),
});

export const auditStatsQuerySchema = Joi.object({
  userId: Joi.string().optional(),
  projectId: Joi.string().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
});