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

function log() { console.log("Token Hotbar | INFO | ", ...arguments)}
function debug() { if (TH_DEBUG?.logs) console.log("Token Hotbar | DEBG | ", ...arguments) }

log("Module Loaded!");

// Let's define some useful constants first:
const TH_NAME = "token-hotbar";
const TH_DEBUG = { hooks: true, logs: true };

// So we don't have to enable it on reloads for now.
// TODO: should probably remove this later.
CONFIG.debug.hooks = TH_DEBUG.hooks;

// Debug hooks if we are debugging
// Let's save the hotbar whenever
//  - a token is selected
//  - the hotbar is changed

// We use the updateUser hook
//  - It's updated whenever the user updates their hotbar
//  - It's not updated whenever the user views another page of their hotbar (unlike renderHotbar)
//  - It's sent to other clients
//  - There's no other hooks that contain the hotbar data that we need

Hooks.on("updateUser", (user, data) => {
    if (!data.hotbar) {
        debug("User updated, but no new hotbar data present.", data)
        return;
    }

    var controlledTokens = game.canvas.tokens.controlled;
    if (controlledTokens.length != 1) {
        debug("Not updating any hotbar, not exactly one token selected.", controlledTokens);
    }
});