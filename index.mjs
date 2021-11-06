import { TH, log } from './lib/constants.mjs';
import { saveHotbar, loadHotbar } from './src/features.mjs';

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
    saveHotbar(controlledTokens, game.user, user, data);
});

// Let's load the hotbar when
//  - a single token is selected

// We use the controlToken [controlPlaceableObject] hook
//  - It's fired when a token is controlled (or let go)
Hooks.on("controlToken", (object, isControlled) => {
    const controlledTokens = game.canvas.tokens.controlled;
    if(loadHotbar(game.user, controlledTokens)) {
        ui.hotbar.render();
    }
});

// Note: we try to stay clear from global variables (game.canvas for example)
//       in our code. The functions in the hooks only take out the variables
//       from the global scope that we need. All other logic is in the rest of the code.
// This feels a bit weird, because thinking from the perspective of our feature,
// we often don't care about having multiple tokens controlled for example.
// But adding another layer also seems wrong. :(