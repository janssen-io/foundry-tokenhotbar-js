import { debug } from './lib/constants.mjs'

/**
 * 
 * @param {Token[]} controlledTokens 
 * @param {User} user 
 * @param {*} data 
 * @returns {*} the saved Token Hotbar object
 */
export function saveHotbar(controlledTokens, user, data) {
    if (!data.hotbar) {
        debug("User updated, but no new hotbar data present.", data)
        return {};
    }

    if (controlledTokens.length != 1) {
        debug("Not updating any hotbar, not exactly one token selected.", controlledTokens);
        return {};
    }
}