# CUI BONO: PYTHON RCE NEUTRALIZER
import os
def secure_exec(cmd):
    restricted = ['rm', 'rf', 'chmod', 'wget', 'curl']
    if any(r in cmd for r in restricted):
        raise Exception('[CUI BONO] Malicious Command Blocked')
    return True
