/**
 * Helpers for the Designs pages: level names.
 */
import type { Design } from './schema';

export const LEVELS: Array<{ id: Design['level']; title: string; note: string }> = [
  { id: 'starter', title: 'Starter', note: 'Small systems with one or two hard ideas. Good first designs.' },
  { id: 'core', title: 'Core', note: 'The designs most interviews come back to.' },
  { id: 'advanced', title: 'Advanced', note: 'Extreme scale, money or optimisation. Do these after the core ones.' },
];
