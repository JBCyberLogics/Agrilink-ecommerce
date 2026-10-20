/**
 * Client test setup — jsdom environment for React component tests.
 */
import { afterAll, beforeAll } from 'vitest'
import { TextEncoder, TextDecoder } from 'node:util'

/* jsdom does not define these globals; React/testing-library need them */
beforeAll(() => {
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
})

afterAll(() => {
  delete global.TextEncoder
  delete global.TextDecoder
})
