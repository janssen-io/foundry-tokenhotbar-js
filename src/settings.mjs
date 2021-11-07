import { TH, log, debug } from './constants.mjs';

export const settingKeys = {
    alwaysUseActor: 'alwaysUseActor',
    debugMode: 'debugMode'
};

export function registerModuleSettings(settings) {
    settings.register(TH.name, settingKeys.alwaysUseActor, {
        name: `${TH.name}.settings.${settingKeys.alwaysUseActor}.name`,
        hint: `${TH.name}.settings.${settingKeys.alwaysUseActor}.hint`,
        scope: 'world',
        config: true,
        default: true,
        type: Boolean
    });

    settings.register(TH.name, settingKeys.debugMode, {
        name: `${TH.name}.settings.${settingKeys.debugMode}.name`,
        hint: `${TH.name}.settings.${settingKeys.debugMode}.hint`,
        scope: 'client',
        config: true,
        default: false,
        type: Boolean,
        onChange: () => setDebugging(settings)
    });

    setDebugging(settings);

    log("Module Settings registered.");
}

export function getModuleSettings(settings) {
    return (settingKey) => settings.get(TH.name, settingKey);
}

function setDebugging(settings) {
    const isDebugging = settings.get(TH.name, settingKeys.debugMode);
    log("Debugging enabled?", isDebugging);
    TH.debug.logs = isDebugging;
}
