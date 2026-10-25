"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePatch = validatePatch;
exports.isPatchCurrent = isPatchCurrent;
function validatePatch(patch) {
    if (!patch?.patchId || typeof patch.patchId !== 'string') {
        return 'GuardRail AI returned a patch without an ID.';
    }
    if (typeof patch.originalCode !== 'string' || typeof patch.secureCode !== 'string') {
        return 'GuardRail AI returned an incomplete patch.';
    }
    if (!patch.secureCode.trim() || patch.secureCode === patch.originalCode) {
        return 'GuardRail AI returned an empty patch.';
    }
    return undefined;
}
function isPatchCurrent(patch, currentCode) {
    return typeof patch.originalCode === 'string' && currentCode === patch.originalCode;
}
//# sourceMappingURL=patch-application.js.map