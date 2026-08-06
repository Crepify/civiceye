/**
 * OPTIONAL demo dataset generator (no longer used by the app).
 *
 * The app reads ONLY from Supabase now (no dummy data). This script still
 * exists so you can generate a sample `src/data/reports.json` if you ever
 * want a local playground file. Deterministic (seeded).
 *
 * Usage:  node scripts/generate-reports.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'src', 'data', 'reports.json');
const SEED = 20240817;
const COUNT = 100;

/* ------------------------------ RNG ---------------------------------- */
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(SEED);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const int = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const around = (lat, lng, radius) => ({
  lat: lat + (rand() - 0.5) * radius * 2,
  lng: lng + (rand() - 0.5) * radius * 2,
});

/* --------------------------- City hotspots --------------------------- */
const HOTSPOTS = [
  { name: 'Indiranagar', lat: 12.9784, lng: 77.6408, r: 0.02, weight: 12 },
  { name: 'Koramangala', lat: 12.9352, lng: 77.6245, r: 0.02, weight: 13 },
  { name: 'Whitefield', lat: 12.9698, lng: 77.7499, r: 0.025, weight: 8 },
  { name: 'MG Road', lat: 12.9757, lng: 77.604, r: 0.015, weight: 9 },
  { name: 'HSR Layout', lat: 12.9116, lng: 77.6372, r: 0.018, weight: 11 },
  { name: 'Jayanagar', lat: 12.925, lng: 77.5938, r: 0.018, weight: 8 },
  { name: 'Marathahalli', lat: 12.9569, lng: 77.7011, r: 0.02, weight: 8 },
  { name: 'Malleshwaram', lat: 13.0034, lng: 77.5674, r: 0.016, weight: 6 },
  { name: 'Electronic City', lat: 12.8452, lng: 77.6602, r: 0.02, weight: 6 },
  { name: 'BTM Layout', lat: 12.9166, lng: 77.6101, r: 0.016, weight: 8 },
  { name: 'Rajajinagar', lat: 12.9917, lng: 77.5537, r: 0.018, weight: 5 },
  { name: 'Hebbal', lat: 13.0358, lng: 77.597, r: 0.02, weight: 6 },
];

const hotspotPool = HOTSPOTS.flatMap((h) => Array(h.weight).fill(h));

/* --------------------------- Content pools --------------------------- */
const NAMES = [
  'Ananya Rao',
  'Ravi Shankar',
  'Meera Krishnan',
  'Arjun Nair',
  'Sneha Iyer',
  'Karthik Reddy',
  'Divya Menon',
  'Vikram Shetty',
  'Priya Deshpande',
  'Nikhil Gowda',
  'Lakshmi Prasad',
  'Sanjay Patil',
  'Farhan Ali',
  'Pooja Hegde',
  'Aditya Verma',
  'Neha Kulkarni',
  'Imran Qureshi',
  'Shruti Kini',
  'Rahul Bhat',
  'Aisha Banu',
];

const TITLES = {
  pothole: [
    'Deep pothole near {area} junction',
    'Large pothole on {area} main road',
    'Pothole cluster after the rain',
    'Hazardous pothole in the middle lane',
  ],
  'broken-road': [
    'Road surface crumbling on {area} 12th main',
    'Broken stretch of road near {area} park',
    'Eroded road with exposed gravel',
    'Sinking road patch on {area} cross',
  ],
  garbage: [
    'Garbage pile overflowing near {area} market',
    'Waste not collected for a week in {area}',
    'Trash dumped on {area} footpath',
    'Overflowing bin outside {area} school',
  ],
  sidewalk: [
    'Broken sidewalk tiles on {area} street',
    'Uneven footpath near {area} metro',
    'Missing slabs on {area} pavement',
    'Cracked walkway in front of {area} complex',
  ],
  manhole: [
    'Open manhole on {area} main road',
    'Missing manhole cover near {area} bus stop',
    'Exposed drainage hole at {area} corner',
    'Manhole cover dislodged in {area}',
  ],
  'fallen-tree': [
    'Fallen tree blocking {area} road',
    'Tree uprooted near {area} lake',
    'Large branch down on {area} street',
    'Tree leaning dangerously in {area}',
  ],
  'street-light': [
    'Street light out on {area} 5th cross',
    'Dark stretch on {area} — lamp not working',
    'Flickering street light near {area} gate',
    'Broken lamp post in {area}',
  ],
  'water-leakage': [
    'Water gushing from pipe in {area}',
    'Burst water line flooding {area} road',
    'Continuous water leak on {area} street',
    'Waterlogging from leak near {area}',
  ],
  sewage: [
    'Sewage overflow on {area} main road',
    'Drain overflowing in {area}',
    'Raw sewage near {area} bus stand',
    'Blocked drain flooding {area} street',
  ],
  'illegal-dumping': [
    'Construction debris dumped in {area}',
    'Illegal waste dumping on {area} plot',
    'Rubble piled up near {area} temple',
    'Unauthorized dumping at {area} vacant land',
  ],
  'traffic-signal': [
    'Traffic signal dark at {area} junction',
    'Malfunctioning signal on {area} main',
    'Damaged signal box at {area} crossing',
    'Signal stuck on red near {area}',
  ],
  accident: [
    'Minor collision reported at {area} junction',
    'Two-wheeler skid accident near {area}',
    'Multi-vehicle accident on {area} main road',
    'Hit-and-run damage at {area} crossing',
  ],
  other: [
    'Broken bus shelter in {area}',
    'Damaged public bench near {area} park',
    'Defaced signage on {area} street',
    'Broken public tap at {area}',
  ],
};

const DESCRIPTIONS = {
  pothole: [
    'This pothole has been getting deeper every week. Vehicles swerve to avoid it and two-wheelers have almost lost control. It needs urgent attention before the next rain.',
    'The pothole is roughly half a metre wide and fills with water after rain, making it invisible to riders at night. Located right in the middle of the carriageway.',
  ],
  'broken-road': [
    'The surface is breaking into loose gravel. Buses and autos slow to a crawl, and dust is a constant problem for nearby shops and homes.',
    'A long stretch of the road is sinking with visible cracks across both lanes. Patching will not hold — the base needs to be re-laid.',
  ],
  garbage: [
    'The pile is growing daily and attracting strays and rodents. The bin is full and hasn\u2019t been cleared for over a week despite the weekly schedule.',
    'Garbage has spilled across the footpath, forcing pedestrians onto the road. Needs an urgent pick-up and a bigger bin.',
  ],
  sidewalk: [
    'The tiles are cracked and missing in a stretch of about 30 metres. Elderly residents and children struggle to walk here safely.',
    'This footpath is broken right at the crossing and becomes a mud pit in the rain. A few slabs are completely missing.',
  ],
  manhole: [
    'The cover is completely missing, leaving a deep open hole on the road. Extremely dangerous for pedestrians at night — needs an immediate guard or cover.',
    'The manhole cover has dislodged and sits half-open. It snapped a cycle wheel earlier this week.',
  ],
  'fallen-tree': [
    'The tree came down during the storm and is blocking one full lane. The root ball has lifted the pavement. Needs crane removal.',
    'A large tree has fallen across the road. Two-wheelers are squeezing past, but buses cannot pass at all.',
  ],
  'street-light': [
    'The lamp has been out for over two weeks, leaving the entire stretch dark after 7 pm. Residents feel unsafe walking home.',
    'The light flickers on and off and now stays dark. The pole also looks slightly tilted.',
  ],
  'water-leakage': [
    'Clean water has been gushing out of a burst pipe for three days. The road is flooded and precious water is being wasted round the clock.',
    'The leak keeps widening — the flow now covers half the road. BWSSB needs to fix the line before the road surface collapses.',
  ],
  sewage: [
    'The drain is overflowing with sewage onto the road. The smell is unbearable and it is a health hazard for children playing nearby.',
    'Sewage has been pooling here for days. It flows down towards the main road during rain.',
  ],
  'illegal-dumping': [
    'Construction rubble and debris have been dumped on this plot overnight. It is growing and blocking the footpath.',
    'Someone has been dumping waste here for weeks. It is now attracting mosquitoes and stray animals.',
  ],
  'traffic-signal': [
    'The signal is completely dark and traffic is a free-for-all during peak hours. Near misses are a daily occurrence.',
    'The signal is stuck on red for the main road, causing long queues and honking. The control box also looks damaged.',
  ],
  accident: [
    'A collision just occurred at this junction. Two vehicles are damaged and debris is scattered across the lane. Emergency services have been informed.',
    'Vehicles are stopped and traffic is building up after an accident here. Please approach with caution and keep the lane clear for responders.',
  ],
  other: [
    'This public facility is damaged and in need of repair. It has been in this state for a while and affects everyone in the area.',
    'The infrastructure here has deteriorated over time. Residents have reported it multiple times with no response.',
  ],
};

const CATEGORY_POOL = [
  'pothole',
  'pothole',
  'pothole',
  'pothole',
  'broken-road',
  'broken-road',
  'broken-road',
  'garbage',
  'garbage',
  'garbage',
  'garbage',
  'garbage',
  'sidewalk',
  'sidewalk',
  'sidewalk',
  'manhole',
  'manhole',
  'fallen-tree',
  'fallen-tree',
  'street-light',
  'street-light',
  'street-light',
  'water-leakage',
  'water-leakage',
  'sewage',
  'sewage',
  'illegal-dumping',
  'illegal-dumping',
  'traffic-signal',
  'traffic-signal',
  'accident',
  'accident',
  'other',
  'other',
];

const SEVERITIES = ['low', 'low', 'medium', 'medium', 'medium', 'high', 'high', 'critical'];

function makeStatus() {
  const r = rand();
  if (r < 0.38) return { status: 'pending', verified: false };
  if (r < 0.66) return { status: 'verified', verified: true };
  if (r < 0.8) return { status: 'in-progress', verified: true };
  if (r < 0.96) return { status: 'resolved', verified: true };
  return { status: 'rejected', verified: false };
}

const DAY = 1000 * 60 * 60 * 24;
const now = Date.now();

const reports = [];
for (let i = 0; i < COUNT; i++) {
  const hotspot = pick(hotspotPool);
  const { lat, lng } = around(hotspot.lat, hotspot.lng, hotspot.r);
  const category = pick(CATEGORY_POOL);
  const severity = pick(SEVERITIES);
  const { status, verified } = makeStatus();

  const confirms = verified ? int(3, 14) : int(0, 2);
  const rejects = rand() < 0.12 ? int(1, 3) : 0;
  const upvotes = int(verified ? 8 : 1, verified ? 60 : 18);
  const downvotes = rejects ? int(1, 4) : int(0, 2);
  const ageDays = int(0, 90);

  const id = `CE-${1001 + i}`;
  const area = hotspot.name;
  const title = pick(TITLES[category]).replace('{area}', area);
  const description = pick(DESCRIPTIONS[category]);
  const author = pick(NAMES);

  reports.push({
    id,
    title,
    description,
    coordinates: { lat: +lat.toFixed(5), lng: +lng.toFixed(5) },
    locationName: `${area}, Bengaluru`,
    category,
    severity,
    status,
    image: `/reports/${category}.${category === 'traffic-signal' || category === 'accident' || category === 'other' ? 'svg' : 'jpg'}`,
    upvotes,
    downvotes,
    votes: upvotes - downvotes,
    confirms,
    rejects,
    date: new Date(now - ageDays * DAY - int(0, DAY)).toISOString(),
    verified,
    author,
    assignedTo:
      status === 'in-progress'
        ? ['bbmp-42', 'bwssb', 'bescom', 'traffic-police'][int(0, 3)]
        : undefined,
  });
}

/* Keep the output deterministic and tidy */
reports.sort((a, b) => (a.id < b.id ? -1 : 1));

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(reports, null, 2) + '\n');

console.log(`✅ Generated ${reports.length} reports → ${OUT}`);
