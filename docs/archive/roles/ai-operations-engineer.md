# AI Operations Engineer Role
## Role Reference: docs/roles/ai-operations-engineer.md

### 🎯 Purpose
Operations and infrastructure standards ensuring secure, reliable, and performant deployment while maintaining full compliance with project-guidelines.md standards.

### 📋 Responsibilities
- **CI/CD Pipeline**: AI-integrated deployment automation
- **Security Operations**: Compliance oversight and vulnerability management
- **Performance Monitoring**: System optimization and reliability
- **Infrastructure Management**: Scalable and secure infrastructure
- **Incident Response**: Production support and recovery procedures
- **AI Tool Operations**: Configuration and monitoring of AI development tools

### 📐 project-guidelines.md Standards
- **Security-First**: No secrets in repo, secure secret scanning, vulnerability scanning
- **Deterministic Deployments**: `npm ci` and frozen dependencies in CI
- **Quality Gates**: ≥85% test coverage, complexity ≤10, performance targets
- **Pre-commit Validation**: All security and quality checks before deployment

### 🎯 AI Assistance Priorities
1. **Security Operations**: Vulnerability scanning, remediation, and compliance
2. **Performance Optimization**: System tuning, monitoring, and scaling
3. **CI/CD Automation**: Pipeline configuration and infrastructure as code
4. **Incident Response**: Root cause analysis and prevention procedures
5. **AI Tool Operations**: Secure configuration and monitoring of AI tools

### 📊 Success Metrics
- **Security (35%)**: Zero critical vulnerabilities, security compliance, incident response
- **Reliability (25%)**: ≥99.9% uptime, ≥99% deployment success, <30min MTTR
- **Performance (20%)**: <100ms response time, throughput targets, scalability
- **Quality (10%)**: Operations code quality, documentation, process compliance
- **Efficiency (10%)**: ≥90% automation, <10min deployment, resource efficiency

### 🛠️ Operations Guidelines
- **Security-First**: All configurations prioritize security and compliance
- **Automated Pipelines**: Comprehensive testing and deployment automation
- **Monitoring**: Application and infrastructure health monitoring
- **Disaster Recovery**: Backup strategies and recovery procedures
- **Performance**: Optimization and scaling for growth

### 🔒 Security Standards
- **Vulnerability Management**: OSV-Scanner and pip-audit integration
- **SAST Integration**: Semgrep OWASP + LLM agent rules
- **Secrets Management**: No secrets in repo, secure scanning
- **Access Control**: Authentication and authorization
- **Compliance**: Relevant standards and audit requirements

### 📊 Monitoring and Alerting
- **Performance Monitoring**: Application and infrastructure metrics
- **Error Tracking**: Comprehensive logging and error analysis
- **Capacity Planning**: Resource utilization and scaling
- **Incident Response**: Automated alerting and response procedures
- **AI Tool Monitoring**: Performance and effectiveness tracking

### 🎓 Training Resources
- **Comprehensive Training**: [AI Operations Engineer Training Guide](ai-operations-engineer-training.md)
- **Infrastructure Patterns**: Reliable, secure infrastructure patterns
- **Monitoring Strategies**: Comprehensive monitoring and alerting

---

## 🚨 **CRITICAL: Lessons Learned - Operations Prevention Checklist**

### **Before Any Operations Work:**
1. **Environment Validation**: Verify all tools and services are operational
2. **Security Baseline**: Ensure all security tools are configured and working
3. **Backup Verification**: Confirm backups are current and accessible
4. **Monitoring Check**: Validate all monitoring and alerting systems
5. **Dependency Audit**: Check for outdated or vulnerable dependencies

### **Pre-commit Infrastructure Setup:**
1. **Tool Installation**: Install all required security and quality tools
2. **Configuration Validation**: Ensure all configs are correct and tested
3. **Version Compatibility**: Verify tool versions are compatible
4. **Path Configuration**: Ensure all tools are in PATH and accessible
5. **Permission Checks**: Verify proper permissions for all operations

### **Security Operations Standards:**
1. **Secrets Scanning**: Every commit must be scanned for secrets
2. **Vulnerability Scanning**: All dependencies must be checked for vulnerabilities
3. **SAST Scanning**: Static analysis must pass on all code
4. **Dependency Updates**: Regular updates and vulnerability patching
5. **Access Control**: Validate all authentication and authorization

### **Common Operations Pitfalls to Avoid:**
- ❌ **Tool Version Conflicts**: Always check tool compatibility before installation
- ❌ **Missing Dependencies**: Ensure all required packages are installed
- ❌ **Configuration Errors**: Validate all configs before deployment
- ❌ **Permission Issues**: Verify proper permissions for all operations
- ❌ **Path Problems**: Ensure all tools are accessible in PATH
- ❌ **Security Oversights**: Don't skip security scans for "minor" changes

### **Pre-commit Hook Management:**
1. **Tool Installation**: Install pre-commit and all required tools
2. **Configuration Setup**: Create proper .pre-commit-config.yaml
3. **Hook Installation**: Run `pre-commit install` to set up hooks
4. **Testing**: Test all hooks before enabling
5. **Monitoring**: Monitor hook performance and fix issues

### **Security Tool Configuration:**
- **Gitleaks**: Configure for secrets scanning
- **OSV-Scanner**: Set up for vulnerability scanning
- **Semgrep**: Configure for SAST scanning
- **Tool Updates**: Regular updates and configuration maintenance
- **Error Handling**: Proper error handling and reporting

### **CI/CD Pipeline Standards:**
1. **Quality Gates**: All quality checks must pass before deployment
2. **Security Scans**: Comprehensive security scanning in pipeline
3. **Performance Tests**: Load and performance testing
4. **Rollback Capability**: Quick rollback for failed deployments
5. **Monitoring**: Real-time monitoring and alerting

### **Infrastructure Management:**
1. **Scalability**: Design for expected load + 20% buffer
2. **Reliability**: High availability and fault tolerance
3. **Security**: Secure by default configuration
4. **Monitoring**: Comprehensive monitoring and alerting
5. **Backup**: Regular backups and disaster recovery

### **Incident Response Procedures:**
1. **Detection**: Automated monitoring and alerting
2. **Assessment**: Quick impact and severity assessment
3. **Response**: Immediate response and mitigation
4. **Recovery**: System recovery and service restoration
5. **Post-mortem**: Analysis and prevention measures

### **AI Tool Operations:**
1. **Configuration**: Secure and optimized AI tool configuration
2. **Monitoring**: Performance and effectiveness monitoring
3. **Updates**: Regular updates and maintenance
4. **Security**: Secure AI tool operations
5. **Optimization**: Continuous optimization and improvement

### **Emergency Operations Response:**
1. **Immediate Assessment**: Run diagnostics to identify issues
2. **Impact Analysis**: Determine scope and severity
3. **Quick Fixes**: Apply automated fixes where possible
4. **Manual Intervention**: Manual fixes for complex issues
5. **Documentation**: Record incidents and fixes

### **Operations Tool Configuration:**
- **Pre-commit**: Automated quality and security checks
- **Security Tools**: Gitleaks, OSV-Scanner, Semgrep
- **Quality Tools**: ESLint, Prettier, TypeScript
- **Testing Tools**: Vitest, coverage reporting
- **Monitoring**: Application and infrastructure monitoring

### **Continuous Improvement:**
- **Tool Updates**: Regular updates to operations tools
- **Process Refinement**: Ongoing improvement of operations processes
- **Team Training**: Regular training on operations best practices
- **Knowledge Sharing**: Document lessons learned and best practices

---

## 📚 **Reference Materials**
- [project-guidelines.md](../../project-guidelines.md)
- [early-quality-gates.md](../../implementation/06-supporting-docs/early-quality-gates.md)
- [essential-operations.md](../../implementation/06-supporting-docs/essential-operations.md)
- [mcp-fallback-strategies.md](../../implementation/06-supporting-docs/mcp-fallback-strategies.md)
