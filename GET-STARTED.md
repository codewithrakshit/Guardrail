# GuardRail AI - Get Started

## 🎯 Choose Your Path

### Path 1: IDE Extension (Recommended for Kiro Users)
**Best for**: Real-time development, immediate feedback, one-click fixes

```bash
# Quick install for Kiro
cd extensions/vscode
./install-kiro.sh
cd ../../api && npm start
# Open Kiro, press Ctrl+Shift+G to scan!
```

📖 **Full Guide**: [KIRO-QUICK-START.md](KIRO-QUICK-START.md)

### Path 2: Web Platform
**Best for**: Code reviews, batch scanning, team dashboards

```bash
# Start backend
cd api && npm install && npm start

# Start frontend (new terminal)
cd web && npm install && npm run dev

# Open http://localhost:3000
```

📖 **Full Guide**: [QUICK-START.md](QUICK-START.md)

## 🚀 Quick Test

### Test in Kiro (30 seconds)

1. Create `test.js`:
```javascript
const apiKey = 'sk-1234567890abcdef';
console.log(apiKey);
```

2. Press `Ctrl+Shift+G`

3. See red squiggly line appear 🔴

4. Click lightbulb 💡 → "Apply GuardRail AI Fix"

5. Code secured! ✅

### Test in Web (1 minute)

1. Go to http://localhost:3000

2. Click "Try Now"

3. Paste the same code

4. Click "Analyze Code"

5. View results and download fix

## 📚 Documentation

### Quick References
- **[KIRO-QUICK-START.md](KIRO-QUICK-START.md)** - 5-minute Kiro setup
- **[UNIVERSAL-IDE-COMPATIBILITY.md](UNIVERSAL-IDE-COMPATIBILITY.md)** - IDE compatibility guide
- **[QUICK-START.md](QUICK-START.md)** - Web platform setup

### Detailed Guides
- **[EXTENSION-SUMMARY.md](EXTENSION-SUMMARY.md)** - Extension overview
- **[IDE-EXTENSION-GUIDE.md](IDE-EXTENSION-GUIDE.md)** - Complete IDE integration
- **[PLATFORM-OVERVIEW.md](PLATFORM-OVERVIEW.md)** - Platform architecture
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment

### Technical
- **[extensions/vscode/README.md](extensions/vscode/README.md)** - Extension user guide
- **[extensions/vscode/DEVELOPMENT.md](extensions/vscode/DEVELOPMENT.md)** - Extension development
- **[extensions/INTEGRATION-DIAGRAM.md](extensions/INTEGRATION-DIAGRAM.md)** - System architecture

## 🎓 Learning Path

### Beginner
1. Read [KIRO-QUICK-START.md](KIRO-QUICK-START.md)
2. Install extension in Kiro
3. Try test examples
4. Scan your own code

### Intermediate
1. Configure extension settings
2. Try web platform
3. Scan entire workspace
4. Integrate into workflow

### Advanced
1. Read [DEPLOYMENT.md](DEPLOYMENT.md)
2. Deploy to production
3. Customize for your team
4. Build extensions for other IDEs

## 🔧 System Requirements

### Minimum
- Node.js 18+
- 4GB RAM
- AWS account (for Bedrock)
- Kiro/Cursor/Windsurf/VS Code

### Recommended
- Node.js 20+
- 8GB RAM
- AWS account with Bedrock access
- Fast internet connection

## 🆘 Need Help?

### Common Issues

**Extension not working?**
→ See [KIRO-QUICK-START.md](KIRO-QUICK-START.md) Troubleshooting section

**Backend not starting?**
→ Check AWS credentials in `api/.env`

**Scan timeout?**
→ Increase timeout in extension settings

### Get Support

- **Documentation**: Check the guides above
- **GitHub Issues**: Report bugs
- **Backend Logs**: Check `api/` directory

## ✅ Success Checklist

- [ ] Node.js 18+ installed
- [ ] AWS credentials configured
- [ ] Backend running on port 3001
- [ ] Extension installed in Kiro
- [ ] Test file scanned successfully
- [ ] Quick fix applied
- [ ] Ready to secure your code!

## 🎉 You're Ready!

Choose your path and start securing your code with GuardRail AI!

**For Kiro users**: [KIRO-QUICK-START.md](KIRO-QUICK-START.md)

**For web platform**: [QUICK-START.md](QUICK-START.md)

**For all IDEs**: [UNIVERSAL-IDE-COMPATIBILITY.md](UNIVERSAL-IDE-COMPATIBILITY.md)

---

**Happy secure coding! 🛡️**
