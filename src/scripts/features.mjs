import CONSTANTS from "./constants.mjs";
import { debug } from "./lib/lib.mjs";
import { settingKeys } from "./settings.mjs";

/**
 * Store the user's hotbar if it hasn't been stored yet.
 * @param {{id: string, unsetFlag: function, setFlag: function, getFlag: function}} user
 * @param {{ [number]: string }} hotbar
 */
export async function saveUserHotbarOnFirstUse(user, hotbar) {
	const documentWithHotbar = user;
	const entity = user;
	const tokenHotbar = documentWithHotbar.getFlag(CONSTANTS.MODULE_NAME, `${entity.id}`);
	// Bug fix: https://github.com/janssen-io/foundry-tokenhotbar-js/issues/7
	if (!tokenHotbar && !game.modules.get(CONSTANTS.CUSTOM_HOTBAR_MODULE_NAME)?.active) {
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
 * @param {{hotbar: {}}} userData
 * @returns the saved Token Hotbar object
 */
export async function updateHotbar(controlledTokens, currentUser, user, userData) {
	if (!userData.hotbar) {
		debug("User updated, but no new hotbar data present.", userData);
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

	const entity = determineEntityForHotbar(controlledTokens, user);
	const documentWithHotbar = user;
	await saveHotbar(userData.hotbar, documentWithHotbar, entity);
	return userData.hotbar;
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
	await documentWithHotbar.unsetFlag(CONSTANTS.MODULE_NAME, `${entity.id}`);
	await documentWithHotbar.setFlag(CONSTANTS.MODULE_NAME, `${entity.id}`, hotbarToStore);
}

/**
 *
 * @param {{ id: string, actor: { id: string }, document: object }[]} controlledTokens
 * @param {{id: string, getFlag: function, data: { update: function }}} user
 * @returns True, if hotbar has been loaded.
 */
export async function loadHotbar(user, controlledTokens) {
	if (controlledTokens.length > 1) {
		debug("Not loading any hotbar, more than one token selected.", controlledTokens);
		return false;
	}

	const documentWithHotbar = user;
	const entity = determineEntityForHotbar(controlledTokens, user);
	const hotbarForToken = documentWithHotbar.getFlag(CONSTANTS.MODULE_NAME, `${entity.id}`);

	debug(`Loading Hotbar for ${entity.constructor.name} from document`, {
		documentWithHotbar,
		entity,
		hotbarForToken,
	});

	// Use { recursive: false } to replace the hotbar, instead of merging it.
	// Bug fix : https://github.com/janssen-io/foundry-tokenhotbar-js/issues/5
	// user.update({hotbar: hotbarForToken || {},},{recursive: false,});
	await user.update({ hotbar: hotbarForToken || {} }, { diff: false, recursive: false, noHook: true });
	return true;
}

function determineEntityForHotbar(controlledTokens, user) {
	if (controlledTokens.length === 0) {
		// use the user id as we are storing the hotbar of the user
		return user;
	} else if (controlledTokens.length === 1) {
		const token = controlledTokens[0];
		// If the token is linked to an actor (e.g. PC)
		//    OR we always want to link hotbars to (synthetic) actors
		// Then use the actor to store the hotbar
		// Otherwise use the token
		return game.settings.get(CONSTANTS.MODULE_NAME, settingKeys.alwaysUseActor) || token.document.isLinked
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
 * @param {{flags: { customHotbar: {}}}} userData
 * @param {{getCustomHotbarMacros: function}} customHotbar
 * @returns the saved Token Hotbar object
 */
export async function updateCustomHotbar(controlledTokens, currentUser, user, userData, customHotbar) {
	if (!userData.flags[CONSTANTS.CUSTOM_HOTBAR_MODULE_NAME]) {
		debug("User updated, but no new custom hotbar data present.", userData);
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
		const macrosPerPage = pages.map((page) => customHotbar.getCustomHotbarMacros(page));

		// macrosPerPage => [ [ { slot: number, macro: Macro } ] ]
		const userData = macrosPerPage
			// => [ { slot: number, macro: Macro } ]
			.flat()
			// => { [number]: string }
			.reduce((prev, curr) => {
				prev[curr.slot] = curr.macro?.id;
				return prev;
			}, {});

		return userData;
	}

	const entity = determineEntityForHotbar(controlledTokens, user);
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
 * @param { { populator: { chbSetMacros: function } } }
 * @returns True, if hotbar has been loaded.
 */
export function loadCustomHotbar(user, controlledTokens, customHotbar) {
	if (controlledTokens.length > 1) {
		debug("Not loading any hotbar, more than one token selected.", controlledTokens);
		return false;
	}
	if (isUpdatingCustomHotbar) {
		debug("Already loading the Token Hotbar onto the Custom Hotbar");
		return false;
	}

	const documentWithHotbar = user;
	const entity = determineEntityForHotbar(controlledTokens, user);
	const hotbarForToken = documentWithHotbar.getFlag(CONSTANTS.MODULE_NAME, `${entity.id}`);

	debug(`Loading Custom Hotbar for ${entity.constructor.name} from document`, {
		documentWithHotbar,
		entity,
		hotbarForToken,
	});

	// We set 'isUpdatingCustomHotbar' to prevent the Token Hotbar from updating itself when
	// the flags from Custom Hotbar are updated (unset and then set).
	// When we do not do this, the Token Hotbar is cleared while loading it.
	isUpdatingCustomHotbar = true;
	customHotbar.populator.chbSetMacros(hotbarForToken || {}).then(() => (isUpdatingCustomHotbar = false));

	return true;
}

export function shareHotbar(userId) {
	if (!userId) {
		warn(`No userId is been Passed`, true);
	}
	const currentUser = game.users.get(userId);
	const userIds = Array.from(game.users.keys()).filter((id) => id !== currentUser.id);
	const users = userIds
		.map((id) => game.users.get(id))
		.map((u) => {
			return { id: u.id, name: u.name };
		});

	// const actorsWithHotbarIds = Object.keys(currentUser.getFlag(CONSTANTS.MODULE_NAME, "hotbar"));
	const actorsWithHotbarIds = Object.keys(getProperty(currentUser.flags, CONSTANTS.MODULE_NAME));
	const actors = actorsWithHotbarIds
		.map((id) => game.actors.get(id))
		.filter((x) => x)
		.map((actor) => {
			return { id: actor.id, name: actor.name };
		});

	const actorOptions = actors.reduce((acc, e) => (acc += `<option value="${e.id}">${e.name}</option>`), ``);
	const userOptions = users.reduce((acc, e) => (acc += `<option value="${e.id}">${e.name}</option>`), ``);

	const content = `<form>
		<div class="form-group">
			<label>User:</label>
			<select name="user">${userOptions}</select>
		</div>
		<div class="form-group">
			<label>Actor:</label>
			<select name="actor">${actorOptions}</select>
		</div>
	</form`;

	function shareHotbarCallback(html) {
		const userId = html.find('[name="user"]')[0].value;
		const actorId = html.find('[name="actor"]')[0].value;
		log(" MACRO | ", { userId, actorId });

		const hotbar = currentUser.getFlag("token-hotbar", `${actorId}`);
		const receivingUser = game.users.get(userId);
		const regardingActor = game.actors.get(actorId);

		log(" MACRO | ", { hotbar, receivingUser, regardingActor });
		game.modules.get("token-hotbar").api.saveHotbar(hotbar, receivingUser, regardingActor);
	}

	let d = new Dialog({
		title: "Share Hotbar",
		content: content,
		buttons: {
			share: {
				icon: '<i class="fas fa-check"></i>',
				label: "Share",
				callback: shareHotbarCallback,
			},
			cancel: {
				icon: '<i class="fas fa-times"></i>',
				label: "Cancel",
			},
		},
		default: "cancel",
	});

	d.render(true);
}
