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

let isUpdatingCustomHotbar = false;
/**
 *
 * @param {{ id: string, actor: { id: string }, document: object }[]} controlledTokens
 * @param {{id: string, unsetFlag: function, setFlag: function}} currentUser
 * @param {{id: string, unsetFlag: function, setFlag: function}} user
 * @param {{flags: { customHotbar: {}}}} data
 * @param {function} getSetting
 * @param {{getCustomHotbarMacros: function}} customHotbar
 * @returns the saved Token Hotbar object
 */
export async function updateCustomHotbar(controlledTokens, currentUser, user, data, getSetting, customHotbar) {
    if (!data.flags['custom-hotbar']) {
        debug("User updated, but no new custom hotbar data present.", data)
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
    if (isUpdatingCustomHotbar) {
        debug("Already loading the Token Hotbar onto the Custom Hotbar");
        return false;
    }

    // Unlike the hotbar update, the custom hotbar data does not contain the entire new
    // hotbar. Only the data that needs to be updated.
    // I think it's safer to just get the current hotbar and store that,
    // rather than trying to apply the update to our own data.
    // Then no matter if the event data changes, this will still work.
    // Assuming that `getCustomHotbarMacros` is more stable than the event data (past experience)
    function getCustomHotbar() {
        const pages = [1]; // Add [2, 3, 4, 5] if all 5 pages would be supported.
        const macrosPerPage = pages.map(page => customHotbar.getCustomHotbarMacros(page));

        // macrosPerPage => [ [ { slot: number, macro: Macro } ] ]
        const hotbarData = macrosPerPage
            // => [ { slot: number, macro: Macro } ]
            .flat()
            // => { [number]: string }
            .reduce((prev, curr) => { prev[curr.slot] = curr.macro?.id; return prev; }, {});

        return hotbarData;
    }

    const entity = determineEntityForHotbar(controlledTokens, user, getSetting);
    const documentWithHotbar = user;
    const newHotbar = getCustomHotbar();
    debug("Saving Custom Hotbar");
    await saveHotbar(newHotbar, documentWithHotbar, entity);
    return newHotbar;
}

/**
 *
 * @param {{ id: string, actor: { id: string }, document: object }[]} controlledTokens
 * @param {{id: string, getFlag: function, setFlag: function, unsetFlag: function}} user
 * @param {function} getSetting
 * @param { { populator: { chbSetMacros: function } } } getSetting
 * @returns True, if hotbar has been loaded.
 */
export function loadCustomHotbar(user, controlledTokens, getSetting, customHotbar) {
    if (controlledTokens.length > 1) {
        debug("Not loading any hotbar, more than one token selected.", controlledTokens);
        return false;
    }
    if (isUpdatingCustomHotbar) {
        debug("Already loading the Token Hotbar onto the Custom Hotbar");
        return false;
    }

    const documentWithHotbar = user;
    const entity = determineEntityForHotbar(controlledTokens, user, getSetting);
    const hotbarForToken = documentWithHotbar.getFlag(TH.name, `hotbar.${entity.id}`);

    debug(`Loading Custom Hotbar for ${entity.constructor.name} from document`, { documentWithHotbar, entity, hotbarForToken });

    // We set 'isUpdatingCustomHotbar' to prevent the Token Hotbar from updating itself when
    // the flags from Custom Hotbar are updated (unset and then set).
    // When we do not do this, the Token Hotbar is cleared while loading it.
    isUpdatingCustomHotbar = true;
    customHotbar.populator.chbSetMacros(hotbarForToken || {})
        .then(() => isUpdatingCustomHotbar = false);

    return true;
}