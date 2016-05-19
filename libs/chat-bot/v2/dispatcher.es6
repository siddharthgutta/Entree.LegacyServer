/**
 * Created by jadesym on 5/18/16.
 */

export class ChatBotDispatcher {
  constructor() {

  }

  _registerBot(BotImpl) {
    const bot = {bot: BotImpl, adapters, actions, extras};
    this.bots.set(_getBotInfo(BotImpl), bot);
  }

  _getBotInfo(BotImpl) {
    return {name: BotImpl.name, version: BotImpl.version};
  }
}