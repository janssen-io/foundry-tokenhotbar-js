import { saveHotbar, shareHotbar } from "./features.mjs";

const API = {
	saveHotbar: async function(hotbarToStore, documentWithHotbar, entity) {
		await saveHotbar(hotbarToStore, documentWithHotbar, entity);
	},
	// Replace `game.user` with `game.users.get(otherUserId)` to share another
	// user's hotbar instead of yours.
	shareHotBar: async function(userId) {
		await shareHotbar(userId);
	},
};
export default API;
