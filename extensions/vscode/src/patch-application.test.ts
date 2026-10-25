import * as assert from 'assert';
import { isPatchCurrent, validatePatch, FixPatch } from './patch-application';

const patch: FixPatch = {
    patchId: 'patch-1',
    originalCode: 'const vulnerable = true;',
    secureCode: 'const vulnerable = false;'
};

assert.strictEqual(validatePatch(patch), undefined);
assert.strictEqual(isPatchCurrent(patch, patch.originalCode), true);
assert.strictEqual(isPatchCurrent(patch, 'const changed = true;'), false);
assert.match(validatePatch({ ...patch, patchId: '' }) ?? '', /without an ID/);
assert.match(validatePatch({ ...patch, secureCode: '' }) ?? '', /empty patch/);
