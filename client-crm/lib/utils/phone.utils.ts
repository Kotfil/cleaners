const US_PHONE_REGEX = /^(?!([0-9])\1{9})([2-9][0-9]{2})([2-9][0-9]{2})([0-9]{4})$/;

export const US_PHONE_PREFIX = '+1';

const getDigits = (value: string): string => value.replace(/\D/g, '');

export const extractUsPhoneDigits = (value: string): string => {
  const digits = getDigits(value);
  if (!digits) {
    return '';
  }
  if (digits.startsWith('1') && digits.length > 10) {
    return digits.slice(1, 11);
  }
  return digits.slice(0, 10);
};

export const isValidUsPhone = (value: string | null | undefined): boolean => {
  if (!value) {
    return false;
  }
  const digits = extractUsPhoneDigits(value);
  return digits.length === 10 && US_PHONE_REGEX.test(digits);
};

export const cleanUsPhone = (value: string): string | null => {
  if (!isValidUsPhone(value)) {
    return null;
  }
  const digits = extractUsPhoneDigits(value);
  return `${US_PHONE_PREFIX}${digits}`;
};

export const formatUsPhone = (value: string): string => {
  const digits = extractUsPhoneDigits(value);
  if (digits.length === 0) {
    return `${US_PHONE_PREFIX} `;
  }

  const area = digits.slice(0, 3);
  const prefix = digits.slice(3, 6);
  const line = digits.slice(6, 10);

  if (digits.length <= 3) {
    return `${US_PHONE_PREFIX} (${area}`;
  }

  if (digits.length <= 6) {
    return `${US_PHONE_PREFIX} (${area}) ${prefix}`;
  }

  return `${US_PHONE_PREFIX} (${area}) ${prefix}-${line}`;
};

