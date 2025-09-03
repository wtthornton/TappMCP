# Role-Based Development with AI Tools

This directory contains role definitions and corresponding `.cursorrules` files for AI-assisted development with the Smart MCP project.

## Role Structure

### Core Roles
1. **AI-Augmented Developer** (`ai-augmented-developer.md`)
   - Primary development role
   - Code generation, architecture, and quality assurance
   - Uses: `developer.cursorrules`

2. **Product Strategist** (`product-strategist.md`)
   - Product vision, roadmap, and stakeholder management
   - Business analysis and market research
   - Uses: `product.cursorrules`

3. **AI Operations Engineer** (`ai-operations-engineer.md`)
   - DevOps, security, and production deployment
   - CI/CD and infrastructure management
   - Uses: `operations.cursorrules`

4. **UX/Product Designer** (`ux-product-designer.md`)
   - User experience and interface design
   - Design system and usability
   - Uses: `designer.cursorrules`

## Usage Instructions

### Switching Roles
To switch between roles, copy the appropriate `.cursorrules` file to the project root:

```bash
# Switch to Developer role
cp developer.cursorrules .cursorrules

# Switch to Product role
cp product.cursorrules .cursorrules

# Switch to Operations role
cp operations.cursorrules .cursorrules

# Switch to Designer role (when needed)
cp designer.cursorrules .cursorrules
```

### Role-Specific AI Behavior
Each `.cursorrules` file configures AI tools to:
- Focus on role-specific priorities
- Use appropriate terminology and context
- Provide relevant suggestions and assistance
- Maintain consistency with role responsibilities

### Benefits
- **Single Source of Truth**: Role definitions in markdown files
- **No Duplication**: `.cursorrules` files reference documentation
- **Easy Maintenance**: Update roles in one place
- **Consistent Behavior**: AI tools understand role context
- **Flexible Workflow**: Easy role switching as needed

## File Structure
```
docs/roles/
├── README.md (this file)
├── ai-augmented-developer.md
├── product-strategist.md
├── ai-operations-engineer.md
└── ux-product-designer.md

.cursorrules files (project root):
├── developer.cursorrules
├── product.cursorrules
├── operations.cursorrules
└── designer.cursorrules
```

## Best Practices
1. **Start each session** by setting the appropriate role context
2. **Update role documentation** when responsibilities change
3. **Use role-specific language** in AI interactions
4. **Switch roles explicitly** when changing focus areas
5. **Maintain consistency** between role docs and `.cursorrules` files
