// jest.setTimeout(30000);

import request from 'supertest';
import app from '../../app';
import { verifyToken } from '../../utils';

const testUser = {
  name: 'Lahori',
  username: 'lj',
  email: 'lahori@jawan.com',
  password: '123456',
};

test('Should create unique user', async () => {
  await request(app)
    .post('/auth/register')
    .send({
      name: testUser.name,
      username: testUser.username,
      email: testUser.email,
      password: testUser.password,
    })
    .expect(201)
    .expect((res: any) => {
      expect(res.body.user.name).toBe(testUser.name);
      expect(res.body.user.username).toBe(testUser.username);
      expect(res.body.user.email).toBe(testUser.email);
    });
});

test('Should not create same user', async () => {
  await request(app)
    .post('/auth/register')
    .send({
      name: testUser.name,
      username: testUser.username,
      email: testUser.email,
      password: testUser.password,
    })
    .expect(400);
});

test('Should login a user with valid access-token', async () => {
  await request(app)
    .post('/auth/login')
    .send({
      email: testUser.email,
      password: testUser.password,
    })
    .expect(200)
    .expect((res: any) => {
      expect(res.body.user.name).toBe(testUser.name);
      expect(res.body.user.email).toBe(testUser.email);
      const [error] = verifyToken(res.body.user.accessToken);
      if (error) throw new Error(`Token is not valid: ${error}`);
    });
});

test('Should not login a user that does not exist', async () => {
  await request(app)
    .post('/auth/login')
    .send({
      email: 'dummy@demo.com',
      password: '123456',
    })
    .expect(400);
});

test('Should not create a user with missing credentials', async () => {
  await request(app)
    .post('/auth/register')
    .send({
      name: testUser.name,
      email: testUser.email,
    })
    .expect(400);
});

test('Should not login a user with missing credentials', async () => {
  await request(app)
    .post('/auth/login')
    .send({
      email: testUser.email,
    })
    .expect(400);
});
