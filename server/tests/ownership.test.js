/**
 * Resource ownership integration tests.
 * Verifies that users can only access/modify their own records:
 * farmers only their own listings, buyers only their own saved produce
 * and purchase requests. Cross-owner access returns 404 (never leaks
 * that another record exists).
 *
 * Fixtures are created in beforeEach (after the per-test DB clear) so the
 * authenticated session always references a live user.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import bcrypt from 'bcryptjs'
import supertest from 'supertest'
import mongoose from 'mongoose'
import { connectTestDb, disconnectTestDb, clearTestDb } from '../lib/testDb.js'
import app from '../app.js'
import User from '../models/User.js'
import Listing from '../models/Listing.js'
import PurchaseRequest from '../models/PurchaseRequest.js'

let buyerAgent, otherBuyerAgent, farmerAgent
let listingId

beforeAll(async () => {
  await connectTestDb()
})

afterAll(async () => {
  await disconnectTestDb()
})

afterEach(async () => {
  await clearTestDb()
})

async function loginAs(email, password, role) {
  const agent = supertest.agent(app)
  await agent.post('/api/auth/login').send({ email, password, role })
  return agent
}

async function signupAndLogin(email, password, role, name) {
  await supertest(app).post('/api/auth/signup').send({
    name, email, password, role,
  })
  return loginAs(email, password, role)
}

beforeEach(async () => {
  /* two farmers, two buyers — created via Mongoose (fixtures) */
  const [farmer, otherFarmer, buyer, otherBuyer] = await Promise.all([
    User.create({
      name: 'Owner Farmer', email: 'owner@example.com',
      passwordHash: await bcrypt.hash('password123', 10), role: 'Farmer',
    }),
    User.create({
      name: 'Other Farmer', email: 'other@example.com',
      passwordHash: await bcrypt.hash('password123', 10), role: 'Farmer',
    }),
    User.create({
      name: 'Buyer One', email: 'ownbuy@example.com',
      passwordHash: await bcrypt.hash('password123', 10), role: 'Buyer',
    }),
    User.create({
      name: 'Buyer Two', email: 'otherbuy@example.com',
      passwordHash: await bcrypt.hash('password123', 10), role: 'Buyer',
    }),
  ])

  /* two listings, one per farmer */
  const [listing] = await Promise.all([
    Listing.create({
      farmerId: farmer._id, name: 'Owner Maize', category: 'Grains', price: 50, unit: 'kg', stock: 100,
    }),
    Listing.create({
      farmerId: otherFarmer._id, name: 'Other Maize', category: 'Grains', price: 55, unit: 'kg', stock: 100,
    }),
  ])
  listingId = listing._id

  /* log the buyers and farmer in via the real API so cookies are exercised */
  buyerAgent = await loginAs('ownbuy@example.com', 'password123', 'Buyer')
  otherBuyerAgent = await loginAs('otherbuy@example.com', 'password123', 'Buyer')
  farmerAgent = await loginAs('owner@example.com', 'password123', 'Farmer')
})

describe('listing ownership', () => {
  it('farmer can delete their own listing → 200', async () => {
    const res = await farmerAgent.delete(`/api/farmer/listings/${listingId}`)
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
  })

  it('farmer cannot delete another farmer\'s listing → 404 (no existence leak)', async () => {
    const otherListing = await Listing.create({
      farmerId: new mongoose.Types.ObjectId(), name: 'Ghost', category: 'Grains',
      price: 10, unit: 'kg', stock: 5,
    })
    const res = await farmerAgent.delete(`/api/farmer/listings/${otherListing._id}`)
    expect(res.status).toBe(404)
    expect(res.body.error).toContain('not found')
  })

  it('anonymous cannot delete listings → 401', async () => {
    const res = await supertest(app).delete(`/api/farmer/listings/${listingId}`)
    expect(res.status).toBe(401)
  })
})

describe('purchase request ownership', () => {
  it('buyer can create a request on an active listing → 201', async () => {
    const res = await buyerAgent.post('/api/buyer/requests').send({
      listingId, quantity: 5, proposedPrice: 45, note: 'own request',
    })
    expect(res.status).toBe(201)
    expect(res.body.request.status).toBe('Pending')
    expect(res.body.request.listing.name).toBe('Owner Maize')
  })

  it('buyer can withdraw their own pending request → 200', async () => {
    const res = await buyerAgent.post('/api/buyer/requests').send({
      listingId, quantity: 3, proposedPrice: null, note: 'to withdraw',
    })
    expect(res.status).toBe(201)
    const { id } = res.body.request
    const del = await buyerAgent.delete(`/api/buyer/requests/${id}`)
    expect(del.status).toBe(200)
    expect(del.body.deleted).toBe(true)
  })

  it('buyer cannot withdraw another buyer\'s request → 404', async () => {
    const own = await buyerAgent.post('/api/buyer/requests').send({
      listingId, quantity: 2, proposedPrice: null, note: 'target',
    })
    expect(own.status).toBe(201)
    const res = await otherBuyerAgent.delete(`/api/buyer/requests/${own.body.request.id}`)
    expect(res.status).toBe(404)
  })

  it('cannot withdraw a non-pending request → 409', async () => {
    const created = await PurchaseRequest.create({
      buyerId: (await User.findOne({ email: 'ownbuy@example.com' }))._id,
      listingId, quantity: 1, unit: 'kg', status: 'Accepted',
    })
    const res = await buyerAgent.delete(`/api/buyer/requests/${created._id}`)
    expect(res.status).toBe(409)
  })
})

describe('saved produce ownership', () => {
  it('buyer saves and lists their own bookmarks', async () => {
    await buyerAgent.post(`/api/buyer/saved/${listingId}`)
    await buyerAgent.post(`/api/buyer/saved/${listingId}`) /* dup ok */
    const res = await buyerAgent.get('/api/buyer/saved')
    expect(res.status).toBe(200)
    expect(res.body.saved.length).toBe(1)
    expect(res.body.saved[0].name).toBe('Owner Maize')
  })

  it('buyer cannot see another buyer\'s saved produce', async () => {
    await otherBuyerAgent.post(`/api/buyer/saved/${listingId}`)
    const res = await buyerAgent.get('/api/buyer/saved')
    expect(res.status).toBe(200)
    expect(res.body.saved.some((s) => s.id === listingId.toString())).toBe(false)
  })
})
