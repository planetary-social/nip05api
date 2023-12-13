# nip05api

`nip05api` is a Node.js project implementing [NIP 05](https://github.com/nostr-protocol/nips/blob/master/05.md). It enables the association of Nostr public keys (in hex format) with human-readable names, improving the usability of the Nostr network by simplifying the process of discovering and identifying users.

## Getting Started

### Prerequisites
- Node.js
- Docker (for local Redis setup)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/planetary-social/nip05api.git
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Configuring the Environment
- Set `AUTH_PUBKEY` to the hexadecimal public key that matches the one used in the [NIP-98](https://github.com/nostr-protocol/nips/blob/master/98.md) authentication event. This public key should correspond to the private key used for signing the auth event.
- Set `ROOT_DOMAIN` (e.g., `nos.social`) to prevent treating subdomains that are part of the root domain as user names.
- Set `REDIS_HOST` to the Redis host you use.

### Running the Tests
Confirm the setup with:
```bash
pnpm test
```

### Starting Redis
Initialize Redis using Docker:
```bash
docker-compose up
```

## Usage
The application supports storing and retrieving Nostr NIP 05 data as follows:

### POST Endpoint Structure
```json
{
  "name": "username",
  "data": {
    "pubkey": "hex_public_key",
    "relays": ["relay_url_1", "relay_url_2"]
  }
}
```
*Note: The `pubkey` must be in hex format.*

## Authentication for POST Requests through NIP-98

To securely authenticate POST requests to the `nip05api` endpoint, utilize the [NIP-98](https://github.com/nostr-protocol/nips/blob/master/98.md) HTTP authentication method. This involves creating a signed Nostr event as per NIP 98 specifications, encoding it in base64, and including it in the `Authorization` header.

### Example Using `nak` for Command-Line Testing

`nak`, the [Nostr army knife](https://github.com/fiatjaf/nak), can be used to conveniently generate and encode these authentication events for command-line testing:

1. **Generate the Base64 Encoded Authentication Event**:
   Create a NIP-98 event using `nak` and encode it in base64.
   ```sh
   export BASE64_AUTH_EVENT=$(nak event --content='' --kind 27235 -t method='POST' -t u='http://nos.social/.well-known/nostr.json' --sec $SECRET_KEY | base64)
   ```

2. **Testing the Endpoint with Curl**:
   Send a POST request to your API including the NIP-98 authentication event in the `Authorization` header.
   ```sh
   curl http://localhost:3000/.well-known/nostr.json 
       -H "Host: nos.social" 
       -H "Content-Type: application/json" 
       -H "Authorization: Nostr $BASE64_AUTH_EVENT" 
       -d '{"name":"alice", "data": {"pubkey": "79ef92b9ebe6dc1e4ea398f6477f227e95429627b0a33dc89b640e137b256be5", "relays":["wss://relay.nos.social", "wss://relay.damus.io"]}}'
   ```

*Note: Replace `$SECRET_KEY` with your private key used for signing the event. The public key corresponding to this secret key should match the `AUTH_PUBKEY` value.*

This method demonstrates how to securely authenticate POST requests using the NIP-98 standard. In practice, the creation and encoding of these events would typically be integrated into your application's authentication flow.

## Contributing
Contributions are welcome! Fork the project, submit pull requests, or report issues.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
