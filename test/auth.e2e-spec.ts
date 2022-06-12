import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication system (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles a signup request', () => {
    const data = { email: 'bert@test.com', password: 'mypassword' };
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send(data)
      .expect(201)
      .then((response) => {
        const { id, email } = response.body;
        expect(id).toBeDefined();
        expect(email).toEqual(data.email);
      });
  });

  it('signup as a new user then get the currently logged in user', async () => {
    const data = { email: 'bert@test.com', password: 'mypassword' };

    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(data)
      .expect(201);
    const cookie = response.get('Set-Cookie');

    const { body } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.email).toEqual(data.email);
  });
});
