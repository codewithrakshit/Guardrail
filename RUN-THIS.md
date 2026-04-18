# 🎯 READY TO TEST — Run These Commands

## Terminal 1: Backend (REQUIRED)
```bash
cd "/Users/rakshit/Desktop/Workspace/GuardRail AI/GuardRail MVP"
./start-backend.sh
```
**Leave this running** — you'll see live API logs

---

## Terminal 2: Frontend (OPTIONAL — only if you want web UI)
```bash
cd "/Users/rakshit/Desktop/Workspace/GuardRail AI/GuardRail MVP"
./start-frontend.sh
```
**Leave this running** — web UI at http://localhost:3000

---

## Terminal 3: Quick Test
```bash
cd "/Users/rakshit/Desktop/Workspace/GuardRail AI/GuardRail MVP"
./test-api.sh
```
This verifies the backend is working.

---

## Then Test in Kiro IDE:

1. Open Kiro
2. Open file: `test-vulnerable.js`
3. Press `Cmd+Shift+G`
4. Wait 3-5 seconds
5. Red squiggly lines appear
6. Click lightbulb 💡 → "Apply Fix"
7. Review diff → Click "Apply Fixes"
8. Done! ✅

---

## What's Already Done:

✅ Extension installed in Kiro  
✅ Backend configured with AWS credentials  
✅ All security fixes applied  
✅ GitHub webhook route built  
✅ Notifier service built (email + Slack)  
✅ GitHub Actions CI workflow built  
✅ CLI tool built  
✅ Test files created  

---

## Files You Need to Run:

**Backend:** `./start-backend.sh`  
**Frontend:** `./start-frontend.sh` (optional)  
**Test:** `./test-api.sh`  

That's it. Everything else is ready.

---

## Full Testing Guide:
See `TESTING-GUIDE.md` for detailed instructions.
