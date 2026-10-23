export interface CountryItem {
  id: string;
  name: string;
  flag: string;
  code: string;
  format: string;
}

export const COUNTRIES: CountryItem[] = [
  { id: 'ua', name: 'Ukraine', flag: '🇺🇦', code: '+380', format: '## ### ## ##' },
  { id: 'us', name: 'United States', flag: '🇺🇸', code: '+1', format: '### ### ####' },
  { id: 'gb', name: 'United Kingdom', flag: '🇬🇧', code: '+44', format: '#### ######' },
  { id: 'de', name: 'Germany', flag: '🇩🇪', code: '+49', format: '### ########' },
  { id: 'pl', name: 'Poland', flag: '🇵🇱', code: '+48', format: '### ### ###' },
  { id: 'ca', name: 'Canada', flag: '🇨🇦', code: '+1', format: '### ### ####' },
  { id: 'fr', name: 'France', flag: '🇫🇷', code: '+33', format: '# ## ## ## ##' },
  { id: 'it', name: 'Italy', flag: '🇮🇹', code: '+39', format: '### #######' },
  { id: 'es', name: 'Spain', flag: '🇪🇸', code: '+34', format: '### ### ###' },
  { id: 'nl', name: 'Netherlands', flag: '🇳🇱', code: '+31', format: '# ########' },
  { id: 'se', name: 'Sweden', flag: '🇸🇪', code: '+46', format: '## ### ## ##' },
  { id: 'ch', name: 'Switzerland', flag: '🇨🇭', code: '+41', format: '## ### ## ##' },
  { id: 'tr', name: 'Turkey', flag: '🇹🇷', code: '+90', format: '### ### ## ##' },
  { id: 'br', name: 'Brazil', flag: '🇧🇷', code: '+55', format: '## ##### ####' },
  { id: 'in', name: 'India', flag: '🇮🇳', code: '+91', format: '##### #####' },
  { id: 'jp', name: 'Japan', flag: '🇯🇵', code: '+81', format: '## #### ####' },
  { id: 'au', name: 'Australia', flag: '🇦🇺', code: '+61', format: '### ### ###' },
];
