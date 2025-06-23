#!/bin/bash
# Copilot Terminal Detection Shell Configuration (Process-Based Detection)
# Add this to your ~/.zshrc or ~/.bashrc file

# Function to get the dynamic temp directory path
get_temp_dir() {
    if command -v node >/dev/null 2>&1; then
        node -e "console.log(require('os').tmpdir())"
    else
        # Fallback to common temp directories
        for temp_dir in "/tmp" "/var/tmp" "$TMPDIR"; do
            if [[ -d "$temp_dir" ]]; then
                echo "$temp_dir"
                return
            fi
        done
        echo "/tmp"  # Final fallback
    fi
}

# Function to check if current shell is running under a Copilot terminal
is_copilot_terminal() {
    local temp_dir=$(get_temp_dir)
    local current_pid=$$
    local parent_pid=$PPID
    
    # First check if current process itself has a marker file
    local marker_file="$temp_dir/.vscode_copilot_agent_$current_pid"
    if [[ -f "$marker_file" ]]; then
        # Verify the marker file is valid
        if command -v node >/dev/null 2>&1; then
            local marker_valid=$(node -e "
                try {
                    const fs = require('fs');
                    const content = JSON.parse(fs.readFileSync('$marker_file', 'utf8'));
                    console.log(content.isAgentSession === true ? 'true' : 'false');
                } catch(e) {
                    console.log('false');
                }
            " 2>/dev/null)
        else
            # Fallback: just check if file contains expected content
            if grep -q '"isAgentSession":true' "$marker_file" 2>/dev/null; then
                marker_valid="true"
            else
                marker_valid="false"
            fi
        fi
        
        if [[ "$marker_valid" == "true" ]]; then
            echo "true"
            return 0
        fi
    fi
    
    # Check if there's a marker file for any parent process in the process tree
    while [[ $parent_pid -gt 1 ]]; do
        local marker_file="$temp_dir/.vscode_copilot_agent_$parent_pid"
        
        if [[ -f "$marker_file" ]]; then
            # Verify the marker file is valid
            if command -v node >/dev/null 2>&1; then
                local marker_valid=$(node -e "
                    try {
                        const fs = require('fs');
                        const content = JSON.parse(fs.readFileSync('$marker_file', 'utf8'));
                        console.log(content.isAgentSession === true ? 'true' : 'false');
                    } catch(e) {
                        console.log('false');
                    }
                " 2>/dev/null)
            else
                # Fallback: just check if file contains expected content
                if grep -q '"isAgentSession":true' "$marker_file" 2>/dev/null; then
                    marker_valid="true"
                else
                    marker_valid="false"
                fi
            fi
            
            if [[ "$marker_valid" == "true" ]]; then
                echo "true"
                return 0
            fi
        fi
        
        # Move up the process tree
        if command -v ps >/dev/null 2>&1; then
            parent_pid=$(ps -o ppid= -p $parent_pid 2>/dev/null | tr -d ' ')
            if [[ -z "$parent_pid" ]]; then
                break
            fi
        else
            break
        fi
    done
    
    echo "false"
    return 1
}

# Check if this terminal is a Copilot terminal
if [[ "$(is_copilot_terminal)" == "true" ]]; then
    export COPILOT_AGENT_DETECTED=true
    export PS1="[🤖] $PS1"
    echo "🤖 Agent session detected - this terminal is controlled by Copilot"
        
        # Optional: Set additional environment variables for agent mode
        export TERM_COLOR_MODE="agent"
        export SHELL_BEHAVIOR="copilot-friendly"
        
        # Optional: Define agent-specific aliases
        alias ll='ls -la --color=always' 2>/dev/null || alias ll='ls -la'
        alias grep='grep --color=always' 2>/dev/null || alias grep='grep'
        alias tree='tree -C' 2>/dev/null || true
        
        # Optional: Set up agent-friendly prompt with more info
        if [[ -n "$ZSH_VERSION" ]]; then
            # Zsh-specific configuration
            autoload -U colors && colors 2>/dev/null || true
            PS1="%F{cyan}[🤖 AI]%f %F{green}%n@%m%f:%F{blue}%~%f$ "
        elif [[ -n "$BASH_VERSION" ]]; then
            # Bash-specific configuration
            PS1="\[\e[36m\][🤖 AI]\[\e[0m\] \[\e[32m\]\u@\h\[\e[0m\]:\[\e[34m\]\w\[\e[0m\]$ "
        fi
else
    export COPILOT_AGENT_DETECTED=false
    echo "ℹ️ Regular terminal - not controlled by Copilot"
fi

# Function to check if current terminal is agent-controlled
is_agent_terminal() {
    [[ "$COPILOT_AGENT_DETECTED" == "true" ]]
}

# Function to show agent status
show_agent_status() {
    echo "=== Copilot Terminal Detection Status ==="
    echo "Process-based detection using temp directory: $(get_temp_dir)"
    
    local is_agent=$(is_copilot_terminal)
    echo "Current terminal is Copilot terminal: $is_agent"
    echo "COPILOT_AGENT_DETECTED: $COPILOT_AGENT_DETECTED"
    
    if [[ "$is_agent" == "true" ]]; then
        echo "🤖 This shell session is configured for agent mode"
    else
        echo "🖥️  This shell session is in standard mode"
    fi
    echo "========================================="
}

# Optional: Alias for quick status check
alias agent-status='show_agent_status'

# Optional: Function to manually enable agent mode (for testing)
enable_agent_mode() {
    export COPILOT_AGENT_DETECTED=true
    export PS1="[🤖 MANUAL] $PS1"
    echo "🤖 Agent mode manually enabled"
}

# Optional: Function to disable agent mode
disable_agent_mode() {
    export COPILOT_AGENT_DETECTED=false
    # Reset PS1 if it was modified (simple approach)
    if [[ "$PS1" == *"🤖"* ]]; then
        PS1="${PS1//\[🤖*\] /}"
    fi
    echo "🖥️  Agent mode disabled"
}
