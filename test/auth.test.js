import request from "supertest";
import getRedisClient from "../src/getRedisClient.js";
import app from "../src/app.js";
import config from "../config";
import {
  getNip98AuthToken,
  createUserPayload,
  servicePubkeySecret,
} from "./testUtils.js";

const redisClient = await getRedisClient();
export const userPrivateKey =
  "b45556a314c245b020690b0b59f21e4ed394ffa7baedfd65e0927ea19d014220";
export const userPubkey =
  "464db1ec23b1a5da9ef3df411ba555276b1af85f069a6aee3e2ce996dda7ae58";

const nip98AuthToken = await getNip98AuthToken({
  url: "http://nos.social/api/names",
  method: "POST",
});

beforeEach(async () => {
  await redisClient.flushdb();
});

afterAll(async () => {
  await redisClient.quit();
});

describe("Nostr 98 Auth tests", () => {
  it("should succeed with correct auth event", async () => {
    const userData = createUserPayload({ name: "bob" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98AuthToken}`)
      .send(userData)
      .expect(200);
  });

  it("should fail without an auth header", async () => {
    const userData = createUserPayload({ name: "bob" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .send(userData)
      .expect(401);
  });

  it("should fail with invalid auth event", async () => {
    const event = {
      kind: 27235,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["u", "http://nos.social/api/names"],
        ["method", "POST"],
      ],
      content: "",
      pubkey: config.servicePubkey,
    };

    const signedEventJSON = JSON.stringify(event);
    const nip98InvalidAuthToken =
      Buffer.from(signedEventJSON).toString("base64");

    const userData = createUserPayload({ name: "bob" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${nip98InvalidAuthToken}`)
      .send(userData)
      .expect(401);
  });

  it("should fail to post with wrong pubkey", async () => {
    const authToken = await getNip98AuthToken({
      url: "http://nos.social/api/names",
      method: "POST",
      secret: servicePubkeySecret.replace("1", "2"),
    });
    const userData = createUserPayload({ name: "bob" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${authToken}`)
      .send(userData)
      .expect(401);
  });

  it("should not fail to POST if the pubkey used for auth is the same that is being changed", async () => {
    const authToken = await getNip98AuthToken({
      url: "http://nos.social/api/names",
      method: "POST",
      secret: userPrivateKey,
    });
    const userData = createUserPayload({ name: "bob", pubkey: userPubkey });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${authToken}`)
      .send(userData)
      .expect(200);
  });

  it("should fail to post with wrong method", async () => {
    const authToken = await getNip98AuthToken({
      url: "http://nos.social/api/names",
      method: "GET",
    });
    const userData = createUserPayload({ name: "bob" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${authToken}`)
      .send(userData)
      .expect(401);
  });

  it("should fail to post with wrong url", async () => {
    const authToken = await getNip98AuthToken({
      url: "http://wrong.nos.social/api/names",
      method: "POST",
    });
    const userData = createUserPayload({ name: "bob" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${authToken}`)
      .send(userData)
      .expect(401);
  });

  it("should not fail to DELETE if the pubkey mapped to the selected name is matching the auth pubkey", async () => {
    const postAuthToken = await getNip98AuthToken({
      url: "http://nos.social/api/names",
      method: "POST",
      secret: userPrivateKey,
    });
    const userData = createUserPayload({ name: "bob", pubkey: userPubkey });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${postAuthToken}`)
      .send(userData)
      .expect(200);

    const deleteAuthToken = await getNip98AuthToken({
      url: "http://nos.social/api/names/bob",
      method: "DELETE",
      secret: userPrivateKey,
    });

    await request(app)
      .delete("/api/names/bob")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${deleteAuthToken}`)
      .expect(200);
  });

  it("should fail if the event is too old", async () => {
    const yesterday = new Date().getDate() - 1;
    const authToken = await getNip98AuthToken({
      url: "http://nos.social/api/names",
      method: "POST",
      eventModifier: (event) => {
        event.created_at = yesterday;
        return event;
      },
    });

    const userData = createUserPayload({ name: "bob" });

    await request(app)
      .post("/api/names")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${authToken}`)
      .send(userData)
      .expect(401);
  });
});
