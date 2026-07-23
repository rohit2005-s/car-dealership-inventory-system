import request from 'supertest';
import { app } from '../../src/app';

// TODO (Phase 4/5): remove .skip once vehicle.service CRUD is implemented.
describe.skip('Vehicle CRUD', () => {
  it('creates a vehicle (admin only)', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', 'Bearer <admin-token>')
      .send({ make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000, quantity: 5 });
    expect(res.status).toBe(201);
  });

  it('updates a vehicle', async () => {
    const res = await request(app)
      .put('/api/vehicles/<id>')
      .set('Authorization', 'Bearer <admin-token>')
      .send({ price: 21000 });
    expect(res.status).toBe(200);
  });

  it('deletes a vehicle', async () => {
    const res = await request(app)
      .delete('/api/vehicles/<id>')
      .set('Authorization', 'Bearer <admin-token>');
    expect(res.status).toBe(200);
  });

  it('searches vehicles by filters', async () => {
    const res = await request(app).get(
      '/api/vehicles/search?make=Toyota&minPrice=10000&maxPrice=30000'
    );
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
