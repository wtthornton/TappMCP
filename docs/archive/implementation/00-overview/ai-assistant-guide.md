# 🤖 **AI Assistant Guide - Smart MCP Project**

**Purpose**: Quick reference for AI coding assistant to find essential information

---

## 🎯 **Start Here**

**Main Overview**: `docs/implementation/00-overview/project-overview.md`
**Project Guidelines**: `project-guidelines.md`
**Project Vision**: `docs/project/vision.md`

---

## 📋 **Phase 1A Implementation**

### **User Requirements**
- `docs/implementation/01-phase-1a/phase-1a-user-stories.md` - Detailed user stories with acceptance criteria

### **Role-Specific Tasks**
- `docs/implementation/01-phase-1a/tasks/developer-tasks.md` - Detailed developer tasks
- `docs/implementation/01-phase-1a/tasks/product-strategist-tasks.md` - Product tasks
- `docs/implementation/01-phase-1a/tasks/operations-engineer-tasks.md` - Operations tasks
- `docs/implementation/01-phase-1a/tasks/designer-tasks.md` - Design tasks
- `docs/implementation/01-phase-1a/tasks/qa-engineer-tasks.md` - QA tasks

### **Integration Planning**
- `docs/implementation/01-phase-1a/integration/phase-1a-1b-integration-user-stories.md` - Integration requirements

---

## 🔧 **Technical Reference**

### **Architecture & Decisions**
- `docs/knowledge/architecture-decisions.md` - Architecture choices
- `docs/implementation/00-overview/technical-specifications.md` - Technical specs

### **Code Files**
- `src/server.ts` - Main MCP server (needs fixing)
- `package.json` - Dependencies (needs zod)
- `tsconfig.json` - TypeScript config

---

## 📊 **Current Issues to Fix**

1. **package.json** - Add `zod` dependency
2. **src/tools/** - Create tool implementations (empty directory)
3. **src/server.ts** - Fix imports for non-existent tools

---

## 🎯 **Phase 1A Success**

**Technical**: <100ms response, ≥85% coverage, 0 vulnerabilities
**Business**: <5min setup, saves 1-2 hours, clear errors, non-technical users understand

---

**Quick Start**: Read project-overview.md, then focus on Phase 1A user stories and developer tasks
