# Experimental

Provides TCP and Local strategies (`IPC.allowRemote`). This is an sandbox environment for perf. and memory benchmarking. Expect this branch to be mercurial. I recommend using `socket-master` and `socket-test`.

## Stability - 3

## Test Setup

- total of 10000 messages
- up to 1 minute for acknowledgment
- 50 concurrent ipc requests per second (to reduce any choking in `node-ipc` library)
- `volatile`: server does not receive any acknowledgement from the client. This is not true volatile, so it maybe be faster in the future.
- `callback`: server uses callback strategies instead of Promises
- tested on MacBook Pro 13" (2.6 Ghz i5)
- with logging

### Multi Client (100 clients)

- serial: 10 messages/s
- parallel: 10 messages/s
- parallel (volatile): 15 messages/s
- parallel (callbacks): 25 messages/s

### Single Client

- serial: 450 messages/s
- parallel: 1000 messages/s
- parallel (volatile): 2200 messages/s

# Installation

```sh
npm install eslint@1.10.3 eslint-config-airbnb@4.0.0 eslint-plugin-markdown@1.0.0-beta.1 eslint-plugin-mocha@1.1.0 eslint-plugin-react@3.16.1
```