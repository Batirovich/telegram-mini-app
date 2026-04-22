import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'

export interface OrderItem {
  item: string
  quantity: number
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
        item: String(i.item),
        quantity: Number(i.quantity) || 1,
        price: randomPrice()
      }))
  } catch {
    return []
  }
}

const PROMPT = `Extract all order items and quantities from the input.
Return ONLY a JSON array like: [{"item": "Item Name", "quantity": 2}]
If no items are found, return [].`

export async function extractOrderFromText(text: string): Promise<OrderItem[]> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{ role: 'user', content: `${PROMPT}\n\nText: "${text}"` }]
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
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mediaType(absoluteFilePath), data: imageData }
        },
        {
          type: 'text',
          text: `${PROMPT}\n\nAnalyze this image which may contain a handwritten or printed list of items to order.`
        }
      ]
    }]
  })

  const content = response.content[0]
  if (content.type !== 'text') return []
  return parseItems(content.text)
}
