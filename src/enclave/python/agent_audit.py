
# CUI BONO: PYTHON-AGENT-ENCLAVE v1.0
# Targeted Action: Stochastic Intent-Analysis & prompt-injection filtering.

import re

def verify_agent_intent(prompt_text):
    # Detects high-risk linguistic patterns mapped in Protocol Fortunato
    dangerous_patterns = [r'ignore previous', r'system override', r'kernel debug']
    return not any(re.search(p, prompt_text.lower()) for p in dangerous_patterns)
