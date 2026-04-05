import type { Tone } from './types';

export interface ToneOption {
  value: Tone;
  label: string;
  description: string;
}

export const TONE_OPTIONS: ToneOption[] = [
  { value: 'nostalgic', label: '추억 소환', description: '담백하고 감성적인 회상 톤' },
  { value: 't_plus', label: 'T-Plus', description: '군대식 말맛을 살린 보고체 톤' },
];
