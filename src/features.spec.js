import { assert, it, describe } from "../lib/test.mjs";
import { saveHotbar } from '../src/features.mjs';
import { TH } from '../lib/constants.mjs';
import { loadHotbar } from "./features.mjs";

TH.debug.logs = false;

await describe("The Token Hotbar does not save when...", async () => {
    await it("multiple tokens are selected", async () => {
        var savedHotbar = await saveHotbar([1, 2], { id: 1 }, { id: 1 }, {hotbar: {}});
        assert(savedHotbar).equals(undefined);
    });

    await it("the data contains no hotbar data", async () => {
        var savedHotbar = await saveHotbar([1], { id: 1 }, { id: 1 }, {someOtherData: {}});
        assert(savedHotbar).equals(undefined);
    });

    await it("it's not the current user that was updated", async () => {
        var savedHotbar = await saveHotbar([1], { id: 1 }, { id: 2 }, {hotbar: {}});
        assert(savedHotbar).equals(undefined);
    });
});

await describe("The Token Hotbar saves when...", async () => {
    await it("a single token is selected and the hotbar was updated for the current user", async () => {
        let setHotbar, hotbarKey;
        const token = { id: 1 };
        const currentUser = { id: 3 };
        const user = {
            id: 3,
            setFlag: (scope, key, value) => { setHotbar = value; hotbarKey = key; },
            unsetFlag: () => {},
        };
        const data = { hotbar: { 1: { slot: 1, macro: { id: 2 } } } };
        var savedHotbar = await saveHotbar([ token ], currentUser, user, data);
        assert(savedHotbar).equals(setHotbar);
        assert(setHotbar).equals(data.hotbar);
        assert(hotbarKey).equals('hotbar.' + token.id);
    });
});

await describe("Loading the Token Hotbar...", async () => {
    await it("updates the ui hotbar", async () => {
        let updatedData;
        const updateUser = data => { updatedData = data; };
        const tokenHotbar = {
            "7": "PGOQX6B0kW7niMum",
            "42": "pQAy1QCUuNHYMFx8"
        };
        const getUserFlag = (scope, key) => {
            // using dots in flags allows to go into nested structures.
            // however, this does not work in plain js :(
            var keys = key.split('.');
            var flags = {
                [TH.name]: {
                    hotbar: {
                        'token-1': tokenHotbar,
                    }
                }
            }[scope];
            return keys.reduce((prev, curr) => { return prev[curr] }, flags);
        };
        const user = {
            getFlag: getUserFlag,
            unsetFlag: () => {},
            data: { update: updateUser },
            id: 'user-1'
        };

        let controlledTokens = [
            { id: 'token-1' }
        ];

        // Sanity check
        assert(user.getFlag('token-hotbar', 'hotbar.token-1')).equals(tokenHotbar);

        loadHotbar(user, controlledTokens);
        assert(updatedData).equals({ hotbar: tokenHotbar})
    });
});

await describe("The Token Hotbar is not loaded when...", async () => {
    await it("More than one token is controlled", async () => {
        let updatedData;
        const updateUser = data => { updatedData = data; };
        const tokenHotbar = {
            "7": "PGOQX6B0kW7niMum",
            "42": "pQAy1QCUuNHYMFx8"
        };
        const getUserFlag = (scope, key) => {
            // using dots in flags allows to go into nested structures.
            // however, this does not work in plain js :(
            var keys = key.split('.');
            var flags = {
                [TH.name]: {
                    hotbar: {
                        'token-1': tokenHotbar,
                    }
                }
            }[scope];
            return keys.reduce((prev, curr) => { return prev[curr] }, flags);
        };
        const user = {
            getFlag: getUserFlag,
            unsetFlag: () => {},
            data: { update: updateUser },
            id: 'user-1'
        };

        let controlledTokens = [
            { id: 'token-1' },
            { id: 'token-2' },
        ];

        const hasLoaded = await loadHotbar(user, controlledTokens);
        assert(hasLoaded).equals(false);
        assert(updatedData).equals(undefined);
    });
});