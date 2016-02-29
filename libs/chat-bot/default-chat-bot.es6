import ChatState from '../models/mysql/chatState.es6';
import OrderItem from '../models/mysql/orderItem.es6';
import ChatBotInterface from './chat-bot-interface.es6';

/* Chat states for this default bot implementation */
const chatStates = {
  start: 'Start',
  restaurants: 'Restaurants',
  items: 'Items',
  categories: 'Categories',
  mods: 'Mods',
  cart: 'Cart',
  cardInfo: 'CardInfo'
};

export default class DefaultChatBot extends ChatBotInterface {
  /**
   * Updates the chat bot state and state metadata for a user given the user command
   *
   * @param {number} userId: userId's state to update
   * @param {String} input: the user input
   * @returns {Promise}: the output of the state transition
   */
  updateState(userId, input) {
    throw new Error('Not implemented', userId, input, ChatState, OrderItem, chatStates);

    /*
      Something along the lines of

      1) Get ChatState for userId
      2) switch(ChatState.state) {
          case someState:
            do stuff to update ChatState object by calling _<state>Transition functions below
      }
     */
  }

  /**
   * @param {number} userId: userId of the chat state we want to create
   * @returns {Promise}: empty promise
   */
  initUserState(userId) {
    throw new Error('Not implemented', userId);
  }

  /**
   * Handles transitions from the start state
   *
   * @param {String} input: the user input
   * @returns {Promise}: output of the state transition
   * @private
   */
  _startTransition(input) {
    throw new Error('Not implemented', input);
  }

  /**
   * Handles transitions from the restaurant state
   *
   * @param {String} input: the user input
   * @returns {Promise}: output of the state transition
   * @private
   */
  _restaurantTransition(input) {
    throw new Error('Not implemented', input);
  }

  /**
   * Handles transitions from the items state
   *
   * @param {String} input: the user input
   * @returns {Promise}: output of the state transition
   * @private
   */
  _itemsTransition(input) {
    throw new Error('Not implemented', input);
  }

  /**
   * Handles transitions from the categories state
   *
   * @param {String} input: the user input
   * @returns {Promise}: output of the state transition
   * @private
   */
  _categoriesTransition(input) {
    throw new Error('Not implemented', input);
  }

  /**
   * Handles transitions from the mods state
   *
   * @param {String} input: the user input
   * @returns {Promise}: output of the state transition
   * @private
   */
  _modsTransition(input) {
    throw new Error('Not implemented', input);
  }

  /**
   * Handles transitions from the cart state
   *
   * @param {String} input: the user input
   * @returns {Promise}: output of the state transition
   * @private
   */
  _cartTransition(input) {
    throw new Error('Not implemented', input);
  }

  /**
   * Handles transitions when the input is stateless
   *
   * @param {String} input: the user input
   * @returns {Promise}: output of the state transition
   * @private
   */
  _handleStatelessInput(input) {
    throw new Error('Not implemented', input);
  }
}
