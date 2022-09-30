import API from "./scripts/api.mjs";
import CONSTANTS from "./scripts/constants.mjs";
import {
	saveHotbar,
	updateHotbar,
	loadHotbar,
	updateCustomHotbar,
	loadCustomHotbar,
	saveUserHotbarOnFirstUse,
} from "./scripts/features.mjs";
import { log } from "./scripts/lib/lib.mjs";
import { registerSettings, settingKeys } from "./scripts/settings.mjs";

// Register settings when the game is properly initialized
// This is exactly what the 'init' hook is for:
Hooks.on("init", () => {
	const hasCustomHotbar = game.modules.get(CONSTANTS.CUSTOM_HOTBAR_MODULE_NAME)?.active;
	// registerSettings(game.settings, hasCustomHotbar);
	registerSettings(hasCustomHotbar);
	log("Module Initialized!");
});

Hooks.once("setup", function () {
	setApi(API);
});

Hooks.on("ready", () => {
	//if (game.settings.get(CONSTANTS.MODULE_NAME, settingKeys.useCustomHotbar) && !ui.customHotbar) {
	if (
		game.settings.get(CONSTANTS.MODULE_NAME, settingKeys.useCustomHotbar) &&
		game.modules.get(CONSTANTS.CUSTOM_HOTBAR_MODULE_NAME)?.active
	) {
		warn(
			"Settings use Norc's Custom Hotbar, but Norc's Custom Hotbar is not installed or enabled. Using standard hotbar instead."
		);
		game.settings.set(CONSTANTS.MODULE_NAME, settingKeys.useCustomHotbar, false);
	}
	saveUserHotbarOnFirstUse(game.user, game.user.hotbar);
});

// Let's save the hotbar whenever
//  - a token is selected
//  - the hotbar is changed

// We use the updateUser [updateDocument] hook
//  - It's fired whenever the user updates their hotbar
//  - It's not updated whenever the user views another page of their hotbar (unlike renderHotbar)
//  - It's sent to other clients
//  - There's no other hooks that contain the hotbar data that we need
Hooks.on("updateUser", (user, data) => {
	// Ignore if is hooked the update of the flags
	if (hasProperty(data.flags, CONSTANTS.MODULE_NAME)) {
		return;
	}

	const controlledTokens = game.canvas.tokens.controlled;
	// Bug fix: https://github.com/janssen-io/foundry-tokenhotbar-js/issues/8
	if (!game.settings.get(CONSTANTS.MODULE_NAME, settingKeys.enableHotbarByRole) !== "NONE") {
		const roleS = game.settings.get(CONSTANTS.MODULE_NAME, settingKeys.enableHotbarByRole);
		if (!game.user.hasRole(CONST.USER_ROLES[roleS])) {
			if (!game.user.isGM() && game.settings.get(CONSTANTS.MODULE_NAME, settingKeys.enableHotbar)) {
				warn(
					`You have enabled the Token Hotbar on this client but the GM has activated the module settings 'Enable Token Hotbar by role' to a value not equal to 'none'.`,
					true
				);
			}
			return;
		}
	}

	if (!game.settings.get(CONSTANTS.MODULE_NAME, settingKeys.enableHotbar)) {
		return;
	}

	if (game.settings.get(CONSTANTS.MODULE_NAME, settingKeys.useCustomHotbar) && ui.customHotbar) {
		updateCustomHotbar(controlledTokens, game.user, user, data, ui.customHotbar);
	} else {
		updateHotbar(controlledTokens, game.user, user, data);
	}
});

// Let's load the hotbar when
//  - a single token is selected

// We use the controlToken [controlPlaceableObject] hook
//  - It's fired when a token is controlled (or let go)

// We need to use a timeout, because going from one controlled token to another
// fires two hooks before we can complete our logic. We only care about the last one.

let controlTokenTimeout;
Hooks.on("controlToken", (object, isControlled) => {
	if (!game.settings.get(CONSTANTS.MODULE_NAME, settingKeys.enableHotbar)) {
		return;
	}

	if (controlTokenTimeout) {
		window.clearTimeout(controlTokenTimeout);
	}

	controlTokenTimeout = window.setTimeout(async () => {
		const controlledTokens = game.canvas.tokens.controlled;

		if (game.settings.get(CONSTANTS.MODULE_NAME, settingKeys.useCustomHotbar) && ui.customHotbar) {
			loadCustomHotbar(game.user, controlledTokens, ui.customHotbar);
		} else {
			if (await loadHotbar(game.user, controlledTokens)) {
				// Only re-render the hotbar, if it actually changed because of us
				ui.hotbar.render();
			}
		}
	}, 100);
});

// Note: we try to stay clear from global variables (game.canvas for example)
//       in our code. The functions in the hooks only take out the variables
//       from the global scope that we need. All other logic is in the rest of the code.
// This feels a bit weird, because thinking from the perspective of our feature,
// we often don't care about having multiple tokens controlled for example.
// But adding another layer also seems wrong. :(

// Finally, we would like to save from macro's, so sharing becomes easier.
// Easiest way to do that is to add a TokenHotbar object to the global scope
// window[CONSTANTS.name] = { saveHotbar };

/**
 * Initialization helper, to set API.
 * @param api to set to game module.
 */
export function setApi(api) {
	const data = game.modules.get(CONSTANTS.MODULE_NAME);
	data.api = api;
}
/**
 * Returns the set API.
 * @returns Api from games module.
 */
export function getApi() {
	const data = game.modules.get(CONSTANTS.MODULE_NAME);
	return data.api;
}
/**
 * Initialization helper, to set Socket.
 * @param socket to set to game module.
 */
export function setSocket(socket) {
	const data = game.modules.get(CONSTANTS.MODULE_NAME);
	data.socket = socket;
}
/*
 * Returns the set socket.
 * @returns Socket from games module.
 */
export function getSocket() {
	const data = game.modules.get(CONSTANTS.MODULE_NAME);
	return data.socket;
}
