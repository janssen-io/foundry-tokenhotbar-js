/**
 * @type { { name: string, displayName: string, debug: { hooks: boolean, logs: boolean } } }
 */
export const TH = {
    name: "token-hotbar",
    displayName: "Token Hotbar",
    debug: { hooks: true, logs: true }
};

export function log() { console.log(`${TH.displayName} | INFO | `, ...arguments)}
export function debug() {
    if (TH.debug?.logs) {
        console.debug(`DEBUG | ${TH.displayName} | `, ...arguments);
    }
}