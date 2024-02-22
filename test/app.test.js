import request from "supertest";
import getRedisClient from "../src/getRedisClient.js";
import app from "../src/app.js";
import config from "../config/index.js";
import { getNip98AuthToken, createUserData } from "./testUtils.js";

const redisClient = await getRedisClient();
const nip98PostAuthToken = await getNip98AuthToken({
  url: "http://nos.social/api/names",
  method: "POST",
});
const nip98PostAuthTokenDomain = await getNip98AuthToken({
  url: "http://bob.nos.social/api/names",
  method: "POST",
});

beforeEach(async () => {
  await redisClient.flushdb();
});

afterAll(async () => {
  await redisClient.quit();
});

describe("Nostr NIP 05 API tests", () => {
  it("should properly handle 500 errors", async () => {
    const response = await request(app)
      .get("/test/error")
      .set("Host", "nos.social")
      .query({ name: "somename" });

    expect(response.status).toEqual(500);
    expect(response.body).toEqual({ error: "Internal Server Error" });
  });

  it("should validate the correct schema", async () => {
    const invalidUserData = createUserData({ name: "bo b" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(invalidUserData)
      .expect(422);
  });

  it("should fail with a forbidden name", async () => {
    const userData = createUserData({ name: "xxx" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData)
      .expect(422);
  });

  it("should fail with a forbidden name in another case", async () => {
    const userData = createUserData({ name: "xxX" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData)
      .expect(422);
  });

  it("should fail with a reserved name", async () => {
    const userData = createUserData({ name: "help" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData)
      .expect(422);
  });

  it("should fail with a reserved name with different casing", async () => {
    const userData = createUserData({ name: "Help" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData)
      .expect(422);
  });

  it("should fail if the name is too long", async () => {
    const longName = "a".repeat(31);
    const userData = createUserData({ name: longName });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData)
      .expect(422);
  });

  it("should fail if the name is too short", async () => {
    const userData = createUserData({ name: "a" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData)
      .expect(422);
  });

  it("should fail if the name starts with -", async () => {
    const userData = createUserData({ name: "-aa" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData)
      .expect(422);
  });

  it("should fail if the name ends with -", async () => {
    const userData = createUserData({ name: "aa-" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData)
      .expect(422);
  });

  it("should fail if the name includes a dot", async () => {
    const userData = createUserData({ name: "aa." });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData)
      .expect(422);
  });

  it("should fail if the name includes an underscore", async () => {
    const userData = createUserData({ name: "aa_" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData)
      .expect(422);
  });

  it("should fail if the name is not found", async () => {
    await request(app)
      .get("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .query({ name: "somename" })
      .expect(404);
  });

  it("should include cors header in the response", async () => {
    await request(app)
      .get("/api/names")
      .set("Host", "nos.social")
      .query({ name: "somename" })
      .expect("Access-Control-Allow-Origin", "*");
  });

  it("should store and retrieve Nostr NIP 05 data dynamically through the name query param", async () => {
    const userData = createUserData({ name: "bob" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData)
      .expect(200);

    const getResponse = await request(app)
      .get("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .query({ name: "Bob" })
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
    const userData = createUserData({ name: "_" });

    await request(app)
      .post("/api/names")
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
    const userData = createUserData({ name: "nos" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData);

    const getResponse = await request(app)
      .get("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .query({ name: "_" })
      .expect(404);
  });

  it("should fail if url doesn't end with root domain", async () => {
    const userData = createUserData({ name: "nos" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData);

    const getResponse = await request(app)
      .get("/.well-known/nostr.json")
      .set("Host", "nos.social.somethingmore")
      .query({ name: "_" })
      .expect(422);
  });

  it("should fail to overwrite the pubkey if the name is already taken", async () => {
    const userData = createUserData({ name: "bob" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData)
      .expect(200);

    userData.data.pubkey = config.servicePubkey.replace("1", "2");

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData)
      .expect(409);
  });

  describe("event deletion", () => {
    let nip98DeleteAuthToken;

    beforeEach(async () => {
      const userData = createUserData({ name: "bob" });

      await request(app)
        .post("/api/names")
        .set("Host", "nos.social")
        .set("Authorization", `Nostr ${nip98PostAuthToken}`)
        .send(userData);

      nip98DeleteAuthToken = await getNip98AuthToken({
        url: "http://nos.social/api/names/bob",
        method: "DELETE",
      });
    });

    it("should be possible to delete an entry with correct credentials using the @ format", async () => {
      await request(app)
        .delete("/api/names/bob")
        .set("Host", "nos.social")
        .set("Authorization", `Nostr ${nip98DeleteAuthToken}`)
        .expect(200);

      await request(app)
        .get("/.well-known/nostr.json")
        .set("Host", "nos.social")
        .query({ name: "bob" })
        .expect(404);
    });

    it("should be possible to delete an entry with correct credentials using the domain format", async () => {
      const nip98DeleteAuthTokenDomain = await getNip98AuthToken({
        url: "http://bob.nos.social/api/names/_",
        method: "DELETE",
      });

      await request(app)
        .delete("/api/names/_")
        .set("Host", "bob.nos.social")
        .set("Authorization", `Nostr ${nip98DeleteAuthTokenDomain}`)
        .expect(200);

      await request(app)
        .get("/api/names")
        .set("Host", "nos.social")
        .query({ name: "bob" })
        .expect(404);
    });

    it("should fail with wrong credentials", async () => {
      await request(app)
        .delete("/api/names/bob")
        .set("Host", "nos.social")
        .set("Authorization", `Nostr ${nip98PostAuthToken}`)
        .expect(401);
    });
  });
});
