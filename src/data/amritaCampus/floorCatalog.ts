import { CAMPUS_FLOORS as LEGACY_FLOORS } from './floors';
import { OFFICIAL_FLOOR_PLANS } from './officialFloorPlans';

/**
 * Keeps the existing map metadata (faculty seats/search coordinates) while
 * adding every official floor from the supplied PDFs. The renderer uses the
 * PDF-derived catalog; legacy spaces remain available as a fallback for
 * faculty records that have not yet been verified against a source plan.
 */
const officialFloorIds = new Set(OFFICIAL_FLOOR_PLANS.map((floor) => floor.floorId));

const extraFloors = Object.fromEntries(
  OFFICIAL_FLOOR_PLANS
    .filter((plan) => !Object.values(LEGACY_FLOORS.buildings[plan.buildingId].floors).some((floor) => floor.id === plan.floorId))
    .map((plan) => [
      plan.floorId,
      {
        id: plan.floorId,
        name: plan.floorName,
        width: 1000,
        height: 460,
        outline: 'M20,20 L980,20 L980,440 L20,440 Z',
        corridors: [{ d: 'M40,290 L960,290 L960,330 L40,330 Z' }],
        nodes: [],
        edges: [],
        spaces: [],
      },
    ] as const),
);

export const CAMPUS_FLOORS = {
  buildings: Object.fromEntries(
    Object.entries(LEGACY_FLOORS.buildings).map(([buildingId, building]) => {
      const missing = OFFICIAL_FLOOR_PLANS
        .filter((plan) => plan.buildingId === buildingId && !building.floors.some((floor) => floor.id === plan.floorId))
        .map((plan) => extraFloors[plan.floorId as keyof typeof extraFloors]);
      return [buildingId, { ...building, verified: true, floors: [...building.floors, ...missing] }];
    }),
  ),
} as unknown as typeof LEGACY_FLOORS;

export { officialFloorIds };
