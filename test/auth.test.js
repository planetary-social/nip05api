import request from "supertest";
import redisClient from "../src/redisClient.js";
import app from "../src/app.js";
import { getNip98AuthToken, testPubkey, createUserData } from "./testUtils.js";

const nip98AuthToken = getNip98AuthToken({
  kind: 27235,
  created_at: Math.floor(Date.now() / 1000),
  tags: [
    ["u", "http://nos.social/.well-known/nostr.json"],
    ["method", "POST"],
  ],
  content: "",
  pubkey: testPubkey,
});

beforeEach(async () => {
  await redisClient.flushdb();
});

describe("Nostr 98 Auth tests", () => {
  it("should succeed with correct auth event", async () => {
    const userData = createUserData("bob");

    await request(app)
      .post("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98AuthToken}`)
      .send(userData)
      .expect(200);
  });

  it("should fail to post with wrong pubkey", async () => {
    const authToken = getNip98AuthToken({
      kind: 27235,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["u", "http://nos.social/.well-known/nostr.json"],
        ["method", "POST"],
      ],
      content: "",
      pubkey: testPubkey.replace("1", "2"),
    });

    const userData = createUserData("bob");

    await request(app)
      .post("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${authToken}`)
      .send(userData)
      .expect(401);
  });

  it("should fail to post with wrong method", async () => {
    const authToken = getNip98AuthToken({
      kind: 27235,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["u", "http://nos.social/.well-known/nostr.json"],
        ["method", "GET"],
      ],
      content: "",
      pubkey: testPubkey,
    });

    const userData = createUserData("bob");

    await request(app)
      .post("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${authToken}`)
      .send(userData)
      .expect(401);
  });

  it("should fail to post with wrong url", async () => {
    const authToken = getNip98AuthToken({
      kind: 27235,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["u", "http://wrong.nos.social/.well-known/nostr.json"],
        ["method", "POST"],
      ],
      content: "",
      pubkey: testPubkey,
    });

    const userData = createUserData("bob");

    await request(app)
      .post("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${authToken}`)
      .send(userData)
      .expect(401);
  });

  it("should fail if the event is too old", async () => {
    const yesterday = new Date().getDate() - 1;
    const authToken = getNip98AuthToken({
      kind: 27235,
      created_at: Math.floor(yesterday / 1000),
      tags: [
        ["u", "http://nos.social/.well-known/nostr.json"],
        ["method", "POST"],
      ],
      content: "",
      pubkey: testPubkey,
    });

    const userData = createUserData("bob");

    await request(app)
      .post("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${authToken}`)
      .send(userData)
      .expect(401);
  });
  
  it("should fail if the kind is wrong", async () => {
    const authToken = getNip98AuthToken({
      kind: 123,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["u", "http://nos.social/.well-known/nostr.json"],
        ["method", "POST"],
      ],
      content: "",
      pubkey: testPubkey,
    });

    const userData = createUserData("bob");

    await request(app)
      .post("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${authToken}`)
      .send(userData)
      .expect(401);
  });
});
