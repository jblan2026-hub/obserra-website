from pathlib import Path

path = Path("scripts/marketplace-v12-artifact-ingest-azure.mjs")
text = path.read_text()
replacements = {
    "metadata?..artifact_sha256": "metadata?.artifact_sha256",
    "metadata?..catalog_revision": "metadata?.catalog_revision",
    "metadata?..product_id": "metadata?.product_id",
}
for old, new in replacements.items():
    old_count = text.count(old)
    new_count = text.count(new)
    if old_count == 1:
        text = text.replace(old, new, 1)
    elif old_count == 0 and new_count == 1:
        continue
    else:
        raise SystemExit(f"Metadata repair invariant failed for {old!r}: old={old_count}, new={new_count}")
path.write_text(text)
