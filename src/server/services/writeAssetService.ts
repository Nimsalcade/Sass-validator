import OpenAI from 'openai';
import NodeCache from 'node-cache';
import { 
  AssetGenerationRequest, 
  AssetGenerationResponse,
  LandingPage, 
  EmailSequence,
  LandingPageSchema,
  EmailSequenceSchema
} from '../../shared/types/schemas';

export class WriteAssetService {
  private openai: OpenAI;
  private cache: NodeCache;
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly MAX_RETRIES = 3;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
    
    this.cache = new NodeCache({ 
      stdTTL: this.CACHE_TTL,
      checkperiod: 600, // Check for expired keys every 10 minutes
    });
  }

  private generateCacheKey(request: AssetGenerationRequest): string {
    return `asset_${request.type}_${JSON.stringify(request.parameters)}`;
  }

  private parseJSONWithRetry(jsonString: string, maxRetries = 3): any {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return JSON.parse(jsonString);
      } catch (error) {
        if (attempt === maxRetries) {
          throw new Error(`Failed to parse JSON after ${maxRetries} attempts: ${error}`);
        }
        
        // Try to fix common JSON issues
        jsonString = jsonString
          .replace(/,\s*}/g, '}') // Remove trailing commas
          .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
          .replace(/(\w+):/g, '"$1":') // Add quotes to unquoted keys
          .replace(/'/g, '"'); // Replace single quotes with double quotes
      }
    }
  }

  private async generateLandingPage(request: AssetGenerationRequest): Promise<LandingPage> {
    const prompt = `
Generate a comprehensive landing page with the following specifications:
- Target Audience: ${request.parameters.targetAudience}
- Industry: ${request.parameters.industry}
- Tone: ${request.parameters.tone}
- Keywords: ${request.parameters.keywords?.join(', ') || 'N/A'}
- Specific Requirements: ${request.parameters.specificRequirements || 'N/A'}

Please generate a landing page with the following structure and return it as valid JSON:
{
  "id": "unique-id",
  "title": "Landing page title",
  "description": "Brief description of the landing page",
  "sections": [
    {
      "id": "section-id",
      "title": "Section title",
      "subtitle": "Optional subtitle",
      "content": "Detailed content for this section",
      "type": "hero|features|testimonials|pricing|cta|about|contact",
      "order": 1
    }
  ],
  "metadata": {
    "targetAudience": "${request.parameters.targetAudience}",
    "industry": "${request.parameters.industry}",
    "tone": "${request.parameters.tone}",
    "keywords": ${JSON.stringify(request.parameters.keywords || [])}
  }
}

Include at least these section types: hero, features, testimonials, pricing, and cta.
Make the content compelling and conversion-focused.
`;

    return this.executeOpenAICall(prompt, LandingPageSchema);
  }

  private async generateEmailSequence(request: AssetGenerationRequest): Promise<EmailSequence> {
    const prompt = `
Generate a cold email outreach sequence with the following specifications:
- Target Audience: ${request.parameters.targetAudience}
- Industry: ${request.parameters.industry}
- Tone: ${request.parameters.tone}
- Keywords: ${request.parameters.keywords?.join(', ') || 'N/A'}
- Specific Requirements: ${request.parameters.specificRequirements || 'N/A'}

Please generate an email sequence with 5-7 steps and return it as valid JSON:
{
  "id": "unique-id",
  "name": "Sequence name",
  "description": "Brief description of the email sequence",
  "targetAudience": "${request.parameters.targetAudience}",
  "goal": "Primary goal of the sequence",
  "steps": [
    {
      "id": "step-id",
      "stepNumber": 1,
      "subject": "Email subject line",
      "body": "Full email body content",
      "purpose": "introduction|followup|value_prop|closing|breakup",
      "sendDelayDays": 0,
      "personalizationTokens": ["[Name]", "[Company]"]
    }
  ],
  "metadata": {
    "industry": "${request.parameters.industry}",
    "tone": "${request.parameters.tone}",
    "averageOpenRate": 0.4,
    "averageReplyRate": 0.15
  }
}

Make the emails personalized, engaging, and follow best practices for cold outreach.
Include appropriate personalization tokens.
`;

    return this.executeOpenAICall(prompt, EmailSequenceSchema);
  }

  private async executeOpenAICall<T>(prompt: string, schema: any): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert marketing copywriter and content strategist. Always respond with valid JSON that matches the requested schema exactly.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('No content received from OpenAI');
        }

        // Extract JSON from the response (in case there's extra text)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No valid JSON found in response');
        }

        const parsedData = this.parseJSONWithRetry(jsonMatch[0]);
        
        // Validate against schema
        const validatedData = schema.parse(parsedData);
        
        // Add timestamps
        return {
          ...validatedData,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as T;

      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (attempt < this.MAX_RETRIES) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Failed to generate asset after maximum retries');
  }

  public async generateAsset(request: AssetGenerationRequest): Promise<AssetGenerationResponse> {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(request);
      const cachedResult = this.cache.get<AssetGenerationResponse>(cacheKey);
      
      if (cachedResult) {
        return {
          ...cachedResult,
          cached: true,
        };
      }

      let result: LandingPage | EmailSequence;

      switch (request.type) {
        case 'landing_page':
          result = await this.generateLandingPage(request);
          break;
        case 'email_sequence':
          result = await this.generateEmailSequence(request);
          break;
        default:
          throw new Error(`Unsupported asset type: ${request.type}`);
      }

      const response: AssetGenerationResponse = {
        success: true,
        data: result,
        cached: false,
      };

      // Cache the result
      this.cache.set(cacheKey, response);

      return response;

    } catch (error) {
      console.error('Error generating asset:', error);
      
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  public clearCache(): void {
    this.cache.flushAll();
  }

  public getCacheStats(): { keys: number; ksize: number; hits: number; misses: number } {
    return this.cache.getStats();
  }
}