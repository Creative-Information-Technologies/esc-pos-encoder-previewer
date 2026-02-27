export interface ColorToken {
  name: string;
  value: string;
}

export interface TypographyToken {
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
}

export const colorTokens: ColorToken[] = [
  { name: 'Primary', value: '#1E3A5F' },
  { name: 'Primary Light', value: '#A7D4EF' },
  { name: 'Secondary', value: '#E94560' },
  { name: 'Success', value: '#10B981' },
  { name: 'Warning', value: '#F59E0B' },
  { name: 'Danger', value: '#EF4444' },
  { name: 'Info', value: '#3B82F6' },
  { name: 'Dark', value: '#1F2937' },
  { name: 'Gray', value: '#6B7280' },
  { name: 'Light Gray', value: '#E5E7EB' },
  { name: 'Background', value: '#F9FAFB' },
  { name: 'White', value: '#FFFFFF' },
];

export const typographyTokens: TypographyToken[] = [
  { name: 'Heading 1', fontFamily: 'Arial', fontSize: 24, fontWeight: 'bold' },
  { name: 'Heading 2', fontFamily: 'Arial', fontSize: 20, fontWeight: 'bold' },
  { name: 'Heading 3', fontFamily: 'Arial', fontSize: 16, fontWeight: 'bold' },
  { name: 'Body', fontFamily: 'Arial', fontSize: 12, fontWeight: 'normal' },
  { name: 'Body Small', fontFamily: 'Arial', fontSize: 10, fontWeight: 'normal' },
  { name: 'Caption', fontFamily: 'Arial', fontSize: 9, fontWeight: 'normal' },
  { name: 'Mono', fontFamily: 'Courier New', fontSize: 11, fontWeight: 'normal' },
];
