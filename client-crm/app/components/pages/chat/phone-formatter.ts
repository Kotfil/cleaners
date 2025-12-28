/**
 * Format phone number with international format: +X(XXX)-XXX-XXXX
 * Formats in real-time as user types
 * Supports all international codes (+1 to +9)
 */
export function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters except +
  const cleaned = value.replace(/[^\d+]/g, '');
  
  // Extract digits only (without +)
  const digits = cleaned.replace(/[^0-9]/g, '');
  
  // Handle international codes (+2 to +9, and multi-digit codes like +44, +86, etc.)
  // Match: + followed by 1-3 digits (country code)
  const internationalCodeMatch = cleaned.match(/^\+(\d{1,3})/);
  
  if (internationalCodeMatch && !cleaned.startsWith('+1')) {
    const countryCode = internationalCodeMatch[1];
    const countryCodeDigits = countryCode.length;
    const fullCode = `+${countryCode}`;
    
    // Get digits after country code
    const digitsAfterCode = digits.slice(countryCodeDigits);
    
    // Limit to 15 digits total (ITU-T E.164 standard)
    const maxDigitsAfterCode = Math.min(digitsAfterCode.length, 15 - countryCodeDigits);
    const limitedDigits = digitsAfterCode.slice(0, maxDigitsAfterCode);
    
    if (limitedDigits.length === 0) {
      return fullCode;
    }
    
    // Format with brackets and dashes: +X(XXX)-XXX-XXXX
    if (limitedDigits.length <= 3) {
      return `${fullCode}(${limitedDigits}`;
    } else if (limitedDigits.length <= 6) {
      return `${fullCode}(${limitedDigits.slice(0, 3)})-${limitedDigits.slice(3)}`;
    } else {
      return `${fullCode}(${limitedDigits.slice(0, 3)})-${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
    }
  }
  
  // Handle +1 specifically (USA/Canada)
  if (cleaned.startsWith('+1')) {
    const remainingDigits = digits.slice(1).slice(0, 10);
    if (remainingDigits.length === 0) {
      return '+1';
    } else if (remainingDigits.length <= 3) {
      return `+1(${remainingDigits}`;
    } else if (remainingDigits.length <= 6) {
      return `+1(${remainingDigits.slice(0, 3)})-${remainingDigits.slice(3)}`;
    } else {
      return `+1(${remainingDigits.slice(0, 3)})-${remainingDigits.slice(3, 6)}-${remainingDigits.slice(6, 10)}`;
    }
  }
  
  // No + prefix - auto-add +1 if digits entered (default to USA)
  if (digits.length === 0) {
    return '';
  }
  
  // If starts with 1 and has 11 digits, treat as +1XXXXXXXXXX
  if (digits.startsWith('1') && digits.length === 11) {
    const remainingDigits = digits.slice(1);
    return `+1(${remainingDigits.slice(0, 3)})-${remainingDigits.slice(3, 6)}-${remainingDigits.slice(6, 10)}`;
  }
  
  // If 10 digits or less, assume USA number and add +1
  if (digits.length <= 10) {
    if (digits.length === 0) {
      return '';
    } else if (digits.length <= 3) {
      return `+1(${digits}`;
    } else if (digits.length <= 6) {
      return `+1(${digits.slice(0, 3)})-${digits.slice(3)}`;
    } else {
      return `+1(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  }
  
  // More than 10 digits without +1 prefix - truncate to 10
  const tenDigits = digits.slice(0, 10);
  return `+1(${tenDigits.slice(0, 3)})-${tenDigits.slice(3, 6)}-${tenDigits.slice(6, 10)}`;
}

/**
 * Clean phone number to E.164 format (+XXXXXXXXXXX)
 * Supports all international codes (+1 to +9)
 * 
 * Input: can contain brackets/dashes, e.g. "+4(444)-432-234" or "+4444432234"
 * Output: linear format without formatting, e.g. "+4444432234"
 */
export function cleanPhoneNumber(value: string): string | null {
  // Remove all non-digit characters except + (removes brackets, dashes, spaces)
  const cleaned = value.replace(/[^\d+]/g, '');
  
  // Extract digits only (without +)
  const digits = cleaned.replace(/[^0-9]/g, '');
  
  // Handle international codes (+2 to +9, and multi-digit codes like +44, +86, etc.)
  // Match: + followed by 1-3 digits (country code), but not +1
  const internationalCodeMatch = cleaned.match(/^\+(\d{1,3})/);
  
  if (internationalCodeMatch && !cleaned.startsWith('+1')) {
    const countryCode = internationalCodeMatch[1];
    const countryCodeDigits = countryCode.length;
    const digitsAfterCode = digits.slice(countryCodeDigits);
    
    // Validate: must have at least 4 digits after country code, max 15 total
    const totalDigits = digits.length;
    if (totalDigits < countryCodeDigits + 4 || totalDigits > 15) {
      return null;
    }
    
    // Return linear format: +countryCode + remaining digits
    return `+${digits}`;
  }
  
  // For USA numbers (+1), we need exactly 10 digits after country code
  if (cleaned.startsWith('+1')) {
    // digits should contain: 1 (country code) + 10 digits = 11 total
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`; // digits уже содержит 1 в начале, итого 11 символов
    }
    return null;
  }
  
  // No + prefix - default to USA
  if (digits.length === 10) {
    // 10 digits - assume USA number, add +1
    return `+1${digits}`;
  }
  
  if (digits.length === 11 && digits.startsWith('1')) {
    // 11 digits starting with 1 - USA number, add +
    return `+${digits}`;
  }
  
  // Invalid format
  return null;
}

