// jest.setTimeout(30000);

import request from 'supertest';
import app from '../../app';

const baseEndpoint = '/api/users';
const uniqueURL = 'uniqueurl.com';
const customDomains = ['w.ow', 'just-another-domain.app'];

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1Zjk2NWNjZjZkMjIwOTIyM2U0NjFiZWQiLCJpYXQiOjE2MDM2ODk3MzEsImV4cCI6MTYwMzc3NjEzMX0.D-WDOEERFBMx8TAF1WfZEsfjsU3ra9cXVXNH3x5-P7M';

test('Should forbid request without headers', async () => {
  await request(app).get(`${baseEndpoint}/user`).expect(403);
});

test('Should forbid request with invalid token', async () => {
  await request(app)
    .get(`${baseEndpoint}/user`)
    .set('Authorization', '123')
    .expect(403);
});

test('Should create & return url object with shortened url', async () => {
  await request(app)
    .post(`${baseEndpoint}/shorten-url`)
    .set('Authorization', token)
    .send({
      url: uniqueURL,
    })
    .expect(201)
    .expect((res: any) => {
      expect(res.body.url.url).toBe(uniqueURL);
      expect(typeof res.body.url.short).toBe('string');
    });
});

test('Should return updated user object with purchased domain(s)', async () => {
  await request(app)
    .post(`${baseEndpoint}/purchase`)
    .set('Authorization', token)
    .send({
      domains: customDomains,
    })
    .expect(200)
    .expect((res: any) => {
      expect(
        res.body.user.purchased.length >= customDomains.length
      ).toBeTruthy();
    });
});

test('Should not activate domain', async () => {
  await request(app)
    .post(`${baseEndpoint}/purchase`)
    .set('Authorization', token)
    .send({
      domainId: 'failBecauseItdoesnexist',
    })
    .expect(400);
});
