import { getSignature, getEventHash, nip98, getPublicKey } from "nostr-tools";

// This is just a test keypair, don't use it in production
export const servicePubkeySecret =
  "7b7758822041766ddfce561464136a3101ed228a1a5c34a01592d323440217ba";

export function createUserPayload({
  name = "bob",
  pubkey = "6c815df9b3e7f43492c232aba075b5fa5b6a60b731ce6ccfc7c1e8bd2adcceb2",
  relays = ["wss://relay1.com", "wss://relay2.com"],
}) {
  return {
    name,
    data: {
      pubkey,
      relays,
    },
  };
}

export async function getNip98AuthToken({
  url,
  method,
  payload,
  secret,
  eventModifier,
}) {
  const eventSigner = signEvent(secret || servicePubkeySecret);
  const eventSignerWrapper = (event) => {
    if (eventModifier) {
      event = eventModifier(event);
    }

    return eventSigner(event);
  };

  return await nip98.getToken(url, method, eventSignerWrapper, false, payload);
}

export function signEvent(secret) {
  return function (event) {
    let signedEvent = { ...event };
    signedEvent.pubkey = getPublicKey(secret);
    signedEvent.id = getEventHash(signedEvent);
    signedEvent.sig = getSignature(signedEvent, secret);
    return signedEvent;
  };
}
