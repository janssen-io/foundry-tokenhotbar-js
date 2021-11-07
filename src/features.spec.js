import { assert, it, describe } from "../lib/test.mjs";
import { TH } from './constants.mjs';
import { saveUserHotbarOnFirstUse } from "./features.mjs";
import { saveHotbar, loadHotbar } from "./features.mjs";
import { settingKeys } from "./settings.mjs";

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
        const token = { id: 1, document: { isLinked: undefined } }; // isLinked does not matter for this test
        const currentUser = { id: 3 };
        const user = {
            id: 3,
            setFlag: (scope, key, value) => { setHotbar = value; hotbarKey = key; },
            unsetFlag: () => {},
        };
        const data = { hotbar: { 1: { slot: 1, macro: { id: 2 } } } };
        const getSetting = k => {
            return {
                [settingKeys.alwaysUseActor]: false
            }[k];
        };
        var savedHotbar = await saveHotbar([ token ], currentUser, user, data, getSetting);
        assert(savedHotbar).equals(setHotbar);
        assert(setHotbar).equals(data.hotbar);
        assert(hotbarKey).equals('hotbar.' + token.id);
    });

    await it("the token is linked to an actor", async () => {
        let setHotbar, hotbarKey;
        const actor = { id: 'actor-1' };
        const token = { id: 'token-1', document: { isLinked: true }, actor }; // isLinked does not matter for this test
        const currentUser = { id: 3 };
        const user = {
            id: 3,
            setFlag: (scope, key, value) => { setHotbar = value; hotbarKey = key; },
            unsetFlag: () => {},
        };
        const data = { hotbar: { 1: { slot: 1, macro: { id: 2 } } } };
        const getSetting = k => {
            return {
                [settingKeys.alwaysUseActor]: false
            }[k];
        };
        var savedHotbar = await saveHotbar([ token ], currentUser, user, data, getSetting);
        assert(savedHotbar).equals(setHotbar);
        assert(setHotbar).equals(data.hotbar);
        assert(hotbarKey).equals('hotbar.' + actor.id);
    });

    await it("the token is not linked to an actor, but we always use the actor", async () => {
        let setHotbar, hotbarKey;
        const actor = { id: 'actor-1' };
        const token = { id: 'token-1', document: { isLinked: false }, actor }; // isLinked does not matter for this test
        const currentUser = { id: 3 };
        const user = {
            id: 3,
            setFlag: (scope, key, value) => { setHotbar = value; hotbarKey = key; },
            unsetFlag: () => {},
        };
        const data = { hotbar: { 1: { slot: 1, macro: { id: 2 } } } };
        const getSetting = k => {
            return {
                [settingKeys.alwaysUseActor]: true // Vital for this test
            }[k];
        };
        var savedHotbar = await saveHotbar([ token ], currentUser, user, data, getSetting);
        assert(savedHotbar).equals(setHotbar);
        assert(setHotbar).equals(data.hotbar);
        assert(hotbarKey).equals('hotbar.' + actor.id);
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
            { id: 'token-1', document: { isLinked: false } }
        ];

        const getSetting = k => {
            return {
                [settingKeys.alwaysUseActor]: false
            }[k];
        };
        // Sanity check
        assert(user.getFlag('token-hotbar', 'hotbar.token-1')).equals(tokenHotbar);

        loadHotbar(user, controlledTokens, getSetting);
        assert(updatedData).equals({ hotbar: tokenHotbar})
    });

    await it("shows the same macros for linked actors", async () => {
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
                        'actor-1': tokenHotbar,
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

        const actor = { id: 'actor-1' };
        let controlledTokens = [
            { id: 'token-1', document: { isLinked: true }, actor }
        ];
        const getSetting = k => {
            return {
                [settingKeys.alwaysUseActor]: false
            }[k];
        };

        loadHotbar(user, controlledTokens, getSetting);
        assert(updatedData).equals({ hotbar: tokenHotbar})
    });
});

await describe("The Token Hotbar is not loaded when...", async () => {
    await it("more than one token is controlled", async () => {
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

await describe("On initialization the user's hotbar is...", async () => {
    await it("not saved if it already was saved before", async () => {
        let setHotbar, hotbarKey;
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
                        'user-1': tokenHotbar,
                    }
                }
            }[scope];
            return keys.reduce((prev, curr) => { return prev[curr] }, flags);
        };
        const user = {
            getFlag: getUserFlag,
            unsetFlag: () => {},
            setFlag: (scope, key, value) => { setHotbar = value; hotbarKey = key; },
            id: 'user-1'
        };

        const hasSaved = await saveUserHotbarOnFirstUse(user, tokenHotbar);
        assert(hasSaved).equals(false);
        assert(setHotbar).equals(undefined);
    });

    await it("saved if it was not saved before", async () => {
        let setHotbar, hotbarKey;
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
                        'user-1': setHotbar,
                    }
                }
            }[scope];
            return keys.reduce((prev, curr) => { return prev[curr] }, flags);
        };
        const user = {
            getFlag: getUserFlag,
            unsetFlag: () => {},
            setFlag: (scope, key, value) => { setHotbar = value; hotbarKey = key; },
            id: 'user-1'
        };

        const hasSaved = await saveUserHotbarOnFirstUse(user, tokenHotbar);
        assert(hasSaved).equals(true);
        assert(setHotbar).equals(tokenHotbar);
    });
});