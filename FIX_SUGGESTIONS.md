# Fix Suggestions - Priority Order (ALL ITEMS)

## Technical Readiness (Make it Enterprise-Grade)

| ID | File | Line | Current State | Why It Needs Fix | What To Do |
|----|------|------|---------------|-----------------|------------|
| 1 | index.ts | 131-158 | Only catch block with console.error | No retry logic - external APIs fail transiently | Add exponential backoff retry (3 attempts) for MCP transport |
| 2 | package.json | 8 | Test script: `echo "Error: no test specified"` | No tests = judges will reject | Add Jest + vitest, create basic test for geocode/hospital search |
| 3 | index.ts | NEW | No config file besides .env | DevOps best practice | Create config.yaml for FHIR endpoints, fallback URLs |
| 4 | index.ts | NEW | No audit logging | HIPAA requires PHI access audit trail | Add audit log on every FHIR read (timestamp, patient ID, action) |
| 5 | fhir-client.ts | 36-55 | No retry on FHIR calls | FHIR servers timeout/fail | Add retry with exponential backoff in _callAxios |
| 6 | api-config.ts | 45 | rateLimitDelay defined but never used | API abuse prevention | Implement actual rate limiting per request |
| 7 | index.ts | NEW | No offline handling | Rural users have weak network | Add fallback to cached facilities if APIs fail |
| 8 | index.ts | NEW | No streaming support | For multi-location results | Add SSE streaming for large result sets |
| 9 | fhir-client.ts | NEW | Only GET requests | Need full FHIR CRUD | Add POST for FHIR Task creation |
| 10 | package.json | NEW | No docker-prod script | Need for marketplace | Add production build + start-prod scripts |

## Medical Safety (Remove Legal Risk)

| ID | File | Line | Current State | Why It Needs Fix | What To Do |
|----|------|------|---------------|-----------------|------------|
| 11 | FindNearbyFacilitiesTool.ts | 66-71 | Returns plain JSON | No disclaimer = legal liability | Add: `"disclaimer": "Call 911 for emergencies. Verify availability before visiting."` |
| 12 | FindHospitalsWithRouteTool.ts | 128-136 | No emergency override | If no hospitals found, user may panic | Add: `"emergencyOverride": "Call 911 immediately"` when results empty |
| 13 | FindHospitalsWithRouteTool.ts | 17-25 | No specialty filter | Generic hospital useless for stroke/burn | Add `specialtyFilter: z.enum(["trauma","burn","stroke","pediatric","cardiac","rehabilitation"])` |
| 14 | all tools | all | No data freshness notice | OSM data may be stale | Add `"lastUpdated": "YYYY-MM-DD"` to all responses |
| 15 | FindNearbyFacilitiesTool.ts | NEW | No emergency services priority | 911 should always appear first | Add logic to always include nearest emergency room |

## FHIR Context Integration (Use Patient Data)

| ID | File | Line | Current State | Why It Needs Fix | What To Do |
|----|------|------|---------------|-----------------|------------|
| 16 | fhir-client.ts | 21-34 | Basic search() only | Need to query patient allergies | Add method to query AllergyIntolerance for latex/food allergies |
| 17 | FindNearbyFacilitiesTool.ts | 41-82 | Uses only OSM data | Does NOT query FHIR | Query FHIR → filter latex-safe facilities if patient has latex allergy |
| 18 | FindNearbyFacilitiesTool.ts | 41-82 | No insurance check | Generic location finder | Query Coverage resource → flag in-network only |
| 19 | FindHospitalsWithRouteTool.ts | NEW | No condition matching | Any hospital returned | Query Condition → recommend stroke center for stroke, burn center for burns |
| 20 | fhir-utilities.ts | 22-34 | getPatientIdIfContextExists exists | Not used anywhere | Wire into tools to get patient ID from FHIR token |
| 21 | FindHospitalsWithRouteTool.ts | NEW | No continuity of care | New hospital every time | Query Encounter → suggest patient's usual hospital |
| 22 | all outputs | NEW | Returns plain objects | Not FHIR-compliant | Return results as FHIR Location resources with extensions |

## Marketplace & Deployment (Required to Win)

| ID | File | Line | Current State | Why It Needs Fix | What To Do |
|----|------|------|---------------|-----------------|------------|
| 23 | Dockerfile | single line | Bare minimum | Need proper build | Multi-stage build: build, test, run stages |
| 24 | index.ts | 161-163 | Hardcoded port 5000 | Not configurable | Accept PORT from env |
| 25 | NEW FILE | NEW | No health-check endpoint | K8s/ cloud readiness | Add /healthz for liveness, /readyz for readiness |
| 26 | NEW FILE | NEW | No metrics | Observability | Add /metrics endpoint (Basic auth) |
| 27 | NEW FILE | NEW | No CI/CD | Automation | Add GitHub Actions workflow |

## Testing & Validation (Judges Check This)

| ID | File | Line | Current State | Why It Needs Fix | What To Do |
|----|------|------|---------------|-----------------|------------|
| 28 | NEW FILE | NEW | No unit tests | Empty | Test geocode, distance calculation, hospital search |
| 29 | NEW FILE | NEW | No integration tests | Can't verify FHIR | Add test against HAPI FHIR sandbox |
| 30 | NEW FILE | NEW | No mock fixtures | Tests brittle | Add mock OSM responses |

## Demo & Documentation (Judges Watch Video)

| ID | File | Line | Current State | Why It Needs Fix | What To Do |
|----|------|------|---------------|-----------------|------------|
| 31 | README.md | basic | No SHARP docs | Judges need to see FHIR | Document SHARP headers + FHIR integration |
| 32 | NEW FILE | NEW | No demo script | 3-min video needs story | Create demo storyboard + talking points |
| 33 | NEW FILE | NEW | No architecture diagram | Visual learners | Add architecture.png (MCP ↔ FHIR ↔ OSM) |

## Pitch & Story (Emotional Connection)

| ID | File | Line | Current State | Why It Needs Fix | What To Do |
|----|------|------|---------------|-----------------|------------|
| 34 | NEW FILE | NEW | No pitch script | 60-sec pitch needed | Script: 10s story + 30s tech + 15s diff + 5s close |
| 35 | NEW FILE | NEW | No differentiators | Generic locator | 5 features: allergy-aware, insurance filter, specialty routing, wait time, offline |

---

# Summary by Category

| Category | Total Items | Critical (Do First) |
|----------|------------|-------------------|
| Technical Readiness | 10 | 1, 2, 4, 5 |
| Medical Safety | 5 | 11, 12, 13 |
| FHIR Integration | 7 | 16, 17, 18, 19 |
| Marketplace | 5 | 23, 24 |
| Testing | 3 | 28 |
| Demo | 3 | 31, 32 |
| Pitch | 2 | 34 |

---

# How to Tell Me What to Fix

Reply with IDs:
- "fix 1,2,5" → Fix items 1, 2, and 5
- "fix 11,12,13" → Medical safety items
- "fix 16,17,18,19" → All FHIR integration
- "fix all medical" → All medical safety (11-15)
- "fix all fhir" → All FHIR (16-22)
- "fix all" → Everything

I'll implement and test. Then you can view in project.