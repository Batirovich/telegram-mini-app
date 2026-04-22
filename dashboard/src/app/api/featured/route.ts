import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

const FEATURED = [
  {
    id: 'power-tools',
    category: 'Power Tools',
    emoji: '⚡',
    items: [
      { id: 'dw-drill',   name: 'DeWalt 20V Drill/Driver Kit',    brand: 'DeWalt',    price: 89.99,  emoji: '🔧', bg: '#f59e0b22', color: '#f59e0b' },
      { id: 'mw-grinder', name: 'Milwaukee M18 Angle Grinder',     brand: 'Milwaukee', price: 129.00, emoji: '⚙️', bg: '#ef444422', color: '#ef4444' },
      { id: 'dw-saw',     name: 'DeWalt Circular Saw 7-1/4"',      brand: 'DeWalt',    price: 149.99, emoji: '🪚', bg: '#f59e0b22', color: '#f59e0b' },
      { id: 'mw-jigsaw',  name: 'Milwaukee M18 Jigsaw',            brand: 'Milwaukee', price: 119.00, emoji: '🪛', bg: '#ef444422', color: '#ef4444' },
      { id: 'dw-impact',  name: 'DeWalt Impact Driver 20V',        brand: 'DeWalt',    price: 99.99,  emoji: '⚡', bg: '#f59e0b22', color: '#f59e0b' },
      { id: 'mw-drill',   name: 'Milwaukee M18 Hammer Drill',      brand: 'Milwaukee', price: 139.00, emoji: '🔨', bg: '#ef444422', color: '#ef4444' },
    ]
  },
  {
    id: 'hand-tools',
    category: 'Hand Tools',
    emoji: '🔧',
    items: [
      { id: 'dw-set',       name: 'DeWalt 20pc Mechanic Set',         brand: 'DeWalt',    price: 79.99,  emoji: '🧰', bg: '#f59e0b22', color: '#f59e0b' },
      { id: 'mw-pliers',    name: 'Milwaukee Pliers Set (4pc)',        brand: 'Milwaukee', price: 44.99,  emoji: '🔀', bg: '#ef444422', color: '#ef4444' },
      { id: 'stanley-ham',  name: 'Stanley 20oz Rip Hammer',          brand: 'Stanley',   price: 24.99,  emoji: '🔨', bg: '#3b82f622', color: '#3b82f6' },
      { id: 'mw-driver',    name: 'Milwaukee Screwdriver Set (10pc)',  brand: 'Milwaukee', price: 34.99,  emoji: '🪛', bg: '#ef444422', color: '#ef4444' },
      { id: 'dw-level',     name: 'DeWalt 48" Magnetic Level',        brand: 'DeWalt',    price: 39.99,  emoji: '📏', bg: '#f59e0b22', color: '#f59e0b' },
      { id: 'stanley-tape', name: 'Stanley 25ft FatMax Tape',         brand: 'Stanley',   price: 19.99,  emoji: '📐', bg: '#3b82f622', color: '#3b82f6' },
    ]
  },
  {
    id: 'safety',
    category: 'Safety & PPE',
    emoji: '⛑️',
    items: [
      { id: 'hard-hat',  name: 'MSA Hard Hat (Class E)',         brand: 'MSA',       price: 22.99,  emoji: '⛑️', bg: '#f9731622', color: '#f97316' },
      { id: 'goggles',   name: '3M Safety Goggles Anti-Fog',     brand: '3M',        price: 14.99,  emoji: '🥽', bg: '#8b5cf622', color: '#8b5cf6' },
      { id: 'gloves',    name: 'DeWalt Work Gloves (L)',         brand: 'DeWalt',    price: 12.99,  emoji: '🧤', bg: '#f59e0b22', color: '#f59e0b' },
      { id: 'vest',      name: 'High-Vis Safety Vest (XL)',      brand: 'Generic',   price: 9.99,   emoji: '🦺', bg: '#eab30822', color: '#eab308' },
      { id: 'boots',     name: 'Timberland Pro Work Boots',      brand: 'Timberland',price: 129.00, emoji: '🥾', bg: '#78350f22', color: '#d97706' },
      { id: 'earmuffs',  name: '3M Peltor Earmuffs NRR 27',     brand: '3M',        price: 29.99,  emoji: '🎧', bg: '#8b5cf622', color: '#8b5cf6' },
    ]
  },
  {
    id: 'fasteners',
    category: 'Fasteners',
    emoji: '🔩',
    items: [
      { id: 'screws-box', name: 'Wood Screws Assortment (500pc)', brand: 'Hillman',   price: 18.99,  emoji: '🔩', bg: '#14b8a622', color: '#14b8a6' },
      { id: 'anchors',    name: 'Concrete Anchors (50pc)',         brand: 'Tapcon',    price: 24.99,  emoji: '⚓', bg: '#06b6d422', color: '#06b6d4' },
      { id: 'nails-lb',   name: 'Framing Nails 3-1/2" (5lb)',     brand: 'Grip-Rite', price: 14.99,  emoji: '📌', bg: '#22c55e22', color: '#22c55e' },
      { id: 'bolts',      name: 'Hex Bolt Kit M8 (100pc)',         brand: 'Hillman',   price: 22.99,  emoji: '🔩', bg: '#14b8a622', color: '#14b8a6' },
    ]
  }
]

export function GET() {
  return NextResponse.json(FEATURED)
}
