import NameRecordRepository from "./nameRecordRepository.js";

const VANISH_STREAM_KEY = "vanish_requests";
const LAST_PROCESSED_ID_KEY = "vanish_requests:nip05_service:last_id";
const BLOCK_TIME_MS = 5000; // 5 seconds

class VanishSubscriber {
  constructor(vanishRequestsRedis, nip05Redis) {
    // Right now we have a local redis instance for nip05 data and a remote one
    // used by all our services.  For the momen, the remote one is only used for
    // the vanish stream.
    // TODO: Refactor to migrate and use only one redis instance.

    const nameRecordRepository = new NameRecordRepository(nip05Redis);

    this.vanishRequestsRedis = vanishRequestsRedis;
    this.nameRecordRepository = nameRecordRepository;
    this.abortController = new AbortController();
    this.isRunning = false;
  }

  async processPubkey(pubkey) {
    console.log(`Deleting pubkey: ${pubkey}`);
    await this.nameRecordRepository.deleteByPubkey(pubkey);
  }

  async run() {
    if (this.isRunning) return; // Prevent multiple runs
    this.isRunning = true;

    let lastProcessedID;

    try {
      lastProcessedID =
        (await this.vanishRequestsRedis.get(LAST_PROCESSED_ID_KEY)) || "0-0";
      console.log(`Starting from last processed ID: ${lastProcessedID}`);
    } catch (err) {
      console.error("Error fetching last processed ID from Redis", err);
      this.isRunning = false;
      return;
    }

    const abortSignal = this.abortController.signal;

    while (!abortSignal.aborted) {
      try {
        const streamEntries = await this.vanishRequestsRedis.xread(
          "BLOCK",
          BLOCK_TIME_MS,
          "STREAMS",
          VANISH_STREAM_KEY,
          lastProcessedID
        );

        if (!streamEntries) {
          continue;
        }

        for (const [stream, messages] of streamEntries) {
          for (const [messageID, messageData] of messages) {
            const event = createObjectFromPairs(messageData);

            console.log(`Vanish requests event: ${JSON.stringify(event)} `);
            const pubkey = event.pubkey;

            console.log(
              `Processing message ID: ${messageID} with pubkey: ${pubkey}`
            );

            try {
              await this.processPubkey(pubkey);
            } catch (err) {
              console.error(`Error processing pubkey: ${pubkey}`, err);
            }

            try {
              await this.vanishRequestsRedis.set(
                LAST_PROCESSED_ID_KEY,
                messageID
              );
              lastProcessedID = messageID;
              console.log(`Updated last processed ID to: ${lastProcessedID}`);
            } catch (err) {
              console.error(
                `Error updating last processed ID: ${messageID}`,
                err
              );
            }
          }
        }
      } catch (err) {
        if (abortSignal.aborted) {
          break;
        }
        console.error("Error reading from Redis stream", err);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log("Cancellation signal received. Exiting gracefully...");
    await this.vanishRequestsRedis.set(LAST_PROCESSED_ID_KEY, lastProcessedID);
    console.log(`Final last processed ID saved: ${lastProcessedID}`);

    this.isRunning = false;
  }

  stop() {
    if (!this.isRunning) return;
    this.abortController.abort();
    console.log(
      "Abort signal sent. Waiting for current processing to finish..."
    );
  }
}

function createObjectFromPairs(messageData) {
  return messageData.reduce((acc, value, index, arr) => {
    if (index % 2 === 0) {
      acc[value] = arr[index + 1];
    }
    return acc;
  }, {});
}

export default VanishSubscriber;
