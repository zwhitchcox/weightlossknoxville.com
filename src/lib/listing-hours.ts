/**
 * Office hours from our Google listings. Google is the source of every
 * hours line on this site (Zane, 2026-10-27). hitchcoxaesthetics.com keeps
 * the listings' hours, as Google shows them, at /resources/listing-hours.
 * The pages that show hours render on request and read them here: a
 * 10-minute memory cache, then the last good copy, then
 * src/data/listing-hours.json when the SHA site does not answer.
 */
import fallback from '../data/listing-hours.json';

export type HoursPeriod = { day: string; opens: string; closes: string };
type Listings = Record<string, { periods: HoursPeriod[] }>;

const UPSTREAM = process.env.BOOKING_UPSTREAM ?? 'https://hitchcoxaesthetics.com';
const CACHE_MS = 10 * 60 * 1000;
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

let cache: { listings: Listings; at: number } | null = null;

async function readListings(): Promise<Listings> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.listings;
  try {
    const res = await fetch(`${UPSTREAM}/resources/listing-hours`, {
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const body = (await res.json()) as { listings: Listings };
    cache = { listings: body.listings, at: Date.now() };
  } catch (error) {
    console.error('listing hours: the SHA site did not answer, using the last copy', error);
    // Ask again only after the cache window, so pages stay fast while it is down.
    cache = { listings: cache?.listings ?? fallback.listings, at: Date.now() };
  }
  return cache.listings;
}

/** The weekly hours of one Google listing, Monday first. */
export async function getListingHours(listingId: string): Promise<HoursPeriod[]> {
  const listings = await readListings();
  return (
    listings[listingId]?.periods ?? (fallback.listings as Listings)[listingId]?.periods ?? []
  );
}

/** Days in a row that have the same hours. A closed day has no times. */
export function hoursRows(periods: HoursPeriod[]) {
  const rows: Array<{ days: string[]; opens?: string; closes?: string }> = [];
  for (const day of DAYS) {
    const period = periods.find((p) => p.day === day);
    const last = rows.at(-1);
    if (last && last.opens === period?.opens && last.closes === period?.closes) {
      last.days.push(day);
    } else {
      rows.push({ days: [day], opens: period?.opens, closes: period?.closes });
    }
  }
  return rows;
}

/** "Sunday", or a range: "Mon - Sat" (short) or "Monday - Saturday" (long). */
export function dayLabel(days: string[], style: 'short' | 'long') {
  if (days.length === 1) return days[0]!;
  const name = (day: string) => (style === 'short' ? day.slice(0, 3) : day);
  return `${name(days[0]!)} - ${name(days.at(-1)!)}`;
}

/** "10:00" as "10:00 AM", "19:00" as "7:00 PM". */
export function clock(hhmm: string) {
  const [hours, minutes] = hhmm.split(':').map(Number);
  return `${((hours! + 11) % 12) + 1}:${String(minutes).padStart(2, '0')} ${hours! < 12 ? 'AM' : 'PM'}`;
}

/** schema.org openingHoursSpecification: days with the same times share one entry. */
export function openingHoursSpecification(periods: HoursPeriod[]) {
  return hoursRows(periods)
    .filter((row) => row.opens)
    .map((row) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: row.days,
      opens: row.opens,
      closes: row.closes,
    }));
}

export const sameHours = (a: HoursPeriod[], b: HoursPeriod[]) =>
  JSON.stringify(a) === JSON.stringify(b);
