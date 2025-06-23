#!/bin/bash
# Copilot Terminal Detection Shell Configuration
# Add this to your ~/.zshrc or ~/.bashrc file

# Smart detection that considers both marker file AND terminal context
detect_agent_terminal() {
    # Check for agent marker file
    local AGENT_MARKER_FILE=$(find /var/folders -name ".vscode_copilot_agent_session" 2>/dev/null | head -1)
    
    # If no marker file, definitely not an agent terminal
    if [[ ! -f "$AGENT_MARKER_FILE" ]]; then
        return 1
    fi
    
    # Check if this is actually a Copilot-initiated session
    # Look for indicators that this terminal was opened by Copilot
    
    # Method 1: Check if VSCODE_INJECTION is set (indicates VS Code terminal)
    if [[ -z "$VSCODE_INJECTION" ]]; then
        return 1
    fi
    
    # Method 2: Check terminal title/name context
    # If we're in a shell that was launched by Copilot, there might be specific indicators
    
    # Method 3: Check process ancestry for Copilot-related processes
    if command -v pgrep >/dev/null 2>&1; then
        local copilot_processes=$(pgrep -f "copilot\|github.*copilot" 2>/dev/null | wc -l)
        if [[ $copilot_processes -eq 0 ]]; then
            # No Copilot processes running, might be a false positive
            return 1
        fi
    fi
    
    # Method 4: Check if terminal was recently created (within last 30 seconds)
    # This helps distinguish between new Copilot terminals and old regular terminals
    if [[ -f "$AGENT_MARKER_FILE" ]]; then
        local marker_time=$(stat -f %m "$AGENT_MARKER_FILE" 2>/dev/null || stat -c %Y "$AGENT_MARKER_FILE" 2>/dev/null)
        local current_time=$(date +%s)
        local age=$((current_time - marker_time))
        
        # If marker file is older than 30 seconds and this terminal doesn't have other indicators,
        # it might be a regular terminal opened after a Copilot session
        if [[ $age -gt 30 ]]; then
            # Additional check: see if this shell process was started recently
            local shell_start_time=$(ps -o lstart= -p $$)
            # This is a heuristic - if the marker is old but shell is new, 
            # it's likely a regular terminal
            return 1
        fi
    fi
    
    return 0
}

# Run the detection
if detect_agent_terminal; then
    export COPILOT_AGENT_DETECTED=true
    export PS1="[🤖] $PS1"
    echo "🤖 Agent-controlled terminal detected"
    
    # Set additional environment variables for agent mode
    export TERM_COLOR_MODE="agent"
    export SHELL_BEHAVIOR="copilot-friendly"
    
    # Define agent-specific aliases
    alias ll='ls -la --color=always'
    alias grep='grep --color=always'
    alias tree='tree -C'
    
    # Set up agent-friendly prompt
    if [[ -n "$ZSH_VERSION" ]]; then
        autoload -U colors && colors
        PS1="%{$fg[cyan]%}[🤖 AI]%{$reset_color%} %{$fg[green]%}%n@%m%{$reset_color%}:%{$fg[blue]%}%~%{$reset_color%}$ "
    elif [[ -n "$BASH_VERSION" ]]; then
        PS1="\[\e[36m\][🤖 AI]\[\e[0m\] \[\e[32m\]\u@\h\[\e[0m\]:\[\e[34m\]\w\[\e[0m\]$ "
    fi
else
    export COPILOT_AGENT_DETECTED=false
    echo "🖥️  Regular terminal session"
    
    # Set different behavior for non-agent terminals
    export TERM_COLOR_MODE="standard"
    export SHELL_BEHAVIOR="standard"
fi
    
elif [[ "$AGENT_DETECTED_BY_ENV" == "true" ]]; then
    export COPILOT_AGENT_DETECTED=true
    export PS1="[🤖 ENV] $PS1"
    echo "🤖 Agent-controlled terminal detected (via environment variables)"
    echo "⚠️  Note: Environment variable detection affects all terminals"
    
    # Optional: Set additional environment variables for agent mode
    export TERM_COLOR_MODE="agent"
    export SHELL_BEHAVIOR="copilot-friendly"
    
else
    export COPILOT_AGENT_DETECTED=false
    
    # Optional: Set different behavior for non-agent terminals
    export TERM_COLOR_MODE="standard"
    export SHELL_BEHAVIOR="standard"
fi

# Optional: Define agent-specific aliases (only if agent detected)
if [[ "$COPILOT_AGENT_DETECTED" == "true" ]]; then
    alias ll='ls -la --color=always'
    alias grep='grep --color=always'
    alias tree='tree -C'
    
    # Optional: Set up agent-friendly prompt with more info
    if [[ -n "$ZSH_VERSION" ]]; then
        # Zsh-specific configuration
        autoload -U colors && colors
        if [[ "$AGENT_DETECTED_BY_FILE" == "true" ]]; then
            PS1="%{$fg[cyan]%}[🤖 AI-FILE]%{$reset_color%} %{$fg[green]%}%n@%m%{$reset_color%}:%{$fg[blue]%}%~%{$reset_color%}$ "
        else
            PS1="%{$fg[cyan]%}[🤖 AI-ENV]%{$reset_color%} %{$fg[green]%}%n@%m%{$reset_color%}:%{$fg[blue]%}%~%{$reset_color%}$ "
        fi
    elif [[ -n "$BASH_VERSION" ]]; then
        # Bash-specific configuration
        if [[ "$AGENT_DETECTED_BY_FILE" == "true" ]]; then
            PS1="\[\e[36m\][🤖 AI-FILE]\[\e[0m\] \[\e[32m\]\u@\h\[\e[0m\]:\[\e[34m\]\w\[\e[0m\]$ "
        else
            PS1="\[\e[36m\][🤖 AI-ENV]\[\e[0m\] \[\e[32m\]\u@\h\[\e[0m\]:\[\e[34m\]\w\[\e[0m\]$ "
        fi
    fi
fi

# Function to check if current terminal is agent-controlled
is_agent_terminal() {
    [[ "$COPILOT_AGENT_DETECTED" == "true" ]]
}

# Function to show agent status
show_agent_status() {
    if is_agent_terminal; then
        echo "🤖 This terminal is controlled by a Copilot agent"
        echo "Detection method:"
        if [[ "$AGENT_DETECTED_BY_FILE" == "true" ]]; then
            echo "  📁 File-based detection: $AGENT_MARKER_FILE"
        elif [[ "$AGENT_DETECTED_BY_ENV" == "true" ]]; then
            echo "  🌍 Environment variable detection (affects all terminals)"
        fi
        echo "Environment variables:"
        echo "  IS_AGENT_SESSION=$IS_AGENT_SESSION"
        echo "  TERMINAL_MODE=$TERMINAL_MODE"
        echo "  COPILOT_AGENT_DETECTED=$COPILOT_AGENT_DETECTED"
    else
        echo "🖥️  This is a standard terminal session"
        echo "  COPILOT_AGENT_DETECTED=$COPILOT_AGENT_DETECTED"
        echo "  No agent marker file found at: $AGENT_MARKER_FILE"
    fi
}

# Optional: Alias for quick status check
alias agent-status='show_agent_status'
