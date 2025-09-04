# Windows Development Troubleshooting Guide

**Date**: December 2024  
**Context**: Smart MCP Development on Windows

## 🎯 **Common Windows Issues and Solutions**

### **1. Pre-commit Bash Issues**

**Problem**: `ExecutableNotFoundError: Executable '/bin/bash' not found`

**Root Cause**: Pre-commit hooks expect Unix-style bash, but Windows doesn't have `/bin/bash` by default.

**Solutions**:

#### **Option A: Use Git Bash (Recommended)**
```bash
# Ensure Git Bash is installed and in PATH
# Use Git Bash terminal instead of PowerShell/CMD
git commit -m "your message"
```

#### **Option B: Use Windows-Specific Pre-commit Config**
```bash
# Use the Windows-specific configuration
cp .pre-commit-config-windows.yaml .pre-commit-config.yaml
pre-commit install
git commit -m "your message"
```

#### **Option C: Bypass Pre-commit (Temporary)**
```bash
# Skip pre-commit hooks for this commit
git commit --no-verify -m "your message"

# Then run quality checks manually
npm run qa:all
```

### **2. Python PATH Issues**

**Problem**: `pre-commit` command not found after installation

**Root Cause**: Python Scripts directory not in system PATH

**Solution**:
```bash
# Add Python Scripts to PATH (replace with your Python version)
setx PATH "%PATH%;C:\Users\%USERNAME%\AppData\Roaming\Python\Python313\Scripts"

# Or add to user PATH in System Properties
# Control Panel > System > Advanced > Environment Variables
```

### **3. Line Ending Issues**

**Problem**: `warning: LF will be replaced by CRLF`

**Root Cause**: Git auto-converting line endings on Windows

**Solution**:
```bash
# Configure Git to handle line endings properly
git config core.autocrlf true

# Or disable the warning
git config core.safecrlf false
```

### **4. PowerShell Command Issues**

**Problem**: `The token '&&' is not a valid statement separator`

**Root Cause**: PowerShell doesn't support `&&` operator like bash

**Solution**:
```bash
# Use semicolon instead of &&
npm install; npm run build

# Or use separate commands
npm install
npm run build

# Or use Git Bash instead of PowerShell
```

## 🛠️ **Windows Development Setup**

### **Required Tools**
1. **Git for Windows** (includes Git Bash)
2. **Node.js LTS** (from nodejs.org)
3. **Python 3.12+** (from python.org)
4. **VS Code** (with TypeScript, ESLint, Prettier extensions)

### **Environment Setup**
```bash
# Install pre-commit
pip install pre-commit

# Install project dependencies
npm install

# Install pre-commit hooks
pre-commit install

# Test the setup
npm run qa:all
```

### **IDE Configuration**
- **TypeScript**: Enable strict mode
- **ESLint**: Auto-fix on save
- **Prettier**: Format on save
- **Git**: Use Git Bash as default terminal

## 📋 **Windows-Specific Workflow**

### **Daily Development**
1. **Start**: Open Git Bash terminal
2. **Code**: Use VS Code with extensions
3. **Test**: Run `npm run qa:all` before committing
4. **Commit**: Use `git commit` (with pre-commit) or `git commit --no-verify` (if issues)

### **Pre-commit Troubleshooting**
1. **If bash error**: Use `git commit --no-verify`
2. **If Python error**: Check PATH and reinstall pre-commit
3. **If line ending error**: Configure Git autocrlf
4. **If PowerShell error**: Use Git Bash instead

### **Quality Assurance**
1. **Before Commit**: Run `npm run qa:all`
2. **After Commit**: Check CI/CD pipeline
3. **If Issues**: Fix locally and recommit
4. **Documentation**: Update this guide with new issues

## 🚨 **Emergency Procedures**

### **If Pre-commit Completely Fails**
```bash
# Disable pre-commit temporarily
git config core.hooksPath /dev/null

# Commit your changes
git commit -m "your message"

# Re-enable pre-commit
git config --unset core.hooksPath
pre-commit install
```

### **If Python/Node Issues**
```bash
# Check versions
node --version
npm --version
python --version
pip --version

# Reinstall if needed
npm install
pip install -r requirements.txt
```

### **If Git Issues**
```bash
# Check Git configuration
git config --list

# Reset to defaults if needed
git config --global init.defaultBranch main
git config --global core.autocrlf true
```

## 📊 **Prevention Checklist**

### **Before Starting Development**
- [ ] Git Bash is installed and working
- [ ] Python is in PATH
- [ ] Node.js is installed
- [ ] VS Code extensions are installed
- [ ] Pre-commit is installed and working

### **Before Each Commit**
- [ ] Run `npm run qa:all` to check quality
- [ ] Fix any ESLint or TypeScript errors
- [ ] Ensure tests are passing
- [ ] Use appropriate commit method (with or without pre-commit)

### **After Each Commit**
- [ ] Check CI/CD pipeline status
- [ ] Fix any issues that arise
- [ ] Update documentation if new issues found

## 🔗 **Related Documents**
- [tech-stack.md](../../project/tech-stack.md)
- [early-quality-gates.md](./early-quality-gates.md)
- [project-guidelines.md](../../project-guidelines.md)

---

**Key Takeaway**: Windows development requires additional setup steps, but with proper configuration, the development experience can be smooth and productive.
