/**
 * Multi-Room Stay Aggregator & ICU Statutory Exemption Logic
 * Evaluates room lines across multiple wards (e.g. ICU + General / Deluxe).
 * Per IRDAI Master Circular 2020 §5 Cl. 19, ICU stays are exempt from room rent caps.
 */

import { BillLine } from './types';

export interface RoomBillingResult {
  totalDays: number;
  totalRoomCharge: number;
  rate: number;
  nonIcuDays: number;
  nonIcuRoomCharge: number;
  nonIcuRate: number;
}

/**
 * Determines whether a bill line represents an ICU/ICCU/Critical Care stay.
 * Statutory Ground: IRDAI Master Circular 2020 §5 Cl. 19 exempts ICU stays from room caps.
 */
export function isIcuLine(line: BillLine): boolean {
  if (!line) return false;
  if (line.isIcu === true) return true;
  if (line.category === 'icu') return true;
  if (line.id && line.id.toLowerCase().includes('icu')) return true;
  if (line.label && /icu|ccu|intensive care|critical care/i.test(line.label)) return true;
  return false;
}

/**
 * Aggregates room lines to compute total stay days, total charges, and weighted daily rate.
 * Accommodates single-room, multi-ward, and ICU stepped-care admissions.
 */
export function resolveRoomBilling(lines: BillLine[] = []): RoomBillingResult {
  const roomLines = (lines || []).filter(l => l && l.category === 'room');
  if (roomLines.length === 0) {
    return {
      totalDays: 0,
      totalRoomCharge: 0,
      rate: 0,
      nonIcuDays: 0,
      nonIcuRoomCharge: 0,
      nonIcuRate: 0,
    };
  }

  const totalDays = roomLines.reduce((sum, l) => sum + Math.max(0, l.qty || 0), 0);
  const totalRoomCharge = roomLines.reduce((sum, l) => sum + Math.max(0, l.amount || 0), 0);
  const rate = totalDays > 0 ? Math.floor(totalRoomCharge / totalDays) : 0;

  const nonIcuLines = roomLines.filter(l => !isIcuLine(l));
  const nonIcuDays = nonIcuLines.reduce((sum, l) => sum + Math.max(0, l.qty || 0), 0);
  const nonIcuRoomCharge = nonIcuLines.reduce((sum, l) => sum + Math.max(0, l.amount || 0), 0);
  const nonIcuRate = nonIcuDays > 0 ? Math.floor(nonIcuRoomCharge / nonIcuDays) : 0;

  return {
    totalDays,
    totalRoomCharge,
    rate,
    nonIcuDays,
    nonIcuRoomCharge,
    nonIcuRate,
  };
}
