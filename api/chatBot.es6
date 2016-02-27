import {DefaultChatBot} from '../libs/chat-bot';

/**
 * Updates the existing state of a user
 *
 * @param {number} userId: userId of the person's state that we want to update
 * @param {String} input: user input
 * @returns {Promise}: output of the state transition
 */
export function updateState(userId, input) {
  /* Some if condition to check which chat bot you want to use to handle this update */
  return DefaultChatBot.updateState(userId, input);
}

/**
 * Creates a new chat bot state for a newly registerd user
 * @param {number} userId: Id of user we want to create
 * @returns {Promise}: empty promise
 */
export function initUserState(userId) {
  return DefaultChatBot.initUserState(userId);
}
