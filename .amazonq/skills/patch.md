# Skill: patch

You are working on the GuardRail AI patch generation system.

Context:
- patch-generator.js produces fixed code from vulnerability findings
- remediation-engine.js handles language-specific logic
- Patched code stored in S3 via s3-storage.js
- Supported: JavaScript, TypeScript, Python, Java, Go, Ruby, PHP

Rules:
- Patches must be complete and runnable — no TODOs, no placeholders
- Preserve original code structure and style
- Hardcoded secrets → replace with process.env.VAR + provision via secret-lifecycle-manager.js
- SQL injection → parameterized queries only
- XSS → framework-native escaping
- Weak crypto (MD5/SHA1/DES) → bcrypt / AES-256 / SHA-256
- Always include imports for any new dependency introduced
