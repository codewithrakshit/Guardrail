# CloudWatch Logging - Quick Reference

## Test the Integration

```bash
# 1. Start backend
cd api
npm start

# 2. Run test script
node test-logging.js

# 3. Test API endpoint
curl http://localhost:3001/api/logs/test-1776537117185

# 4. Check CloudWatch
aws logs tail /guardrail-ai/public --follow --region us-west-2
```

## API Endpoints

```bash
# Get session logs
GET /api/logs/:sessionId

# Get errors only
GET /api/logs/:sessionId/errors

# Get recent scans
GET /api/logs/recent?limit=10

# Get stats
GET /api/logs/stats
```

## Log Levels

- **INFO** - Scan started, progress, completion (safe)
- **WARN** - Vulnerabilities found
- **ERROR** - Errors, failures

## CloudWatch Streams

```
/guardrail-ai/public/
  ├── scan_started/YYYY-MM-DD
  ├── scan_progress/YYYY-MM-DD
  ├── scan_complete/YYYY-MM-DD
  ├── fix_requested/YYYY-MM-DD
  ├── fix_generated/YYYY-MM-DD
  └── error/YYYY-MM-DD
```

## What's Working ✅

- [x] Structured logging with timestamps
- [x] CloudWatch integration
- [x] DynamoDB storage
- [x] Session log retrieval
- [x] Error logging
- [x] API endpoints
- [x] Test script

## What's Next 🚀

- [ ] Extension logs panel UI
- [ ] Real-time log streaming (SSE)
- [ ] Log filtering and search
- [ ] Export functionality
- [ ] Web dashboard integration
