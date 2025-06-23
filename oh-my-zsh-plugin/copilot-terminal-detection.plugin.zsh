#!/usr/bin/env zsh
# Oh My Zsh Plugin: Copilot Terminal Detection
# Detects if the current terminal is controlled by GitHub Copilot
# Sets COPILOT_AGENT_DETECTED environment variable

# Function to get the dynamic temp directory path
_copilot_get_temp_dir() {
    if command -v node >/dev/null 2>&1; then
        node -e "console.log(require('os').tmpdir())" 2>/dev/null
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
_copilot_is_agent_terminal() {
    local temp_dir=$(_copilot_get_temp_dir)
    local current_pid=$$
    local parent_pid=$PPID
    
    # First check if current process itself has a marker file
    local marker_file="$temp_dir/.vscode_copilot_agent_$current_pid"
    if [[ -f "$marker_file" ]]; then
        if _copilot_validate_marker_file "$marker_file"; then
            return 0
        fi
    fi
    
    # Check if there's a marker file for any parent process in the process tree
    while [[ $parent_pid -gt 1 ]]; do
        local marker_file="$temp_dir/.vscode_copilot_agent_$parent_pid"
        
        if [[ -f "$marker_file" ]]; then
            if _copilot_validate_marker_file "$marker_file"; then
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
    
    return 1
}

# Function to validate marker file content
_copilot_validate_marker_file() {
    local marker_file="$1"
    
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
        [[ "$marker_valid" == "true" ]]
    else
        # Fallback: just check if file contains expected content
        grep -q '"isAgentSession":true' "$marker_file" 2>/dev/null
    fi
}

# Main detection logic - runs only once per shell session
if [[ -z "$COPILOT_AGENT_DETECTED" ]]; then
    if _copilot_is_agent_terminal; then
        export COPILOT_AGENT_DETECTED=true
    else
        export COPILOT_AGENT_DETECTED=false
    fi
fi

# Clean up private functions to avoid polluting the namespace
unset -f _copilot_get_temp_dir _copilot_is_agent_terminal _copilot_validate_marker_file
