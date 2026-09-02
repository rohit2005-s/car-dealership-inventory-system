import request from 'supertest';
import express from 'express';
import { getMyPurchases } from '../../src/controllers/purchase.controller';
import { authMiddleware } from '../../src/middlewares/auth.middleware';
import { errorMiddleware } from '../../src/middlewares/error.middleware';
import { signToken } from '../../src/utils/jwt';
import { purchaseService } from '../../src/services/purchase.service';

jest.mock('../../src/services/purchase.service', () => ({
  purchaseService: {
    getUserPurchases: jest.fn(),
  },
}));

const mockedPurchaseService =
  purchaseService as jest.Mocked<typeof purchaseService>;

function buildApp() {
  const app = express();

  app.use(express.json());

  app.get('/api/purchases', authMiddleware, getMyPurchases);

  app.use(errorMiddleware);

  return app;
}

const app = buildApp();

const userToken = signToken({
  userId: 'user-1',
  role: 'user',
});

const adminToken = signToken({
  userId: 'admin-1',
  role: 'admin',
});

const sampleResult = {
  purchases: [
    {
      id: 'p1',
      userId: 'user-1',
      vehicleId: 'v1',
      quantity: 1,
      vehicle: {
        id: 'v1',
        make: 'Toyota',
      },
    },
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
  },
};

describe('GET /api/purchases', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app).get('/api/purchases');

    expect(res.status).toBe(401);
    expect(mockedPurchaseService.getUserPurchases).not.toHaveBeenCalled();
  });

  it('scopes the request to the authenticated user (req.user.userId)', async () => {
    mockedPurchaseService.getUserPurchases.mockResolvedValue(
      sampleResult as any
    );

    await request(app)
      .get('/api/purchases')
      .set('Authorization', `Bearer ${userToken}`);

    expect(mockedPurchaseService.getUserPurchases).toHaveBeenCalledWith(
      'user-1',
      1,
      10
    );
  });

  it('works for admin users too (not admin-only, just authenticated)', async () => {
    mockedPurchaseService.getUserPurchases.mockResolvedValue(
      sampleResult as any
    );

    const res = await request(app)
      .get('/api/purchases')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    expect(mockedPurchaseService.getUserPurchases).toHaveBeenCalledWith(
      'admin-1',
      1,
      10
    );
  });

  it('defaults to page=1, limit=10 when no query params are given', async () => {
    mockedPurchaseService.getUserPurchases.mockResolvedValue(
      sampleResult as any
    );

    await request(app)
      .get('/api/purchases')
      .set('Authorization', `Bearer ${userToken}`);

    expect(mockedPurchaseService.getUserPurchases).toHaveBeenCalledWith(
      'user-1',
      1,
      10
    );
  });

  it('uses page/limit from query params when provided', async () => {
    mockedPurchaseService.getUserPurchases.mockResolvedValue(
      sampleResult as any
    );

    await request(app)
      .get('/api/purchases?page=2&limit=5')
      .set('Authorization', `Bearer ${userToken}`);

    expect(mockedPurchaseService.getUserPurchases).toHaveBeenCalledWith(
      'user-1',
      2,
      5
    );
  });

  it('returns 400 for an invalid page value', async () => {
    const res = await request(app)
      .get('/api/purchases?page=abc')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(400);
    expect(mockedPurchaseService.getUserPurchases).not.toHaveBeenCalled();
  });

  it('returns 200 with purchases and pagination metadata in the response body', async () => {
    mockedPurchaseService.getUserPurchases.mockResolvedValue(
      sampleResult as any
    );

    const res = await request(app)
      .get('/api/purchases')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);

    expect(res.body).toEqual({
      success: true,
      data: sampleResult.purchases,
      pagination: sampleResult.pagination,
    });
  });

  it('returns the related vehicle data nested inside each purchase in the response body', async () => {
    mockedPurchaseService.getUserPurchases.mockResolvedValue(
      sampleResult as any
    );

    const res = await request(app)
      .get('/api/purchases')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.body.data[0].vehicle).toEqual({
      id: 'v1',
      make: 'Toyota',
    });
  });

  it('returns an empty array with zero totals when the user has no purchase history', async () => {
    mockedPurchaseService.getUserPurchases.mockResolvedValue({
      purchases: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    } as any);

    const res = await request(app)
      .get('/api/purchases')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);

    expect(res.body).toEqual({
      success: true,
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    });
  });

  it('a different authenticated user only ever triggers a lookup scoped to their own id', async () => {
    mockedPurchaseService.getUserPurchases.mockResolvedValue(
      sampleResult as any
    );

    const otherUserToken = signToken({
      userId: 'user-2',
      role: 'user',
    });

    await request(app)
      .get('/api/purchases')
      .set('Authorization', `Bearer ${userToken}`);

    expect(
      mockedPurchaseService.getUserPurchases
    ).toHaveBeenLastCalledWith('user-1', 1, 10);

    jest.clearAllMocks();

    mockedPurchaseService.getUserPurchases.mockResolvedValue(
      sampleResult as any
    );

    await request(app)
      .get('/api/purchases')
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(
      mockedPurchaseService.getUserPurchases
    ).toHaveBeenLastCalledWith('user-2', 1, 10);

    expect(
      mockedPurchaseService.getUserPurchases
    ).not.toHaveBeenCalledWith('user-1', 1, 10);
  });
});