#!/usr/bin/env zsh
# Example usage of the Copilot Terminal Detection Oh My Zsh plugin

# Example 1: Check if running in a Copilot terminal
if [[ "$COPILOT_AGENT_DETECTED" == "true" ]]; then
    echo "🤖 Running in a Copilot-controlled terminal"
    # You can add agent-specific behavior here
else
    echo "💻 Running in a regular terminal"
fi

# Example 2: Conditional prompt modification
if [[ "$COPILOT_AGENT_DETECTED" == "true" ]]; then
    # Add Copilot indicator to prompt
    PS1="[🤖 AI] $PS1"
fi

# Example 3: Conditional aliases for agent terminals
if [[ "$COPILOT_AGENT_DETECTED" == "true" ]]; then
    # Agent-friendly aliases
    alias ll='ls -la --color=always' 2>/dev/null || alias ll='ls -la'
    alias grep='grep --color=always' 2>/dev/null || alias grep='grep'
    alias tree='tree -C' 2>/dev/null || true
fi

# Example 4: Use in shell functions
copilot_status() {
    if [[ "$COPILOT_AGENT_DETECTED" == "true" ]]; then
        echo "Agent session: Active"
        echo "Terminal mode: Copilot-controlled"
    else
        echo "Agent session: Inactive"
        echo "Terminal mode: Manual"
    fi
}

# Example 5: Integration with other Oh My Zsh themes
# Add this to your theme file:
# if [[ "$COPILOT_AGENT_DETECTED" == "true" ]]; then
#     RPROMPT="🤖${RPROMPT}"
# fi
