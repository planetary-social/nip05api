import { getSignature, getEventHash } from "nostr-tools";
export const testPrivateKey = '7b7758822041766ddfce561464136a3101ed228a1a5c34a01592d323440217ba';
export const testPubkey = '6c815df9b3e7f43492c232aba075b5fa5b6a60b731ce6ccfc7c1e8bd2adcceb2';

export function createUserData(
  name = "bob",
  pubkey = "6c815df9b3e7f43492c232aba075b5fa5b6a60b731ce6ccfc7c1e8bd2adcceb2",
  relays = ["wss://relay1.com", "wss://relay2.com"]
) {
  return {
    name,
    data: {
      pubkey,
      relays,
    },
  };
}

export function getNip98AuthToken(event) {
  const signedEvent = signEvent(event);
  const signedEventJSON = JSON.stringify(signedEvent);
  return Buffer.from(signedEventJSON).toString("base64");
}

function signEvent(event) {
  let signedEvent = { ...event };
  signedEvent.id = getEventHash(signedEvent);
  signedEvent.sig = getSignature(signedEvent, testPrivateKey);
  return signedEvent;
}
