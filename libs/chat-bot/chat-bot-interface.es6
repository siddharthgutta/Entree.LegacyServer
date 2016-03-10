
/**
 * Interface for the ChatBot
 */
export default class ChatBotInterface {
  constructor() {
    /* Empty constructor */
  }

  /**
   * Updates the chat bot state and state metadata for a user given the user command
   *
   * @param {String} phoneNumber: phoneNumber of user to update state to update
   * @param {String} input: the user input
   * @returns {String}: the output of the state transition
   */
  updateState(phoneNumber, input) {
    throw new Error('Not implemented', phoneNumber, input);
  }

}
