import request from "supertest";
import getRedisClient from "../src/getRedisClient.js";
import app from "../src/app.js";
import config from "../config/index.js";
import { getNip98AuthToken, createUserPayload } from "./testUtils.js";
import NameRecord from "../src/nameRecord.js";
import NameRecordRepository from "../src/nameRecordRepository.js";
import { response } from "express";

const notSystemSecret =
  "73685b53bdf5ac16498f2dc6a9891d076039adbe7eebff88b7f7ac72963450e2";
const notSystemPubkey =
  "a7e5c75a2f70a5e2a17fb6eadefd8e2b0830e906a3b03e576159cfaa5783b0d9";
const redisClient = await getRedisClient();
const nip98PostAuthToken = await getNip98AuthToken({
  url: "http://nos.social/api/names",
  method: "POST",
});
const nip98PostAuthTokenDomain = await getNip98AuthToken({
  url: "http://bob.nos.social/api/names",
  method: "POST",
});

const nip98PostAuthTokenNotSystem = await getNip98AuthToken({
  url: "http://nos.social/api/names",
  method: "POST",
  secret: notSystemSecret,
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
    const invalidUserData = createUserPayload({ name: "bo b" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(invalidUserData)
      .expect(422);
  });

  it("should not fail with a forbidden name with the system account", async () => {
    const userData = createUserPayload({ name: "xxx" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData)
      .expect(200);
  });

  it("should fail with a forbidden name", async () => {
    const userData = createUserPayload({
      name: "xxx",
      pubkey: notSystemPubkey,
    });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthTokenNotSystem}`)
      .send(userData)
      .expect(422);
  });

  it("should fail with a reserved name", async () => {
    const userData = createUserPayload({
      name: "help",
      pubkey: notSystemPubkey,
    });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthTokenNotSystem}`)
      .send(userData)
      .expect(422);
  });

  it("should fail with a reserved name with different casing", async () => {
    const userData = createUserPayload({
      name: "Help",
      pubkey: notSystemPubkey,
    });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthTokenNotSystem}`)
      .send(userData)
      .expect(422);
  });

  it("should not fail with a reserved name if the auth token used corresponds with the current stored pubkey", async () => {
    redisClient.set("pubkey:help", notSystemPubkey);
    const userData = createUserPayload({
      name: "help",
      pubkey: notSystemPubkey,
    });
    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthTokenNotSystem}`)
      .send(userData)
      .expect(200);
  });

  it("should fail if the name is too long", async () => {
    const longName = "a".repeat(31);
    const userData = createUserPayload({ name: longName });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData)
      .expect(422);
  });

  it("should fail if the name is too short", async () => {
    const userData = createUserPayload({ name: "a" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData)
      .expect(422);
  });

  it("should fail if the name starts with -", async () => {
    const userData = createUserPayload({ name: "-aa" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData)
      .expect(422);
  });

  it("should fail if the name ends with -", async () => {
    const userData = createUserPayload({ name: "aa-" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData)
      .expect(422);
  });

  it("should fail if the name includes a dot", async () => {
    const userData = createUserPayload({ name: "aa." });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData)
      .expect(422);
  });

  it("should fail if the name includes an underscore", async () => {
    const userData = createUserPayload({ name: "aa_" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData)
      .expect(422);
  });

  it("should fail if the name is not found for nostr.json", async () => {
    await request(app)
      .get("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .query({ name: "somename" })
      .expect(404);
  });

  it("should fail if the name is not found for webfinger", async () => {
    await request(app)
      .get("/.well-known/webfinger")
      .set("Host", "nos.social")
      .query({ resource: "acct:somename@nos.social" })
      .expect(404);
  });

  it("should include cors header in the response", async () => {
    await request(app)
      .get("/api/names")
      .set("Host", "nos.social")
      .query({ name: "somename" })
      .expect("Access-Control-Allow-Origin", "*");
  });

  it("should store and retrieve Nostr NIP 05 data dynamically through the name query param, relays are uniq and wss://relay.nos.social added", async () => {
    const userData = createUserPayload({
      name: "bob",
      relays: ["wss://relay1.com", "wss://relay1.com", "wss://relay2.com"],
    });

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
        [config.servicePubkey]: [
          "wss://relay1.com",
          "wss://relay2.com",
          "wss://relay.nos.social",
        ],
      },
    });
  });

  it("should store and retrieve Webfinger data dynamically through the resource query param", async () => {
    const userData = createUserPayload({
      name: "bob",
      relays: ["wss://relay1.com", "wss://relay1.com", "wss://relay2.com"],
    });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98PostAuthToken}`)
      .send(userData)
      .expect(200);

    const getResponse = await request(app)
      .get("/.well-known/webfinger")
      .set("Host", "nos.social")
      .query({ resource: "acct:bob@nos.social" })
      .expect(302);

    expect(getResponse.header.location).toEqual(
      "https://mostr.pub/.well-known/webfinger?resource=acct:6c815df9b3e7f43492c232aba075b5fa5b6a60b731ce6ccfc7c1e8bd2adcceb2@mostr.pub"
    );
  });

  it("should store and retrieve Nostr NIP 05 data through the subdomain", async () => {
    const userData = createUserPayload({ name: "_" });

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
        [config.servicePubkey]: [
          "wss://relay1.com",
          "wss://relay2.com",
          "wss://relay.nos.social",
        ],
      },
    });
  });

  it("should not use components of the root domain as a subdomain", async () => {
    const userData = createUserPayload({ name: "nos" });

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
    const userData = createUserPayload({ name: "nos" });

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
    const userData = createUserPayload({ name: "bob" });

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
      const userData = createUserPayload({ name: "bob" });

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

  it("should save notifications and then fetch and clear them correctly", async () => {
    const testRecords = [
      new NameRecord(
        "testName1",
        "pubkey1",
        ["wss://relay1.com"],
        "clientIp1",
        "userAgent1",
        new Date().toISOString()
      ),
      new NameRecord(
        "testName2",
        "pubkey2",
        ["wss://relay2.com"],
        "clientIp2",
        "userAgent2",
        new Date().toISOString()
      ),
    ];

    const repo = new NameRecordRepository(redisClient);

    for (const record of testRecords) {
      await repo.save(record);
    }

    const pendingCountBefore = await redisClient.zcount(
      "pending_notifications",
      "-inf",
      "+inf"
    );
    expect(pendingCountBefore).toEqual(testRecords.length);

    const fetchedRecords = await repo.fetchAndClearPendingNotifications();

    const fetchedNames = fetchedRecords.map((record) => record.name);
    expect(fetchedNames.sort()).toEqual(
      testRecords.map((record) => record.name).sort()
    );

    const pendingCountAfter = await redisClient.zcount(
      "pending_notifications",
      "-inf",
      "+inf"
    );
    expect(pendingCountAfter).toEqual(0);
  });
});
