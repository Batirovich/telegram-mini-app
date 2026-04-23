import { Router } from 'express'
import { Product } from '../../db/models/Product'

export const productsRouter = Router()

// GET /api/products?category=&search=&limit=&offset=
productsRouter.get('/', async (req, res) => {
  try {
    const { category, search, limit = '50', offset = '0' } = req.query as Record<string, string>

    const query: Record<string, any> = { isActive: true }
    if (category && category !== 'All') query.category = category
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    const [products, total] = await Promise.all([
      Product.find(query).skip(Number(offset)).limit(Number(limit)).sort({ createdAt: -1 }),
      Product.countDocuments(query)
    ])

    res.json({ products, total })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// GET /api/products/categories
productsRouter.get('/categories', async (_req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true })
    res.json(['All', ...categories.sort()])
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// GET /api/products/:id
productsRouter.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ error: 'Not found' })
    res.json(product)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// POST /api/products (admin)
productsRouter.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body)
    res.status(201).json(product)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' })
  }
})

// PATCH /api/products/:id (admin)
productsRouter.patch('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(product)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// DELETE /api/products/:id (admin)
productsRouter.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' })
  }
})
