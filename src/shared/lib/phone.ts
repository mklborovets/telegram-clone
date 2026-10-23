export const cleanPhoneDigits = (input: string): string => {
  return input.replace(/\D/g, '');
};

export const formatPhoneByPattern = (digits: string, pattern: string): string => {
  let result = '';
  let digitIndex = 0;

  for (let i = 0; i < pattern.length && digitIndex < digits.length; i++) {
    if (pattern[i] === '#') {
      result += digits[digitIndex];
      digitIndex++;
    } else {
      result += pattern[i];
    }
  }

  if (digitIndex < digits.length) {
    result += digits.slice(digitIndex);
  }

  return result;
};

export const getExpectedPhoneLength = (countryCode: string): { min: number; max: number } => {
  switch (countryCode) {
    case '+380':
      return { min: 9, max: 9 };
    case '+1':
      return { min: 10, max: 10 };
    case '+48':
      return { min: 9, max: 9 };
    case '+44':
      return { min: 10, max: 11 };
    case '+49':
      return { min: 10, max: 11 };
    case '+33':
      return { min: 9, max: 9 };
    case '+39':
      return { min: 9, max: 10 };
    case '+34':
      return { min: 9, max: 9 };
    default:
      return { min: 7, max: 12 };
  }
};

export const isPhoneValid = (digits: string, countryCode: string): boolean => {
  const { min, max } = getExpectedPhoneLength(countryCode);
  return digits.length >= min && digits.length <= max;
};

export const isValidInternationalPhone = (fullPhone: string): boolean => {
  const digitsOnly = fullPhone.replace(/\D/g, '');
  if (!fullPhone.trim().startsWith('+')) {
    return false;
  }
  return digitsOnly.length >= 8 && digitsOnly.length <= 15;
};

export const normalizePhone = (input: string): string => {
  return input.replace(/[^\d+]/g, '');
};

export const isSamePhone = (phoneA: string, phoneB: string): boolean => {
  const digitsA = cleanPhoneDigits(phoneA);
  const digitsB = cleanPhoneDigits(phoneB);
  if (!digitsA || !digitsB) return false;
  return digitsA === digitsB;
};
