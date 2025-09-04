# Process Compliance Checklist
## Preventing Role and Testing Rule Violations

**Purpose**: Comprehensive checklist to prevent process compliance failures like the Phase 1C incident.

---

## 🚨 **CRITICAL: Before Starting Any Work**

### **Role Validation (MANDATORY)**
- [ ] **Explicit Role Confirmation**: State "I am now in the [ROLE] role" before starting
- [ ] **Role Requirements Review**: Read the complete role-specific document
- [ ] **Process Understanding**: Understand all role-specific responsibilities
- [ ] **Success Metrics**: Know the role-specific success metrics and thresholds

### **Environment Validation (MANDATORY)**
- [ ] **Early Quality Check**: Run `npm run early-check` - MUST PASS
- [ ] **Clean State**: No TypeScript errors, ESLint warnings, or test failures
- [ ] **Dependencies**: All packages installed and up-to-date
- [ ] **Tool Configuration**: All quality tools properly configured
- [ ] **Project Guidelines**: Review current standards and requirements

---

## 🧪 **Testing Compliance (MANDATORY)**

### **Test-Driven Development (TDD)**
- [ ] **Write Tests First**: Create tests BEFORE implementing features
- [ ] **Test Coverage**: Ensure ≥85% coverage on all changed files
- [ ] **Edge Cases**: Test all edge cases and error scenarios
- [ ] **Mock Dependencies**: Mock all external dependencies
- [ ] **Test Data**: Use proper test data fixtures

### **Pre-commit Testing**
- [ ] **TypeScript Check**: `npm run type-check` - MUST PASS
- [ ] **ESLint Check**: `npm run lint:check` - MUST PASS
- [ ] **Formatting Check**: `npm run format:check` - MUST PASS
- [ ] **Unit Tests**: `npm run test` - MUST PASS
- [ ] **Pre-commit Hooks**: `npm run pre-commit:run` - MUST PASS

---

## 🔒 **Security Compliance (MANDATORY)**

### **Security Scanning**
- [ ] **OSV-Scanner**: Run vulnerability scanning before commits
- [ ] **Semgrep**: Run static analysis before commits
- [ ] **Secrets Check**: Ensure no secrets in codebase
- [ ] **Dependency Audit**: Check for vulnerable dependencies
- [ ] **Security Review**: Review all security-related changes

---

## ⚡ **Performance Compliance (MANDATORY)**

### **Performance Validation**
- [ ] **Response Time**: Ensure <100ms response time targets
- [ ] **Memory Usage**: Validate memory usage is within limits
- [ ] **Load Testing**: Test under expected load conditions
- [ ] **Performance Monitoring**: Monitor performance metrics
- [ ] **Optimization**: Optimize code for performance

---

## 📊 **Quality Compliance (MANDATORY)**

### **Quality Gates**
- [ ] **TypeScript Errors**: 0 (blocking)
- [ ] **ESLint Errors**: 0 (blocking)
- [ ] **Test Coverage**: ≥85% (blocking)
- [ ] **Performance**: <100ms response time (blocking)
- [ ] **Security**: 0 critical vulnerabilities (blocking)
- [ ] **Complexity**: ≤10 cyclomatic complexity (blocking)
- [ ] **Duplication**: ≤5% code duplication (blocking)

### **Code Standards**
- [ ] **TypeScript Strict**: Full strict mode compliance
- [ ] **Error Handling**: Comprehensive error handling
- [ ] **Documentation**: All public APIs documented
- [ ] **Code Review**: Self-review all changes
- [ ] **Refactoring**: Refactor complex code

---

## 🔄 **Process Compliance (MANDATORY)**

### **Development Process**
- [ ] **Incremental Commits**: Small, focused commits
- [ ] **Quality Checks**: Run quality checks frequently
- [ ] **Process Adherence**: Follow all established processes
- [ ] **Documentation**: Document all decisions and rationale
- [ ] **Communication**: Communicate process compliance status

### **Role-Specific Process**
- [ ] **Role Requirements**: Follow all role-specific requirements
- [ ] **Success Metrics**: Track role-specific success metrics
- [ ] **Quality Standards**: Meet role-specific quality standards
- [ ] **Process Validation**: Validate process compliance
- [ ] **Continuous Improvement**: Learn from mistakes and improve

---

## 🚨 **Emergency Procedures**

### **If Process Violations Are Detected:**
1. **Immediate Stop**: Stop all work immediately
2. **Assessment**: Assess the scope of violations
3. **Fix Priority**: Fix critical issues first
4. **Process Review**: Review and understand what went wrong
5. **Corrective Action**: Take corrective action
6. **Prevention**: Implement prevention measures
7. **Documentation**: Document lessons learned

### **If Quality Issues Are Found:**
1. **Early Quality Check**: Run `npm run early-check`
2. **Issue Identification**: Identify all quality issues
3. **Priority Fixing**: Fix issues in priority order
4. **Validation**: Validate fixes don't introduce new issues
5. **Process Review**: Review process to prevent recurrence
6. **Documentation**: Document issues and fixes

---

## 📋 **Role-Specific Checklists**

### **AI-Augmented Developer**
- [ ] **Role Validation**: Confirm AI-Augmented Developer role
- [ ] **TDD Approach**: Write tests before implementing features
- [ ] **Quality Gates**: Meet all quality gate requirements
- [ ] **Security Scans**: Run all security scans
- [ ] **Performance**: Ensure <100ms response times
- [ ] **Process Adherence**: Follow all development processes

### **AI Quality Assurance Engineer**
- [ ] **Role Validation**: Confirm AI Quality Assurance Engineer role
- [ ] **Test Strategy**: Implement comprehensive test strategy
- [ ] **Quality Validation**: Validate all quality requirements
- [ ] **Security Testing**: Run all security tests
- [ ] **Performance Testing**: Validate performance requirements
- [ ] **Process Compliance**: Ensure process compliance

### **AI Operations Engineer**
- [ ] **Role Validation**: Confirm AI Operations Engineer role
- [ ] **Tool Configuration**: Configure all operational tools
- [ ] **Security Operations**: Implement security operations
- [ ] **Performance Monitoring**: Set up performance monitoring
- [ ] **Process Automation**: Automate operational processes
- [ ] **Incident Response**: Prepare incident response procedures

### **Product Strategist**
- [ ] **Role Validation**: Confirm Product Strategist role
- [ ] **Business Alignment**: Align with business requirements
- [ ] **Quality Integration**: Integrate quality requirements
- [ ] **Technical Feasibility**: Validate technical feasibility
- [ ] **Process Integration**: Integrate with development processes
- [ ] **Stakeholder Communication**: Communicate with stakeholders

### **UX/Product Designer**
- [ ] **Role Validation**: Confirm UX/Product Designer role
- [ ] **User Experience**: Focus on user experience
- [ ] **Performance Design**: Design for performance
- [ ] **Accessibility**: Ensure accessibility compliance
- [ ] **Process Integration**: Integrate with development processes
- [ ] **Design Validation**: Validate design decisions

---

## 📚 **Reference Materials**

- [ai-augmented-developer.md](../../roles/ai-augmented-developer.md)
- [ai-quality-assurance-engineer.md](../../roles/ai-quality-assurance-engineer.md)
- [ai-operations-engineer.md](../../roles/ai-operations-engineer.md)
- [product-strategist.md](../../roles/product-strategist.md)
- [ux-product-designer.md](../../roles/ux-product-designer.md)
- [role-specific-prevention-guide.md](./role-specific-prevention-guide.md)
- [early-quality-gates.md](./early-quality-gates.md)
- [phase-1c-role-compliance-failure.md](../../lessons/project/phase-1c-role-compliance-failure.md)

---

## 🎯 **Success Metrics**

### **Process Compliance:**
- **Role Compliance**: 100% (target: 100%)
- **Testing Compliance**: 100% (target: 100%)
- **Quality Compliance**: 100% (target: 100%)
- **Security Compliance**: 100% (target: 100%)
- **Performance Compliance**: 100% (target: 100%)

### **Quality Standards:**
- **TypeScript Errors**: 0 (target: 0)
- **ESLint Errors**: 0 (target: 0)
- **Test Coverage**: ≥85% (target: ≥85%)
- **Performance**: <100ms (target: <100ms)
- **Security**: 0 critical vulnerabilities (target: 0)
- **Complexity**: ≤10 (target: ≤10)
- **Duplication**: ≤5% (target: ≤5%)

---

**Remember**: Process compliance is not optional - it's essential for maintaining quality, preventing issues, and ensuring project success. Follow this checklist religiously to avoid process violations and quality issues.
