import { Router } from 'express'

export const featuredRouter = Router()

const FEATURED = [
  {
    id: 'power-tools',
    category: 'Power Tools',
    emoji: '⚡',
    items: [
      { id: 'dw-drill', name: 'DeWalt 20V Drill/Driver Kit', brand: 'DeWalt', price: 89.99 },
      { id: 'mw-grinder', name: 'Milwaukee M18 Angle Grinder', brand: 'Milwaukee', price: 129.00 },
      { id: 'dw-saw', name: 'DeWalt Circular Saw 7-1/4"', brand: 'DeWalt', price: 149.99 },
      { id: 'mw-jigsaw', name: 'Milwaukee M18 Jigsaw', brand: 'Milwaukee', price: 119.00 },
      { id: 'dw-impact', name: 'DeWalt Impact Driver 20V', brand: 'DeWalt', price: 99.99 },
      { id: 'mw-drill', name: 'Milwaukee M18 Hammer Drill', brand: 'Milwaukee', price: 139.00 },
    ]
  },
  {
    id: 'hand-tools',
    category: 'Hand Tools',
    emoji: '🔧',
    items: [
      { id: 'dw-set', name: 'DeWalt 20pc Mechanic Set', brand: 'DeWalt', price: 79.99 },
      { id: 'mw-pliers', name: 'Milwaukee Pliers Set (4pc)', brand: 'Milwaukee', price: 44.99 },
      { id: 'stanley-hammer', name: 'Stanley 20oz Rip Hammer', brand: 'Stanley', price: 24.99 },
      { id: 'mw-driver', name: 'Milwaukee Screwdriver Set (10pc)', brand: 'Milwaukee', price: 34.99 },
      { id: 'dw-level', name: 'DeWalt 48" Magnetic Level', brand: 'DeWalt', price: 39.99 },
      { id: 'stanley-tape', name: 'Stanley 25ft FatMax Tape', brand: 'Stanley', price: 19.99 },
    ]
  },
  {
    id: 'safety',
    category: 'Safety & PPE',
    emoji: '⛑️',
    items: [
      { id: 'hard-hat', name: 'MSA Hard Hat (Class E)', brand: 'MSA', price: 22.99 },
      { id: 'goggles', name: '3M Safety Goggles Anti-Fog', brand: '3M', price: 14.99 },
      { id: 'gloves', name: 'DeWalt Work Gloves (L)', brand: 'DeWalt', price: 12.99 },
      { id: 'vest', name: 'High-Vis Safety Vest (XL)', brand: 'Generic', price: 9.99 },
      { id: 'boots', name: 'Timberland Pro Work Boots', brand: 'Timberland', price: 129.00 },
      { id: 'earmuffs', name: '3M Peltor Earmuffs NRR 27', brand: '3M', price: 29.99 },
    ]
  },
  {
    id: 'fasteners',
    category: 'Fasteners & Hardware',
    emoji: '🔩',
    items: [
      { id: 'screws-box', name: 'Wood Screws Assortment (500pc)', brand: 'Hillman', price: 18.99 },
      { id: 'anchors', name: 'Concrete Anchors (50pc)', brand: 'Tapcon', price: 24.99 },
      { id: 'nails-lb', name: 'Framing Nails 3-1/2" (5lb)', brand: 'Grip-Rite', price: 14.99 },
      { id: 'bolts', name: 'Hex Bolt Kit M8 (100pc)', brand: 'Hillman', price: 22.99 },
    ]
  }
]

featuredRouter.get('/', (_req, res) => {
  res.json(FEATURED)
})
