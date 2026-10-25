export interface FixPatch {
    patchId: string;
    originalCode: string;
    secureCode: string;
}

export function validatePatch(patch: Partial<FixPatch> | undefined): string | undefined {
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

export function isPatchCurrent(patch: Partial<FixPatch>, currentCode: string): boolean {
    return typeof patch.originalCode === 'string' && currentCode === patch.originalCode;
}
