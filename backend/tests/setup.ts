// Global test setup. In Phase 5 this will handle:
// - connecting Prisma to a dedicated test database
// - truncating tables between test suites
// - disconnecting after all tests complete
// Kept minimal for now so `npm test` runs cleanly from Phase 1 onward.

beforeAll(() => {
  process.env.NODE_ENV = 'test';
});
