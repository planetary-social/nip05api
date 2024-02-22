export default class NameRecord {
  constructor(name, pubkey, relays = []) {
    this.name = name;
    this.pubkey = pubkey;
    this.relays = relays;
  }
}
