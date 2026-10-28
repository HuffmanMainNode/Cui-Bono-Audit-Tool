"""CUI BONO command-execution safety boundary.

This module is not a sandbox. Until an isolated executor with a reviewed
command allowlist is implemented and tested, it fails closed.
"""


def secure_exec(cmd):
    """Refuse command execution rather than falsely reporting it as safe."""
    if not isinstance(cmd, (str, list, tuple)):
        raise TypeError("cmd must be a string or an argument sequence")
    raise PermissionError(
        "secure_exec is disabled: no hardened sandbox is implemented. "
        "Use an isolated runner with an explicit allowlist and least privilege."
    )
