"""Blindspot v2.0 — Retrieval Module

ChromaDB integration for legal rules, benchmark clauses, and Indian statutes.
"""

import json
import os
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions


class CorpusRetriever:
    """Unified retriever for all three corpora."""

    def __init__(self, persist_directory: str = "./chroma_db"):
        self.client = chromadb.PersistentClient(path=persist_directory)
        self.embedding_fn = embedding_functions.DefaultEmbeddingFunction()

        # Collections
        self.legal_rules = self.client.get_or_create_collection("legal_rules")
        self.benchmark_clauses = self.client.get_or_create_collection("benchmark_clauses")
        self.indian_statutes = self.client.get_or_create_collection("indian_statutes")

    def seed_all(self, rules_path: str, benchmarks_path: str, statutes_path: str):
        """Seed all collections from JSON files."""
        if os.path.exists(rules_path):
            self._seed_collection(self.legal_rules, rules_path, "rule")
        if os.path.exists(benchmarks_path):
            self._seed_collection(self.benchmark_clauses, benchmarks_path, "benchmark")
        if os.path.exists(statutes_path):
            self._seed_collection(self.indian_statutes, statutes_path, "statute")

    def _seed_collection(self, collection, json_path: str, doc_type: str):
        """Seed a single collection from JSON."""
        with open(json_path, 'r') as f:
            entries = json.load(f)

        if collection.count() > 0:
            return  # Already seeded

        documents = []
        metadatas = []
        ids = []

        for entry in entries:
            documents.append(json.dumps(entry))
            metadatas.append({
                "doc_type": doc_type,
                "id": entry.get("id", ""),
                **{k: str(v) for k, v in entry.items() if k != "text" and isinstance(v, (str, int, float))}
            })
            ids.append(entry.get("id", f"{doc_type}_{len(ids)}"))

        collection.add(documents=documents, metadatas=metadatas, ids=ids)

    def search_legal_rules(self, query: str, k: int = 3) -> List[Dict[str, Any]]:
        """Search legal rules corpus."""
        results = self.legal_rules.query(query_texts=[query], n_results=k)
        return self._format_results(results)

    def find_similar_clauses(self, query: str, doc_type_filter: Optional[str] = None, k: int = 10) -> List[Dict[str, Any]]:
        """Search benchmark clauses corpus."""
        where = {"doc_type": doc_type_filter} if doc_type_filter else None
        results = self.benchmark_clauses.query(query_texts=[query], n_results=k, where=where)
        return self._format_results(results)

    def lookup_indian_statute(self, query: str) -> List[Dict[str, Any]]:
        """Search Indian statutes corpus."""
        results = self.indian_statutes.query(query_texts=[query], n_results=3)
        return self._format_results(results)

    def _format_results(self, results) -> List[Dict[str, Any]]:
        """Format Chroma results into list of dicts."""
        if not results or not results.get("ids"):
            return []
        formatted = []
        for i, doc_id in enumerate(results["ids"][0]):
            entry = json.loads(results["documents"][0][i])
            entry["distance"] = results["distances"][0][i] if results.get("distances") else None
            formatted.append(entry)
        return formatted


# Global retriever instance
_retriever: Optional[CorpusRetriever] = None


def get_retriever() -> CorpusRetriever:
    """Get or create the global retriever instance."""
    global _retriever
    if _retriever is None:
        from src.config import settings
        _retriever = CorpusRetriever(persist_directory=settings.chroma_persist_directory)
    return _retriever
