import request from "supertest";
import redisClient from "../src/redisClient.js";
import app from "../src/app.js";
import config from "../config/index.js";
import { getNip98AuthToken, createUserData } from './testUtils.js';

const nip98PostAuthToken = getNip98AuthToken({
  kind: 27235,
  created_at: Math.floor(Date.now() / 1000),
  tags: [
    ["u", "http://nos.social/.well-known/nostr.json"],
    ["method", "POST"],
  ],
  content: '',
  pubkey: config.servicePubkey,
});

const nip98PostAuthTokenDomain = getNip98AuthToken({
  kind: 27235,
  created_at: Math.floor(Date.now() / 1000),
  tags: [
    ["u", "http://bob.nos.social/.well-known/nostr.json"],
    ["method", "POST"],
  ],
  content: '',
  pubkey: config.servicePubkey,
});

beforeEach(async () => {
  await redisClient.flushdb();
});

describe("Nostr NIP 05 API tests", () => {
  it("should validate the correct schema", async () => {
    const invalidUserData = createUserData({name: "bo b"});

    await request(app)
      .post("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(invalidUserData)
      .expect(422);
  });

  it("should fail if the name is not found", async () => {
    await request(app)
      .get("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .query({ name: "somename" })
      .expect(404);
  });

  it("should store and retrieve Nostr NIP 05 data dynamically through the name query param", async () => {
    const userData = createUserData({name: "bob"});

    await request(app)
      .post("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData)
      .expect(200);

    const getResponse = await request(app)
      .get("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .query({ name: "bob" })
      .expect(200);

    const jsonResponse = JSON.parse(getResponse.text);

    expect(jsonResponse).toEqual({
      names: { bob: config.servicePubkey },
      relays: {
        [config.servicePubkey]: ["wss://relay1.com", "wss://relay2.com"],
      },
    });
  });

  it("should store and retrieve Nostr NIP 05 data through the subdomain", async () => {
    const userData = createUserData({name: "_"});

    await request(app)
      .post("/.well-known/nostr.json")
      .set("Host", "bob.nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthTokenDomain}`)
      .send(userData)
      .expect(200);

    const getResponse = await request(app)
      .get("/.well-known/nostr.json")
      .set("Host", "bob.nos.social")
      .query({ name: "_" })
      .expect(200);

    const jsonResponse = JSON.parse(getResponse.text);

    expect(jsonResponse).toEqual({
      names: { bob: config.servicePubkey },
      relays: {
        [config.servicePubkey]: ["wss://relay1.com", "wss://relay2.com"],
      },
    });
  });

  it("should not use components of the root domain as a subdomain", async () => {
    const userData = createUserData({name: "nos"});

    await request(app)
      .post("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData);

    const getResponse = await request(app)
      .get("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .query({ name: "_" })
      .expect(404);
  });

  it("should fail to overwrite the pubkey if the name is already taken", async () => {
    const userData = createUserData({name: "bob"});

     await request(app)
      .post("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData)
      .expect(200);

     userData.data.pubkey = config.servicePubkey.replace("1", "2");

     await request(app)
      .post("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData)
      .expect(409);
  });

  describe('event deletion', () => {
    let nip98DeleteAuthToken;

    beforeEach(async () => {
      const userData = createUserData({name: "bob"});

      await request(app)
        .post("/.well-known/nostr.json")
        .set("Host", "nos.social")
        .set("Authorization", `Nostr ${nip98PostAuthToken}`)
        .send(userData);

      nip98DeleteAuthToken = getNip98AuthToken({
        kind: 27235,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ["u", "http://nos.social/.well-known/nostr.json?name=bob"],
          ["method", "DELETE"],
        ],
        content: '',
        pubkey: config.servicePubkey,
      });
    });

    it("should be possible to delete an entry with correct credentials using the @ format", async () => {
      await request(app)
        .delete("/.well-known/nostr.json")
        .set("Host", "nos.social")
        .set("Authorization", `Nostr ${nip98DeleteAuthToken}`)
        .query({ name: "bob" })
        .expect(200);

      await request(app)
        .get("/.well-known/nostr.json")
        .set("Host", "nos.social")
        .query({ name: "bob" })
        .expect(404);
    });

    it("should be possible to delete an entry with correct credentials using the domain format", async () => {
      const nip98DeleteAuthTokenDomain = getNip98AuthToken({
        kind: 27235,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ["u", "http://bob.nos.social/.well-known/nostr.json?name=_"],
          ["method", "DELETE"],
        ],
        content: '',
        pubkey: config.servicePubkey,
      });

      await request(app)
        .delete("/.well-known/nostr.json")
        .set("Host", "bob.nos.social")
        .set("Authorization", `Nostr ${nip98DeleteAuthTokenDomain}`)
        .query({ name: "_" })
        .expect(200);

      await request(app)
        .get("/.well-known/nostr.json")
        .set("Host", "nos.social")
        .query({ name: "bob" })
        .expect(404);
    });

    it("should fail with wrong credentials", async () => {
      await request(app)
        .delete("/.well-known/nostr.json")
        .set("Host", "nos.social")
        .set("Authorization", `Nostr ${nip98PostAuthToken}`)
        .query({ name: "bob" })
        .expect(401);
    });
  });
});