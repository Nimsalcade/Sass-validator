import { PIIService } from '../services/pii.service';

describe('PIIService', () => {
  let piiService: PIIService;

  beforeAll(() => {
    piiService = new PIIService();
  });

  describe('Email filtering', () => {
    it('should detect and filter email addresses', () => {
      const content = 'Contact us at support@example.com for help';
      const result = piiService.filterPII(content);

      expect(result.filtered).toBe(true);
      expect(result.content).toContain('[EMAIL_REDACTED]');
      expect(result.content).not.toContain('support@example.com');
      expect(result.detectedPII).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'email',
            confidence: 0.9,
          }),
        ])
      );
    });

    it('should handle multiple emails', () => {
      const content = 'Email john@doe.com or jane@smith.com';
      const result = piiService.filterPII(content);

      expect(result.filtered).toBe(true);
      expect(result.detectedPII.filter(pii => pii.type === 'email')).toHaveLength(2);
    });
  });

  describe('Phone number filtering', () => {
    it('should detect and filter phone numbers', () => {
      const content = 'Call us at (555) 123-4567 for support';
      const result = piiService.filterPII(content);

      expect(result.filtered).toBe(true);
      expect(result.content).toContain('[PHONE_REDACTED]');
      expect(result.content).not.toContain('(555) 123-4567');
      expect(result.detectedPII).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'phone',
            confidence: 0.8,
          }),
        ])
      );
    });

    it('should handle different phone formats', () => {
      const content = 'Call 555-123-4567 or 555.123.4567 or 5551234567';
      const result = piiService.filterPII(content);

      expect(result.filtered).toBe(true);
      expect(result.detectedPII.filter(pii => pii.type === 'phone')).toHaveLength(3);
    });
  });

  describe('SSN filtering', () => {
    it('should detect and filter SSNs', () => {
      const content = 'SSN: 123-45-6789';
      const result = piiService.filterPII(content);

      expect(result.filtered).toBe(true);
      expect(result.content).toContain('[SSN_REDACTED]');
      expect(result.content).not.toContain('123-45-6789');
      expect(result.detectedPII).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'ssn',
            confidence: 0.95,
          }),
        ])
      );
    });
  });

  describe('Credit card filtering', () => {
    it('should detect and filter valid credit card numbers', () => {
      const content = 'Card: 4539 1488 0343 6467';
      const result = piiService.filterPII(content);

      expect(result.filtered).toBe(true);
      expect(result.content).toContain('[CREDIT_CARD_REDACTED]');
      expect(result.content).not.toContain('4539 1488 0343 6467');
      expect(result.detectedPII).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'credit_card',
            confidence: 0.85,
          }),
        ])
      );
    });

    it('should not filter invalid credit card numbers', () => {
      const content = 'Not a card: 1234 5678 9012 3456';
      const result = piiService.filterPII(content);

      expect(result.filtered).toBe(false);
      expect(result.content).toBe(content);
      expect(result.detectedPII.filter(pii => pii.type === 'credit_card')).toHaveLength(0);
    });
  });

  describe('IP address filtering', () => {
    it('should detect and filter public IP addresses', () => {
      const content = 'Server IP: 8.8.8.8';
      const result = piiService.filterPII(content);

      expect(result.filtered).toBe(true);
      expect(result.content).toContain('[IP_REDACTED]');
      expect(result.content).not.toContain('8.8.8.8');
      expect(result.detectedPII).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'ip_address',
            confidence: 0.7,
          }),
        ])
      );
    });

    it('should not filter private IP addresses', () => {
      const content = 'Local IP: 192.168.1.1 and 127.0.0.1';
      const result = piiService.filterPII(content);

      expect(result.filtered).toBe(false);
      expect(result.content).toBe(content);
      expect(result.detectedPII.filter(pii => pii.type === 'ip_address')).toHaveLength(0);
    });
  });

  describe('Address filtering', () => {
    it('should detect and filter addresses', () => {
      const content = 'Visit us at 123 Main Street';
      const result = piiService.filterPII(content);

      expect(result.filtered).toBe(true);
      expect(result.content).toContain('[ADDRESS_REDACTED]');
      expect(result.content).not.toContain('123 Main Street');
      expect(result.detectedPII).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'address',
            confidence: 0.6,
          }),
        ])
      );
    });
  });

  describe('Mixed content', () => {
    it('should filter multiple types of PII', () => {
      const content = 'Contact john@doe.com at 123 Main Street, call (555) 123-4567';
      const result = piiService.filterPII(content);

      expect(result.filtered).toBe(true);
      expect(result.content).toContain('[EMAIL_REDACTED]');
      expect(result.content).toContain('[ADDRESS_REDACTED]');
      expect(result.content).toContain('[PHONE_REDACTED]');
      expect(result.detectedPII).toHaveLength(3);
    });
  });
});