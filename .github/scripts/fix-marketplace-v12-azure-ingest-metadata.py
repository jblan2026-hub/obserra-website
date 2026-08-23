from pathlib import Path

path = Path("scripts/marketplace-v12-artifact-ingest-azure.mjs")
text = path.read_text()
replacements = {
    "metadata?..artifact_sha256": "metadata?.artifact_sha256",
    "metadata?..catalog_revision": "metadata?.catalog_revision",
    "metadata?..product_id": "metadata?.product_id",
}
for old, new in replacements.items():
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"Expected one {old!r}, found {count}")
    text = text.replace(old, new, 1)
path.write_text(text)
