# Dev Log 09 - Sprint 7 RAG and Embeddings

## Development tasks ✅
- Added explicit vulnerable prompt-extraction behavior in `/ai/query` for secret-seeking inputs.
- Kept `/kb/search` retrieval surface and `/ai/embed` poisoning path for lab simulation.
- Preserved `/ai/config` API-key exposure in vulnerable mode and hidden key behavior in secure mode.

## Dev testing tasks 🧪
- Added automated tests for:
- prompt injection extraction behavior by mode
- config secret exposure by mode
- vector poisoning acceptance/rejection by mode
- KB sensitive retrieval behavior

## QA tasks 🧪
- Extended runbook and QA script coverage for prompt extraction, secret exfiltration, and poisoning scenarios.

## Documentation tasks 📘
- Expanded AI RAG manual with endpoint matrix, vulnerable vs secure behavior, pipeline flow, and threat model.

## User Guide updates 📖
- Added prompt injection tutorial, RAG exfiltration commands, poisoning test, and secure-mode comparison flow.

## Commit messages 💾
- feat(ai): add rag pipeline
- feat(ai): insecure prompt
- docs(ai): add threat model
