import httpx
import json

with open("test.txt", "w") as f:
    f.write("This is a non-disclosure agreement. Clause 1: Confidentiality. Both parties agree to keep secrets.")

with httpx.stream("POST", "http://localhost:8888/api/v1/analyze", data={"metadata": "{}"}, files={"file": open("test.txt", "rb")}, timeout=30.0) as r:
    current_event = None
    for line in r.iter_lines():
        if line.startswith("event: "):
            current_event = line[7:]
        elif line.startswith("data: "):
            if current_event == "scout_complete":
                print("SCOUT COMPLETE DATA:")
                print(line[6:])
                break
