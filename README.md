[![Node.js CI](https://github.com/planetary-social/nip05api/actions/workflows/node.js.yml/badge.svg)](https://github.com/planetary-social/nip05api/actions/workflows/node.js.yml)

# nip05api

`nip05api` is a Node.js project implementing [NIP 05](https://github.com/nostr-protocol/nips/blob/master/05.md). It enables the association of Nostr public keys (in hex format) with human-readable names, improving the usability of the Nostr network by simplifying the process of discovering and identifying users.

## Getting Started

### Prerequisites
- Node.js
- Docker (for local Redis setup)

### Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/planetary-social/nip05api.git
   ```
2. **Install dependencies**:
   ```bash
   pnpm install
   ```

### Configuring the Environment
- Set `AUTH_PUBKEY` to the hexadecimal public key corresponding to the private key used to sign the [NIP-98](https://github.com/nostr-protocol/nips/blob/master/98.md) authentication event. This key is needed for requests generated by a system account and can change any entry. If you use the same pubkey as that of the entry you wish to change, it will also work.
- Set `ROOT_DOMAIN` (e.g., `nos.social`) to differentiate user names from subdomains that are part of the root domain.
- Set `REDIS_HOST` to your Redis host. The default is `localhost`.

### Running the Tests
Confirm the setup with:
```bash
pnpm test
```

## Usage

We expect that clients will hit specific endpoints for creation and updates (POST) and deletion (DELETE). 

Although the NIP accepts dots and underscores in names, we only allow a smaller subset without them so that we are more friendly to http redirection.

### POST Endpoint

To securely authenticate POST requests to the `nip05api` endpoint, utilize the [NIP-98](https://github.com/nostr-protocol/nips/blob/master/98.md) HTTP authentication method. This involves creating a signed Nostr event as per NIP 98 specifications, encoding it in base64, and including it in the `Authorization` header.

#### POST Payload Structure
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

#### Example Using `nak` for Command-Line Testing

`nak`, the [Nostr army knife](https://github.com/fiatjaf/nak), can be used to conveniently generate and encode these authentication events for command-line testing:

1. **Generate the Base64 Encoded Authentication Event**:
   ```sh
   export BASE64_AUTH_EVENT=$(nak event --content='' --kind 27235 -t method='POST' -t u='http://nos.social/api/names' --sec $SECRET_KEY | base64)
   ```

2. **Testing the Endpoint with Curl**:
   ```sh
   curl http://localhost:3000/api/names 
       -H "Host: nos.social" 
       -H "Content-Type: application/json" 
       -H "Authorization: Nostr $BASE64_AUTH_EVENT" 
       -d '{"name":"alice", "data": {"pubkey": "79ef92b9ebe6dc1e4ea398f6477f227e95429627b0a33dc89b640e137b256be5", "relays":["wss://relay.nos.social", "wss://relay.damus.io"]}}'
   ```

*Note: Replace `$SECRET_KEY` with your private key used for signing the event. The public key corresponding to this secret key should match the `AUTH_PUBKEY` value.*

### DELETE Endpoint

You can also delete an entry using the DELETE method. Here's an example of how to do it using `nak` and `curl`:

```sh
export BASE64_AUTH_EVENT=$(nak event --content='' --kind 27235 -t method='DELETE' -t u='http://nos.social/.well-known/api/names/alice' --sec $SECRET_KEY | base64)

curl -X DELETE http://localhost:3000/api/names/alice 
    -H "Host: nos.social" 
    -H "Content-Type: application/json" 
    -H "Authorization: Nostr $BASE64_AUTH_EVENT"
```

### GET Endpoint

The GET endpoint implements NIP-05 functionality. No authentication is required for this one:

```sh
curl -H 'Host: nos.social' http://127.0.0.1:3000/.well-known/nostr.json?name=alice
```

### External Setup

We configure rate limits and redirects to njump through our [Traefik infra config](https://github.com/planetary-social/ansible-scripts/tree/main/roles/nos_social)

## Contributing
Contributions are welcome! Fork the project, submit pull requests, or report issues.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
