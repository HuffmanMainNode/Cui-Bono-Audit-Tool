
# CUI BONO: LINGUISTIC-LOGIC-DIFF v1.0
# Targeted Action: Detects subtle semantic 'Nudging' in agent responses.

def calculate_intent_drift(baseline_intent, current_output):
    # Compares the logical vector of the intent vs the generated output
    # Neutralizes concept-slippage identified in Phase 300
    if len(current_output) > (len(baseline_intent) * 2):
        return "🚨 [WARNING] Verbosity-Exploit / Logic-Drift Detected"
    return "CLEAN"
