import importlib.util
import pathlib
import unittest

MODULE_PATH = pathlib.Path(__file__).parents[1] / "src" / "cures" / "python-security-layer.py"
SPEC = importlib.util.spec_from_file_location("python_security_layer", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class SecureExecTests(unittest.TestCase):
    def test_string_command_is_refused(self):
        with self.assertRaisesRegex(PermissionError, "disabled"):
            MODULE.secure_exec("echo safe")

    def test_argument_sequence_is_refused(self):
        with self.assertRaisesRegex(PermissionError, "disabled"):
            MODULE.secure_exec(["echo", "safe"])

    def test_invalid_input_type_is_rejected(self):
        with self.assertRaises(TypeError):
            MODULE.secure_exec(None)


if __name__ == "__main__":
    unittest.main()
