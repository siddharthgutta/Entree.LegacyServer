import EventEmitter from 'events';
import crypto from 'crypto';
import Loki from 'lokijs';
import exitHook from 'exit-hook';
import fs from 'fs';

const dbFile = 'accepted.cache.json';

export default class Slave extends EventEmitter {
  constructor(debug = true) {
    super();

    const db = new Loki();

    const accepted = db.addCollection('accepted');

    this.debug = debug;
    this.accepted = accepted;
    this.on('error', err => console.error(err));

    this._restore();

    exitHook(() => this._dump());
  }

  _restore() {
    try {
      const res = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

      this.accepted.insert(...res);
    } catch (e) {
      // ignore
    }
  }

  _dump() {
    const res = this.accepted.find();

    try {
      fs.writeFileSync(dbFile, JSON.stringify(res), 'utf8');
    } catch (e) {
      // ignore
    }
  }

  // privatizing
  _emit(...args) {
    return super.emit(...args);
  }

  tokens() {
    let tokens = [];

    for (const [, toks] of Object.entries(this.origins)) {
      tokens = tokens.concat(toks);
    }
  }

  accept(origin, token) {
    let res = this.accepted.findOne({token, origin});

    if (!res) {
      const uuid = crypto.randomBytes(20).toString('hex');

      // TODO ensure unique
      res = this.accepted.insert({origin, token, uuid});
    }

    return res.uuid;
  }

  isAccepted(uuid) {
    const res = this.accepted.findOne({uuid});
    return res && res.uuid;
  }

  originOf(uuid) {
    const res = this.accepted.findOne({uuid});
    return res;
  }

  uuidOf(origin, token) {
    origin = origin || '<stopper>';
    token = token || '<stopper>';

    const res = this.accepted.findOne({token, origin});

    return res && res.uuid;
  }

  reject(origin, token) {
    const res = this.accepted.findOne({token, origin});

    try {
      this.accepted.remove(res);

      return res.uuid;
    } catch (e) {
      // ignore
    }
  }

  log(...args) {
    if (this.debug) {
      console.log(...args);
    }
  }

  attach(server) {
    throw new Error('Not implemented', server);
  }

  emit(origin, token, channel, data) {
    throw new Error('Not implemented', origin, channel, token, data);
  }

  broadcast(origin, channel, data) {
    throw new Error('Not implemented', origin, channel, data);
  }
}
