import { z } from 'zod';

// Landing page section schema
export const LandingPageSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  content: z.string(),
  type: z.enum(['hero', 'features', 'testimonials', 'pricing', 'cta', 'about', 'contact']),
  order: z.number(),
});

export const LandingPageSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  sections: z.array(LandingPageSectionSchema),
  metadata: z.object({
    targetAudience: z.string(),
    industry: z.string(),
    tone: z.enum(['professional', 'casual', 'friendly', 'formal', 'enthusiastic']),
    keywords: z.array(z.string()),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Email outreach sequence schema
export const EmailStepSchema = z.object({
  id: z.string(),
  stepNumber: z.number(),
  subject: z.string(),
  body: z.string(),
  purpose: z.enum(['introduction', 'followup', 'value_prop', 'closing', 'breakup']),
  sendDelayDays: z.number(),
  personalizationTokens: z.array(z.string()),
});

export const EmailSequenceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  targetAudience: z.string(),
  goal: z.string(),
  steps: z.array(EmailStepSchema),
  metadata: z.object({
    industry: z.string(),
    tone: z.enum(['professional', 'casual', 'friendly', 'formal']),
    averageOpenRate: z.number().optional(),
    averageReplyRate: z.number().optional(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Asset generation request schema
export const AssetGenerationRequestSchema = z.object({
  type: z.enum(['landing_page', 'email_sequence']),
  parameters: z.object({
    targetAudience: z.string(),
    industry: z.string(),
    tone: z.enum(['professional', 'casual', 'friendly', 'formal', 'enthusiastic']),
    keywords: z.array(z.string()).optional(),
    specificRequirements: z.string().optional(),
  }),
});

// Asset record schema (for storing in project documents)
export const AssetRecordSchema = z.object({
  id: z.string(),
  type: z.enum(['landing_page', 'email_sequence']),
  name: z.string(),
  description: z.string(),
  content: z.any(), // Will be LandingPageSchema or EmailSequenceSchema
  status: z.enum(['draft', 'approved', 'published']),
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// API response schemas
export const AssetGenerationResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(), // Will be LandingPageSchema or EmailSequenceSchema
  error: z.string().optional(),
  cached: z.boolean().optional(),
});

export const AssetListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(AssetRecordSchema),
  error: z.string().optional(),
});

// Type exports
export type LandingPageSection = z.infer<typeof LandingPageSectionSchema>;
export type LandingPage = z.infer<typeof LandingPageSchema>;
export type EmailStep = z.infer<typeof EmailStepSchema>;
export type EmailSequence = z.infer<typeof EmailSequenceSchema>;
export type AssetGenerationRequest = z.infer<typeof AssetGenerationRequestSchema>;
export type AssetRecord = z.infer<typeof AssetRecordSchema>;
export type AssetGenerationResponse = z.infer<typeof AssetGenerationResponseSchema>;
export type AssetListResponse = z.infer<typeof AssetListResponseSchema>;