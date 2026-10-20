/**
 * Role authorization integration tests.
 * Verifies that authentication and role permissions are enforced on the
 * server, independently of frontend navigation: anonymous users get 401,
 * buyers get 403 on farmer-only endpoints, farmers get 403 on buyer-only
 * endpoints, with the documented error codes.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import supertest from 'supertest'
import app from '../app.js'

const buyerCreds = {
  name: 'Buyer One', email: 'buyerauth@example.com', password: 'password123', role: 'Buyer',
}
const farmerCreds = {
  name: 'Farmer One', email: 'farmerauth@example.com', password: 'password123', role: 'Farmer',
}

async function signupBoth() {
  await supertest(app).post('/api/auth/signup').send(buyerCreds)
  await supertest(app).post('/api/auth/signup').send(farmerCreds)
}

describe('anonymous access is rejected', () => {
  beforeEach(async () => {
    await signupBoth()
  })

  it('GET /api/buyer/profile → 401', async () => {
    const res = await supertest(app).get('/api/buyer/profile')
    expect(res.status).toBe(401)
  })

  it('GET /api/buyer/saved → 401', async () => {
    const res = await supertest(app).get('/api/buyer/saved')
    expect(res.status).toBe(401)
  })

  it('GET /api/buyer/requests → 401', async () => {
    const res = await supertest(app).get('/api/buyer/requests')
    expect(res.status).toBe(401)
  })

  it('GET /api/farmer/profile → 401', async () => {
    const res = await supertest(app).get('/api/farmer/profile')
    expect(res.status).toBe(401)
  })

  it('GET /api/farmer/listings → 401', async () => {
    const res = await supertest(app).get('/api/farmer/listings')
    expect(res.status).toBe(401)
  })

  it('POST /api/farmer/listings → 401', async () => {
    const res = await supertest(app).post('/api/farmer/listings').send({ name: 'x' })
    expect(res.status).toBe(401)
  })
})

describe('buyer cannot access farmer-only endpoints', () => {
  const agent = supertest.agent(app)

  beforeEach(async () => {
    await signupBoth()
    await agent.post('/api/auth/login').send(buyerCreds)
  })

  it('GET /api/farmer/profile → 403 FARMER_ONLY', async () => {
    const res = await agent.get('/api/farmer/profile')
    expect(res.status).toBe(403)
    expect(res.body.code).toBe('FARMER_ONLY')
  })

  it('GET /api/farmer/listings → 403 FARMER_ONLY', async () => {
    const res = await agent.get('/api/farmer/listings')
    expect(res.status).toBe(403)
    expect(res.body.code).toBe('FARMER_ONLY')
  })
})

describe('farmer cannot access buyer-only endpoints', () => {
  const agent = supertest.agent(app)

  beforeEach(async () => {
    await signupBoth()
    await agent.post('/api/auth/login').send(farmerCreds)
  })

  it('GET /api/buyer/profile → 403 BUYER_ONLY', async () => {
    const res = await agent.get('/api/buyer/profile')
    expect(res.status).toBe(403)
    expect(res.body.code).toBe('BUYER_ONLY')
  })

  it('GET /api/buyer/saved → 403 BUYER_ONLY', async () => {
    const res = await agent.get('/api/buyer/saved')
    expect(res.status).toBe(403)
    expect(res.body.code).toBe('BUYER_ONLY')
  })

  it('GET /api/buyer/requests → 403 BUYER_ONLY', async () => {
    const res = await agent.get('/api/buyer/requests')
    expect(res.status).toBe(403)
    expect(res.body.code).toBe('BUYER_ONLY')
  })
})
