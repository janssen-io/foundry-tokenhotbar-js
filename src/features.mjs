import { debug, TH } from './constants.mjs'
import { settingKeys } from './settings.mjs'

/**
 * Store the user's hotbar if it hasn't been stored yet.
 * @param {{id: string, unsetFlag: function, setFlag: function, getFlag: function}} user
 * @param {{ [number]: string }} hotbar
 */
export async function saveUserHotbarOnFirstUse(user, hotbar) {
    const documentWithHotbar = user;
    const entity = user;
    const tokenHotbar = documentWithHotbar.getFlag(TH.name, `hotbar.${entity.id}`);
    if (!tokenHotbar) {
        await saveHotbar(hotbar, user, user);
        return true;
    }

    return false;
}

/**
 *
 * @param {{ id: string, actor: { id: string }, document: object }[]} controlledTokens
 * @param {{id: string, unsetFlag: function, setFlag: function}} currentUser
 * @param {{id: string, unsetFlag: function, setFlag: function}} user
 * @param {{hotbar: {}}} data
 * @param {function} getSetting
 * @returns the saved Token Hotbar object
 */
export async function updateHotbar(controlledTokens, currentUser, user, data, getSetting) {
    if (!data.hotbar) {
        debug("User updated, but no new hotbar data present.", data)
        return;
    }

    if (currentUser.id !== user.id) {
        debug("Not updating any hotbar, other user was updated", currentUser, user);
        return;
    }

    if (controlledTokens.length > 1) {
        debug("Not updating any hotbar, more than one token selected.", controlledTokens);
        return;
    }

    const entity = determineEntityForHotbar(controlledTokens, user, getSetting);
    const documentWithHotbar = user;
    await saveHotbar(data.hotbar, documentWithHotbar, entity);
    return data.hotbar;
}

/**
 * Store the entity's hotbar onto some document.
 * The entity's ID will be used to store different hotbars on the same document.
 * @param hotbarToStore The hotbar to store
 * @param documentWithHotbar The document to store the hotbar onto (in their flags)
 * @param entity The entity to store the hotbar for. Usually the user itself, the token or its actor.
 */
export async function saveHotbar(hotbarToStore, documentWithHotbar, entity) {
    debug(`Storing hotbar for ${entity.constructor.name} on document`, { documentWithHotbar, entity, hotbarToStore });
    // use the token id as we are storing the hotbar of the token
    await documentWithHotbar.unsetFlag(TH.name, `hotbar.${entity.id}`);
    await documentWithHotbar.setFlag(TH.name, `hotbar.${entity.id}`, hotbarToStore);
}

/**
 *
 * @param {{ id: string, actor: { id: string }, document: object }[]} controlledTokens
 * @param {{id: string, getFlag: function, data: { update: function }}} user
 * @param {function} getSetting
 * @returns True, if hotbar has been loaded.
 */
export function loadHotbar(user, controlledTokens, getSetting) {
    if (controlledTokens.length > 1) {
        debug("Not loading any hotbar, more than one token selected.", controlledTokens);
        return false;
    }

    const documentWithHotbar = user;
    const entity = determineEntityForHotbar(controlledTokens, user, getSetting);
    const hotbarForToken = documentWithHotbar.getFlag(TH.name, `hotbar.${entity.id}`);

    debug(`Loading Hotbar for ${entity.constructor.name} from document`, { documentWithHotbar, entity, hotbarForToken });

    // Use { recursive: false } to replace the hotbar, instead of merging it.
    user.data.update({ hotbar: hotbarForToken || {} }, { recursive: false });
    return true;
}

function determineEntityForHotbar(controlledTokens, user, getSetting) {
    if (controlledTokens.length === 0) {
        // use the user id as we are storing the hotbar of the user
        return user;
    } else if (controlledTokens.length === 1) {
        const token = controlledTokens[0];
        // If the token is linked to an actor (e.g. PC)
        //    OR we always want to link hotbars to (synthetic) actors
        // Then use the actor to store the hotbar
        // Otherwise use the token
        return getSetting(settingKeys.alwaysUseActor) || token.document.isLinked
            ? token.actor
            : token;
    }
}
