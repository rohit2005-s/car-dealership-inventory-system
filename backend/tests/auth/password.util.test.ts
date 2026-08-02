import { hashPassword, comparePassword } from '../../src/utils/password';

describe('password utility (bcrypt)', () => {
  it('hashes a password to a different string than the original', async () => {
    const hash = await hashPassword('mySecret123');
    expect(hash).not.toBe('mySecret123');
    expect(hash.length).toBeGreaterThan(20);
  });

  it('produces a different hash each time (salted)', async () => {
    const hash1 = await hashPassword('mySecret123');
    const hash2 = await hashPassword('mySecret123');
    expect(hash1).not.toBe(hash2);
  });

  it('comparePassword returns true for the correct password', async () => {
    const hash = await hashPassword('mySecret123');
    await expect(comparePassword('mySecret123', hash)).resolves.toBe(true);
  });

  it('comparePassword returns false for the wrong password', async () => {
    const hash = await hashPassword('mySecret123');
    await expect(comparePassword('wrongPassword', hash)).resolves.toBe(false);
  });
});
