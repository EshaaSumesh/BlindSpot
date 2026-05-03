import httpx
import json

with open("test.txt", "w") as f:
    f.write("This is a non-disclosure agreement. Clause 1: Confidentiality. Both parties agree to keep secrets.")

with httpx.stream("POST", "http://localhost:8888/api/v1/analyze", data={"metadata": "{}"}, files={"file": open("test.txt", "rb")}, timeout=30.0) as r:
    for line in r.iter_lines():
        if line.startswith("data: "):
            try:
                d = json.loads(line[6:])
                if "scout_complete" in d:
                    print(d)
                else:
                    print(d.get("event"))
                    if d.get("event") == "scout_complete":
                        print("CLAUSES: ", d["data"].get("clauses"))
            except Exception as e:
                pass
