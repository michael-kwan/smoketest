import '@testing-library/jest-dom'

// Add global fetch polyfill for Node.js
import { TextEncoder, TextDecoder } from 'util'

// Setup globals for MSW
global.TextEncoder = TextEncoder as any
global.TextDecoder = TextDecoder as any

// Mock Response and Request for MSW compatibility
global.Response = Response || class MockResponse {}
global.Request = Request || class MockRequest {}

import { setupServer } from 'msw/node'
import { handlers } from './mocks/handlers'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Setup MSW server
export const server = setupServer(...handlers)

// Establish API mocking before all tests
beforeAll(() => {
  server.listen()
})

// Reset any request handlers that we may add during the tests
afterEach(() => {
  server.resetHandlers()
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
})

// Clean up after the tests are finished
afterAll(() => {
  server.close()
})

// Mock environment variables for tests
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/smoketest_test'