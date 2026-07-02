# GuardRail API Documentation

This document describes the GuardRail backend API used by the frontend, VS Code extension, GitHub Actions, and other integrations.

---

# API Base URL

Development:

```
http://localhost:3001
```

Production:

```
http://<your-ec2-ip-or-domain>
```

All API routes are prefixed with:

```
/api
```

Health check endpoint:

```
GET /health
```

Example response:

```json
{
  "status": "healthy",
  "timestamp": "2026-07-02T10:00:00.000Z",
  "version": "1.0.0"
}
```

---

# Authentication

Most API endpoints do **not** require authentication.

The GitHub webhook endpoint validates requests using the following header:

```
X-Hub-Signature-256
```

The signature is verified using the configured GitHub webhook secret.

---

# Endpoint List

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health check |
| POST | `/api/scan` | Scan submitted source code |
| POST | `/api/scan/upload` | Upload a source file for scanning |
| POST | `/api/fix/:sessionId` | Generate remediation patch |
| GET | `/api/result/:sessionId` | Retrieve scan results |
| GET | `/api/result/:sessionId/download` | Download patched code |
| DELETE | `/api/session/:sessionId` | Delete a session |
| GET | `/api/logs/:sessionId` | Retrieve session logs |
| GET | `/api/logs/:sessionId/errors` | Retrieve error logs |
| GET | `/api/logs/stats` | Platform statistics |
| GET | `/api/logs/recent` | Recent scan events |
| GET | `/api/demo` | List demo examples |
| GET | `/api/demo/:exampleId` | Retrieve a demo example |
| POST | `/api/webhook/github` | GitHub webhook endpoint |

---

# API Reference

---

## POST /api/scan

Submit source code for security analysis.

### Headers

```
Content-Type: application/json
```

### Request Body

```json
{
  "code": "const password = 'secret';",
  "language": "javascript",
  "filename": "app.js"
}
```

### Supported Languages

- javascript
- typescript
- python
- java
- go
- ruby
- php

### Successful Response

```json
{
  "sessionId": "uuid",
  "status": "vulnerable",
  "vulnerabilities": [
    {
      "type": "hardcoded_secret",
      "severity": "critical",
      "explanation": "Hardcoded credential detected.",
      "affectedLines": [3],
      "cwe": "CWE-798"
    }
  ],
  "severity": "critical",
  "scanDuration": 1450,
  "timestamp": "2026-07-02T10:00:00.000Z"
}
```

---

## POST /api/scan/upload

Upload a source file instead of sending code directly.

### Headers

```
Content-Type: multipart/form-data
```

### Form Fields

| Field | Type | Required |
|------|------|----------|
| file | File | Yes |
| language | String | Yes |

---

## POST /api/fix/:sessionId

Generate a remediation patch for a completed scan.

### Response

```json
{
  "sessionId": "uuid",
  "status": "fixed",
  "patch": {
    "available": true,
    "secureCode": "...",
    "diff": {},
    "explanation": "...",
    "securityBenefit": "...",
    "confidence": 0.95,
    "secretRef": {}
  },
  "vulnerabilities": [],
  "timestamp": "2026-07-02T10:00:00.000Z"
}
```

---

## GET /api/result/:sessionId

Retrieve scan status and generated patch.

### Response

```json
{
  "sessionId": "uuid",
  "status": "completed",
  "language": "javascript",
  "filename": "app.js",
  "vulnerabilitiesDetected": 1,
  "secretCreated": false,
  "vulnerabilities": [],
  "patchedCode": "...",
  "patch": {
    "available": true
  }
}
```

---

## GET /api/result/:sessionId/download

Downloads the generated secure source code as a text file.

---

## DELETE /api/session/:sessionId

Deletes a session and initiates cleanup.

### Response

```json
{
  "message": "Session cleanup initiated",
  "sessionId": "uuid"
}
```

---

## GET /api/logs/:sessionId

Retrieve all logs for a session.

---

## GET /api/logs/:sessionId/errors

Retrieve only error logs for a session.

---

## GET /api/logs/stats

Retrieve platform statistics.

---

## GET /api/logs/recent

Retrieve recent scan events.

---

## GET /api/demo

Returns all available demo examples.

Example response:

```json
{
  "examples": [
    {
      "id": "sql_injection",
      "name": "SQL Injection",
      "language": "javascript",
      "description": "Unsanitized user input in SQL query."
    }
  ]
}
```

---

## GET /api/demo/:exampleId

Retrieve a specific demo example.

---

## POST /api/webhook/github

GitHub webhook endpoint.

### Required Header

```
X-Hub-Signature-256
```

This endpoint validates incoming webhook signatures before processing pull request events.

---

# Common Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request / Validation failed |
| 401 | Authentication required / Invalid webhook signature |
| 403 | Access denied |
| 404 | Resource not found |
| 409 | Conflict |
| 410 | Session expired |
| 422 | Unprocessable request |
| 429 | Too many requests |
| 500 | Internal server error |

Typical error response:

```json
{
  "error": "Validation failed",
  "status": 400,
  "timestamp": "2026-07-02T10:00:00.000Z"
}
```

---

# Sample cURL Requests

## Scan Source Code

```bash
curl -X POST http://localhost:3001/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "code":"const password=\"secret\";",
    "language":"javascript",
    "filename":"app.js"
  }'
```

---

## Retrieve Scan Result

```bash
curl http://localhost:3001/api/result/<sessionId>
```

---

## Generate Fix

```bash
curl -X POST http://localhost:3001/api/fix/<sessionId>
```

---

## Delete Session

```bash
curl -X DELETE http://localhost:3001/api/session/<sessionId>
```

---

# Postman

Import the above endpoints into Postman using:

- Base URL

```
http://localhost:3001
```

- For JSON requests, set:

```
Content-Type: application/json
```

- For file uploads, use:

```
multipart/form-data
```

- For GitHub webhook testing, include the required:

```
X-Hub-Signature-256
```
