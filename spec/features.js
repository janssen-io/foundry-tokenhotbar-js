import { assert, it } from "../lib/test.mjs";
import { saveHotbar } from '../features.mjs';

it("does not update if no token is selected", () => {
    var savedHotbar = saveHotbar([], {}, {hotbar: {}});
    assert(savedHotbar).equals({});
});

it("does not update if multiple tokens are selected", () => {
    var savedHotbar = saveHotbar([1,2], {}, {hotbar: {}});
    assert(savedHotbar).equals({});
});

it("does not update if multiple the data contains not hotbar data", () => {
    var savedHotbar = saveHotbar([], {}, {notTheHotbarData: {}});
    assert(savedHotbar).equals({});
});