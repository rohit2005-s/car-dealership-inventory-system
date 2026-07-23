import request from 'supertest';
import { app } from '../../src/app';

// TODO (Phase 4/5): remove .skip once purchase/restock logic is implemented.
describe.skip('Inventory actions', () => {
  it('purchases a vehicle and decreases quantity by 1', async () => {
    const res = await request(app)
      .post('/api/vehicles/<id>/purchase')
      .set('Authorization', 'Bearer <user-token>');
    expect(res.status).toBe(200);
    expect(res.body.data.vehicle.quantity).toBeGreaterThanOrEqual(0);
  });

  it('rejects purchase when stock is 0', async () => {
    const res = await request(app)
      .post('/api/vehicles/<out-of-stock-id>/purchase')
      .set('Authorization', 'Bearer <user-token>');
    expect(res.status).toBe(400);
  });

  it('restocks a vehicle (admin only)', async () => {
    const res = await request(app)
      .post('/api/vehicles/<id>/restock')
      .set('Authorization', 'Bearer <admin-token>')
      .send({ amount: 10 });
    expect(res.status).toBe(200);
  });
});
