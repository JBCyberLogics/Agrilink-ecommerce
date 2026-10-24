/**
 * Authentication API integration tests.
 * Runs against the real Express app (Supertest) against the isolated test DB.
 * Verifies signup, login, session, logout, and the strict role gate.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import supertest from 'supertest'
import app from '../app.js'

const signupBody = {
  name: 'Test Buyer',
  email: 'testbuyer@example.com',
  password: 'password123',
  role: 'Buyer',
}

function creds() {
  return {
    email: 'testbuyer@example.com',
    password: 'password123',
    role: 'Buyer',
  }
}

describe('POST /api/auth/signup', () => {
  it('creates a real user record and returns 201 with the user shape (no password hash)', async () => {
    const agent = supertest.agent(app)
    const res = await agent.post('/api/auth/signup').send(signupBody)
    expect(res.status).toBe(201)
    expect(res.body.user).toMatchObject({
      name: 'Test Buyer',
      email: 'testbuyer@example.com',
      role: 'Buyer',
    })
    expect(res.body.user.passwordHash).toBeUndefined()
    expect(Array.isArray(res.headers['set-cookie'])).toBe(true)
  })

  it('rejects duplicate email with 409 and field=email', async () => {
    const agent = supertest.agent(app)
    await agent.post('/api/auth/signup').send(signupBody)
    const res = await agent.post('/api/auth/signup').send(signupBody)
    expect(res.status).toBe(409)
    expect(res.body.error).toContain('already exists')
    expect(res.body.field).toBe('email')
  })

  it('rejects invalid signup fields with 400 and a field', async () => {
    const res = await supertest(app).post('/api/auth/signup').send({})
    expect(res.status).toBe(400)
    expect(res.body.field).toBeDefined()
    expect(res.body.error).toBeDefined()
  })

  it('rejects an invalid role with 400 field=role', async () => {
    const agent = supertest.agent(app)
    const res = await agent.post('/api/auth/signup').send({ ...signupBody, role: 'Admin' })
    expect(res.status).toBe(400)
    expect(res.body.field).toBe('role')
  })
})

describe('POST /api/auth/login', () => {
  it('authenticates valid credentials and returns the user', async () => {
    const agent = supertest.agent(app)
    await agent.post('/api/auth/signup').send(signupBody)
    const res = await agent.post('/api/auth/login').send(creds())
    expect(res.status).toBe(200)
    expect(res.body.user).toMatchObject({
      name: 'Test Buyer',
      email: 'testbuyer@example.com',
      role: 'Buyer',
    })
  })

  it('rejects invalid credentials with 401 (generic message, no account info)', async () => {
    const agent = supertest.agent(app)
    await agent.post('/api/auth/signup').send(signupBody)
    const res = await agent
      .post('/api/auth/login')
      .send({ ...creds(), password: 'wrongpassword' })
    expect(res.status).toBe(401)
    expect(res.body.error).toContain('Invalid email or password')
    expect(res.body.accountRole).toBeUndefined()
  })

  it('rejects role mismatch with 403 and pre-selects the real role (accountRole)', async () => {
    const agent = supertest.agent(app)
    await agent.post('/api/auth/signup').send(signupBody)
    const res = await agent.post('/api/auth/login').send({ ...creds(), role: 'Farmer' })
    expect(res.status).toBe(403)
    expect(res.body.error).toContain('a Buyer')
    expect(res.body.field).toBe('role')
    expect(res.body.accountRole).toBe('Buyer')
  })
})

describe('GET /api/auth/me', () => {
  it('returns the verified session user for an authenticated request', async () => {
    const agent = supertest.agent(app)
    await agent.post('/api/auth/signup').send(signupBody)
    await agent.post('/api/auth/login').send(creds())
    const res = await agent.get('/api/auth/me')
    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe('testbuyer@example.com')
    expect(res.body.user.role).toBe('Buyer')
  })

  it('returns { user: null } for anonymous visitors (no console-breaking 401)', async () => {
    const res = await supertest(app).get('/api/auth/me')
    expect(res.status).toBe(200)
    expect(res.body.user).toBeNull()
  })
})

describe('POST /api/auth/logout', () => {
  it('clears the session cookie so /api/auth/me returns null', async () => {
    const agent = supertest.agent(app)
    await agent.post('/api/auth/signup').send(signupBody)
    await agent.post('/api/auth/login').send(creds())
    const res = await agent.post('/api/auth/logout')
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    const me = await agent.get('/api/auth/me')
    expect(me.body.user).toBeNull()
  })
})
