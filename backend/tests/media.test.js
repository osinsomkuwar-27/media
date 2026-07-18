import request from 'supertest';
import app from '../src/app.js';
import { connectTestDB, closeTestDB, clearTestDB } from './setup.js';
import { createTestImageBuffer } from './helpers.js';

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

async function registerUser(email) {
  const res = await request(app).post('/api/v1/auth/register').send({
    name: 'User',
    email,
    password: 'password123',
  });
  return res.body.data.token;
}

describe('Media upload and unlock', () => {
  it('uploads media successfully', async () => {
    const token = await registerUser('creator@example.com');
    const imageBuffer = await createTestImageBuffer();

    const res = await request(app)
      .post('/api/v1/media')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Test Media')
      .field('description', 'A test image')
      .field('unlockPrice', '20')
      .attach('image', imageBuffer, 'test.jpg');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.media.title).toBe('Test Media');
  });

  it('unlocks media and updates both buyer and creator wallet balances', async () => {
    const creatorToken = await registerUser('creator2@example.com');
    const buyerToken = await registerUser('buyer2@example.com');
    const imageBuffer = await createTestImageBuffer();

    const uploadRes = await request(app)
      .post('/api/v1/media')
      .set('Authorization', `Bearer ${creatorToken}`)
      .field('title', 'Paid Media')
      .field('description', '')
      .field('unlockPrice', '20')
      .attach('image', imageBuffer, 'test.jpg');

    const mediaId = uploadRes.body.data.media.id;

    const unlockRes = await request(app)
      .post(`/api/v1/media/${mediaId}/unlock`)
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(unlockRes.status).toBe(200);
    expect(unlockRes.body.data.alreadyUnlocked).toBe(false);

    const buyerWallet = await request(app)
      .get('/api/v1/wallet')
      .set('Authorization', `Bearer ${buyerToken}`);
    expect(buyerWallet.body.data.coinBalance).toBe(80);

    const creatorWallet = await request(app)
      .get('/api/v1/wallet')
      .set('Authorization', `Bearer ${creatorToken}`);
    expect(creatorWallet.body.data.coinBalance).toBe(120);
  });

  it('does not charge twice on duplicate unlock', async () => {
    const creatorToken = await registerUser('creator3@example.com');
    const buyerToken = await registerUser('buyer3@example.com');
    const imageBuffer = await createTestImageBuffer();

    const uploadRes = await request(app)
      .post('/api/v1/media')
      .set('Authorization', `Bearer ${creatorToken}`)
      .field('title', 'Paid Media 2')
      .field('description', '')
      .field('unlockPrice', '15')
      .attach('image', imageBuffer, 'test.jpg');

    const mediaId = uploadRes.body.data.media.id;

    await request(app)
      .post(`/api/v1/media/${mediaId}/unlock`)
      .set('Authorization', `Bearer ${buyerToken}`);

    const secondUnlock = await request(app)
      .post(`/api/v1/media/${mediaId}/unlock`)
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(secondUnlock.status).toBe(200);
    expect(secondUnlock.body.data.alreadyUnlocked).toBe(true);

    const buyerWallet = await request(app)
      .get('/api/v1/wallet')
      .set('Authorization', `Bearer ${buyerToken}`);
    expect(buyerWallet.body.data.coinBalance).toBe(85); // unchanged from first unlock
  });
});