import { assert, it, describe } from "../lib/test.mjs";
import { saveHotbar } from '../src/features.mjs';
import { TH } from '../lib/constants.mjs';
import { loadHotbar } from "./features.mjs";

TH.debug.logs = false;

describe("The Token Hotbar does not save when...", () => {
    it("no token is selected", () => {
        var savedHotbar = saveHotbar([], { id: 1 }, { id: 1 }, {hotbar: {}});
        assert(savedHotbar).equals(undefined);
    });

    it("multiple tokens are selected", () => {
        var savedHotbar = saveHotbar([1, 2], { id: 1 }, { id: 1 }, {hotbar: {}});
        assert(savedHotbar).equals(undefined);
    });

    it("the data contains no hotbar data", () => {
        var savedHotbar = saveHotbar([1], { id: 1 }, { id: 1 }, {someOtherData: {}});
        assert(savedHotbar).equals(undefined);
    });

    it("it's not the current user that was updated", () => {
        var savedHotbar = saveHotbar([1], { id: 1 }, { id: 2 }, {hotbar: {}});
        assert(savedHotbar).equals(undefined);
    });
});

describe("The Token Hotbar saves when...", () => {
    it("a single token is selected and the hotbar was updated for the current user", () => {
        let setHotbar, hotbarKey;
        const token = { id: 1 };
        const currentUser = { id: 3 };
        const user = { id: 3, setFlag: (scope, key, value) => { setHotbar = value; hotbarKey = key; } };
        const data = { hotbar: { 1: { slot: 1, macro: { id: 2 } } } };
        var savedHotbar = saveHotbar([ token ], currentUser, user, data);
        assert(savedHotbar).equals(setHotbar);
        assert(setHotbar).equals(data.hotbar);
        assert(hotbarKey).equals('hotbar.' + token.id);
    });
});

describe("Loading the Token Hotbar...", () => {
    it("updates the ui hotbar", () => {
        let updatedData;
        const updateUser = data => {
            updatedData = data;
        };
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