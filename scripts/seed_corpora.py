"""Blindspot v2.0 — Seed Corpora Script

Loads and embeds curated corpora into ChromaDB.
"""

import json
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from src.retrieval.retriever import CorpusRetriever


def seed():
    retriever = CorpusRetriever()
    print("Seeding legal rules...")
    retriever.seed_all(
        rules_path="../../data/legal_rules.json",
        benchmarks_path="../../data/benchmark_clauses.json",
        statutes_path="../../data/indian_statutes.json"
    )
    print("✅ Corpora seeded successfully!")
    print(f"   Legal rules: {retriever.legal_rules.count()} entries")
    print(f"   Benchmark clauses: {retriever.benchmark_clauses.count()} entries")
    print(f"   Indian statutes: {retriever.indian_statutes.count()} entries")


if __name__ == "__main__":
    seed()
