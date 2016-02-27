
/**
 * Interface for the ChatBot
 */
export default class ChatBotInterface {
  constructor() {
    throw new Error('Not implemented');
  }

  /**
   * @param {number} userId: userId's state to update
   * @param {String} input: the user input
   * @returns {Promise}: the output of the state transition
   */
  updateState(userId, input) {
    throw new Error('Not implemented', userId, input);
  }

  /**
   * @param {number} userId: userId of the chat state we want to create
   * @returns {Promise}: empty promise
   */
  initUserState(userId) {
    throw new Error('Not implemented', userId);
  }

}
