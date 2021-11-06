import { debug, TH } from '../lib/constants.mjs'

/**
 *
 * @param {{ id: string}[]} controlledTokens
 * @param {page: number} uiHotbar
 * @param {{id: string, setFlag: function}} currentUser
 * @param {{id: string, setFlag: function}} user
 * @param {{hotbar: {}}} data
 * @returns the saved Token Hotbar object
 */
export function saveHotbar(controlledTokens, uiHotbar, currentUser, user, data) {
    if (!data.hotbar) {
        debug("User updated, but no new hotbar data present.", data)
        return undefined;
    }

    if (controlledTokens.length !== 1) {
        debug("Not updating any hotbar, not exactly one token selected.", controlledTokens);
        return undefined;
    }

    if (currentUser.id !== user.id) {
        debug("Not updating any hotbar, other user was updated", currentUser, user);
        return undefined;
    }

    // For now, we write our logic here. Perhaps later we want to separate it for readability/maintainability.
    // Concept: ui-hotbar refers to the data from the hotbar on the bottom of the screen.
    //          updates contain the complete current page in the format { number: { slot: number, macro: Macro } }
    const updatedUiHotbar = data.hotbar;
    const token = controlledTokens[0];

    // let's implement storing the hotbar on the user first. This is the simplest, as we don't need to update other clients.
    const documentToStoreTokenHotbar = user;
    const tokenHotbar = updatedUiHotbar;

    documentToStoreTokenHotbar.setFlag(TH.name, `hotbar.${token.id}`, updatedUiHotbar);

    return tokenHotbar;
}