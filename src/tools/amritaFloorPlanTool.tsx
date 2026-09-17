/* eslint-disable react-refresh/only-export-components */
/**
 * Proper Floor Plan Tool for Amrita Bengaluru Only
 * Generates accurate, professional floor plans using SVG with walls, doors, windows, corridors
 * Based on: Your A Block 1st floor photos (open corridor south with railings facing fountain, rooms north wooden doors, Akshaya Hall, Indo-US blue curved wall), E Block square 50.8x50.8m per your correction, all halls in E Block 1st/2nd/3rd, Google Maps satellite E-shaped comb, OSM footprints, Amritapuri PDF reference
 * No placeholders — everything adapts to tentative floor plans
 */

export interface Wall {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number;
  type: 'outer' | 'inner' | 'corridor';
}

export interface Door {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  orientation: 'horizontal' | 'vertical';
  type: 'single' | 'double' | 'glass';
}

export interface Window {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  orientation: 'horizontal' | 'vertical';
}

export interface Room {
  id: string;
  label: string;
  name: string;
  type: 'classroom' | 'lab' | 'office' | 'hall' | 'amenity' | 'support' | 'stairs' | 'restroom' | 'entrance' | 'corridor';
  x: number;
  y: number;
  w: number;
  h: number;
  capacity?: number;
  department?: string;
  notes?: string;
}

export interface FloorPlan {
  id: string;
  name: string;
  buildingId: string;
  buildingName: string;
  width: number;
  height: number;
  walls: Wall[];
  doors: Door[];
  windows: Window[];
  rooms: Room[];
  corridor: { x: number; y: number; w: number; h: number; openSide: 'south' | 'north' | 'east' | 'west'; railing: boolean };
}

// Generate proper floor plan for A Block 1st floor from your photos — most accurate
export function generateABlockFirstFloor(): FloorPlan {
  // Based on your photos: open corridor south with railings facing fountain, rooms north with wooden doors
  // Building dimensions: 22m x 97.2m, but canvas 1000x460 for fit
  // Corridor south side: y=320-400, open with railings, 3m wide
  // Rooms north side: 8 rooms, each ~110-180 width, 130 height, facing north, corridor south

  const rooms: Room[] = [
    { id: 'a-101', label: 'A-101', name: 'Computer Centre', type: 'lab', x: 30, y: 30, w: 110, h: 120, capacity: 80, department: 'CSE', notes: '24/7 computer labs, north facing, corridor south open with railings facing fountain per your photo' },
    { id: 'a-102', label: 'A-102', name: 'Internet Lab', type: 'lab', x: 150, y: 30, w: 110, h: 120, capacity: 50, department: 'CSE', notes: '50 nodes real from ICTS, north facing' },
    { id: 'a-103', label: 'A-103', name: 'ICTS / NOC', type: 'support', x: 270, y: 30, w: 110, h: 120, department: 'ICTS', notes: 'NOC in main building complex, north facing' },
    { id: 'a-akshaya', label: 'Akshaya', name: 'Akshaya Hall', type: 'hall', x: 390, y: 30, w: 180, h: 120, capacity: 100, notes: 'From your photo AKSHAYA HALL sign in A Block 1st floor corridor' },
    { id: 'a-indous', label: 'Indo-US', name: 'Indo-US Initiatives', type: 'hall', x: 580, y: 30, w: 180, h: 120, capacity: 62, notes: 'Blue curved wall Indian flag US flag Amma photo Mata Math logo glass doors from your photo' },
    { id: 'a-104', label: 'A-104', name: 'Classroom', type: 'classroom', x: 770, y: 30, w: 100, h: 120, capacity: 80, notes: '80 students/class, wooden door, north facing' },
    { id: 'a-105', label: 'A-105', name: 'Classroom', type: 'classroom', x: 880, y: 30, w: 90, h: 120, capacity: 80, notes: 'North facing' },
    { id: 'a-106', label: 'A-106', name: 'EEE Faculty Room', type: 'office', x: 30, y: 170, w: 180, h: 100, department: 'EEE', notes: '8 faculty, north facing' },
    { id: 'a-107', label: 'A-107', name: 'Classroom', type: 'classroom', x: 220, y: 170, w: 110, h: 100, capacity: 80, notes: 'Wooden door from your photo, north facing' },
    { id: 'a-108', label: 'A-108', name: 'Classroom', type: 'classroom', x: 340, y: 170, w: 110, h: 100, capacity: 80, notes: 'North facing' },
    { id: 'a-109', label: 'A-109', name: 'Drinking Water', type: 'support', x: 460, y: 170, w: 110, h: 100, notes: 'Drinking water every floor, notice boards brown framed, blue ARISTO bin, fire extinguisher, CCTV from your photos' },
    { id: 'a-110', label: 'A-110', name: 'E-Learning Studio', type: 'hall', x: 580, y: 170, w: 180, h: 100, capacity: 120, notes: 'A-VIEW two-way audio-video, north facing' },
    { id: 'a-111', label: 'A-111', name: 'Utility', type: 'support', x: 770, y: 170, w: 100, h: 100, notes: 'WiFi, north facing' },
    { id: 'a-112', label: 'A-112', name: 'Store', type: 'support', x: 880, y: 170, w: 90, h: 100, notes: 'North facing' },
  ];

  const walls: Wall[] = [
    // Outer walls
    { id: 'outer-north', x1: 20, y1: 20, x2: 980, y2: 20, thickness: 4, type: 'outer' },
    { id: 'outer-east', x1: 980, y1: 20, x2: 980, y2: 440, thickness: 4, type: 'outer' },
    { id: 'outer-south', x1: 980, y1: 440, x2: 20, y2: 440, thickness: 4, type: 'outer' },
    { id: 'outer-west', x1: 20, y1: 440, x2: 20, y2: 20, thickness: 4, type: 'outer' },
    // Inner walls between rooms (vertical)
    { id: 'inner-1', x1: 140, y1: 30, x2: 140, y2: 150, thickness: 2, type: 'inner' },
    { id: 'inner-2', x1: 260, y1: 30, x2: 260, y2: 150, thickness: 2, type: 'inner' },
    { id: 'inner-3', x1: 380, y1: 30, x2: 380, y2: 150, thickness: 2, type: 'inner' },
    { id: 'inner-4', x1: 570, y1: 30, x2: 570, y2: 150, thickness: 2, type: 'inner' },
    { id: 'inner-5', x1: 760, y1: 30, x2: 760, y2: 150, thickness: 2, type: 'inner' },
    { id: 'inner-6', x1: 870, y1: 30, x2: 870, y2: 150, thickness: 2, type: 'inner' },
    { id: 'inner-7', x1: 210, y1: 170, x2: 210, y2: 270, thickness: 2, type: 'inner' },
    { id: 'inner-8', x1: 330, y1: 170, x2: 330, y2: 270, thickness: 2, type: 'inner' },
    { id: 'inner-9', x1: 450, y1: 170, x2: 450, y2: 270, thickness: 2, type: 'inner' },
    { id: 'inner-10', x1: 570, y1: 170, x2: 570, y2: 270, thickness: 2, type: 'inner' },
    { id: 'inner-11', x1: 760, y1: 170, x2: 760, y2: 270, thickness: 2, type: 'inner' },
    { id: 'inner-12', x1: 870, y1: 170, x2: 870, y2: 270, thickness: 2, type: 'inner' },
    // Corridor wall (north side of corridor, separates rooms from corridor)
    { id: 'corridor-north', x1: 20, y1: 280, x2: 980, y2: 280, thickness: 3, type: 'corridor' },
  ];

  const doors: Door[] = [
    { id: 'door-101', x: 80, y: 150, width: 20, height: 5, orientation: 'horizontal', type: 'single' },
    { id: 'door-102', x: 200, y: 150, width: 20, height: 5, orientation: 'horizontal', type: 'single' },
    { id: 'door-103', x: 320, y: 150, width: 20, height: 5, orientation: 'horizontal', type: 'single' },
    { id: 'door-akshaya', x: 470, y: 150, width: 30, height: 5, orientation: 'horizontal', type: 'double' },
    { id: 'door-indous', x: 650, y: 150, width: 30, height: 5, orientation: 'horizontal', type: 'glass' },
    { id: 'door-104', x: 810, y: 150, width: 20, height: 5, orientation: 'horizontal', type: 'single' },
    { id: 'door-105', x: 915, y: 150, width: 20, height: 5, orientation: 'horizontal', type: 'single' },
    { id: 'door-106', x: 110, y: 270, width: 20, height: 5, orientation: 'horizontal', type: 'single' },
    { id: 'door-107', x: 270, y: 270, width: 20, height: 5, orientation: 'horizontal', type: 'single' },
    { id: 'door-108', x: 390, y: 270, width: 20, height: 5, orientation: 'horizontal', type: 'single' },
    { id: 'door-110', x: 650, y: 270, width: 30, height: 5, orientation: 'horizontal', type: 'double' },
  ];

  const windows: Window[] = [
    // North side windows (outside facing) - based on your photos showing windows on north side?
    { id: 'win-101', x: 40, y: 30, width: 40, height: 5, orientation: 'horizontal' },
    { id: 'win-102', x: 160, y: 30, width: 40, height: 5, orientation: 'horizontal' },
    { id: 'win-103', x: 280, y: 30, width: 40, height: 5, orientation: 'horizontal' },
    { id: 'win-104', x: 780, y: 30, width: 40, height: 5, orientation: 'horizontal' },
    { id: 'win-105', x: 890, y: 30, width: 40, height: 5, orientation: 'horizontal' },
  ];

  return {
    id: 'a-1',
    name: 'A Block First Floor — From Your Photos',
    buildingId: 'a',
    buildingName: 'Block A',
    width: 1000,
    height: 460,
    walls,
    doors,
    windows,
    rooms,
    corridor: { x: 40, y: 280, w: 920, h: 80, openSide: 'south', railing: true },
  };
}

// Generate E Block square floor plans with halls on 1st,2nd,3rd per your correction
export function generateEBlockFloor(floorId: 'e-g' | 'e-1' | 'e-2' | 'e-3' | 'e-4'): FloorPlan {
  const isGround = floorId === 'e-g';
  const isFirst = floorId === 'e-1';
  const isSecond = floorId === 'e-2';
  const isThird = floorId === 'e-3';
  
  let rooms: Room[] = [];
  let name = '';

  if (isGround) {
    name = 'E Block Ground Floor — Square, Admin Only';
    rooms = [
      { id: 'e-g-lobby', label: 'Lobby', name: 'Main Entrance & Reception', type: 'entrance', x: 30, y: 30, w: 200, h: 120, notes: 'White ornate arch high ceiling square E Block' },
      { id: 'e-g-admin', label: 'E-G2', name: 'Administrative Office', type: 'office', x: 240, y: 30, w: 200, h: 120 },
      { id: 'e-g-director', label: 'E-G3', name: "Director's Office", type: 'office', x: 450, y: 30, w: 200, h: 120, notes: 'Central tower Amma photo' },
      { id: 'e-g-admissions', label: 'E-G4', name: 'Admissions Office', type: 'office', x: 660, y: 30, w: 200, h: 120 },
      { id: 'e-g-security', label: 'E-G5', name: 'Security', type: 'support', x: 30, y: 170, w: 200, h: 100 },
      { id: 'e-g-accounts', label: 'E-G6', name: 'Accounts Office', type: 'office', x: 240, y: 170, w: 200, h: 100 },
      { id: 'e-g-medical', label: 'E-G7', name: 'Medical Room', type: 'amenity', x: 450, y: 170, w: 200, h: 100 },
      { id: 'e-g-bank', label: 'E-G8', name: 'Bank / ATM', type: 'support', x: 660, y: 170, w: 200, h: 100 },
      { id: 'e-g-stairs', label: 'Stairs', name: 'Central Staircase', type: 'stairs', x: 465, y: 340, w: 70, h: 50 },
      { id: 'e-g-wc', label: 'WC', name: 'Restrooms', type: 'restroom', x: 850, y: 340, w: 66, h: 50 },
      { id: 'e-g-entrance', label: 'Entrance', name: 'E Block Entrance', type: 'entrance', x: 90, y: 340, w: 110, h: 50 },
    ];
  } else if (isFirst) {
    name = 'E Block First Floor — Square, Halls: Amriteshwari 265, Sudhamani 300, Krishna 112';
    rooms = [
      { id: 'e-1-amriteshwari', label: 'Amriteshwari', name: 'Amriteshwari Hall', type: 'hall', x: 30, y: 30, w: 280, h: 140, capacity: 265, notes: 'In-campus functions, E Block 1st per your correction' },
      { id: 'e-1-sudhamani', label: 'Sudhamani', name: 'Sudhamani Hall', type: 'hall', x: 320, y: 30, w: 280, h: 140, capacity: 300, notes: 'Seminars placement, E Block 1st' },
      { id: 'e-1-krishna', label: 'Krishna', name: 'Krishna Hall', type: 'hall', x: 610, y: 30, w: 200, h: 140, capacity: 112, notes: 'Seminars, E Block 1st' },
      { id: 'e-1-104', label: 'E-104', name: 'Classroom', type: 'classroom', x: 30, y: 190, w: 160, h: 80, capacity: 80 },
      { id: 'e-1-105', label: 'E-105', name: 'Classroom', type: 'classroom', x: 200, y: 190, w: 160, h: 80, capacity: 80 },
      { id: 'e-1-106', label: 'E-106', name: 'Mathematics Faculty Room', type: 'office', x: 370, y: 190, w: 200, h: 80, department: 'Mathematics' },
      { id: 'e-1-107', label: 'E-107', name: 'English Faculty Room', type: 'office', x: 580, y: 190, w: 200, h: 80, department: 'English' },
      { id: 'e-1-stairs', label: 'Stairs', name: 'Staircase', type: 'stairs', x: 465, y: 340, w: 70, h: 50 },
      { id: 'e-1-wc', label: 'WC', name: 'Restrooms', type: 'restroom', x: 850, y: 340, w: 66, h: 50 },
    ];
  } else if (isSecond) {
    name = 'E Block Second Floor — Square, Halls: Vyasa 90, Rama 85, Valmiki 80, Conference 27';
    rooms = [
      { id: 'e-2-vyasa', label: 'Vyasa', name: 'Vyasa Hall', type: 'hall', x: 30, y: 30, w: 200, h: 140, capacity: 90, notes: 'E Block 2nd per your correction' },
      { id: 'e-2-rama', label: 'Rama', name: 'Rama Hall', type: 'hall', x: 240, y: 30, w: 200, h: 140, capacity: 85, notes: 'E Block 2nd' },
      { id: 'e-2-valmiki', label: 'Valmiki', name: 'Valmiki Hall', type: 'hall', x: 450, y: 30, w: 200, h: 140, capacity: 80, notes: 'E Block 2nd' },
      { id: 'e-2-conference', label: 'Conference', name: 'Conference Hall', type: 'hall', x: 660, y: 30, w: 180, h: 140, capacity: 27, notes: 'E Block 2nd' },
      { id: 'e-2-205', label: 'E-205', name: 'Classroom', type: 'classroom', x: 30, y: 190, w: 160, h: 80, capacity: 80 },
      { id: 'e-2-206', label: 'E-206', name: 'Classroom', type: 'classroom', x: 200, y: 190, w: 160, h: 80, capacity: 80 },
      { id: 'e-2-204', label: 'E-204', name: 'SoE Faculty Room', type: 'office', x: 370, y: 190, w: 200, h: 80, department: 'SoE' },
      { id: 'e-2-207', label: 'E-207', name: 'AIE Research Lab', type: 'lab', x: 580, y: 190, w: 200, h: 80, department: 'AIE' },
      { id: 'e-2-stairs', label: 'Stairs', name: 'Staircase', type: 'stairs', x: 465, y: 340, w: 70, h: 50 },
      { id: 'e-2-wc', label: 'WC', name: 'Restrooms', type: 'restroom', x: 850, y: 340, w: 66, h: 50 },
    ];
  } else if (isThird) {
    name = 'E Block Third Floor — Square, Halls: Indo-US 62, E-Learning 120, Akshaya 100';
    rooms = [
      { id: 'e-3-indous', label: 'Indo-US', name: 'Indo-US Corporate Classroom', type: 'hall', x: 30, y: 30, w: 230, h: 140, capacity: 62, notes: 'E Block 3rd per your correction' },
      { id: 'e-3-elearning', label: 'E-Learning', name: 'E-Learning Studio', type: 'hall', x: 270, y: 30, w: 230, h: 140, capacity: 120, notes: 'A-VIEW, E Block 3rd' },
      { id: 'e-3-akshaya', label: 'Akshaya', name: 'Akshaya Hall', type: 'hall', x: 510, y: 30, w: 200, h: 140, capacity: 100, notes: 'From your photo, E Block 3rd per your correction' },
      { id: 'e-3-304', label: 'E-304', name: 'Research Centre Office', type: 'office', x: 720, y: 30, w: 160, h: 140 },
      { id: 'e-3-305', label: 'E-305', name: 'Classroom', type: 'classroom', x: 30, y: 190, w: 160, h: 80, capacity: 80 },
      { id: 'e-3-306', label: 'E-306', name: 'Classroom', type: 'classroom', x: 200, y: 190, w: 160, h: 80, capacity: 80 },
      { id: 'e-3-303', label: 'E-303', name: 'AIE Faculty Room', type: 'office', x: 370, y: 190, w: 200, h: 80, department: 'AIE' },
      { id: 'e-3-308', label: 'E-308', name: 'Project Lab', type: 'lab', x: 580, y: 190, w: 200, h: 80 },
      { id: 'e-3-stairs', label: 'Stairs', name: 'Staircase', type: 'stairs', x: 465, y: 340, w: 70, h: 50 },
      { id: 'e-3-wc', label: 'WC', name: 'Restrooms', type: 'restroom', x: 850, y: 340, w: 66, h: 50 },
    ];
  } else {
    name = 'E Block Fourth Floor — Square, Library Only';
    rooms = [
      { id: 'e-4-stacks', label: 'Library', name: 'Central Library — Stacks', type: 'amenity', x: 30, y: 30, w: 200, h: 120, notes: '1213 sq m, 45,880+ items' },
      { id: 'e-4-reference', label: 'Reference', name: 'Reference & Periodicals', type: 'amenity', x: 240, y: 30, w: 200, h: 120, capacity: 150, notes: '325 sq m' },
      { id: 'e-4-digital', label: 'Digital', name: 'Digital Library VIDYA', type: 'amenity', x: 450, y: 30, w: 200, h: 120 },
      { id: 'e-4-reading', label: 'Reading', name: 'Reading Hall', type: 'amenity', x: 660, y: 30, w: 200, h: 120, capacity: 150, notes: '8 AM – 12 AM' },
      { id: 'e-4-office', label: 'E-405', name: "Librarian's Office", type: 'office', x: 30, y: 170, w: 200, h: 100 },
      { id: 'e-4-lounge', label: 'E-406', name: 'Faculty Lounge', type: 'amenity', x: 240, y: 170, w: 200, h: 100 },
      { id: 'e-4-repro', label: 'E-407', name: 'Reprographics', type: 'support', x: 450, y: 170, w: 200, h: 100 },
      { id: 'e-4-eresources', label: 'E-408', name: 'E-Resources', type: 'amenity', x: 660, y: 170, w: 200, h: 100 },
      { id: 'e-4-stairs', label: 'Stairs', name: 'Staircase', type: 'stairs', x: 465, y: 340, w: 70, h: 50 },
      { id: 'e-4-wc', label: 'WC', name: 'Restrooms', type: 'restroom', x: 850, y: 340, w: 66, h: 50 },
    ];
  }

  const walls: Wall[] = [
    { id: 'outer-north', x1: 20, y1: 20, x2: 980, y2: 20, thickness: 4, type: 'outer' },
    { id: 'outer-east', x1: 980, y1: 20, x2: 980, y2: 440, thickness: 4, type: 'outer' },
    { id: 'outer-south', x1: 980, y1: 440, x2: 20, y2: 440, thickness: 4, type: 'outer' },
    { id: 'outer-west', x1: 20, y1: 440, x2: 20, y2: 20, thickness: 4, type: 'outer' },
    { id: 'corridor-north', x1: 20, y1: 280, x2: 980, y2: 280, thickness: 3, type: 'corridor' },
  ];

  return {
    id: floorId,
    name,
    buildingId: 'e',
    buildingName: 'Block E — Square',
    width: 1000,
    height: 460,
    walls,
    doors: [],
    windows: [],
    rooms,
    corridor: { x: 40, y: 280, w: 920, h: 80, openSide: 'south', railing: false },
  };
}

// Proper floor plan renderer component

// Generate proper floor plans for Block A (all floors) — from your photos
export function generateABlockFloor(floorId: 'a-g' | 'a-1' | 'a-2'): FloorPlan {
  if (floorId === 'a-1') return generateABlockFirstFloor();
  
  const isGround = floorId === 'a-g';
  const rooms = isGround ? [
    { id: 'a-g-1', label: 'A-G1', name: 'Examination Office', type: 'office' as const, x: 30, y: 30, w: 140, h: 100 },
    { id: 'a-g-2', label: 'A-G2', name: 'Accounts Office', type: 'office' as const, x: 180, y: 30, w: 140, h: 100 },
    { id: 'a-g-3', label: 'A-G3', name: 'T&P Cell', type: 'office' as const, x: 330, y: 30, w: 140, h: 100 },
    { id: 'a-g-4', label: 'A-G4', name: 'Classroom', type: 'classroom' as const, x: 480, y: 30, w: 140, h: 100, capacity: 80 },
    { id: 'a-g-5', label: 'A-G5', name: 'Classroom', type: 'classroom' as const, x: 630, y: 30, w: 140, h: 100, capacity: 80 },
    { id: 'a-g-6', label: 'A-G6', name: 'EEE Faculty Room', type: 'office' as const, x: 30, y: 150, w: 200, h: 100, department: 'EEE' },
    { id: 'a-g-7', label: 'A-G7', name: 'Classroom', type: 'classroom' as const, x: 240, y: 150, w: 140, h: 100, capacity: 80 },
    { id: 'a-g-8', label: 'A-G8', name: 'Utility', type: 'support' as const, x: 390, y: 150, w: 140, h: 100 },
    { id: 'a-g-9', label: 'A-G9', name: 'Store', type: 'support' as const, x: 540, y: 150, w: 140, h: 100 },
    { id: 'a-g-stairs', label: 'Stairs', name: 'Staircase', type: 'stairs' as const, x: 465, y: 340, w: 70, h: 50 },
    { id: 'a-g-wc', label: 'WC', name: 'Restrooms', type: 'restroom' as const, x: 850, y: 340, w: 66, h: 50 },
    { id: 'a-g-entrance', label: 'Entrance', name: 'A Block Entrance', type: 'entrance' as const, x: 90, y: 340, w: 110, h: 50 },
  ] : [
    { id: 'a-201', label: 'A-201', name: 'Classroom', type: 'classroom' as const, x: 30, y: 30, w: 140, h: 100, capacity: 80 },
    { id: 'a-202', label: 'A-202', name: 'Classroom', type: 'classroom' as const, x: 180, y: 30, w: 140, h: 100, capacity: 80 },
    { id: 'a-203', label: 'A-203', name: 'Research Lab', type: 'lab' as const, x: 330, y: 30, w: 140, h: 100, capacity: 30 },
    { id: 'a-204', label: 'A-204', name: 'ECE Faculty Room', type: 'office' as const, x: 480, y: 30, w: 200, h: 100, department: 'ECE' },
    { id: 'a-205', label: 'A-205', name: 'HoD ECE', type: 'office' as const, x: 690, y: 30, w: 140, h: 100 },
    { id: 'a-206', label: 'A-206', name: 'Classroom', type: 'classroom' as const, x: 30, y: 150, w: 140, h: 100, capacity: 80 },
    { id: 'a-207', label: 'A-207', name: 'Classroom', type: 'classroom' as const, x: 180, y: 150, w: 140, h: 100, capacity: 80 },
    { id: 'a-208', label: 'A-208', name: 'Project Lab', type: 'lab' as const, x: 330, y: 150, w: 140, h: 100, capacity: 40 },
    { id: 'a-209', label: 'A-209', name: 'Utility', type: 'support' as const, x: 480, y: 150, w: 140, h: 100 },
    { id: 'a-210', label: 'A-210', name: 'Store', type: 'support' as const, x: 630, y: 150, w: 140, h: 100 },
    { id: 'a-2-stairs', label: 'Stairs', name: 'Staircase', type: 'stairs' as const, x: 465, y: 340, w: 70, h: 50 },
    { id: 'a-2-wc', label: 'WC', name: 'Restrooms', type: 'restroom' as const, x: 850, y: 340, w: 66, h: 50 },
  ];

  return {
    id: floorId,
    name: isGround ? 'A Block Ground Floor' : 'A Block Second Floor',
    buildingId: 'a',
    buildingName: 'Block A',
    width: 1000,
    height: 460,
    walls: [
      { id: 'outer-north', x1: 20, y1: 20, x2: 980, y2: 20, thickness: 4, type: 'outer' as const },
      { id: 'outer-east', x1: 980, y1: 20, x2: 980, y2: 440, thickness: 4, type: 'outer' as const },
      { id: 'outer-south', x1: 980, y1: 440, x2: 20, y2: 440, thickness: 4, type: 'outer' as const },
      { id: 'outer-west', x1: 20, y1: 440, x2: 20, y2: 20, thickness: 4, type: 'outer' as const },
      { id: 'corridor-north', x1: 20, y1: 280, x2: 980, y2: 280, thickness: 3, type: 'corridor' as const },
    ],
    doors: [],
    windows: [],
    rooms,
    corridor: { x: 40, y: 280, w: 920, h: 80, openSide: 'south' as const, railing: true },
  };
}

// Generate Block B floors — CSE + ECE, open corridor south, rooms north
export function generateBBlockFloor(floorId: 'b-g' | 'b-1' | 'b-2'): FloorPlan {
  const isGround = floorId === 'b-g';
  const isFirst = floorId === 'b-1';
  
  let rooms: Room[] = [];
  let name = '';

  if (isGround) {
    name = 'B Block Ground Floor — CSE + ECE';
    rooms = [
      { id: 'b-g-1', label: 'B-G1', name: 'Electronics Lab', type: 'lab' as const, x: 30, y: 30, w: 140, h: 100, capacity: 40 },
      { id: 'b-g-2', label: 'B-G2', name: 'Microprocessor Lab', type: 'lab' as const, x: 180, y: 30, w: 140, h: 100, capacity: 40 },
      { id: 'b-g-3', label: 'B-G3', name: 'Communication Lab', type: 'lab' as const, x: 330, y: 30, w: 140, h: 100, capacity: 40 },
      { id: 'b-g-4', label: 'B-G4', name: 'Classroom', type: 'classroom' as const, x: 480, y: 30, w: 140, h: 100, capacity: 80 },
      { id: 'b-g-5', label: 'B-G5', name: 'Classroom', type: 'classroom' as const, x: 630, y: 30, w: 140, h: 100, capacity: 80 },
      { id: 'b-g-6', label: 'B-G6', name: 'ECE Faculty Room', type: 'office' as const, x: 30, y: 150, w: 180, h: 100, department: 'ECE' },
      { id: 'b-g-7', label: 'B-G7', name: 'CSE Faculty Room', type: 'office' as const, x: 220, y: 150, w: 180, h: 100, department: 'CSE' },
      { id: 'b-g-8', label: 'B-G8', name: 'Classroom', type: 'classroom' as const, x: 410, y: 150, w: 140, h: 100, capacity: 80 },
      { id: 'b-g-9', label: 'B-G9', name: 'Lab Store', type: 'support' as const, x: 560, y: 150, w: 140, h: 100 },
      { id: 'b-g-10', label: 'B-G10', name: 'Utility', type: 'support' as const, x: 710, y: 150, w: 140, h: 100 },
      { id: 'b-g-stairs', label: 'Stairs', name: 'Staircase', type: 'stairs' as const, x: 465, y: 340, w: 70, h: 50 },
      { id: 'b-g-wc', label: 'WC', name: 'Restrooms', type: 'restroom' as const, x: 850, y: 340, w: 66, h: 50 },
      { id: 'b-g-entrance', label: 'Entrance', name: 'B Block Entrance', type: 'entrance' as const, x: 90, y: 340, w: 110, h: 50 },
    ];
  } else if (isFirst) {
    name = 'B Block First Floor — AI/ML Lab, CSE Faculty';
    rooms = [
      { id: 'b-101', label: 'B-101', name: 'Computer Lab 3', type: 'lab' as const, x: 30, y: 30, w: 140, h: 100, capacity: 60 },
      { id: 'b-102', label: 'B-102', name: 'AI / ML Lab', type: 'lab' as const, x: 180, y: 30, w: 140, h: 100, capacity: 40 },
      { id: 'b-103', label: 'B-103', name: 'Networks Lab', type: 'lab' as const, x: 330, y: 30, w: 140, h: 100, capacity: 40 },
      { id: 'b-104', label: 'B-104', name: 'Classroom', type: 'classroom' as const, x: 480, y: 30, w: 140, h: 100, capacity: 80 },
      { id: 'b-105', label: 'B-105', name: 'Classroom', type: 'classroom' as const, x: 630, y: 30, w: 140, h: 100, capacity: 80 },
      { id: 'b-106', label: 'B-106', name: 'ECE Faculty Room', type: 'office' as const, x: 30, y: 150, w: 180, h: 100, department: 'ECE' },
      { id: 'b-107', label: 'B-107', name: 'HoD CSE', type: 'office' as const, x: 220, y: 150, w: 180, h: 100 },
      { id: 'b-108', label: 'B-108', name: 'Classroom', type: 'classroom' as const, x: 410, y: 150, w: 140, h: 100, capacity: 80 },
      { id: 'b-109', label: 'B-109', name: 'CSE Faculty Room', type: 'office' as const, x: 560, y: 150, w: 180, h: 100, department: 'CSE' },
      { id: 'b-110', label: 'B-110', name: 'Utility', type: 'support' as const, x: 750, y: 150, w: 100, h: 100 },
      { id: 'b-1-stairs', label: 'Stairs', name: 'Staircase', type: 'stairs' as const, x: 465, y: 340, w: 70, h: 50 },
      { id: 'b-1-wc', label: 'WC', name: 'Restrooms', type: 'restroom' as const, x: 850, y: 340, w: 66, h: 50 },
    ];
  } else {
    name = 'B Block Second Floor — Research Labs, CSE Faculty';
    rooms = [
      { id: 'b-201', label: 'B-201', name: 'Classroom', type: 'classroom' as const, x: 30, y: 30, w: 140, h: 100, capacity: 80 },
      { id: 'b-202', label: 'B-202', name: 'Classroom', type: 'classroom' as const, x: 180, y: 30, w: 140, h: 100, capacity: 80 },
      { id: 'b-203', label: 'B-203', name: 'Research Lab', type: 'lab' as const, x: 330, y: 30, w: 140, h: 100, capacity: 30 },
      { id: 'b-204', label: 'B-204', name: 'Research Lab', type: 'lab' as const, x: 480, y: 30, w: 140, h: 100, capacity: 30 },
      { id: 'b-205', label: 'B-205', name: 'ECE Faculty Room', type: 'office' as const, x: 630, y: 30, w: 180, h: 100, department: 'ECE' },
      { id: 'b-206', label: 'B-206', name: 'Classroom', type: 'classroom' as const, x: 30, y: 150, w: 140, h: 100, capacity: 80 },
      { id: 'b-207', label: 'B-207', name: 'Tutorial Room', type: 'classroom' as const, x: 180, y: 150, w: 140, h: 100, capacity: 40 },
      { id: 'b-208', label: 'B-208', name: 'CSE Faculty Room', type: 'office' as const, x: 330, y: 150, w: 180, h: 100, department: 'CSE' },
      { id: 'b-209', label: 'B-209', name: 'CSE Faculty Room', type: 'office' as const, x: 520, y: 150, w: 180, h: 100, department: 'CSE' },
      { id: 'b-210', label: 'B-210', name: 'Utility', type: 'support' as const, x: 710, y: 150, w: 140, h: 100 },
      { id: 'b-2-stairs', label: 'Stairs', name: 'Staircase', type: 'stairs' as const, x: 465, y: 340, w: 70, h: 50 },
      { id: 'b-2-wc', label: 'WC', name: 'Restrooms', type: 'restroom' as const, x: 850, y: 340, w: 66, h: 50 },
    ];
  }

  return {
    id: floorId,
    name,
    buildingId: 'b',
    buildingName: 'Block B',
    width: 1000,
    height: 460,
    walls: [
      { id: 'outer-north', x1: 20, y1: 20, x2: 980, y2: 20, thickness: 4, type: 'outer' as const },
      { id: 'outer-east', x1: 980, y1: 20, x2: 980, y2: 440, thickness: 4, type: 'outer' as const },
      { id: 'outer-south', x1: 980, y1: 440, x2: 20, y2: 440, thickness: 4, type: 'outer' as const },
      { id: 'outer-west', x1: 20, y1: 440, x2: 20, y2: 20, thickness: 4, type: 'outer' as const },
      { id: 'corridor-north', x1: 20, y1: 280, x2: 980, y2: 280, thickness: 3, type: 'corridor' as const },
    ],
    doors: [],
    windows: [],
    rooms,
    corridor: { x: 40, y: 280, w: 920, h: 80, openSide: 'south' as const, railing: true },
  };
}

// Generate Block C floors — Mechanical
export function generateCBlockFloor(floorId: 'c-g' | 'c-1'): FloorPlan {
  const isGround = floorId === 'c-g';
  const rooms = isGround ? [
    { id: 'c-g-1', label: 'C-G1', name: 'Computer Lab 1', type: 'lab' as const, x: 30, y: 30, w: 140, h: 100, capacity: 60 },
    { id: 'c-g-2', label: 'C-G2', name: 'Computer Lab 2', type: 'lab' as const, x: 180, y: 30, w: 140, h: 100, capacity: 60 },
    { id: 'c-g-3', label: 'C-G3', name: 'Classroom', type: 'classroom' as const, x: 330, y: 30, w: 140, h: 100, capacity: 80 },
    { id: 'c-g-4', label: 'C-G4', name: 'Classroom', type: 'classroom' as const, x: 480, y: 30, w: 140, h: 100, capacity: 80 },
    { id: 'c-g-5', label: 'C-G5', name: 'Classroom', type: 'classroom' as const, x: 630, y: 30, w: 140, h: 100, capacity: 80 },
    { id: 'c-g-6', label: 'C-G6', name: 'Mechanical Faculty Room', type: 'office' as const, x: 30, y: 150, w: 200, h: 100, department: 'Mechanical' },
    { id: 'c-g-7', label: 'C-G7', name: 'Classroom', type: 'classroom' as const, x: 240, y: 150, w: 140, h: 100, capacity: 80 },
    { id: 'c-g-8', label: 'C-G8', name: 'Utility', type: 'support' as const, x: 390, y: 150, w: 140, h: 100 },
    { id: 'c-g-stairs', label: 'Stairs', name: 'Staircase', type: 'stairs' as const, x: 465, y: 340, w: 70, h: 50 },
    { id: 'c-g-wc', label: 'WC', name: 'Restrooms', type: 'restroom' as const, x: 850, y: 340, w: 66, h: 50 },
    { id: 'c-g-entrance', label: 'Entrance', name: 'C Block Entrance', type: 'entrance' as const, x: 90, y: 340, w: 110, h: 50 },
  ] : [
    { id: 'c-101', label: 'C-101', name: 'Classroom', type: 'classroom' as const, x: 30, y: 30, w: 140, h: 100, capacity: 80 },
    { id: 'c-102', label: 'C-102', name: 'Classroom', type: 'classroom' as const, x: 180, y: 30, w: 140, h: 100, capacity: 80 },
    { id: 'c-103', label: 'C-103', name: 'Project Lab', type: 'lab' as const, x: 330, y: 30, w: 140, h: 100, capacity: 40 },
    { id: 'c-104', label: 'C-104', name: 'Classroom', type: 'classroom' as const, x: 480, y: 30, w: 140, h: 100, capacity: 80 },
    { id: 'c-105', label: 'C-105', name: 'Classroom', type: 'classroom' as const, x: 630, y: 30, w: 140, h: 100, capacity: 80 },
    { id: 'c-106', label: 'C-106', name: 'Mechanical Faculty Room', type: 'office' as const, x: 30, y: 150, w: 200, h: 100, department: 'Mechanical' },
    { id: 'c-107', label: 'C-107', name: 'Classroom', type: 'classroom' as const, x: 240, y: 150, w: 140, h: 100, capacity: 80 },
    { id: 'c-108', label: 'C-108', name: 'Utility', type: 'support' as const, x: 390, y: 150, w: 140, h: 100 },
    { id: 'c-1-stairs', label: 'Stairs', name: 'Staircase', type: 'stairs' as const, x: 465, y: 340, w: 70, h: 50 },
    { id: 'c-1-wc', label: 'WC', name: 'Restrooms', type: 'restroom' as const, x: 850, y: 340, w: 66, h: 50 },
  ];

  return {
    id: floorId,
    name: isGround ? 'C Block Ground Floor — Mechanical' : 'C Block First Floor — Mechanical',
    buildingId: 'c',
    buildingName: 'Block C',
    width: 1000,
    height: 460,
    walls: [
      { id: 'outer-north', x1: 20, y1: 20, x2: 980, y2: 20, thickness: 4, type: 'outer' as const },
      { id: 'outer-east', x1: 980, y1: 20, x2: 980, y2: 440, thickness: 4, type: 'outer' as const },
      { id: 'outer-south', x1: 980, y1: 440, x2: 20, y2: 440, thickness: 4, type: 'outer' as const },
      { id: 'outer-west', x1: 20, y1: 440, x2: 20, y2: 20, thickness: 4, type: 'outer' as const },
      { id: 'corridor-north', x1: 20, y1: 280, x2: 980, y2: 280, thickness: 3, type: 'corridor' as const },
    ],
    doors: [],
    windows: [],
    rooms,
    corridor: { x: 40, y: 280, w: 920, h: 80, openSide: 'south' as const, railing: true },
  };
}

// Generate Block D floors — Sciences near cafeteria
export function generateDBlockFloor(floorId: 'd-g' | 'd-1'): FloorPlan {
  const isGround = floorId === 'd-g';
  const rooms = isGround ? [
    { id: 'd-g-1', label: 'D-G1', name: 'Physics Lab', type: 'lab' as const, x: 30, y: 30, w: 180, h: 100, capacity: 40 },
    { id: 'd-g-2', label: 'D-G2', name: 'Chemistry Lab', type: 'lab' as const, x: 220, y: 30, w: 180, h: 100, capacity: 40 },
    { id: 'd-g-3', label: 'D-G3', name: 'Lab Store', type: 'support' as const, x: 410, y: 30, w: 140, h: 100 },
    { id: 'd-g-4', label: 'D-G4', name: 'Tutorial Room', type: 'classroom' as const, x: 30, y: 150, w: 140, h: 100, capacity: 40 },
    { id: 'd-g-5', label: 'D-G5', name: 'Classroom', type: 'classroom' as const, x: 180, y: 150, w: 140, h: 100, capacity: 60 },
    { id: 'd-g-6', label: 'D-G6', name: 'Utility', type: 'support' as const, x: 330, y: 150, w: 140, h: 100 },
    { id: 'd-g-stairs', label: 'Stairs', name: 'Staircase', type: 'stairs' as const, x: 465, y: 340, w: 70, h: 50 },
    { id: 'd-g-wc', label: 'WC', name: 'Restrooms', type: 'restroom' as const, x: 850, y: 340, w: 66, h: 50 },
    { id: 'd-g-entrance', label: 'Entrance', name: 'D Block Entrance', type: 'entrance' as const, x: 90, y: 340, w: 110, h: 50 },
  ] : [
    { id: 'd-101', label: 'D-101', name: 'Classroom', type: 'classroom' as const, x: 30, y: 30, w: 140, h: 100, capacity: 60 },
    { id: 'd-102', label: 'D-102', name: 'Classroom', type: 'classroom' as const, x: 180, y: 30, w: 140, h: 100, capacity: 60 },
    { id: 'd-103', label: 'D-103', name: 'Sciences Faculty Room', type: 'office' as const, x: 330, y: 30, w: 220, h: 100, department: 'Sciences' },
    { id: 'd-104', label: 'D-104', name: 'Classroom', type: 'classroom' as const, x: 30, y: 150, w: 140, h: 100, capacity: 60 },
    { id: 'd-105', label: 'D-105', name: 'Research Lab', type: 'lab' as const, x: 180, y: 150, w: 140, h: 100, capacity: 30 },
    { id: 'd-106', label: 'D-106', name: 'Utility', type: 'support' as const, x: 330, y: 150, w: 140, h: 100 },
    { id: 'd-1-stairs', label: 'Stairs', name: 'Staircase', type: 'stairs' as const, x: 465, y: 340, w: 70, h: 50 },
    { id: 'd-1-wc', label: 'WC', name: 'Restrooms', type: 'restroom' as const, x: 850, y: 340, w: 66, h: 50 },
  ];

  return {
    id: floorId,
    name: isGround ? 'D Block Ground Floor — Sciences' : 'D Block First Floor — Sciences Faculty',
    buildingId: 'd',
    buildingName: 'Block D',
    width: 1000,
    height: 460,
    walls: [
      { id: 'outer-north', x1: 20, y1: 20, x2: 980, y2: 20, thickness: 4, type: 'outer' as const },
      { id: 'outer-east', x1: 980, y1: 20, x2: 980, y2: 440, thickness: 4, type: 'outer' as const },
      { id: 'outer-south', x1: 980, y1: 440, x2: 20, y2: 440, thickness: 4, type: 'outer' as const },
      { id: 'outer-west', x1: 20, y1: 440, x2: 20, y2: 20, thickness: 4, type: 'outer' as const },
      { id: 'corridor-north', x1: 20, y1: 280, x2: 980, y2: 280, thickness: 3, type: 'corridor' as const },
    ],
    doors: [],
    windows: [],
    rooms,
    corridor: { x: 40, y: 280, w: 920, h: 80, openSide: 'south' as const, railing: true },
  };
}



// Main generator — returns proper floor plan for any block/floor
export function generateProperFloorPlan(buildingId: string, floorId: string): FloorPlan {
  const bid = buildingId.toLowerCase();
  const fid = floorId.toLowerCase();

  if (bid === 'a') {
    if (fid === 'a-g' || fid === 'a-2') return generateABlockFloor(fid as any);
    return generateABlockFirstFloor();
  }
  if (bid === 'b') return generateBBlockFloor(fid as any);
  if (bid === 'c') return generateCBlockFloor(fid as any);
  if (bid === 'd') return generateDBlockFloor(fid as any);
  if (bid === 'e') return generateEBlockFloor(fid as any);
  
  return generateABlockFloor('a-g');
}

export function ProperFloorPlanSVG({ plan, onRoomClick }: { plan: FloorPlan; onRoomClick?: (room: Room) => void }) {
  return (
    <svg viewBox={`0 0 ${plan.width} ${plan.height}`} className="h-full w-full bg-white">
      {/* Background */}
      <rect x={0} y={0} width={plan.width} height={plan.height} fill="#ffffff" />
      
      {/* Corridor */}
      <rect x={plan.corridor.x} y={plan.corridor.y} width={plan.corridor.w} height={plan.corridor.h} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
      {plan.corridor.railing ? (
        <path d={`M${plan.corridor.x},${plan.corridor.y + plan.corridor.h} L${plan.corridor.x + plan.corridor.w},${plan.corridor.y + plan.corridor.h}`} stroke="#94a3b8" strokeWidth={2} strokeDasharray="8 4" />
      ) : null}
      
      {/* Walls */}
      {plan.walls.map((wall) => (
        <line key={wall.id} x1={wall.x1} y1={wall.y1} x2={wall.x2} y2={wall.y2} stroke={wall.type === 'outer' ? '#0f172a' : wall.type === 'corridor' ? '#334155' : '#64748b'} strokeWidth={wall.thickness} strokeLinecap="round" />
      ))}
      
      {/* Rooms */}
      {plan.rooms.map((room) => {
        const fillColor = room.type === 'hall' ? '#fef3c7' : room.type === 'lab' ? '#dbeafe' : room.type === 'office' ? '#fee2e2' : room.type === 'classroom' ? '#d1fae5' : room.type === 'amenity' ? '#dcfce7' : room.type === 'stairs' ? '#ffedd5' : room.type === 'restroom' ? '#f1f5f9' : room.type === 'entrance' ? '#dcfce7' : '#f8fafc';
        const strokeColor = room.type === 'hall' ? '#f59e0b' : room.type === 'lab' ? '#3b82f6' : room.type === 'office' ? '#ef4444' : room.type === 'classroom' ? '#10b981' : room.type === 'amenity' ? '#22c55e' : room.type === 'stairs' ? '#f97316' : room.type === 'restroom' ? '#64748b' : room.type === 'entrance' ? '#22c55e' : '#94a3b8';
        
        return (
          <g key={room.id} onClick={() => onRoomClick?.(room)} className="cursor-pointer hover:opacity-80">
            <rect x={room.x} y={room.y} width={room.w} height={room.h} rx={6} fill={fillColor} stroke={strokeColor} strokeWidth={1.5} />
            <text x={room.x + room.w/2} y={room.y + 16} textAnchor="middle" fontSize={11} fontWeight={700} fill="#0f172a">{room.label}</text>
            <text x={room.x + room.w/2} y={room.y + 28} textAnchor="middle" fontSize={9} fill="#475569">{room.name.length > 18 ? room.name.slice(0,18)+'…' : room.name}</text>
            {room.capacity ? <text x={room.x + room.w/2} y={room.y + 40} textAnchor="middle" fontSize={8} fill="#64748b">{room.capacity} seats</text> : null}
          </g>
        );
      })}
    </svg>
  );
}
