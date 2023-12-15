import request from "supertest";
import redisClient from "../src/redisClient.js";
import app from "../src/app.js";
import config from "../config";
import { getNip98AuthToken, createUserData } from "./testUtils.js";

export const userPrivateKey = 'b45556a314c245b020690b0b59f21e4ed394ffa7baedfd65e0927ea19d014220';
export const userPubkey = '464db1ec23b1a5da9ef3df411ba555276b1af85f069a6aee3e2ce996dda7ae58';

const nip98AuthToken = getNip98AuthToken({
  kind: 27235,
  created_at: Math.floor(Date.now() / 1000),
  tags: [
    ["u", "http://nos.social/.well-known/nostr.json"],
    ["method", "POST"],
  ],
  content: "",
  pubkey: config.servicePubkey,
});

beforeEach(async () => {
  await redisClient.flushdb();
});

describe("Nostr 98 Auth tests", () => {
  it("should succeed with correct auth event", async () => {
    const userData = createUserData({name: "bob"});

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
      pubkey: config.servicePubkey.replace("1", "2"),
    });

    const userData = createUserData({name: "bob"});

    await request(app)
      .post("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${authToken}`)
      .send(userData)
      .expect(401);
  });

  it("should fail to post with an event not signed with the app secret", async () => {
    const authToken = getNip98AuthToken({
      kind: 27235,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["u", "http://nos.social/.well-known/nostr.json"],
        ["method", "POST"],
      ],
      content: "",
      pubkey: config.servicePubkey,
    }, userPrivateKey);

    const userData = createUserData({name: "bob"});

    await request(app)
      .post("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${authToken}`)
      .send(userData)
      .expect(401);
  });


  it("should not fail to POST if the pubkey used for auth is the same that is being changed", async () => {
    const authToken = getNip98AuthToken({
      kind: 27235,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["u", "http://nos.social/.well-known/nostr.json"],
        ["method", "POST"],
      ],
      content: "",
      pubkey: userPubkey,
    }, userPrivateKey);

    const userData = createUserData({name: "bob", pubkey: userPubkey});

    await request(app)
      .post("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${authToken}`)
      .send(userData)
      .expect(200);
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
      pubkey: config.servicePubkey,
    });

    const userData = createUserData({name: "bob"});

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
      pubkey: config.servicePubkey,
    });

    const userData = createUserData({name: "bob"});

    await request(app)
      .post("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${authToken}`)
      .send(userData)
      .expect(401);
  });

  it("should not fail to DELETE if the pubkey mapped to the selected name is matching the auth pubkey", async () => {
    const postAuthToken = getNip98AuthToken({
      kind: 27235,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["u", "http://nos.social/.well-known/nostr.json"],
        ["method", "POST"],
      ],
      content: "",
      pubkey: userPubkey,
    }, userPrivateKey);

    const userData = createUserData({name: "bob", pubkey: userPubkey});

    await request(app)
      .post("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${postAuthToken}`)
      .send(userData)
      .expect(200);

    const deleteAuthToken = getNip98AuthToken({
      kind: 27235,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["u", "http://nos.social/.well-known/nostr.json?name=bob"],
        ["method", "DELETE"],
      ],
      content: "",
      pubkey: userPubkey,
    }, userPrivateKey);

    await request(app)
      .delete("/.well-known/nostr.json")
      .query({ name: "bob" })
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${deleteAuthToken}`)
      .expect(200);
  });

  it("should fail to DELETE if the pubkey mapped to the selected name is not matching the auth pubkey", async () => {
    const postAuthToken = getNip98AuthToken({
      kind: 27235,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["u", "http://nos.social/.well-known/nostr.json"],
        ["method", "POST"],
      ],
      content: "",
      pubkey: config.servicePubkey,
    });

    const userData = createUserData({name: "bob", pubkey: config.servicePubkey});

    await request(app)
      .post("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${postAuthToken}`)
      .send(userData)
      .expect(200);

    const deleteAuthToken = getNip98AuthToken({
      kind: 27235,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["u", "http://nos.social/.well-known/nostr.json?name=bob"],
        ["method", "DELETE"],
      ],
      content: "",
      pubkey: userPubkey,
    }, userPrivateKey);

    await request(app)
      .delete("/.well-known/nostr.json")
      .query({ name: "bob" })
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${deleteAuthToken}`)
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
      pubkey: config.servicePubkey,
    });

    const userData = createUserData({name: "bob"});

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
      pubkey: config.servicePubkey,
    });

    const userData = createUserData({name: "bob"});

    await request(app)
      .post("/.well-known/nostr.json")
      .set("Host", "nos.social")
      .set("Authorization", `Nostr ${authToken}`)
      .send(userData)
      .expect(401);
  });
});
