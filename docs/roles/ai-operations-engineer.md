# AI Operations Engineer Role

## 🎯 Purpose
This role defines the **operations and infrastructure standards** for Smart MCP, ensuring secure, reliable, and performant deployment while maintaining full compliance with project guidelines and security standards.

---

## 📋 Responsibilities
- **CI/CD Pipeline**: AI-integrated deployment automation
- **Security Operations**: Compliance oversight and vulnerability management
- **Performance Monitoring**: System optimization and reliability
- **Infrastructure Management**: Scalable and secure infrastructure
- **Incident Response**: Production support and recovery procedures
- **AI Tool Operations**: Configuration and monitoring of AI development tools

---

## 🛠️ Skills Required

### Core Operations
- **DevOps Expertise**: CI/CD, infrastructure as code, and automation
- **Security Operations**: Compliance, vulnerability management, and incident response
- **Performance Engineering**: Monitoring, optimization, and scalability
- **Infrastructure Management**: Cloud platforms, containers, and orchestration

### AI-Specific Skills
- **AI Tool Configuration**: Cursor AI and Claude Code operational setup
- **Security Integration**: AI tool security and compliance
- **Performance Monitoring**: AI-assisted operations and monitoring
- **Automation**: AI-enhanced operational procedures

---

## 📐 Operational Standards
Following PROJECT_GUIDELINES.md principles:

### Security-First Operations
- **Secrets Management**: No secrets in repo, secure secret scanning
- **Vulnerability Scanning**: OSV-Scanner and pip-audit integration
- **SAST Integration**: Semgrep OWASP + LLM agent rules
- **Commit Security**: Signed commits on protected branches
- **Branch Protection**: PRs required for high-risk operations

### Deterministic Deployments
- **Frozen Dependencies**: `npm ci` and `uv --frozen` in CI
- **Schema-Locked I/O**: All operations use JSON Schemas
- **Reproducible Builds**: Consistent local and production environments
- **Pre-commit Validation**: All security and quality checks before deployment

### Quality Gates
- **Coverage Enforcement**: ≥85% test coverage required
- **Complexity Limits**: ESLint complexity ≤10, duplication ≤5%
- **Performance Benchmarks**: Meet response time and throughput targets
- **Security Compliance**: Zero critical vulnerabilities in production

---

## 🧪 Operations Testing Strategy
- **Infrastructure Testing**: Automated infrastructure validation
- **Security Testing**: Continuous vulnerability scanning and assessment
- **Performance Testing**: Load testing and performance validation
- **Deployment Testing**: Blue-green deployments and rollback procedures
- **Monitoring Validation**: Comprehensive monitoring and alerting

---

## 📊 Success Metrics
Aligned with PROJECT_GUIDELINES.md scorecard:

### Security (35% weight)
- **Zero Critical Vulnerabilities**: No critical/high vulnerabilities in production
- **Security Compliance**: Full compliance with security standards
- **Incident Response**: <1 hour mean time to detection (MTTD)
- **Audit Results**: Clean security audit reports

### Reliability (25% weight)
- **System Uptime**: ≥99.9% availability
- **Deployment Success**: ≥99% successful deployments
- **Mean Time to Recovery**: <30 minutes MTTR
- **Error Rates**: <0.1% error rate in production

### Performance (20% weight)
- **Response Times**: <100ms average response time
- **Throughput**: Meet performance benchmarks
- **Resource Utilization**: Optimal resource usage
- **Scalability**: Handle expected load growth

### Quality (10% weight)
- **Code Quality**: Operations code meets quality standards
- **Documentation**: Comprehensive operational documentation
- **Process Compliance**: Adherence to operational procedures
- **Knowledge Sharing**: Lessons learned and best practices

### Efficiency (10% weight)
- **Automation**: ≥90% of operations automated
- **Deployment Speed**: <10 minutes deployment time
- **Resource Efficiency**: Optimal resource utilization
- **Cost Management**: Efficient infrastructure costs

**Grade Thresholds**: A ≥90, B ≥80, C ≥70, D ≥60, F <60

---

## 🤝 Collaboration Points
- **AI-Augmented Developer**: Deployment readiness and code quality
- **Product Strategist**: Infrastructure requirements and scaling needs
- **UX/Product Designer**: Performance considerations for user experience
- **AI Quality Assurance Engineer**: Quality gates and validation procedures

---

## 🎯 AI Tool Usage

### Cursor AI
- **Infrastructure as Code**: Configuration management and automation
- **Security Configuration**: Secure setup and monitoring
- **Documentation**: Operational procedures and runbooks

### Claude Code
- **Security Analysis**: Vulnerability assessment and remediation
- **Performance Optimization**: System tuning and optimization
- **Incident Analysis**: Root cause analysis and prevention

### Focus Areas
- **Reliability**: High availability and fault tolerance
- **Security**: Comprehensive security and compliance
- **Performance**: Optimal system performance and scalability
- **Automation**: AI-enhanced operational efficiency

---

## 📁 Project Context
- **Infrastructure**: Node.js MCP server deployment
- **Security Focus**: Comprehensive security and compliance
- **Reliability**: High availability and fault tolerance
- **Integration**: Seamless integration with development workflows
- **Standards**: Full compliance with PROJECT_GUIDELINES.md

---

## ✅ Deliverables
- **CI/CD Pipeline**: Automated, secure deployment pipeline
- **Security Reports**: Comprehensive security audit and compliance reports
- **Performance Dashboards**: Real-time monitoring and alerting
- **Deployment Documentation**: Complete operational procedures
- **Incident Procedures**: Comprehensive incident response and recovery
- **Infrastructure Code**: Secure, scalable infrastructure as code
