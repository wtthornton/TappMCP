# Vibe Coder Usage Guide

## Quick Start

### 1. Install Dependencies
```bash
cd src/vibe
npm install
```

### 2. Build the Project
```bash
npm run build
```

### 3. Run the CLI
```bash
# Interactive mode
npm start

# Or run specific commands
node dist/VibeCLI.js "help me write a function"
node dist/VibeCLI.js "analyze my code for issues"
node dist/VibeCLI.js "plan a new feature"
```

## Available Commands

### Natural Language Commands
- **"help me write [something]"** - Uses smart_write tool
- **"analyze my code"** - Uses smart_begin for analysis
- **"plan a new feature"** - Uses smart_plan for planning
- **"orchestrate my workflow"** - Uses smart_orchestrate
- **"finish my task"** - Uses smart_finish
- **"think through this problem"** - Uses smart_thought_process
- **"converse about [topic]"** - Uses smart_converse

### Configuration Commands
- **"config show"** - Show current configuration
- **"config set [key] [value]"** - Set configuration value
- **"status"** - Show system status

## Examples

### Writing Code
```bash
node dist/VibeCLI.js "help me write a TypeScript function that validates email addresses"
```

### Code Analysis
```bash
node dist/VibeCLI.js "analyze my TypeScript files for security issues"
```

### Planning
```bash
node dist/VibeCLI.js "plan a user authentication system with JWT tokens"
```

### Workflow Orchestration
```bash
node dist/VibeCLI.js "orchestrate a CI/CD pipeline for my Node.js app"
```

## Configuration

The Vibe Coder uses intelligent defaults but can be configured:

```bash
# Set default role
node dist/VibeCLI.js "config set defaultRole developer"

# Set quality level
node dist/VibeCLI.js "config set defaultQuality high"

# Set verbosity
node dist/VibeCLI.js "config set defaultVerbosity detailed"
```

## Integration

### Programmatic Usage
```typescript
import { VibeTapp } from './core/VibeTapp.js';

const vibe = new VibeTapp();

// Process a vibe command
const response = await vibe.vibe("help me write a function");
console.log(response.formattedOutput);
```

### CLI Integration
```bash
# Add to your package.json scripts
"vibe": "node src/vibe/dist/VibeCLI.js"
```

## Troubleshooting

### Common Issues
1. **Build errors**: Make sure you're in the `src/vibe` directory
2. **Module not found**: Run `npm install` first
3. **Permission errors**: Make sure the bin file is executable

### Getting Help
```bash
node dist/VibeCLI.js "help"
node dist/VibeCLI.js "status"
```

## Next Steps

1. **Test the interface**: Try different natural language commands
2. **Customize configuration**: Set your preferred defaults
3. **Integrate with your workflow**: Add to your development process
4. **Extend functionality**: Add custom adapters for your tools

The Vibe Coder is designed to be intuitive and powerful - just speak naturally and it will understand your intent!
