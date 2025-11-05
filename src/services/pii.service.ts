import { config } from '../config';
import { PIIFilterResult } from '../types';

export class PIIService {
  private emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  private phoneRegex = /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g;
  private ssnRegex = /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g;
  private creditCardRegex = /\b(?:\d[ -]*?){13,16}\b/g;
  private ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;

  filterPII(content: string): PIIFilterResult {
    if (!config.pii.enabled) {
      return {
        filtered: false,
        content,
        detectedPII: [],
      };
    }

    const detectedPII: Array<{
      type: string;
      confidence: number;
      position: number;
      length: number;
    }> = [];

    let filteredContent = content;

    // Filter emails
    const emailMatches = [...content.matchAll(this.emailRegex)];
    for (const match of emailMatches) {
      if (match.index !== undefined) {
        detectedPII.push({
          type: 'email',
          confidence: 0.9,
          position: match.index,
          length: match[0].length,
        });
        filteredContent = filteredContent.replace(match[0], '[EMAIL_REDACTED]');
      }
    }

    // Filter phone numbers
    const phoneMatches = [...content.matchAll(this.phoneRegex)];
    for (const match of phoneMatches) {
      if (match.index !== undefined) {
        detectedPII.push({
          type: 'phone',
          confidence: 0.8,
          position: match.index,
          length: match[0].length,
        });
        filteredContent = filteredContent.replace(match[0], '[PHONE_REDACTED]');
      }
    }

    // Filter SSN
    const ssnMatches = [...content.matchAll(this.ssnRegex)];
    for (const match of ssnMatches) {
      if (match.index !== undefined) {
        detectedPII.push({
          type: 'ssn',
          confidence: 0.95,
          position: match.index,
          length: match[0].length,
        });
        filteredContent = filteredContent.replace(match[0], '[SSN_REDACTED]');
      }
    }

    // Filter credit card numbers (basic Luhn check)
    const creditCardMatches = [...content.matchAll(this.creditCardRegex)];
    for (const match of creditCardMatches) {
      if (match.index !== undefined && this.isValidLuhn(match[0].replace(/\D/g, ''))) {
        detectedPII.push({
          type: 'credit_card',
          confidence: 0.85,
          position: match.index,
          length: match[0].length,
        });
        filteredContent = filteredContent.replace(match[0], '[CREDIT_CARD_REDACTED]');
      }
    }

    // Filter IP addresses
    const ipMatches = [...content.matchAll(this.ipRegex)];
    for (const match of ipMatches) {
      if (match.index !== undefined && this.isValidIP(match[0])) {
        detectedPII.push({
          type: 'ip_address',
          confidence: 0.7,
          position: match.index,
          length: match[0].length,
        });
        filteredContent = filteredContent.replace(match[0], '[IP_REDACTED]');
      }
    }

    // Filter potential addresses (simple pattern)
    const addressRegex = /\d+\s+([A-Z][a-z]*\s*)+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way|Place|Pl)\b/gi;
    const addressMatches = [...content.matchAll(addressRegex)];
    for (const match of addressMatches) {
      if (match.index !== undefined) {
        detectedPII.push({
          type: 'address',
          confidence: 0.6,
          position: match.index,
          length: match[0].length,
        });
        filteredContent = filteredContent.replace(match[0], '[ADDRESS_REDACTED]');
      }
    }

    const hasHighConfidencePII = detectedPII.some(pii => pii.confidence >= config.pii.confidenceThreshold);

    return {
      filtered: hasHighConfidencePII,
      content: filteredContent,
      detectedPII,
    };
  }

  private isValidLuhn(number: string): boolean {
    let sum = 0;
    let isEven = false;

    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  private isValidIP(ip: string): boolean {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;

    for (const part of parts) {
      const num = parseInt(part, 10);
      if (isNaN(num) || num < 0 || num > 255) return false;
    }

    // Filter out private IPs and localhost
    if (parts[0] === '10') return false;
    if (parts[0] === '172' && parseInt(parts[1], 10) >= 16 && parseInt(parts[1], 10) <= 31) return false;
    if (parts[0] === '192' && parts[1] === '168') return false;
    if (parts[0] === '127') return false;

    return true;
  }
}