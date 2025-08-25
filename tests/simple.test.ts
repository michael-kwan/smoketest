// Simple test to verify Jest setup is working
describe('Test Environment', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have access to environment variables', () => {
    expect(process.env.DATABASE_URL).toBeDefined()
  })
})