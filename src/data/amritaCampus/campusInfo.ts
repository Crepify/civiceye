/**
 * Amrita Bengaluru Campus — extended public information
 * Sources: OSM, amrita.edu, careers360, icbse, campus tour videos
 * All data is public, no private emails/phones.
 */

export const CAMPUS_ADDRESS = {
  name: 'Amrita Vishwa Vidyapeetham, Bengaluru Campus',
  short: 'Amrita Bengaluru',
  address: 'Kasavanahalli, Carmelaram P.O., Off Sarjapur Road, Bengaluru, Karnataka 560035',
  plusCode: 'VMVG+V8W, Amrita Nagar, Choodasandra, Junnasandra, Bengaluru',
  phone: '080 - 25183700',
  email: 'info@blr.amrita.edu',
  website: 'https://www.amrita.edu/campus/bengaluru/',
};

export const CAMPUS_STATS = {
  totalAcresOfficial: 50,
  totalAcresMeasured: 37.2,
  academicAcres: 25.3,
  residentialAcres: 11.8,
  buildings: 12,
  blocks: 5,
  floors: 15,
  rooms: 163,
  facultyPublic: 155,
  halls: 9,
  gates: 3,
};

export const BLOCKS_INFO = [
  {
    id: 'E',
    name: 'Block E (Main / New Block) — SQUARE 50.8x50.8m per your correction',
    role: 'Main block — SQUARE per your correction — nearest the gate (entrance, admin, all halls in 1st 2nd 3rd floor per your correction)',
    floors: 5,
    area: 2587,
    position: 'Nearest the gate — square shape from your correction + Google Maps',
    highlights: ['Main Entrance & Reception (white ornate arch from your photo)', 'Administrative Office', "Director's Office central tower with Amma photo", 'Ground: Admin only (no halls per your correction)', '1st Floor: Amriteshwari 265, Sudhamani 300, Krishna 112 (all in E Block per your correction)', '2nd Floor: Vyasa 90, Rama 85, Valmiki 80, Conference 27 (E Block per your correction)', '3rd Floor: Indo-US 62, E-Learning 120, Akshaya 100 (E Block per your correction, Akshaya was in A Block photo)', '4th Floor: Central Library 1213 sq m 200 seating + Reading Hall 325 sq m 150 seating', 'Medical Room, Bank/ATM'],
    color: '#A51636',
  },
  {
    id: 'A',
    name: 'Block A',
    role: 'Academic wing (next to E block)',
    floors: 3,
    area: 2138,
    position: 'Next to E block',
    highlights: ['Sudhamani Hall 300', 'EEE Faculty Room 1 & 2', 'Examination Office', 'Training & Placement Cell', 'Internet Lab 50 nodes', 'NOC', 'E-Learning Studio 120'],
    color: '#ef4444',
  },
  {
    id: 'B',
    name: 'Block B',
    role: 'Academic wing',
    floors: 3,
    area: 2098,
    position: 'Third from gate',
    highlights: ['Krishna Hall 112', 'ECE Faculty Room 1-3', 'Electronics Lab', 'Microprocessor Lab', 'Communication Lab', 'AI/ML Lab', 'Indo-US Corporate Classroom 62'],
    color: '#22c55e',
  },
  {
    id: 'C',
    name: 'Block C',
    role: 'Academic wing',
    floors: 2,
    area: 2153,
    position: 'Fourth from gate',
    highlights: ['Valmiki Hall 80', 'Vyasa Hall 90', 'Rama Hall 85', 'Mechanical Faculty Room 1-2', 'Computer Labs 1 & 2'],
    color: '#3b82f6',
  },
  {
    id: 'D',
    name: 'Block D',
    role: 'Academic wing — nearest the cafeteria',
    floors: 2,
    area: 578,
    position: 'Next to cafeteria',
    highlights: ['Physics Lab', 'Chemistry Lab', 'Sciences Faculty Room (Chem/Phys)', 'Tutorial Rooms'],
    color: '#eab308',
  },
];

export const HALLS_INFO = [
  { name: 'Amriteshwari Hall', capacity: 265, block: 'E', use: 'In-campus functions (A/V equipped)', source: 'amrita.edu ICTS' },
  { name: 'Sudhamani Hall', capacity: 300, block: 'A', use: 'Seminars, placement, club activities', source: 'amrita.edu ICTS' },
  { name: 'Krishna Hall', capacity: 112, block: 'B', use: 'Seminars, student presentations', source: 'amrita.edu ICTS' },
  { name: 'Vyasa Hall', capacity: 90, block: 'C', use: 'Seminars, student presentations', source: 'amrita.edu ICTS' },
  { name: 'Rama Hall', capacity: 85, block: 'C', use: 'Seminars, student presentations', source: 'amrita.edu ICTS' },
  { name: 'Valmiki Hall', capacity: 80, block: 'C', use: 'Seminars, placement, presentations', source: 'amrita.edu ICTS' },
  { name: 'Conference Hall', capacity: 27, block: 'E', use: 'Board / executive / departmental meetings', source: 'amrita.edu ICTS' },
  { name: 'Indo-US Corporate Classroom', capacity: 62, block: 'B', use: 'Dual MS-degree lecture studio', source: 'amrita.edu ICTS' },
  { name: 'E-Learning Studio (A-VIEW)', capacity: 120, block: 'A', use: 'Two-way audio-video lectures across campuses', source: 'amrita.edu ICTS' },
  { name: 'Central Library — Stacks', capacity: 0, block: 'E', floor: '4th', use: 'New Block, 4th floor, 16,550 sq ft, 45,880+ items, Mon–Fri 8AM–10PM', source: 'amrita.edu Resources' },
];

export const AMENITIES = [
  { name: 'Cafeteria', kind: 'food', zone: 'south', note: 'In-campus canteen' },
  { name: 'Playing Field / Ground', kind: 'sport', zone: 'north', area: 13341, note: 'Traced from Esri imagery' },
  { name: 'Tennis & Basketball Courts', kind: 'sport', zone: 'north', area: 1350, note: 'Traced from Esri imagery' },
  { name: 'Blue-roof Hall (indoor sports / mess)', kind: 'support', zone: 'north', area: 4586, note: 'Traced from Esri imagery' },
  { name: 'Badminton Court', kind: 'sport', zone: 'south', area: 82, note: 'Between B and C blocks, reported on ground' },
  { name: 'Open-Air Stage', kind: 'amenity', zone: 'south', area: 54, note: 'Between A and B blocks, reported on ground' },
  { name: 'Hostel H1-H6', kind: 'hostel', zone: 'north', note: 'North residential ring, H1–H6 reference labels invented for map' },
  { name: 'BMTC Bus Stop - Amrita University', kind: 'transit', zone: 'outside', note: '290m from college, just outside boundary' },
];

export const DEPARTMENTS = [
  { id: 'CSE', name: 'Computer Science & Engineering', school: 'School of Computing', blocks: ['B'], facultyCount: 46 },
  { id: 'ECE', name: 'Electronics & Communication Engineering', school: 'School of Engineering', blocks: ['A', 'B'], facultyCount: 40 },
  { id: 'EEE', name: 'Electrical & Electronics Engineering', school: 'School of Engineering', blocks: ['A'], facultyCount: 17 },
  { id: 'Mechanical', name: 'Mechanical Engineering', school: 'School of Engineering', blocks: ['C'], facultyCount: 22 },
  { id: 'AIE', name: 'Artificial Intelligence', school: 'School of Artificial Intelligence', blocks: ['B', 'E'], facultyCount: 5 },
  { id: 'Mathematics', name: 'Mathematics', school: 'Sciences', blocks: ['E'], facultyCount: 4 },
  { id: 'Chemistry', name: 'Chemistry', school: 'Sciences', blocks: ['D'], facultyCount: 6 },
  { id: 'Physics', name: 'Physics', school: 'Sciences', blocks: ['D'], facultyCount: 1 },
  { id: 'English', name: 'English & Cultural Education', school: 'Humanities', blocks: ['E'], facultyCount: 5 },
  { id: 'SoE', name: 'School of Engineering (General)', school: 'School of Engineering', blocks: ['E'], facultyCount: 9 },
];

export const CAMPUS_FEATURES = [
  'Real OSM building footprints (12 buildings, 2 zones, 21 roads, 3 gates) verified inside campus multipolygon',
  'Blocks A–E axis-aligned rectangles on true wall angle 67°, exhaustive partition of Main Academic Block 8,561 m², order E,A,B,C,D confirmed on ground',
  '15 floors across Blocks A–E, 163 rooms, 155 faculty public searchable by name/dept/room',
  'Named halls with real capacities from amrita.edu ICTS, Central Library 4th floor 16,550 sq ft 45,880+ items',
  'Satellite basemap Esri World Imagery z19 143 tiles, converted to /public/amrita-satellite.jpg, not Google Maps (ToS forbids tracing)',
  'Campus walking navigation Dijkstra over 100 nodes 103 edges 26 POIs, distance, walk time 1.35 m/s, turn-by-turn, Gate1→Cafeteria 306m/4min/7 steps',
  'Indoor routing BFS per-floor nodes/edges from entrance/stairs to target room',
  'Every location pinnable to 1m: tap any point to get campus meters + lat/lng, copy, share, use for report, QR deep links /amrita/map?b=block-c&f=c-g&room=C-G7&person=id',
  'Campus issues only on this map: scope=campus filtered, city reports never mixed, reports shown as severity-colored pins with clustering',
  'No Google Maps in Amrita Eye: MapPage, AmritaMapCanvas, Dashboard, ReportPage location step, Features preview all use custom campus map',
  'UI: Apple HIG minimalist, Amrita maroon #A51636, light #FFF5F7 dark #1A030A, Tailwind, Framer Motion, responsive drawer + bottom sheet, constant-size labels scale(1/k)',
  'Honest data disclosure: verified vs estimated vs traced, warning banners, attribution auto-switches OSM vs Esri',
];
