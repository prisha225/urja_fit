"""Validate Phase 0 fixture data against frozen JSON Schemas."""
from __future__ import annotations
import json
import sys
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker, RefResolver

ROOT = Path(__file__).resolve().parents[1]
SCHEMAS = ROOT / "packages" / "contracts" / "schemas"
FIXTURES = {
    "demo-persona.json": "user-profile.schema.json",
    "day-plan.json": "day-plan.schema.json",
    "meal-plan.json": "meal-plan.schema.json",
    "screening-go.json": "screening-result.schema.json",
    "screening-gentle.json": "screening-result.schema.json",
    "screening-stop.json": "screening-result.schema.json",
}
def main() -> int:
    failures = []
    for fixture, schema_name in FIXTURES.items():
        schema_path = SCHEMAS / schema_name
        schema = json.loads(schema_path.read_text(encoding="utf-8"))
        instance = json.loads((ROOT / "fixtures" / fixture).read_text(encoding="utf-8"))
        resolver = RefResolver(base_uri=schema_path.as_uri(), referrer=schema)
        errors = list(Draft202012Validator(schema, resolver=resolver, format_checker=FormatChecker()).iter_errors(instance))
        if errors: failures.extend(f"{fixture}: {error.message}" for error in errors)
        else: print(f"valid: {fixture}")
    if failures:
        print("\n".join(failures), file=sys.stderr); return 1
    print("All fixtures validate."); return 0
if __name__ == "__main__": raise SystemExit(main())
