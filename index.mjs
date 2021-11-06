import { TH, log } from './lib/constants.mjs';
import { saveHotbar } from './src/features.mjs';

// class BarLoader {
//     saveBar(page, document) { }

//     loadBar(page, document) { }
// }

// class DocumentSelector {
//     getDocument(settings) {
//         if (isUserBar) return game.user;
//         else if (isShared) return game.canvas.token.controlled[0];
//     }
// }

// // updateUser
// var loader = new BarLoader();
// var doc = new DocumentSelector();
// loader.saveBar(settings.page, doc.getDocument(settings));


log("Module Loaded!");

// Auto-enable hooks so we don't need to do so manually when reloading while developing.
// Do NOT disable the hooks if they were already enabled outside this module
// TODO: should probably remove this later or move it to a setting.
CONFIG.debug.hooks = CONFIG.debug.hooks || TH.debug.hooks;

// Let's save the hotbar whenever
//  - a token is selected
//  - the hotbar is changed

// We use the updateUser [updateDocument] hook
//  - It's fired whenever the user updates their hotbar
//  - It's not updated whenever the user views another page of their hotbar (unlike renderHotbar)
//  - It's sent to other clients
//  - There's no other hooks that contain the hotbar data that we need

Hooks.on("updateUser", (user, data) => {
    var controlledTokens = game.canvas.tokens.controlled;
    saveHotbar(controlledTokens, ui.hotbar, game.user, user, data);
});

// Let's load the hotbar when
//  - a single token is selected

// We use the controlToken [controlPlaceableObject] hook
//  - It's fired when a token is controlled (or let go)
Hooks.on("controlToken", (object, isControlled) => {
    const controlledTokens = game.canvas.tokens.controlled;
    loadHotbar(controlledTokens, ui.hotbar, game.user);
});