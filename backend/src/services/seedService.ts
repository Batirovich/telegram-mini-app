import { Product } from '../db/models/Product'

const SEED_PRODUCTS = [
  // Power Tools
  { name: 'DeWalt 20V Drill/Driver Kit', brand: 'DeWalt', description: 'Compact and lightweight design fits into tight areas. 2-speed transmission delivers up to 300/1,000 RPM. Includes 2 batteries.', price: 89.99, category: 'Power Tools', emoji: '🔧', bg: '#f59e0b22', color: '#f59e0b' },
  { name: 'Milwaukee M18 Angle Grinder', brand: 'Milwaukee', description: 'POWERSTATE brushless motor delivers up to 9,000 RPM. Paddle switch for immediate shutoff. Compatible with all M18 batteries.', price: 129.00, category: 'Power Tools', emoji: '⚙️', bg: '#ef444422', color: '#ef4444' },
  { name: 'DeWalt Circular Saw 7-1/4"', brand: 'DeWalt', description: '5,200 RPM motor for fast, efficient cutting. 50° bevel capacity with detents at 45° and 22.5°. Lightweight at only 8.8 lbs.', price: 149.99, category: 'Power Tools', emoji: '🪚', bg: '#f59e0b22', color: '#f59e0b' },
  { name: 'Milwaukee M18 Jigsaw', brand: 'Milwaukee', description: 'Variable speed trigger 0–3,500 SPM. POWERSTATE brushless motor. Tool-free blade change system.', price: 119.00, category: 'Power Tools', emoji: '🪛', bg: '#ef444422', color: '#ef4444' },
  { name: 'DeWalt Impact Driver 20V', brand: 'DeWalt', description: '1,825 in-lbs of max torque. 3-speed settings. LED lights illuminate the work surface.', price: 99.99, category: 'Power Tools', emoji: '⚡', bg: '#f59e0b22', color: '#f59e0b' },
  { name: 'Milwaukee M18 Hammer Drill', brand: 'Milwaukee', description: '1,200 in-lbs of peak torque. 2-speed gearbox. All-metal chuck for maximum bit retention.', price: 139.00, category: 'Power Tools', emoji: '🔨', bg: '#ef444422', color: '#ef4444' },
  { name: 'Bosch GSB 18V Combi Drill', brand: 'Bosch', description: 'Electronic motor protection. 2-speed gearbox for drilling, screwdriving and hammer drilling.', price: 109.99, category: 'Power Tools', emoji: '🔩', bg: '#2563eb22', color: '#2563eb' },
  { name: 'Makita DGA452Z Grinder', brand: 'Makita', description: '11,000 RPM, labyrinth construction seals motor and bearings. Tool-less wheel guard.', price: 89.00, category: 'Power Tools', emoji: '⚙️', bg: '#16a34a22', color: '#16a34a' },

  // Hand Tools
  { name: 'DeWalt 20pc Mechanic Set', brand: 'DeWalt', description: 'Ratchet, extensions, and sockets in metric and SAE sizes. Stored in a blow-mold case.', price: 79.99, category: 'Hand Tools', emoji: '🧰', bg: '#f59e0b22', color: '#f59e0b' },
  { name: 'Milwaukee Pliers Set 4pc', brand: 'Milwaukee', description: 'Forged from high-strength steel. Comfort grip handles. Includes slip joint, long nose, diagonal, and locking pliers.', price: 44.99, category: 'Hand Tools', emoji: '🔀', bg: '#ef444422', color: '#ef4444' },
  { name: 'Stanley 20oz Rip Hammer', brand: 'Stanley', description: 'Fiberglass handle absorbs vibration. Anti-vibe technology reduces muscle fatigue.', price: 24.99, category: 'Hand Tools', emoji: '🔨', bg: '#3b82f622', color: '#3b82f6' },
  { name: 'Milwaukee Screwdriver Set 10pc', brand: 'Milwaukee', description: 'Cushion grip handles. Extended steel shank for increased torque. Tips precision machined.', price: 34.99, category: 'Hand Tools', emoji: '🪛', bg: '#ef444422', color: '#ef4444' },
  { name: 'DeWalt 48" Magnetic Level', brand: 'DeWalt', description: 'Aluminum frame construction. 3 vials: plumb, level, and 45°. Strong magnet holds to metal surfaces.', price: 39.99, category: 'Hand Tools', emoji: '📏', bg: '#f59e0b22', color: '#f59e0b' },
  { name: 'Stanley 25ft FatMax Tape', brand: 'Stanley', description: 'Blade armor coating. 13ft standout. Tru-Zero end hook for accurate inside/outside measurements.', price: 19.99, category: 'Hand Tools', emoji: '📐', bg: '#3b82f622', color: '#3b82f6' },
  { name: 'Irwin Adjustable Wrench Set', brand: 'Irwin', description: 'Set of 3 (6", 8", 10"). Rust-resistant corrosion protection. Wide jaw opening.', price: 29.99, category: 'Hand Tools', emoji: '🔧', bg: '#7c3aed22', color: '#7c3aed' },

  // Safety & PPE
  { name: 'MSA Hard Hat Class E', brand: 'MSA', description: 'High-density polyethylene. Meets ANSI/ISEA Z89.1 Class E standard. 4-point suspension.', price: 22.99, category: 'Safety & PPE', emoji: '⛑️', bg: '#f9731622', color: '#f97316' },
  { name: '3M Safety Goggles Anti-Fog', brand: '3M', description: 'Anti-fog lens coating. Adjustable elastic headband. Indirect ventilation system.', price: 14.99, category: 'Safety & PPE', emoji: '🥽', bg: '#8b5cf622', color: '#8b5cf6' },
  { name: 'DeWalt Work Gloves L', brand: 'DeWalt', description: 'Synthetic leather palm. Adjustable wrist closure. Machine washable.', price: 12.99, category: 'Safety & PPE', emoji: '🧤', bg: '#f59e0b22', color: '#f59e0b' },
  { name: 'High-Vis Safety Vest XL', brand: 'Generic', description: 'Class 2 ANSI/ISEA compliance. 2 front pockets. Reflective strips front and back.', price: 9.99, category: 'Safety & PPE', emoji: '🦺', bg: '#eab30822', color: '#eab308' },
  { name: 'Timberland Pro Work Boots', brand: 'Timberland', description: 'Steel toe cap. Waterproof leather upper. Anti-fatigue insole technology.', price: 129.00, category: 'Safety & PPE', emoji: '🥾', bg: '#78350f22', color: '#d97706' },
  { name: '3M Peltor Earmuffs NRR 27', brand: '3M', description: 'Adjustable headband. Liquid foam ear cushions. NRR 27dB. Folds flat for storage.', price: 29.99, category: 'Safety & PPE', emoji: '🎧', bg: '#8b5cf622', color: '#8b5cf6' },

  // Fasteners & Hardware
  { name: 'Wood Screws Assortment 500pc', brand: 'Hillman', description: 'Zinc-plated for corrosion resistance. Bugle head, coarse thread. Sizes #6 to #10.', price: 18.99, category: 'Fasteners', emoji: '🔩', bg: '#14b8a622', color: '#14b8a6' },
  { name: 'Concrete Anchors 50pc', brand: 'Tapcon', description: 'Blue climaseal coating. Self-tapping into concrete and masonry. No pre-set anchor required.', price: 24.99, category: 'Fasteners', emoji: '⚓', bg: '#06b6d422', color: '#06b6d4' },
  { name: 'Framing Nails 3-1/2" 5lb', brand: 'Grip-Rite', description: 'Bright, smooth shank. Paper collated strips. For pneumatic framing nailers.', price: 14.99, category: 'Fasteners', emoji: '📌', bg: '#22c55e22', color: '#22c55e' },
  { name: 'Hex Bolt Kit M8 100pc', brand: 'Hillman', description: 'Grade 5 zinc. Includes nuts and washers. Metric M8 x 25mm, 30mm, 40mm, 50mm.', price: 22.99, category: 'Fasteners', emoji: '🔩', bg: '#14b8a622', color: '#14b8a6' },
]

export async function seedProductsIfEmpty() {
  const count = await Product.countDocuments()
  if (count > 0) return
  await Product.insertMany(SEED_PRODUCTS)
  console.log(`Seeded ${SEED_PRODUCTS.length} products`)
}
