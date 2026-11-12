/**
 * ClaimLens Deterministic Rules Engine
 * Pure TypeScript, exact integer rupees, zero external runtime dependencies.
 */

export * from './types';
export * from './multiroom';
export * from './forecast';
export * from './advice';

export { forecast as calculateForecast } from './forecast';

import { ENGINE_VERSION } from './types';

/**
 * Engine health check helper for service monitors and smoke tests.
 */
export function getEngineHealth(): { status: string; version: string } {
  return {
    status: 'ok',
    version: ENGINE_VERSION,
  };
}
