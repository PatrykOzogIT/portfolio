import type { Lang } from '../model';
import { en } from './en';
import { pl, type Dictionary } from './pl';

export type { Dictionary };

export const DICTIONARIES: Readonly<Record<Lang, Dictionary>> = { pl, en };
