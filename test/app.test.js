import request from 'supertest';
import redisClient from '../src/redisClient.js';
import app from '../src/app.js';


const validPubkey = '89ef92b9ebe6dc1e4ea398f6477f227e95429627b0a33dc89b640e137b256be5';

beforeEach(async () => {
  await redisClient.flushdb();
});

describe('Nostr NIP 05 API tests', () => {
  it('should validate the correct schema', async () => {
    const invalidUserData = {
      namee: 'bob',
      data: {
        pubkey: validPubkey,
        relays: ['wss://relay1.com', 'wss://relay2.com']
      }
    };

    await request(app)
      .post('/.well-known/nostr.json')
      .auth('password', '')
      .send(invalidUserData)
      .expect(400);
  });

  it('should store and retrieve Nostr NIP 05 data dynamically through the name query param', async () => {
    const name = 'bob';
    const userData = {
      name,
      data: {
        pubkey: validPubkey,
        relays: ['wss://relay1.com', 'wss://relay2.com']
      }
    };

    const postResponse = await request(app)
      .post('/.well-known/nostr.json')
      .auth('password', '')
      .send(userData);

    expect(postResponse.body).toEqual({});
    expect(postResponse.status).toEqual(200);

    const getResponse = await request(app)
      .get('/.well-known/nostr.json')
      .set('Host', 'nos.social')
      .query({ name })
      .expect(200);

    const jsonResponse = JSON.parse(getResponse.text);


    expect(jsonResponse).toEqual({
      names: { bob: validPubkey },
      relays: {
        [validPubkey]: [
          'wss://relay1.com',
          'wss://relay2.com'
        ]
      }
    });
  });

  it('should store and retrieve Nostr NIP 05 data through the subdomain', async () => {
    const name = 'bob';
    const userData = {
      name,
      data: {
        pubkey: validPubkey,
        relays: ['wss://relay1.com', 'wss://relay2.com']
      }
    };

    await request(app)
      .post('/.well-known/nostr.json')
      .auth('password', '')
      .send(userData);

    const getResponse = await request(app)
      .get('/.well-known/nostr.json')
      .set('Host', 'bob.nos.social')
      .query({ name: '_' })
      .expect(200);

    const jsonResponse = JSON.parse(getResponse.text);


    expect(jsonResponse).toEqual({
      names: { bob: validPubkey },
      relays: {
        [validPubkey]: [
          'wss://relay1.com',
          'wss://relay2.com'
        ]
      }
    });
  });

  it('should not use components of the root domain as a subdomain', async () => {
    const name = 'nos';
    const userData = {
      name,
      data: { pubkey: validPubkey }
    };

    await request(app)
      .post('/.well-known/nostr.json')
      .auth('password', '')
      .send(userData);

    const getResponse = await request(app)
      .get('/.well-known/nostr.json')
      .query({ name: '_' })
      .set('Host', 'nos.social')
      .expect(404);
  });
});
