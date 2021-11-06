import { assert, it } from "../lib/test.mjs";
import { saveHotbar } from '../src/features.mjs';

it("does not update if no token is selected", () => {
    var savedHotbar = saveHotbar([], {page: 5}, { id: 1 }, { id: 1 }, {hotbar: {}});
    assert(savedHotbar).equals({});
});

it("does not update if multiple tokens are selected", () => {
    var savedHotbar = saveHotbar([1, 2], {page: 5}, { id: 1 }, { id: 1 }, {hotbar: {}});
    assert(savedHotbar).equals({});
});

it("does not update if the data contains not hotbar data", () => {
    var savedHotbar = saveHotbar([1], {page: 5}, { id: 1 }, { id: 1 }, {someOtherData: {}});
    assert(savedHotbar).equals({});
});

it("does not update if we are not on the hotbar page", () => {
    var savedHotbar = saveHotbar([1], {page: 2}, { id: 1 }, { id: 1 }, {hotbar: {}});
    assert(savedHotbar).equals({});
});

it("does not update if it's not the current user that was updated", () => {
    var savedHotbar = saveHotbar([1], {page: 2}, { id: 1 }, { id: 2 }, {hotbar: {}});
    assert(savedHotbar).equals({});
});

it("saved the updated hotbar on the user, given the tokens id", () => {
    let setHotbar;
    const token = { id: 1 };
    const uiHotbar = { page: 5 };
    const currentUser = { id: 3 };
    const user = { id: 3, setFlag: (scope, key, value) => { setHotbar = value } };
    const data = { hotbar: { 1: { slot: 1, macro: { id: 2 } } } };
    var savedHotbar = saveHotbar([ token ], uiHotbar, currentUser, user, data);
    assert(savedHotbar).equals(setHotbar);
    assert(setHotbar).equals(data.hotbar);
});