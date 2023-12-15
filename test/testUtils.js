import { getSignature, getEventHash, generatePrivateKey } from "nostr-tools";

export const servicePubkeySecret = '7b7758822041766ddfce561464136a3101ed228a1a5c34a01592d323440217ba';

export function createUserData({
  name = "bob",
  pubkey = "6c815df9b3e7f43492c232aba075b5fa5b6a60b731ce6ccfc7c1e8bd2adcceb2",
  relays = ["wss://relay1.com", "wss://relay2.com"]
}) {
  return {
    name,
    data: {
      pubkey,
      relays,
    },
  };
}

export function getNip98AuthToken(event, secret = servicePubkeySecret) {
  const signedEvent = signEvent(event, secret);
  const signedEventJSON = JSON.stringify(signedEvent);
  return Buffer.from(signedEventJSON).toString("base64");
}

function signEvent(event, secret) {
  let signedEvent = { ...event };
  signedEvent.id = getEventHash(signedEvent);
  signedEvent.sig = getSignature(signedEvent, secret);
  return signedEvent;
}
