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

function log(msg) { console.log("Token Hotbar | INFO | " + msg)}
function debug(msg) { console.log("Token Hotbar | DEBG | " + msg)}

log("Module Loaded!");