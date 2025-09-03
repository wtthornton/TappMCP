#!/bin/bash
# Role Switching Script for Smart MCP Project
# Usage: ./switch-role.sh [developer|product|operations|designer]

ROLE=$1

case $ROLE in
    "developer")
        SOURCE_FILE="developer.cursorrules"
        ;;
    "product")
        SOURCE_FILE="product.cursorrules"
        ;;
    "operations")
        SOURCE_FILE="operations.cursorrules"
        ;;
    "designer")
        SOURCE_FILE="designer.cursorrules"
        ;;
    "qa")
        SOURCE_FILE="qa.cursorrules"
        ;;
    *)
        echo "❌ Invalid role: $ROLE"
        echo "Available roles: developer, product, operations, designer, qa"
        exit 1
        ;;
esac

if [ -f "$SOURCE_FILE" ]; then
    cp "$SOURCE_FILE" ".cursorrules"
    echo "✅ Switched to $ROLE role"
    echo "📋 Role documentation: docs/roles/$ROLE.md"
else
    echo "❌ Role file not found: $SOURCE_FILE"
    exit 1
fi
