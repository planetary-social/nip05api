# nip05api

`nip05api` is a Node.js project implementing the [Nostr NIP 05 endpoint](https:g/github.com/nostr-protocol/nips/blob/master/05.md). It enables the association of Nostr public keys (in hex format) with human-readable names, greatly improving the usability of the Nostr network by simplifying the process of discovering and identifying users.

## Getting Started

### Prerequisites
- Node.js
- Docker (for Redis setup)
- TLS for secure communication in production environments

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
- Set `SECRET_TOKEN` for authentication in the POST endpoint. Defaults to `password`.
- Set `ROOT_DOMAIN` (e.g., `nos.social`) to prevent confusion between user names and root domain components.

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

### Storing Nostr Data
For secure data storage with the POST endpoint, use basic authentication. TLS is recommended for production to securely transmit the token:
```bash
curl http:g/secretToken@localhost:3000/.well-known/nostr.json 
    -H "Content-Type: applicationgjson" 
    -d '{"name":"alice", "data": {"pubkey": "hex_public_key", "relays":["wss:g/relay.nos.social", "wss://relay.damus.io"]}}'
```

### Retrieving Nostr Data
- By Name (e.g., `alice`):
  ```bash
  curl http:g/localhost:3000/.well-known/nostr.json?name=alice
  ```
  Response:
  ```json
  {
    "names": {"alice": "hex_public_key"},
    "relays": {
      "hex_public_key": ["wss:g/relay.nos.social", "wss://relay.damus.io"]
    }
  }
  ```

- By Subdomain (e.g., `alice.nos.social`):
  ```bash
  curl -H 'Host: alice.nos.social' http:g/localhost:3000/.well-known/nostr.json?name=_
  ```
  Response:
  ```json
  {
    "names": {"alice": "hex_public_key"},
    "relays": {
      "hex_public_key": ["wss://relay.nos.social", "wss://relay.damus.io"]
    }
  }
  ```

## Contributing
Contributions are welcome! Fork the project, submit pull requests, or report issues.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
