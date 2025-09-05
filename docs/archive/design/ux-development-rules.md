# UX Development Rules - TappMCP Project

**Document Version**: 1.0
**Date**: December 2024
**Status**: Active Development Rules
**Target Audience**: Development Team

## 🎯 **Purpose**

This document provides specific rules and guidelines for implementing UX enhancements in the TappMCP project. These rules ensure consistent, user-friendly experiences across all tools and interactions.

## 📋 **Core UX Rules**

### **Rule 1: Always Provide User-Friendly Error Messages**

#### **Implementation Requirements**
```typescript
// REQUIRED: Every error response must include
interface ErrorResponse {
  technicalError: string;        // For developers
  userMessage: string;          // For end users
  explanation: string;          // What happened
  nextSteps: string[];         // How to fix it
  businessImpact: string;      // Why it matters
  severity: 'low' | 'medium' | 'high' | 'critical';
}
```

#### **Error Message Rules**
1. **NEVER** show raw technical errors to end users
2. **ALWAYS** explain what the error means in business terms
3. **ALWAYS** provide 3-5 specific next steps
4. **ALWAYS** explain the business impact
5. **ALWAYS** include role-specific guidance when available

#### **Example Implementation**
```typescript
// ❌ BAD - Technical error only
throw new Error("Tool 'smart_begin' not found");

// ✅ GOOD - User-friendly error
const error: ErrorResponse = {
  technicalError: "Tool 'smart_begin' not found",
  userMessage: "Project setup tool is not available",
  explanation: "The system cannot find the tool needed to start new projects",
  nextSteps: [
    "Check your MCP configuration",
    "Restart the server",
    "Contact support if issue persists"
  ],
  businessImpact: "This prevents you from starting new projects",
  severity: 'high'
};
```

### **Rule 2: Show Progress for Operations >2 Seconds**

#### **Implementation Requirements**
```typescript
// REQUIRED: Progress feedback interface
interface ProgressUpdate {
  currentPhase: string;
  progressMessage: string;
  progressPercentage: number;
  estimatedTimeRemaining: string;
  currentAction: string;
  businessValue: string;
  nextSteps: string[];
}
```

#### **Progress Rules**
1. **ALWAYS** show progress for operations >2 seconds
2. **ALWAYS** update progress every 500ms
3. **ALWAYS** explain business value being created
4. **ALWAYS** provide estimated time remaining
5. **ALWAYS** show next steps after completion

#### **Example Implementation**
```typescript
// ✅ GOOD - Progress feedback
const progress: ProgressUpdate = {
  currentPhase: "Creating Structure",
  progressMessage: "Setting up your project files and folders",
  progressPercentage: 45,
  estimatedTimeRemaining: "30 seconds remaining",
  currentAction: "Creating package.json and tsconfig.json",
  businessValue: "This ensures your project follows best practices",
  nextSteps: ["Quality gates will be configured next", "Then you can start coding"]
};
```

### **Rule 3: Provide Role-Specific Context**

#### **Implementation Requirements**
```typescript
// REQUIRED: Role state indicator
interface RoleState {
  currentRole: string;
  roleContext: {
    name: string;
    description: string;
    capabilities: string[];
    currentFocus: string;
    status: 'active' | 'idle' | 'working' | 'error';
  };
  availableActions: ActionOption[];
  roleGuidance: {
    tips: string[];
    bestPractices: string[];
    commonTasks: string[];
  };
}
```

#### **Role Context Rules**
1. **ALWAYS** show current role prominently
2. **ALWAYS** display role capabilities
3. **ALWAYS** provide role-specific guidance
4. **ALWAYS** show available actions
5. **ALWAYS** update status in real-time

### **Rule 4: Use Business Language, Not Technical Jargon**

#### **Language Rules**
| Technical Term | Business Language | Use When |
|----------------|-------------------|----------|
| "Schema validation failed" | "The information doesn't match our requirements" | Error messages |
| "MCP server" | "AI development system" | User-facing text |
| "Tool handler" | "Project assistant" | User-facing text |
| "JSON schema" | "Data format requirements" | User-facing text |
| "API endpoint" | "Service connection" | User-facing text |

#### **Implementation Rules**
1. **NEVER** use technical jargon in user-facing messages
2. **ALWAYS** explain technical concepts in business terms
3. **ALWAYS** provide context for why something matters
4. **ALWAYS** use role-appropriate language

## 🎨 **Visual Design Rules**

### **Rule 5: Consistent Color Coding by Role**

#### **Color Rules**
```typescript
// REQUIRED: Role color mapping
const ROLE_COLORS = {
  developer: '#2563EB',    // Blue
  product: '#059669',      // Green
  designer: '#7C3AED',     // Purple
  qa: '#EA580C',           // Orange
  ops: '#DC2626'           // Red
} as const;
```

#### **Visual Rules**
1. **ALWAYS** use role-specific colors consistently
2. **ALWAYS** provide color contrast ratios ≥4.5:1
3. **ALWAYS** include color-blind accessible alternatives
4. **ALWAYS** use consistent spacing (8px grid)

### **Rule 6: Clear Visual Hierarchy**

#### **Hierarchy Rules**
1. **ALWAYS** show current role at the top
2. **ALWAYS** display progress indicators prominently
3. **ALWAYS** group related information together
4. **ALWAYS** use consistent typography scales

## 📊 **User Experience Rules**

### **Rule 7: Provide Immediate Feedback**

#### **Feedback Rules**
1. **ALWAYS** acknowledge user actions within 100ms
2. **ALWAYS** show loading states for operations >1 second
3. **ALWAYS** provide success confirmations
4. **ALWAYS** explain what happened and what's next

### **Rule 8: Prevent User Errors**

#### **Prevention Rules**
1. **ALWAYS** validate inputs before submission
2. **ALWAYS** provide clear requirements upfront
3. **ALWAYS** suggest corrections for invalid inputs
4. **ALWAYS** offer examples and templates

### **Rule 9: Guide Users Through Complex Processes**

#### **Guidance Rules**
1. **ALWAYS** break complex processes into steps
2. **ALWAYS** show progress through multi-step processes
3. **ALWAYS** provide help and support throughout
4. **ALWAYS** validate each step before proceeding

## 🧪 **Testing Rules**

### **Rule 10: Test User Experience, Not Just Functionality**

#### **UX Testing Requirements**
1. **ALWAYS** test with non-technical users
2. **ALWAYS** validate error message clarity
3. **ALWAYS** test progress indicator accuracy
4. **ALWAYS** verify role context clarity
5. **ALWAYS** measure user satisfaction

#### **UX Test Scenarios**
- **Error Recovery**: Can users understand and fix errors?
- **Progress Understanding**: Do users know what's happening?
- **Role Clarity**: Do users understand their current role?
- **Onboarding Success**: Can new users complete setup?

## 📋 **Implementation Checklist**

### **For Every Feature**
- [ ] User-friendly error messages implemented
- [ ] Progress feedback for long operations
- [ ] Role-specific context provided
- [ ] Business language used throughout
- [ ] Visual design follows guidelines
- [ ] User experience tested
- [ ] Accessibility requirements met

### **For Every Error**
- [ ] Technical error logged for developers
- [ ] User-friendly message displayed
- [ ] Business impact explained
- [ ] Next steps provided
- [ ] Role-specific guidance included

### **For Every Long Operation**
- [ ] Progress indicator shown
- [ ] Current phase displayed
- [ ] Business value explained
- [ ] Estimated time provided
- [ ] Next steps previewed

## 🚫 **Common Mistakes to Avoid**

### **UX Anti-Patterns**
1. **DON'T** show technical errors to end users
2. **DON'T** leave users guessing what's happening
3. **DON'T** use technical jargon in user messages
4. **DON'T** skip progress feedback for long operations
5. **DON'T** forget role-specific context

### **Technical Anti-Patterns**
1. **DON'T** hardcode error messages
2. **DON'T** skip input validation
3. **DON'T** forget accessibility requirements
4. **DON'T** ignore performance implications
5. **DON'T** skip user testing

## 📚 **Resources and References**

### **Design System**
- Color palette and typography guidelines
- Component specifications and examples
- Accessibility requirements and testing
- User research findings and insights

### **Development Tools**
- Error message templates and examples
- Progress indicator components
- Role state management utilities
- User experience testing frameworks

---

**Document Owner**: UX/Product Designer
**Last Updated**: December 2024
**Next Review**: January 2025
**Status**: Active Development Rules
