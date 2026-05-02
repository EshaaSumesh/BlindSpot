"""Blindspot v2.0 — Scout Agent"""

import re
import json
from typing import List, Dict, Any
from pypdf import PdfReader
from docx import Document as DocxDocument
from src.agents.base import BaseAgent
from src.state.schema import Clause, ScoutOutput, DocType, BlindspotState
from src.config import settings


class ScoutAgent(BaseAgent):
    """Parses contract and produces structured clause map."""

    name = "scout"
    description = "Document mapping — clause segmentation and classification"

    def run(self) -> Dict[str, Any]:
        if not self.state:
            raise ValueError("State not set")

        text = self.state.contract_text
        source_format = self.state.source_format

        # Parse based on format
        if source_format == "pdf":
            text = self._parse_pdf(self.state.contract_text)
        elif source_format == "docx":
            text = self._parse_docx(self.state.contract_text)

        # Classify document type
        doc_type, doc_confidence = self._classify_document(text)

        # Segment into clauses
        clauses = self._segment_clauses(text)

        return {
            "scout_output": ScoutOutput(
                doc_type=doc_type,
                doc_type_confidence=doc_confidence,
                clauses=clauses,
            )
        }

    def _parse_pdf(self, content: bytes) -> str:
        """Extract text from PDF bytes."""
        try:
            from io import BytesIO
            reader = PdfReader(BytesIO(content))
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            return text
        except Exception as e:
            raise ValueError(f"PDF parsing failed: {str(e)}")

    def _parse_docx(self, content: bytes) -> str:
        """Extract text from DOCX bytes."""
        try:
            from io import BytesIO
            doc = DocxDocument(BytesIO(content))
            return "\n".join([p.text for p in doc.paragraphs])
        except Exception as e:
            raise ValueError(f"DOCX parsing failed: {str(e)}")

    def _classify_document(self, text: str) -> tuple:
        """Classify document type based on keywords."""
        text_lower = text.lower()

        if any(kw in text_lower for kw in ["freelance", "independent contractor", "services agreement"]):
            return DocType.FREELANCE, 0.85
        elif any(kw in text_lower for kw in ["non-disclosure", "confidentiality agreement", "nda"]):
            return DocType.NDA, 0.90
        elif any(kw in text_lower for kw in ["employment", "employee", "salary", "benefits"]):
            return DocType.EMPLOYMENT, 0.85
        elif any(kw in text_lower for kw in ["master services agreement", "msa", "vendor"]):
            return DocType.VENDOR_MSA, 0.80
        else:
            return DocType.UNKNOWN, 0.50

    def _segment_clauses(self, text: str) -> List[Clause]:
        """Segment document into clauses using regex patterns."""
        clauses = []

        # Pattern: "1.", "1.1", "Article 1", "Clause 1", etc.
        clause_pattern = r'(?:^|\n)\s*(?:Clause\s+)?(\d+(?:\.\d+)?\.?)\s*[:\.)]?\s*([A-Z][^\n]{10,})'

        # Alternative: split by numbered sections
        numbered_pattern = r'(?:^|\n)\s*(\d+)\.\s+([A-Z][^\n]{10,})'

        matches = list(re.finditer(clause_pattern, text, re.MULTILINE)) or \
                 list(re.finditer(numbered_pattern, text, re.MULTILINE))

        if not matches:
            # Fallback: split by paragraphs
            return self._fallback_segment(text)

        for idx, match in enumerate(matches):
            clause_num = match.group(1)
            clause_text = match.group(2)

            # Get full clause text until next clause
            start_pos = match.start()
            end_pos = matches[idx + 1].start() if idx + 1 < len(matches) else len(text)

            full_text = text[start_pos:end_pos].strip()

            clauses.append(Clause(
                id=f"clause_{idx + 1}",
                section_header=f"Clause {clause_num}",
                text=full_text[:500],  # Truncate for now
                position={"start": start_pos, "end": end_pos},
                clause_type=self._classify_clause_type(full_text),
            ))

        return clauses

    def _fallback_segment(self, text: str) -> List[Clause]:
        """Fallback: split by paragraphs."""
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip() and len(p.strip()) > 50]
        clauses = []
        for idx, para in enumerate(paragraphs[:20]):  # Limit to 20 for now
            clauses.append(Clause(
                id=f"clause_{idx + 1}",
                section_header=None,
                text=para[:500],
                position={"start": idx * 500, "end": (idx + 1) * 500},
                clause_type=self._classify_clause_type(para),
            ))
        return clauses

    def _classify_clause_type(self, text: str) -> str:
        """Heuristically classify clause type."""
        text_lower = text.lower()

        if any(kw in text_lower for kw in ["intellectual property", "copyright", "assignment", "work product"]):
            return "ip_assignment"
        elif any(kw in text_lower for kw in ["terminate", "termination", "notice period"]):
            return "termination"
        elif any(kw in text_lower for kw in ["non-compete", "compete", "refrain from"]):
            return "non_compete"
        elif any(kw in text_lower for kw in ["payment", "invoice", "fee", "compensation"]):
            return "payment"
        elif any(kw in text_lower for kw in ["confidential", "proprietary information"]):
            return "confidentiality"
        elif any(kw in text_lower for kw in ["governing law", "jurisdiction"]):
            return "governing_law"
        elif any(kw in text_lower for kw in ["indemnif", "hold harmless", "liability"]):
            return "indemnification"
        elif any(kw in text_lower for kw in ["dispute", "arbitration", "mediation"]):
            return "dispute_resolution"
        elif any(kw in text_lower for kw in ["force majeure", "act of god"]):
            return "force_majeure"
        else:
            return "other"
