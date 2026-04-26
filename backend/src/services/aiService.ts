import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'

export interface OrderItem {
  item: string
  quantity: number
  unit: string
  price: number
}

function randomPrice(): number {
  return Math.round((Math.random() * 95 + 5) * 100) / 100
}

function parseItems(text: string): OrderItem[] {
  const match = text.match(/\[[\s\S]*?\]/)
  if (!match) return []
  try {
    const parsed = JSON.parse(match[0])
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((i: any) => i.item)
      .map((i: any) => ({
        item: String(i.item).trim(),
        quantity: Number(i.quantity) || 1,
        unit: String(i.unit || 'шт'),
        price: randomPrice()
      }))
  } catch {
    return []
  }
}

const PROMPT = `You are an order extraction assistant for a construction tools store.

Extract ALL items from the input. For each item:
1. CLEAN the product name: remove filler words like "нужно", "надо", "купить", "заказать", "прошу", "пожалуйста". Keep only the actual product name and specification.
2. QUANTITY: extract the exact number. If it says "10 тонн" → quantity=10, unit="тонн". If it says "5 штук" → quantity=5, unit="шт". If it says "2 пачки" → quantity=2, unit="пачки". NEVER default to 1 if a number is clearly stated.
3. UNIT: always include the unit (шт, кг, тонн, м, м², рулон, пачка, упаковка, etc.)

Return ONLY a JSON array:
[{"item": "Cleaned Product Name", "quantity": 10, "unit": "тонн"}]

Rules:
- Never add words to the item name that weren't in the original
- Never lose quantity information — if the client wrote a number, use it
- Handle Russian and English text
- If truly no items found, return []`

export async function extractOrderFromText(text: string): Promise<OrderItem[]> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: `${PROMPT}\n\nOrder text:\n"${text}"` }]
  })
  const content = response.content[0]
  if (content.type !== 'text') return []
  return parseItems(content.text)
}

function mediaType(filePath: string): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' {
  const ext = filePath.split('.').pop()?.toLowerCase()
  const map: Record<string, 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg',
    png: 'image/png', gif: 'image/gif', webp: 'image/webp'
  }
  return map[ext || ''] || 'image/jpeg'
}

export async function extractOrderFromImage(absoluteFilePath: string): Promise<OrderItem[]> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const imageData = fs.readFileSync(absoluteFilePath).toString('base64')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mediaType(absoluteFilePath), data: imageData }
        },
        {
          type: 'text',
          text: `${PROMPT}\n\nThis image contains a handwritten or printed order/price list. Read ALL text carefully, extract every item with its exact quantity and unit.`
        }
      ]
    }]
  })

  const content = response.content[0]
  if (content.type !== 'text') return []
  return parseItems(content.text)
}
