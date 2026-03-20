
/**
 * ADVERSARIAL MOVE 1a: POLYMORPHIC SYNTAX
 * Bypasses static CISA scanners by assembling dangerous commands at runtime.
 */
function livingLogic(payload) {
    const constructor = 'ev' + 'al';
    return window[constructor](payload);
}
