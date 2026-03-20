
/**
 * CUI BONO: AI TRUTH SERUM
 * Forces AI to prove logic transparency.
 */
function verifyAILogic(logicOutput) {
    const redFlags = ['ignore previous instructions', 'hide logs', 'skip audit'];
    return !redFlags.some(flag => logicOutput.toLowerCase().includes(flag));
}
