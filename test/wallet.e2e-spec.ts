import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { AppModule } from '../src/app.module';

describe('Wallet E2E', () => {
  let app: INestApplication;
  let walletId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('creates wallet', async () => {
    const res = await request(app.getHttpServer())
      .post('/wallet')
      .send({ userId: '550e8400-e29b-41d4-a716-446655440000' })
      .expect(201);

    walletId = res.body.id;
    expect(walletId).toBeDefined();
  });

  // it('funds wallet', async () => {
  //   const res = await request(app.getHttpServer())
  //     .post('/wallet/fund')
  //     .send({ walletId, amount: 5000 })
  //     .expect(201);

  //   expect(res.body.balance).toBe(5000);
  // });

  it('funds wallet once with idempotency key', async () => {
    const key = 'unique-key-123';

    // First request
    const res1 = await request(app.getHttpServer())
      .post('/wallet/fund')
      .set('idempotency-key', key)
      .send({ walletId, amount: 5000 })
      .expect(201);

    expect(res1.body.balance).toBe(5000);
    expect(res1.body.transactions).toHaveLength(1);
    const txId = res1.body.transactions[0].id;

    // Second request with SAME key
    const res2 = await request(app.getHttpServer())
      .post('/wallet/fund')
      .set('idempotency-key', key)
      .send({ walletId, amount: 5000 })
      .expect(201);

    // Balance should not change, transaction ID should match
    expect(res2.body.balance).toBe(5000);
    expect(res2.body.transactions).toHaveLength(1);
    expect(res2.body.transactions[0].id).toBe(txId);
  });

  it('funds wallet with a NEW idempotency key', async () => {
    const key = 'unique-key-456';

    const res = await request(app.getHttpServer())
      .post('/wallet/fund')
      .set('idempotency-key', key)
      .send({ walletId, amount: 2000 })
      .expect(201);

    expect(res.body.balance).toBe(7000);
    expect(res.body.transactions).toHaveLength(2);
  });


  it('gets wallet details', async () => {
    const res = await request(app.getHttpServer())
      .get(`/wallet/${walletId}`)
      .expect(200);

      expect(res.body.id).toBe(walletId);
      expect(res.body.balance).toBeGreaterThanOrEqual(0);
      expect(res.body.currency).toBe('USD');
      expect(res.body.transactions).toEqual(expect.any(Array));

  });

  afterAll(async () => {
    await app.close();
  });
});
