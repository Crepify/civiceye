/**
 * ROAD CONTRACT / WARRANTY LOOKUP
 *
 * In many cities, freshly laid roads carry a contractor "Defect Liability
 * Period" (DLP) — commonly 1–5 years — during which the CONTRACTOR (not the
 * civic body) must fix potholes for free. Inspired by Gaurav Sen's dash-cam
 * idea: detect the pothole, then automatically complain to the road's
 * contractor instead of the taxpayer-funded civic body.
 *
 * Ideally this reads a live government contract registry (BBMP publishes
 * contract/DLP data in tenders & annual reports). Until an open API exists,
 * CivicEye ships this demo registry of high-traffic Bengaluru corridors,
 * clearly marked as SAMPLE. Replace/extend with your city's live data and
 * the app will match automatically.
 */

export interface RoadContract {
  corridor: string;
  keywords: string[];
  /** Whose road it is (BBMP zone / major road). */
  owner: string;
  /** Contractor that laid/re-laid the road (SAMPLE — verify). */
  contractor: string;
  /** Public reference for the contract/tender (SAMPLE). */
  contractRef: string;
  /** End of the defect-liability / warranty window (ISO date). */
  warrantyUntil: string;
  source: string;
}

export const ROAD_CONTRACTS: RoadContract[] = [
  {
    corridor: 'Outer Ring Road (Silk Board → KR Puram)',
    keywords: ['outer ring road', 'orr', 'silk board', 'kr puram', 'marathahalli', 'bellandur'],
    owner: 'BBMP / NHAI (ORR stretch)',
    contractor: 'Sample Infra Ltd (BBMP major-road DLP contract)',
    contractRef: 'BBMP-TNDR-DEMO-2024-07',
    warrantyUntil: '2028-03-31',
    source: 'Demo registry — verify via BBMP contract records',
  },
  {
    corridor: 'Indiranagar 100 Feet Road',
    keywords: ['indiranagar', '100 feet road', '100-ft', 'old airport road'],
    owner: 'BBMP East zone',
    contractor: 'Sample Build Co (ward maintenance contract)',
    contractRef: 'BBMP-WARD-DEMO-2024-11',
    warrantyUntil: '2027-09-30',
    source: 'Demo registry — verify via BBMP contract records',
  },
  {
    corridor: 'Koramangala 80 Feet Road',
    keywords: ['koramangala', '80 feet road', '80-ft', 'sony world'],
    owner: 'BBMP East zone',
    contractor: 'Sample Roads Pvt Ltd',
    contractRef: 'BBMP-WARD-DEMO-2025-01',
    warrantyUntil: '2028-06-30',
    source: 'Demo registry — verify via BBMP contract records',
  },
  {
    corridor: 'Hosur Road (Silk Board → Electronic City)',
    keywords: ['hosur road', 'electronic city', 'bommanahalli', 'e-city'],
    owner: 'NHAI / BMRDA',
    contractor: 'Sample Highway JV (NH-44 maintenance)',
    contractRef: 'NHAI-DEMO-2023-05',
    warrantyUntil: '2027-12-31',
    source: 'Demo registry — verify via NHAI records',
  },
];

/** Match a location string ("near 100 Feet Road Indiranagar") to a corridor. */
export function findRoadContract(location?: string | null): RoadContract | null {
  if (!location) return null;
  const q = location.toLowerCase();
  for (const rc of ROAD_CONTRACTS) {
    if (rc.keywords.some((k) => q.includes(k))) return rc;
  }
  return null;
}

/** Human "is this still under warranty?" — true if today <= warrantyUntil. */
export function isUnderWarranty(rc: RoadContract, today = new Date()): boolean {
  return today <= new Date(rc.warrantyUntil + 'T23:59:59');
}
