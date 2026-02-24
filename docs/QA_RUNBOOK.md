# QA Runbook

This runbook tracks reproducible validation per sprint. Update status after each run.

| Sprint | Feature | QA Steps | Expected Result | Status |
|---|---|---|---|---|
| 1 | feat(auth): implement jwt issuing | `curl -s -X POST http://localhost:8080/auth/jwt/issue -H 'content-type: application/json' -d '{"user_id":"42"}'` then split `token` by `.` and decode first two segments | JWT has 3 segments, header includes `alg=HS256`, payload includes `sub=42`, `role=user`, and `exp > iat` | ready to execute |
