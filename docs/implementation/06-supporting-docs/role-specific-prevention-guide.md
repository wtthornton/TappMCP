# Role-Specific Prevention Guide
## Preventing Quality Issues in SDLC

### 🎯 **Purpose**
Role-specific instructions to prevent quality issues from propagating through the SDLC, based on lessons learned from recent development cycles.

---

## 👨‍💻 **AI-Augmented Developer**

### **Critical Prevention Checklist:**
- [ ] **Before Coding**: Run `npm run early-check` to verify clean state
- [ ] **During Development**: Use strict TypeScript, avoid `any` types
- [ ] **Before Commit**: Run `npm run pre-commit:run` to validate
- [ ] **Quality Gates**: 0 TypeScript errors, 0 ESLint errors, ≥85% coverage

### **Common Pitfalls:**
- ❌ Using `any` instead of `unknown` or proper types
- ❌ Creating functions >150 lines or complexity >15
- ❌ Using `||` instead of `??` for default values
- ❌ Skipping tests for new functionality
- ❌ Ignoring ESLint warnings

### **Emergency Fixes:**
1. Run `npm run format` for formatting issues
2. Run `npm run lint` for ESLint issues
3. Fix TypeScript errors with proper typing
4. Add missing tests or fix broken ones

---

## 🧪 **AI Quality Assurance Engineer**

### **Critical Prevention Checklist:**
- [ ] **Before QA Work**: Verify all tools are installed and configured
- [ ] **During Testing**: Test changes incrementally, not at the end
- [ ] **Quality Gates**: 0 tolerance for errors, warnings, or coverage drops
- [ ] **Security Scans**: Run on every commit, not just releases

### **Common Pitfalls:**
- ❌ Skipping pre-commit checks
- ❌ Ignoring test warnings
- ❌ Allowing coverage to drop below 85%
- ❌ Skipping security scans for "minor" changes
- ❌ Not testing performance impact

### **Emergency Fixes:**
1. Run full QA suite to identify issues
2. Apply automated fixes where possible
3. Manually validate fixes don't introduce new issues
4. Document issues and fixes for future prevention

---

## 🔧 **AI Operations Engineer**

### **Critical Prevention Checklist:**
- [ ] **Before Operations**: Validate all tools and services are operational
- [ ] **Pre-commit Setup**: Install and configure all required tools
- [ ] **Security Operations**: Scan every commit for secrets and vulnerabilities
- [ ] **Tool Management**: Keep all tools updated and properly configured

### **Common Pitfalls:**
- ❌ Tool version conflicts
- ❌ Missing dependencies or configuration errors
- ❌ Permission issues or PATH problems
- ❌ Skipping security scans for "minor" changes
- ❌ Not testing pre-commit hooks before enabling

### **Emergency Fixes:**
1. Run diagnostics to identify issues
2. Check tool compatibility and dependencies
3. Verify configurations and permissions
4. Test all hooks before enabling

---

## 📊 **Product Strategist**

### **Critical Prevention Checklist:**
- [ ] **Before Planning**: Understand technical constraints and quality requirements
- [ ] **During Planning**: Ensure features align with quality standards
- [ ] **Quality Alignment**: All features must meet code quality standards
- [ ] **Technical Feasibility**: Verify features can be implemented within constraints

### **Common Pitfalls:**
- ❌ Planning features without considering quality requirements
- ❌ Ignoring technical constraints in favor of business goals
- ❌ Not understanding the impact of quality standards on timelines
- ❌ Skipping quality validation in feature planning

### **Emergency Fixes:**
1. Review technical constraints and quality requirements
2. Adjust feature scope to meet quality standards
3. Communicate quality requirements to development team
4. Update timelines to account for quality work

---

## 🎨 **UX/Product Designer**

### **Critical Prevention Checklist:**
- [ ] **Before Design**: Understand performance and quality constraints
- [ ] **During Design**: Ensure designs support technical quality requirements
- [ ] **Performance Alignment**: Designs must support <100ms response times
- [ ] **Technical Integration**: Verify designs can be implemented within constraints

### **Common Pitfalls:**
- ❌ Designing without considering performance constraints
- ❌ Ignoring technical feasibility in favor of design goals
- ❌ Not understanding the impact of quality standards on design
- ❌ Skipping quality validation in design process

### **Emergency Fixes:**
1. Review performance and quality constraints
2. Adjust designs to meet technical requirements
3. Communicate quality requirements to development team
4. Update designs to support quality standards

---

## 🚀 **Implementation Strategy**

### **Phase 1: Immediate (This Sprint)**
1. **Update Role Documents**: Add prevention checklists to all role documents
2. **Create Early Check Script**: Implement `npm run early-check` for all roles
3. **Fix Current Issues**: Resolve existing TypeScript, ESLint, and test issues
4. **Validate Pre-commit**: Ensure pre-commit workflow is functional

### **Phase 2: Short-term (Next Sprint)**
1. **IDE Configuration**: Set up role-specific IDE configurations
2. **Team Training**: Train team on new prevention procedures
3. **Process Integration**: Integrate prevention checks into daily workflows
4. **Monitoring**: Set up quality monitoring and alerting

### **Phase 3: Long-term (Ongoing)**
1. **Continuous Improvement**: Regular process refinement
2. **Tool Updates**: Keep all tools updated and optimized
3. **Knowledge Sharing**: Document lessons learned and best practices
4. **Team Development**: Ongoing training and skill development

---

## 📚 **Reference Materials**
- [ai-augmented-developer.md](../../roles/ai-augmented-developer.md)
- [ai-quality-assurance-engineer.md](../../roles/ai-quality-assurance-engineer.md)
- [ai-operations-engineer.md](../../roles/ai-operations-engineer.md)
- [product-strategist.md](../../roles/product-strategist.md)
- [ux-product-designer.md](../../roles/ux-product-designer.md)
- [early-quality-gates.md](./early-quality-gates.md)
