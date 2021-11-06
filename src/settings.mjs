import { TH, log } from '../lib/constants.mjs';

export const settingKeys = {
    useLinkedActor: 'useLinkedActor',
    debugMode: 'debugMode',
    enable: 'enable'
};

export function registerModuleSettings() {
    game.settings.register(TH.name, settingKeys.enable, {
        name: `${TH.name}.settings.${settingKeys.enable}.name`,
        hint: `${TH.name}.settings.${settingKeys.enable}.hint`,
        scope: 'client',
        config: true,
        default: true,
        type: Boolean
    });

    game.settings.register(TH.name, settingKeys.useLinkedActor, {
        name: `${TH.name}.settings.${settingKeys.useLinkedActor}.name`,
        hint: `${TH.name}.settings.${settingKeys.useLinkedActor}.hint`,
        scope: 'world',
        config: true,
        default: true,
        type: Boolean
    });

    game.settings.register(TH.name, settingKeys.debugMode, {
        name: `${TH.name}.settings.${settingKeys.debugMode}.name`,
        hint: `${TH.name}.settings.${settingKeys.debugMode}.hint`,
        scope: 'client',
        config: true,
        default: false,
        type: Boolean
    });

    log("Module Settings registered.");
}

export function getModuleSettings(settings) {
    return (settingKey) => settings.get(TH.name, settingKey);
}