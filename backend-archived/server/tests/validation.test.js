/**
 * Validation and error-handling integration tests.
 * Verifies invalid bodies, missing resources, duplicate operations,
 * expected HTTP status codes, field-mapped errors, and rate limiting.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'
import supertest from 'supertest'
import mongoose from 'mongoose'
import app from '../app.js'
import User from '../models/User.js'
import Listing from '../models/Listing.js'

const request = supertest(app)

const buyerBody = {
  name: 'Val Buyer', email: 'val@example.com', password: 'password123', role: 'Buyer',
}

describe('POST /api/auth/signup validation', () => {
  it('rejects missing name with 400 field=name', async () => {
    const res = await request.post('/api/auth/signup').send({
      ...buyerBody, name: '',
    })
    expect(res.status).toBe(400)
    expect(res.body.field).toBe('name')
  })

  it('rejects invalid email with 400 field=email', async () => {
    const res = await request.post('/api/auth/signup').send({
      ...buyerBody, email: 'not-an-email',
    })
    expect(res.status).toBe(400)
    expect(res.body.field).toBe('email')
  })

  it('rejects short password with 400 field=password', async () => {
    const res = await request.post('/api/auth/signup').send({
      ...buyerBody, password: 'short',
    })
    expect(res.status).toBe(400)
    expect(res.body.field).toBe('password')
  })

  it('rejects missing role with 400 field=role', async () => {
    const res = await request.post('/api/auth/signup').send({
      ...buyerBody, role: '',
    })
    expect(res.status).toBe(400)
    expect(res.body.field).toBe('role')
  })

  it('rejects duplicate email with 409 field=email', async () => {
    await request.post('/api/auth/signup').send(buyerBody)
    const res = await request.post('/api/auth/signup').send(buyerBody)
    expect(res.status).toBe(409)
    expect(res.body.field).toBe('email')
  })
})

describe('POST /api/auth/login validation', () => {
  beforeEach(async () => {
    await request.post('/api/auth/signup').send(buyerBody)
  })

  it('rejects missing credentials with 401', async () => {
    const res = await request.post('/api/auth/login').send({})
    expect(res.status).toBe(401)
  })

  it('rejects wrong password with 401', async () => {
    const res = await request.post('/api/auth/login').send({
      email: 'val@example.com', password: 'wrong', role: 'Buyer',
    })
    expect(res.status).toBe(401)
  })
})

describe('POST /api/buyer/requests validation', () => {
  let buyerAgent, listingId

  beforeEach(async () => {
    /* create a real listing via Mongoose so listingId is valid */
    const farmer = await User.create({
      name: 'Req Farmer', email: 'reqfarmer@example.com',
      passwordHash: await bcrypt.hash('password123', 10), role: 'Farmer',
    })
    const listing = await Listing.create({
      farmerId: farmer._id, name: 'Req Maize', category: 'Grains',
      price: 50, unit: 'kg', stock: 100,
    })
    listingId = listing._id

    /* sign up and log in a buyer via the real API */
    buyerAgent = supertest.agent(app)
    await buyerAgent.post('/api/auth/signup').send({
      name: 'Req Buyer', email: 'req@example.com', password: 'password123', role: 'Buyer',
    })
    const login = await buyerAgent.post('/api/auth/login').send({
      email: 'req@example.com', password: 'password123', role: 'Buyer',
    })
    expect(login.status).toBe(200)
  })

  it('rejects missing listingId with 400', async () => {
    const res = await buyerAgent.post('/api/buyer/requests').send({ quantity: 1 })
    expect(res.status).toBe(400)
    expect(res.body.field).toBe('listingId')
  })

  it('rejects invalid listing id format with 400', async () => {
    const res = await buyerAgent.post('/api/buyer/requests').send({
      listingId: 'not-an-id', quantity: 1,
    })
    expect(res.status).toBe(400)
    expect(res.body.field).toBe('listingId')
  })

  it('rejects missing/nonexistent listing with 404', async () => {
    const res = await buyerAgent.post('/api/buyer/requests').send({
      listingId: '000000000000000000000000', quantity: 1,
    })
    expect(res.status).toBe(404)
  })

  it('rejects quantity 0 with 400 field=quantity', async () => {
    const res = await buyerAgent.post('/api/buyer/requests').send({
      listingId, quantity: 0,
    })
    expect(res.status).toBe(400)
    expect(res.body.field).toBe('quantity')
  })

  it('rejects counter-offer below KSh 1 with 400 field=proposedPrice', async () => {
    const res = await buyerAgent.post('/api/buyer/requests').send({
      listingId, quantity: 1, proposedPrice: 0,
    })
    expect(res.status).toBe(400)
    expect(res.body.field).toBe('proposedPrice')
  })

  it('rejects note over 400 chars with 400 field=note', async () => {
    const res = await buyerAgent.post('/api/buyer/requests').send({
      listingId, quantity: 1, note: 'a'.repeat(401),
    })
    expect(res.status).toBe(400)
    expect(res.body.field).toBe('note')
  })
})

describe('DELETE /api/buyer/saved/:id idempotent delete', () => {
  it('unsave a listing not saved → 200 (no-op, not 404)', async () => {
    const agent = supertest.agent(app)
    await agent.post('/api/auth/signup').send({
      name: 'No Name', email: 'n@example.com', password: 'password123', role: 'Buyer',
    })
    const login = await agent.post('/api/auth/login').send({
      email: 'n@example.com', password: 'password123', role: 'Buyer',
    })
    expect(login.status).toBe(200)
    const res = await agent.delete('/api/buyer/saved/000000000000000000000000')
    expect(res.status).toBe(200)
  })
})

describe('rate limiting on auth routes', () => {
  it('returns X-RateLimit headers on signup responses', async () => {
    const res = await request.post('/api/auth/signup').send({})
    expect(res.status).toBe(400)
    expect(res.headers['x-ratelimit-limit']).toBeDefined()
    expect(res.headers['x-ratelimit-remaining']).toBeDefined()
  })

  it('returns 429 with Retry-After when the signup limit is exceeded', async () => {
    let last
    for (let i = 0; i < 11; i++) {
      last = await request.post('/api/auth/signup').send({
        ...buyerBody, email: `ratelimit${i}@example.com`,
      })
    }
    expect(last.status).toBe(429)
    expect(last.body.error).toContain('Too many requests')
    expect(last.headers['retry-after']).toBeDefined()
  })
})
