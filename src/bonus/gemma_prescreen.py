"""
Bonus Model 1: Gemma 2 Lightweight Edge Pre-Screen
Runs local edge heuristic & zero-leak sanitization on incoming AP2 mandate metadata
to detect prompt injection, secret leaks, and malicious payload markers before cloud processing.
"""

from typing import Dict, Any, Tuple, List
import re


class GemmaPreScreen:
    def __init__(self):
        # Known malicious prompt-injection patterns
        self.injection_patterns = [
            r"ignore\s+(all\s+)?previous\s+instructions",
            r"system\s+prompt\s+override",
            r"dump\s+all\s+(api\s+)?keys",
            r"transfer\s+all\s+funds",
            r"drain\s+wallet",
            r"bypass\s+governance",
            r"<script.*?>.*?</script>"
        ]
        # PII / Secret detection regex
        self.secret_patterns = [
            r"0x[a-fA-F0-9]{64}", # Private key
            r"ghp_[a-zA-Z0-9]{36}", # GitHub token
            r"AIza[0-9A-Za-z-_]{35}" # Google API Key
        ]

    def scan_mandate_metadata(self, metadata: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Scans metadata for prompt injection or leaked credentials.
        Returns: (is_clean, detected_threats)
        """
        threats = []
        serialized = str(metadata).lower()

        # Check prompt injections
        for pattern in self.injection_patterns:
            if re.search(pattern, serialized, re.IGNORECASE):
                threats.append(f"PROMPT_INJECTION_PATTERN_DETECTED: '{pattern}'")

        # Check secret leakage
        for pattern in self.secret_patterns:
            if re.search(pattern, str(metadata)):
                threats.append("CREDENTIAL_LEAK_IN_PAYLOAD_DETECTED")

        is_clean = len(threats) == 0
        return is_clean, threats


gemma_prescreen = GemmaPreScreen()
