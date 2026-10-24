import { Tone } from '@shared/types';

export type AlertTone = Extract<Tone, 'info' | 'success' | 'warning' | 'danger'>;
