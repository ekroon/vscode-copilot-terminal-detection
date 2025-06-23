#!/bin/bash
# demo.sh - Demonstration script for Copilot Terminal Detection

echo "🚀 Copilot Terminal Detection Demo"
echo "=================================="
echo

# Check if we're in an agent-controlled terminal
echo "🔍 Checking terminal environment..."
echo

if [[ "$IS_AGENT_SESSION" == "true" ]] || [[ "$TERMINAL_MODE" == "agent" ]]; then
    echo "✅ Agent-controlled terminal detected!"
    echo "🤖 Environment variables set by extension:"
    echo "   IS_AGENT_SESSION: $IS_AGENT_SESSION"
    echo "   TERMINAL_MODE: $TERMINAL_MODE"
    echo "   COPILOT_AGENT_DETECTED: $COPILOT_AGENT_DETECTED"
    echo
    echo "🎨 Terminal behavior modified for agent interaction:"
    echo "   - Enhanced prompt with 🤖 indicator"
    echo "   - Colorized output enabled"
    echo "   - Verbose command aliases activated"
    echo
    echo "🧪 Testing agent-optimized commands:"
    
    # Show colorized directory listing
    echo "📁 Directory listing (colorized):"
    ls -la --color=always 2>/dev/null || ls -la
    echo
    
    # Show current working directory with formatting
    echo "📍 Current location: $(pwd)"
    echo "📊 Files in directory: $(ls -1 | wc -l | tr -d ' ')"
    echo
    
    # Git status if in a git repository
    if git rev-parse --git-dir > /dev/null 2>&1; then
        echo "🔀 Git repository detected:"
        git --no-pager status --short 2>/dev/null || echo "   Clean working directory"
    fi
    
else
    echo "ℹ️  Standard terminal session detected"
    echo "   IS_AGENT_SESSION: ${IS_AGENT_SESSION:-unset}"
    echo "   TERMINAL_MODE: ${TERMINAL_MODE:-unset}"
    echo "   COPILOT_AGENT_DETECTED: ${COPILOT_AGENT_DETECTED:-false}"
    echo
    echo "💡 To test agent detection:"
    echo "   1. Install the Copilot Terminal Detection extension"
    echo "   2. Ask GitHub Copilot to open a terminal"
    echo "   3. Run this script again"
fi

echo
echo "🎯 Demo complete!"
echo
echo "📚 For more information, see:"
echo "   - README.md for installation and setup"
echo "   - USAGE.md for detailed examples"
echo "   - shell-integration.sh for shell configuration"
