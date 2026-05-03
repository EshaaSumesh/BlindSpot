"""Script to generate the cache data for the demo contract."""

import asyncio
import os
import sys

# Add backend to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from src.orchestration.graph import BlindspotGraph
from src.state.schema import BlindspotState, CounterpartyInfo
from src.config import settings

async def generate_cache():
    """Run the pipeline on the demo contract to populate the cache."""
    print("Generating demo cache...")
    
    # Force live LLM for cache generation
    settings.llm_enabled = True
    settings.demo_mode = False 
    
    contract_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'demo_contracts', 'demo_freelance_contract.txt')
    
    if not os.path.exists(contract_path):
        print(f"Error: Demo contract not found at {contract_path}")
        return
        
    with open(contract_path, 'r', encoding='utf-8') as f:
        contract_text = f.read()
        
    print(f"Loaded contract ({len(contract_text)} chars)")
    
    initial_state = BlindspotState(
        contract_text=contract_text,
        source_format="txt",
        user_role="freelancer",
        deal_context="Standard frontend dev gig.",
        counterparty_info=CounterpartyInfo(
            name="Acme Studios Pvt Ltd",
            known_domains=["acmestudios.in"]
        )
    )
    
    graph = BlindspotGraph()
    
    print("Starting pipeline execution (this will take a while and use Gemini API)...")
    
    # We iterate over the stream to let all agents execute
    try:
        async for event in graph.arun_with_events(initial_state):
            print(f"Event: {event}")
        print("\nSuccess! Cache has been generated.")
    except Exception as e:
        print(f"\nPipeline failed: {e}")

if __name__ == "__main__":
    asyncio.run(generate_cache())
