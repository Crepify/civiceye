/**
 * Canonical room index transcribed from the official floor-plan PDFs supplied
 * for the Amrita Bengaluru pilot. The PDFs remain the source of truth; this
 * file is deliberately data-only so the map renderer can be replaced without
 * changing the verified room labels.
 */

export type OfficialRoomType =
  | 'room'
  | 'lab'
  | 'office'
  | 'hall'
  | 'library'
  | 'washroom'
  | 'stairs'
  | 'lift'
  | 'entrance'
  | 'service';

export interface OfficialRoom {
  label: string;
  name: string;
  type?: OfficialRoomType;
  capacity?: number;
  note?: string;
}

export interface OfficialFloorPlanDefinition {
  buildingId: 'a' | 'b' | 'c' | 'd' | 'e';
  floorId: string;
  floorName: string;
  source: string;
  rooms: OfficialRoom[];
}

const source = (building: string, floor?: string) =>
  `/floor-plans/professional/block-${building}-${floor || 'g'}.pdf`;

const rooms = (...items: Array<OfficialRoom | string>): OfficialRoom[] =>
  items.map((item) => (typeof item === 'string' ? { label: item, name: item } : item));

const numbered = (building: string, floor: number, first: number, last: number): OfficialRoom[] =>
  Array.from({ length: last - first + 1 }, (_, index) => {
    const room = `${building}-${floor}${String(first + index).padStart(2, '0')}`;
    return { label: room, name: 'Room', type: 'room' as const };
  });

export const OFFICIAL_FLOOR_PLANS: OfficialFloorPlanDefinition[] = [
  {
    buildingId: 'a', floorId: 'a-g', floorName: 'Ground Floor', source: source('a'),
    rooms: rooms(
      { label: 'Amrita Darshanam', name: 'Amrita Darshanam', type: 'hall' },
      { label: 'Admin Office', name: 'Admin Office', type: 'office' },
      'A-107', 'A-106', 'A-105',
      { label: 'Conference Hall', name: 'Conference Hall', type: 'hall' },
      { label: 'Estate Office', name: 'Estate Office Facilities', type: 'office' },
      { label: 'ATM / Bank', name: 'ATM Bank', type: 'service' },
      { label: 'Male staff WC', name: 'Male Staff Washroom', type: 'washroom' },
      { label: 'Female staff WC', name: 'Female Staff Washroom', type: 'washroom' },
      { label: 'Entrance', name: 'Main entry / passageway to cafeteria', type: 'entrance' },
      { label: 'Stairs', name: 'Main stairs', type: 'stairs' },
    ),
  },
  {
    buildingId: 'a', floorId: 'a-1', floorName: 'First Floor', source: source('a'),
    rooms: rooms(
      { label: 'Heat Transfer Lab', name: 'Heat Transfer Lab', type: 'lab' },
      { label: 'Akshaya Hall', name: 'Akshaya Hall', type: 'hall' },
      { label: 'E-Learning Centre', name: 'E-Learning Centre', type: 'hall' },
      { label: 'Indo-US', name: 'Indo-US University Institutions', type: 'hall' },
      { label: 'Male staff WC', name: 'Male Staff Washroom', type: 'washroom' },
      { label: 'Female staff WC', name: 'Female Staff Washroom', type: 'washroom' },
      { label: 'Stairs', name: 'Main stairs', type: 'stairs' },
    ),
  },
  {
    buildingId: 'a', floorId: 'a-2', floorName: 'Second Floor', source: source('a'),
    rooms: rooms(
      ...numbered('A', 3, 1, 8),
      { label: 'Eye tracking / CV', name: 'Eye Tracking and Computer Vision Research Lab', type: 'lab' },
      { label: 'Male staff WC', name: 'Male Staff Washroom', type: 'washroom' },
      { label: 'Female staff WC', name: 'Female Staff Washroom', type: 'washroom' },
      { label: 'Stairs', name: 'Main stairs', type: 'stairs' },
    ),
  },
  {
    buildingId: 'a', floorId: 'a-3', floorName: 'Third Floor', source: source('a'),
    rooms: rooms(
      ...numbered('A', 4, 1, 8),
      { label: 'Male staff WC', name: 'Male Staff Washroom', type: 'washroom' },
      { label: 'Female staff WC', name: 'Female Staff Washroom', type: 'washroom' },
      { label: 'Stairs', name: 'Main stairs', type: 'stairs' },
    ),
  },
  {
    buildingId: 'b', floorId: 'b-g', floorName: 'Ground Floor', source: source('b'),
    rooms: rooms(
      { label: 'CSE Staff', name: 'CSE Staff Room', type: 'office' },
      { label: 'Simulation Lab', name: 'Simulation Lab', type: 'lab' },
      { label: 'Xerox & Shop', name: 'Xerox and Shop', type: 'service' },
      { label: 'Shockwave', name: 'Shockwave and Hypersonic Lab', type: 'lab' },
      { label: 'Applied Instrumentation', name: 'Applied Instrumentation and Optoelectronics Lab', type: 'lab' },
      { label: 'Male staff WC', name: 'Male Staff Washroom', type: 'washroom' },
      { label: 'Stairs', name: 'Main stairs', type: 'stairs' },
    ),
  },
  {
    buildingId: 'b', floorId: 'b-1', floorName: 'First Floor', source: source('b'),
    rooms: rooms(
      { label: 'ECE Staff 1', name: 'ECE Staff Room', type: 'office' },
      { label: 'Digital System', name: 'Digital System Lab', type: 'lab' },
      { label: 'ECE Staff 2', name: 'ECE Staff Room', type: 'office' },
      { label: 'Microcontroller', name: 'Microcontroller and Signal Processing Lab', type: 'lab' },
      { label: 'Cisco', name: 'Cisco Networking Lab', type: 'lab' },
      { label: 'Communications', name: 'Communication Lab', type: 'lab' },
      { label: 'Male staff WC', name: 'Male Staff Washroom', type: 'washroom' },
      { label: 'Stairs', name: 'Main stairs', type: 'stairs' },
    ),
  },
  {
    buildingId: 'b', floorId: 'b-2', floorName: 'Second Floor', source: source('b'),
    rooms: rooms(
      { label: 'Mechanical Staff', name: 'Mechanical Staff Room', type: 'office' },
      { label: 'Project Lab 1', name: 'Project Lab 1', type: 'lab' },
      { label: 'ECE Computer', name: 'ECE Computer Lab', type: 'lab' },
      'B-304',
      { label: 'Circuits', name: 'Circuits Lab', type: 'lab' },
      'B-302',
      { label: 'Microwave & RF', name: 'Microwave and RF Simulation Lab', type: 'lab' },
      { label: 'Female staff WC', name: 'Female Staff Washroom', type: 'washroom' },
      { label: 'Stairs', name: 'Main stairs', type: 'stairs' },
    ),
  },
  {
    buildingId: 'b', floorId: 'b-3', floorName: 'Third Floor', source: source('b'),
    rooms: rooms(
      { label: 'Maths', name: 'Department of Maths', type: 'office' },
      { label: 'English / Biology', name: 'Department of English / Biology', type: 'office' },
      { label: 'Power Electronics', name: 'Power Electronics Lab / Electric Devices and Controls Lab', type: 'lab' },
      { label: 'Circuits & Measurements', name: 'Circuits and Measurements Lab', type: 'lab' },
      'B-404',
      { label: 'Physics Lab', name: 'Physics Lab', type: 'lab' },
      { label: 'Physics', name: 'Physics Department', type: 'office' },
      { label: 'Chemistry', name: 'Chemistry Department', type: 'office' },
      { label: 'Female staff WC', name: 'Female Staff Washroom', type: 'washroom' },
      { label: 'Stairs', name: 'Main stairs', type: 'stairs' },
    ),
  },
  {
    buildingId: 'c', floorId: 'c-g', floorName: 'Ground Floor', source: source('c'),
    rooms: rooms(
      { label: 'Thermal Science', name: 'Thermal Science Laboratory', type: 'lab' },
      { label: 'Fluid Mechanics', name: 'Fluid Mechanics Lab', type: 'lab' },
      { label: 'Metallurgy', name: 'Metallurgy Lab', type: 'lab' },
      { label: 'Electrical Machines', name: 'Electrical Machines Lab and Power System Hardware Lab', type: 'lab' },
      { label: 'Material Testing', name: 'Material Testing Laboratory', type: 'lab' },
      { label: 'Male staff WC', name: 'Male Staff Washroom', type: 'washroom' },
      { label: 'Stairs', name: 'Main stairs', type: 'stairs' },
    ),
  },
  {
    buildingId: 'c', floorId: 'c-1', floorName: 'First Floor', source: source('c'),
    rooms: rooms(...numbered('C', 2, 1, 12), { label: 'Female staff WC', name: 'Female Staff Washroom', type: 'washroom' }, { label: 'Stairs', name: 'Main stairs', type: 'stairs' }),
  },
  {
    buildingId: 'c', floorId: 'c-2', floorName: 'Second Floor', source: source('c'),
    rooms: rooms(...numbered('C', 3, 1, 8), { label: 'Male staff WC', name: 'Male Staff Washroom', type: 'washroom' }, { label: 'Stairs', name: 'Main stairs', type: 'stairs' }),
  },
  {
    buildingId: 'c', floorId: 'c-3', floorName: 'Third Floor', source: source('c'),
    rooms: rooms(...numbered('C', 4, 1, 8), { label: 'Female staff WC', name: 'Female Staff Washroom', type: 'washroom' }, { label: 'Stairs', name: 'Main stairs', type: 'stairs' }),
  },
  {
    buildingId: 'd', floorId: 'd-g', floorName: 'Ground Floor', source: source('d'),
    rooms: rooms(
      { label: 'Saraswathi Idol', name: 'Saraswathi Idol', type: 'service' },
      { label: 'Lathe Shop', name: 'Lathe Shop', type: 'lab' },
      { label: 'Foundry Lab', name: 'Foundry Lab', type: 'lab' },
      { label: 'Cafeteria entry', name: 'Entry / way to cafeteria', type: 'entrance' },
      { label: 'Stairs', name: 'Main stairs', type: 'stairs' },
    ),
  },
  {
    buildingId: 'd', floorId: 'd-1', floorName: 'First Floor', source: source('d'),
    rooms: rooms(
      { label: 'Research Scholar', name: 'Research Scholar Room', type: 'office' },
      { label: 'Manufacturing', name: 'Manufacturing Practice Lab', type: 'lab' },
      { label: 'Electrical Workshop', name: 'Electrical Workshop Lab', type: 'lab' },
      { label: 'Stairs', name: 'Main stairs', type: 'stairs' },
    ),
  },
  {
    buildingId: 'd', floorId: 'd-2', floorName: 'Second Floor', source: source('d'),
    rooms: rooms(
      { label: 'Girls Common', name: 'Girls Common Room', type: 'service' },
      { label: 'Machine Dynamics', name: 'Machine Dynamics and Measurement Lab', type: 'lab' },
      { label: 'CAM / Robotics', name: 'CAM / Robotics Lab', type: 'lab' },
      { label: 'Metrology', name: 'Metrology Lab', type: 'lab' },
      { label: 'Male staff WC', name: 'Male Staff Washroom', type: 'washroom' },
      { label: 'Stairs', name: 'Main stairs', type: 'stairs' },
    ),
  },
  {
    buildingId: 'd', floorId: 'd-3', floorName: 'Third Floor', source: source('d'),
    rooms: rooms(
      { label: 'Amritadhara', name: 'Amritadhara', type: 'service' },
      'D-404', 'D-403', 'D-402', 'D-401',
      { label: 'Male staff WC', name: 'Male Staff Washroom', type: 'washroom' },
      { label: 'Stairs', name: 'Main stairs', type: 'stairs' },
    ),
  },
  {
    buildingId: 'e', floorId: 'e-g', floorName: 'Ground Floor', source: source('e', 'ground'),
    rooms: rooms(
      { label: 'Amriteshwari', name: 'Amriteshwari Hall', type: 'hall', capacity: 265 },
      { label: 'Sudhamani', name: 'Sudhamani Hall', type: 'hall', capacity: 300 },
      { label: 'Canteen', name: 'Canteen', type: 'service' },
      { label: 'Reception', name: 'Reception Area', type: 'entrance' },
      { label: 'DOSA', name: 'Department of Student Affairs', type: 'office' },
      { label: 'Clinic', name: 'Clinic', type: 'service' },
      { label: 'Girls WC', name: 'Girls Washroom', type: 'washroom' },
      { label: 'Boys WC', name: 'Boys Washroom', type: 'washroom' },
      { label: 'Female staff WC', name: 'Female Staff Washroom', type: 'washroom' },
      { label: 'Male staff WC', name: 'Male Staff Washroom', type: 'washroom' },
      { label: 'Side lift', name: 'Side Lift', type: 'lift' },
      { label: 'Staff lift', name: 'Staff Lift', type: 'lift' },
      { label: 'Main entrance', name: 'Main Entrance / Main Gate', type: 'entrance' },
      { label: 'Stairs', name: 'Stairs to first floor / basement', type: 'stairs' },
    ),
  },
  {
    buildingId: 'e', floorId: 'e-1', floorName: 'First Floor', source: source('e', 'first'),
    rooms: rooms(
      { label: 'Valmiki', name: 'Valmiki Hall', type: 'hall', capacity: 80 },
      { label: 'Rama', name: 'Rama Hall', type: 'hall', capacity: 85 },
      { label: 'Krishna', name: 'Krishna Hall', type: 'hall', capacity: 112 },
      { label: 'Vyasa', name: 'Vyasa Hall', type: 'hall', capacity: 90 },
      { label: 'ACIP', name: 'Amrita Centre for International Programs', type: 'office' },
      { label: 'Alumni Relations', name: 'Alumni Relations Office', type: 'office' },
      { label: "Principal's Cabin", name: "Principal's Cabin", type: 'office' },
      { label: 'Exam Cell', name: 'Exam Cell', type: 'office' },
      { label: 'Academic Coordinator', name: 'Academic Coordinator Office', type: 'office' },
      { label: 'Girls WC', name: 'Girls Washroom', type: 'washroom' },
      { label: 'Boys WC', name: 'Boys Washroom', type: 'washroom' },
      { label: 'Side lift', name: 'Side Lift', type: 'lift' },
      { label: 'Staff lift', name: 'Staff Lift', type: 'lift' },
      { label: 'Stairs', name: 'Stairs', type: 'stairs' },
    ),
  },
  {
    buildingId: 'e', floorId: 'e-2', floorName: 'Second Floor', source: source('e', 'second'),
    rooms: rooms(
      { label: 'Advanced Communications', name: 'Advanced Communications and Networks Lab', type: 'lab' },
      'E-209', 'E-208', 'E-207', 'E-206', 'E-205',
      'E-201', 'E-202', 'E-203',
      { label: 'Raaga', name: 'Raaga Room', type: 'room' },
      { label: 'Nanotechnology', name: 'Nanotechnology Research Lab', type: 'lab' },
      { label: 'Girls WC', name: 'Girls Washroom', type: 'washroom' },
      { label: 'Boys WC', name: 'Boys Washroom', type: 'washroom' },
      { label: 'Side lift', name: 'Side Lift', type: 'lift' },
      { label: 'Staff lift', name: 'Staff Lift', type: 'lift' },
      { label: 'Stairs', name: 'Stairs', type: 'stairs' },
    ),
  },
  {
    buildingId: 'e', floorId: 'e-3', floorName: 'Third Floor', source: source('e', 'third'),
    rooms: rooms(
      'E-309',
      { label: 'MBA Operations', name: 'MBA: Operations', type: 'room' },
      { label: 'MBA HR / Analytics', name: 'MBA: HR / Analytics', type: 'room' },
      { label: 'MBA Finance', name: 'MBA: Finance', type: 'room' },
      { label: 'MBA Marketing', name: 'MBA: Marketing', type: 'room' },
      'E-301', 'E-302', 'E-303',
      { label: 'Girls WC', name: 'Girls Washroom', type: 'washroom' },
      { label: 'Boys WC', name: 'Boys Washroom', type: 'washroom' },
      { label: 'Side lift', name: 'Side Lift', type: 'lift' },
      { label: 'Staff lift', name: 'Staff Lift', type: 'lift' },
      { label: 'Stairs', name: 'Stairs', type: 'stairs' },
    ),
  },
  {
    buildingId: 'e', floorId: 'e-4', floorName: 'Fourth Floor', source: source('e', 'fourth'),
    rooms: rooms(
      { label: 'Reading Room', name: 'Reading Room', type: 'library', capacity: 150 },
      { label: 'Library', name: 'Library', type: 'library', capacity: 200 },
      { label: 'Girls WC', name: 'Girls Washroom', type: 'washroom' },
      { label: 'Boys WC', name: 'Boys Washroom', type: 'washroom' },
      { label: 'Side lift', name: 'Side Lift', type: 'lift' },
      { label: 'Staff lift', name: 'Staff Lift', type: 'lift' },
      { label: 'Stairs', name: 'Stairs', type: 'stairs' },
    ),
  },
  {
    buildingId: 'e', floorId: 'e-5', floorName: 'Fifth Floor', source: source('e', 'fifth'),
    rooms: rooms(
      { label: 'Edge AI', name: 'Edge AI Lab', type: 'lab' },
      { label: 'Embedded Systems', name: 'Embedded System Lab', type: 'lab' },
      { label: 'Robotics Research', name: 'Robotics Research Lab', type: 'lab' },
      { label: 'AI Lab', name: 'AI Lab', type: 'lab' },
      { label: 'Computer Lab', name: 'Computer Lab', type: 'lab' },
      { label: 'Girls WC', name: 'Girls Washroom', type: 'washroom' },
      { label: 'Boys WC', name: 'Boys Washroom', type: 'washroom' },
      { label: 'Side lift', name: 'Side Lift', type: 'lift' },
      { label: 'Staff lift', name: 'Staff Lift', type: 'lift' },
      { label: 'Stairs', name: 'Stairs', type: 'stairs' },
    ),
  },
  {
    buildingId: 'e', floorId: 'e-6', floorName: 'Sixth Floor', source: source('e', 'sixth'),
    rooms: rooms(
      { label: 'ICTS', name: 'ICTS', type: 'office' },
      { label: 'CIR', name: 'Corporate and Industry Relations (CIR)', type: 'office' },
      { label: 'MBA Classes 1', name: 'MBA Classes', type: 'room' },
      { label: 'MBA Classes 2', name: 'MBA Classes', type: 'room' },
      { label: 'Amrita School of Business', name: 'Amrita School of Business', type: 'office' },
      { label: 'Girls WC', name: 'Girls Washroom', type: 'washroom' },
      { label: 'Boys WC', name: 'Boys Washroom', type: 'washroom' },
      { label: 'Side lift', name: 'Side Lift', type: 'lift' },
      { label: 'Staff lift', name: 'Staff Lift', type: 'lift' },
      { label: 'Stairs', name: 'Stairs', type: 'stairs' },
    ),
  },
  {
    buildingId: 'e', floorId: 'e-7', floorName: 'Seventh Floor', source: source('e', 'seventh'),
    rooms: rooms(
      { label: 'Human Language', name: 'Human Language Technology Lab', type: 'lab' },
      { label: 'RF / Wireless', name: 'RF and Wireless Systems Lab', type: 'lab' },
      { label: 'TBI 1', name: 'TBI', type: 'office' },
      { label: 'TBI 2', name: 'TBI', type: 'office' },
      { label: 'Microgrid', name: 'Microgrid and Drives Research Lab', type: 'lab' },
      { label: 'Microwave Sensing', name: 'Microwave Sensing and Materials Lab', type: 'lab' },
      { label: 'Girls WC', name: 'Girls Washroom', type: 'washroom' },
      { label: 'Boys WC', name: 'Boys Washroom', type: 'washroom' },
      { label: 'Side lift', name: 'Side Lift', type: 'lift' },
      { label: 'Staff lift', name: 'Staff Lift', type: 'lift' },
      { label: 'Stairs', name: 'Stairs', type: 'stairs' },
    ),
  },
];

export function getOfficialFloorPlan(buildingId: string, floorId: string) {
  return OFFICIAL_FLOOR_PLANS.find(
    (plan) => plan.buildingId === buildingId.toLowerCase() && plan.floorId === floorId.toLowerCase(),
  );
}
