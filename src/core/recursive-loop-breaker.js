
/**
 * CUI BONO: RECURSIVE-LOOP-BREAKER v1.0
 * Targeted Mitigation: Denial of Wallet & API Amplification.
 * Method: Recursive depth tracking and token-velocity limits for agent workflows.
 */
const LoopBreaker = {
    maxDepth: 5,
    workflowRegistry: new Map(),

    trackPulse(workflowId) {
        const currentCount = (this.workflowRegistry.get(workflowId) || 0) + 1;
        if (currentCount > this.maxDepth) {
            console.error(`🚨 [CUI BONO] DENIAL OF WALLET DETECTED: Terminating loop ${workflowId}`);
            this.workflowRegistry.delete(workflowId);
            throw new Error('RECURSIVE_TOOL_LOOP_NEUTRALIZED');
        }
        this.workflowRegistry.set(workflowId, currentCount);
        return true;
    }
};
export default LoopBreaker;
