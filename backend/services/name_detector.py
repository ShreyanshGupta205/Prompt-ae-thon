"""
Name Detection Engine for Resonance.
Matches user names and configured nickname variants using strict word-boundary
regular expressions and normalized text to eliminate substring false positives.
"""
import re
from typing import List, Optional, Tuple, Dict, Any

class NameDetector:
    def __init__(self, primary_name: str = "Aman", nicknames: Optional[List[str]] = None):
        self.primary_name = primary_name
        self.nicknames = nicknames or []
        self._compiled_patterns = []
        self._compile_patterns()

    def update_names(self, primary_name: str, nicknames: List[str]):
        """Updates user name and nickname list and recompiles regexes."""
        self.primary_name = primary_name.strip()
        self.nicknames = [n.strip() for n in nicknames if n.strip()]
        self._compile_patterns()

    def _compile_patterns(self):
        """Compiles word-boundary regex patterns for all active name variants."""
        names_to_match = set()
        if self.primary_name:
            names_to_match.add(self.primary_name)
        for n in self.nicknames:
            if n:
                names_to_match.add(n)

        self._compiled_patterns = []
        for name in sorted(names_to_match, key=len, reverse=True):
            # Escape regex special characters in name
            escaped_name = re.escape(name)
            # Use negative lookbehind and lookahead or \b word boundary to avoid substring matches
            # e.g. \bAman\b will match "Hey Aman!" but not "dramatic" or "amalgam"
            pattern = re.compile(rf'(?<!\w){escaped_name}(?!\w)', re.IGNORECASE)
            self._compiled_patterns.append((name, pattern))

    def detect(self, text: str) -> Optional[Dict[str, Any]]:
        """
        Scans input caption text for any configured name or nickname.
        Returns match dict if found, or None if no match.
        """
        if not text or not self._compiled_patterns:
            return None

        for original_name, pattern in self._compiled_patterns:
            match = pattern.search(text)
            if match:
                start, end = match.span()
                matched_text = match.group(0)

                # Extract local snippet context (approx 50 chars before and after)
                context_start = max(0, start - 40)
                context_end = min(len(text), end + 40)
                context_str = text[context_start:context_end].strip()
                if context_start > 0:
                    context_str = "..." + context_str
                if context_end < len(text):
                    context_str = context_str + "..."

                return {
                    "matched_name": original_name,
                    "matched_text": matched_text,
                    "span": (start, end),
                    "context": context_str,
                    "severity": "urgent"
                }

        return None

# Singleton instance
name_detector = NameDetector()
