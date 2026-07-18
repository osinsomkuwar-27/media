import request from 'supertest';
import app from '../src/app.js';
import { connectTestDB, closeTestDB, clearTestDB } from './setup.js';

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Auth', () => {
  const userPayload = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123',
  };

  it('registers a new user with default wallet balance', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(userPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(userPayload.email);
    expect(res.body.data.user.coinBalance).toBe(100);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('rejects duplicate email registration', async () => {
    await request(app).post('/api/v1/auth/register').send(userPayload);
    const res = await request(app).post('/api/v1/auth/register').send(userPayload);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_EMAIL');
  });

  it('logs in with correct credentials', async () => {
    await request(app).post('/api/v1/auth/register').send(userPayload);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: userPayload.email, password: userPayload.password });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('rejects login with wrong password', async () => {
    await request(app).post('/api/v1/auth/register').send(userPayload);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: userPayload.email, password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});