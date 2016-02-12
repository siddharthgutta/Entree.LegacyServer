/**
 * Created by kfu on 2/11/16.
 */

export default class SocketTable {
  constructor(maxSocket, logging = false) {
    this.tokenDict = {};
    this.logging = logging;
  }

  log(message) {
    if (this.logging) {
      console.log(message);
    }
  }

  tokenExists(token) {
    return token in this.tokenDict ? true : false;
  }

  addToken(token) {
    if (!(token in this.tokenDict)) {
      this.log(`Added ${token} to SocketTable`);
      this.tokenDict[token] = [];
      return true;
    }
    this.log(`Token ${token} already exists in the table`);
    return false;
  }

  addSocket(token, socket) {
    if (!(token in this.tokenDict)) {
      this.log(`Trying to add socket, but ${token} token does not exist in SocketTable.`);
      return false;
    }

    this.log(`Successfully added socket to ${token} in table`);
    this.tokenDict[token].push(socket);
    return true;
  }

  removeSocket(token, socket) {
    if (!(token in this.tokenDict)) {
      this.log(`Trying to remove socket, but ${token} token does not exist in SocketTable.`);
      return false;
    }
    const index = this.tokenDict[token].indexOf(socket);
    if (index > -1) {
      this.log(`Successfully removed socket from ${token} in SocketTable`);
      this.tokenDict[token].splice(index, 1);
      return true;
    }
    this.log(`Trying to remove socket from ${token}, but socket does not exist there`);
    return false;
  }
}
