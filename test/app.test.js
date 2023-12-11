import request from "supertest";
import redisClient from "../src/redisClient.js";
import app from "../src/app.js";
import { getNip98AuthToken, testPubkey, createUserData } from './testUtils.js';

const nip98AuthToken = getNip98AuthToken({
  kind: 27235,
  created_at: Math.floor(Date.now() / 1000),
  tags: [
    ["u", "http://nos.social/.well-known/nostr.json"],
    ["method", "POST"],
  ],
  content: '',
  pubkey: testPubkey,
});

beforeEach(async () => {
  await redisClient.flushdb();
});

describe("Nostr NIP 05 API tests", () => {
  it("should validate the correct schema", async () => {
    const invalidUserData = createUserData("bo b");

    await request(app)
      .post("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98AuthToken}`)
      .send(invalidUserData)
      .expect(422);
  });

  it("should store and retrieve Nostr NIP 05 data dynamically through the name query param", async () => {
    const userData = createUserData("bob");

    const postResponse = await request(app)
      .post("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98AuthToken}`)
      .send(userData);

    expect(postResponse.body).toEqual({});
    expect(postResponse.status).toEqual(200);

    const getResponse = await request(app)
      .get("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .query({ name: "bob" })
      .expect(200);

    const jsonResponse = JSON.parse(getResponse.text);

    expect(jsonResponse).toEqual({
      names: { bob: testPubkey },
      relays: {
        [testPubkey]: ["wss://relay1.com", "wss://relay2.com"],
      },
    });
  });

  it("should store and retrieve Nostr NIP 05 data through the subdomain", async () => {
    const userData = createUserData("bob");

    await request(app)
      .post("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98AuthToken}`)
      .send(userData);

    const getResponse = await request(app)
      .get("/.well-known/nostr.json")
      .set("Host", "bob.nos.social")
      .query({ name: "_" })
      .expect(200);

    const jsonResponse = JSON.parse(getResponse.text);

    expect(jsonResponse).toEqual({
      names: { bob: testPubkey },
      relays: {
        [testPubkey]: ["wss://relay1.com", "wss://relay2.com"],
      },
    });
  });

  it("should not use components of the root domain as a subdomain", async () => {
    const userData = createUserData("nos");

    await request(app)
      .post("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98AuthToken}`)
      .send(userData);

    const getResponse = await request(app)
      .get("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .query({ name: "_" })
      .expect(404);
  });

  it("should fail to overwrite the pubkey if the name is already taken", async () => {
    const userData = createUserData("bob");

     await request(app)
      .post("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98AuthToken}`)
      .send(userData)
      .expect(200);

     userData.data.pubkey = testPubkey.replace("1", "2");

     await request(app)
      .post("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98AuthToken}`)
      .send(userData)
      .expect(409);
  });
});