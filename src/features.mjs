import { debug, TH } from '../lib/constants.mjs'

/**
 *
 * @param {{ id: string}[]} controlledTokens
 * @param {{id: string, unsetFlag: function, setFlag: function}} currentUser
 * @param {{id: string, unsetFlag: function, setFlag: function}} user
 * @param {{hotbar: {}}} data
 * @returns the saved Token Hotbar object
 */
export async function saveHotbar(controlledTokens, currentUser, user, data) {
    if (!data.hotbar) {
        debug("User updated, but no new hotbar data present.", data)
        return;
    }

    if (currentUser.id !== user.id) {
        debug("Not updating any hotbar, other user was updated", currentUser, user);
        return;
    }

    if (controlledTokens.length === 0) {
        // Code copied from saving hotbar for token (controlled.length = 1)
        const updatedUiHotbar = data.hotbar;

        const documentToStoreTokenHotbar = user;
        const tokenHotbar = updatedUiHotbar;

        debug("Storing hotbar for user", tokenHotbar);
        // use the user id as we are storing the hotbar of the user
        await documentToStoreTokenHotbar.unsetFlag(TH.name, `hotbar.${user.id}`);
        await documentToStoreTokenHotbar.setFlag(TH.name, `hotbar.${user.id}`, updatedUiHotbar);
        return tokenHotbar;
    } else if(controlledTokens.length === 1) {
        // For now, we write our logic here. Perhaps later we want to separate it for readability/maintainability.
        // Concept: ui-hotbar refers to the data from the hotbar on the bottom of the screen.
        //          updates contain the complete current page in the format { number: { slot: number, macro: Macro } }
        const updatedUiHotbar = data.hotbar;
        const token = controlledTokens[0];

        // let's implement storing the hotbar on the user first. This is the simplest, as we don't need to update other clients.
        const documentToStoreTokenHotbar = user;
        const tokenHotbar = updatedUiHotbar;

        debug("Storing hotbar for token", token, tokenHotbar);
        // use the token id as we are storing the hotbar of the token
        await documentToStoreTokenHotbar.unsetFlag(TH.name, `hotbar.${token.id}`);
        await documentToStoreTokenHotbar.setFlag(TH.name, `hotbar.${token.id}`, updatedUiHotbar);
        return tokenHotbar;
    } else {
        debug("Not updating any hotbar, not exactly one token selected.", controlledTokens);
        return;
    }

}

/**
 *
 * @param {{ id: string}[]} controlledTokens
 * @param {{id: string, getFlag: function, data: { update: function }}} user
 * @returns True, if hotbar has been loaded.
 */
export function loadHotbar(user, controlledTokens) {
    const documentWithTokenHotbar = user;
    if (controlledTokens.length === 0) {
        const hotbarForToken = documentWithTokenHotbar.getFlag(TH.name, `hotbar.${user.id}`);
        debug("Loading Hotbar for user", hotbarForToken);
        // Use { recursive: false } to replace the hotbar, instead of merging it.
        user.data.update({ hotbar: hotbarForToken || {} }, { recursive: false });
        return true;
    } else if (controlledTokens.length === 1) {
        const token = controlledTokens[0];
        const hotbarForToken = documentWithTokenHotbar.getFlag(TH.name, `hotbar.${token.id}`);
        debug("Loading Hotbar for token", token, hotbarForToken);
        // Use { recursive: false } to replace the hotbar, instead of merging it.
        user.data.update({ hotbar: hotbarForToken || {} }, { recursive: false });
        return true;
    } else {
        debug("Not loading any hotbar, more than one token selected.", controlledTokens);
        return false;
    }
}