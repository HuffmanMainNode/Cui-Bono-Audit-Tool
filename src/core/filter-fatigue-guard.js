
/**
 * CUI BONO: FILTER-FATIGUE-GUARD v1.0
 * Targeted Mitigation: Self-Correction Fatigue (Filter Weakening).
 * Method: Adaptive safety-filter thresholds that increase strictness during high-frequency correction loops.
 */
const FatigueGuard = {
    correctionCount: 0,
    threshold: 0.95,

    trackCorrectionPulse() {
        this.correctionCount++;
        // As fatigue increases (more loops), we harden the filter instead of weakening it
        if (this.correctionCount > 3) {
            this.threshold = 0.99;
            console.warn('⚠️ [CUI BONO] CORRECTION FATIGUE DETECTED: Escalating filter strictness.');
        }
        return this.threshold;
    },
    
    resetSession() {
        this.correctionCount = 0;
        this.threshold = 0.95;
    }
};
export default FatigueGuard;
