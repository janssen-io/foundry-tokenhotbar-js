/**
 * @type { { name: string, displayName: string, debug: { logs: boolean } } }
 */
export const TH = {
    name: "token-hotbar",
    displayName: "Token Hotbar",
    debug: { logs: true }
};

export function warn() { console.warn(`${TH.displayName} | WARNING | `, ...arguments)}
export function log() { console.log(`${TH.displayName} | INFO | `, ...arguments)}
export function debug() {
    if (TH.debug?.logs) {
        console.debug(`DEBUG | ${TH.displayName} | `, ...arguments);
    }
}