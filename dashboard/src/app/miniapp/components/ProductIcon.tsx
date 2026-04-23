import {
  Zap, Wrench, HardHat, Package,
  Drill, Hammer, Shield, Layers
} from 'lucide-react'

const ICON_MAP: Record<string, React.ElementType> = {
  'Power Tools':   Drill,
  'Hand Tools':    Wrench,
  'Safety & PPE':  HardHat,
  'Fasteners':     Layers,
}

interface Props {
  category: string
  color: string
  size?: number
}

export default function ProductIcon({ category, color, size = 40 }: Props) {
  const Icon = ICON_MAP[category] ?? Package
  return <Icon size={size} color={color} strokeWidth={1.5} />
}
