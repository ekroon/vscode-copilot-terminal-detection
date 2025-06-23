# Usage Examples

This document provides examples of how to use the Copilot Terminal Detection extension.

## Basic Shell Integration

### For Zsh users (macOS default)

Add to your `~/.zshrc`:

```bash
# Source the shell integration from the extension
source /path/to/extension/shell-integration.sh

# Or use the simple version:
if [[ "$IS_AGENT_SESSION" == "true" ]] || [[ "$TERMINAL_MODE" == "agent" ]]; then
    export COPILOT_AGENT_DETECTED=true
    export PS1="[🤖] $PS1"
    echo "🤖 Agent-controlled terminal detected"
else
    export COPILOT_AGENT_DETECTED=false
fi
```

### For Bash users

Add to your `~/.bashrc`:

```bash
# Source the shell integration from the extension
source /path/to/extension/shell-integration.sh

# Or use the simple version:
if [[ "$IS_AGENT_SESSION" == "true" ]] || [[ "$TERMINAL_MODE" == "agent" ]]; then
    export COPILOT_AGENT_DETECTED=true
    export PS1="[🤖] $PS1"
    echo "🤖 Agent-controlled terminal detected"
else
    export COPILOT_AGENT_DETECTED=false
fi
```

## Advanced Usage

### Custom Script Based on Agent Detection

Create a script that behaves differently when run in an agent-controlled terminal:

```bash
#!/bin/bash
# my-script.sh

if [[ "$COPILOT_AGENT_DETECTED" == "true" ]]; then
    echo "Running in agent mode - providing detailed output"
    ls -la --color=always
    echo "Current directory: $(pwd)"
    echo "Files count: $(ls -1 | wc -l)"
else
    echo "Running in standard mode"
    ls
fi
```

### Custom Prompt with Agent Indicator

```bash
# Enhanced prompt for agent detection
if [[ "$COPILOT_AGENT_DETECTED" == "true" ]]; then
    # Agent-controlled terminal
    if [[ -n "$ZSH_VERSION" ]]; then
        PROMPT='%F{cyan}[🤖 AI-Terminal]%f %F{green}%n@%m%f:%F{blue}%~%f$ '
    elif [[ -n "$BASH_VERSION" ]]; then
        PS1='\[\e[36m\][🤖 AI-Terminal]\[\e[0m\] \[\e[32m\]\u@\h\[\e[0m\]:\[\e[34m\]\w\[\e[0m\]$ '
    fi
else
    # Standard terminal
    if [[ -n "$ZSH_VERSION" ]]; then
        PROMPT='%F{green}%n@%m%f:%F{blue}%~%f$ '
    elif [[ -n "$BASH_VERSION" ]]; then
        PS1='\[\e[32m\]\u@\h\[\e[0m\]:\[\e[34m\]\w\[\e[0m\]$ '
    fi
fi
```

### Environment-Based Configuration

```bash
# Different behaviors based on terminal type
if [[ "$TERMINAL_MODE" == "agent" ]]; then
    # Agent-friendly settings
    export EDITOR="code --wait"
    export PAGER="less -R"
    export GREP_OPTIONS="--color=always"
    
    # Enable verbose output for common commands
    alias cp='cp -v'
    alias mv='mv -v'
    alias rm='rm -v'
    alias mkdir='mkdir -v'
    
    # Set up agent-friendly git configuration
    git config --global color.ui always
    git config --global core.pager "less -R"
else
    # Standard settings
    export EDITOR="vim"
    export PAGER="less"
    
    # Standard aliases
    alias ll='ls -l'
    alias la='ls -la'
fi
```

## VS Code Commands

The extension provides these commands that you can access via the Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`):

1. **Copilot Terminal Detection: Detect Copilot Terminal**
   - Manually check if the active terminal is controlled by Copilot
   - Useful for testing and debugging

2. **Copilot Terminal Detection: Show Environment Variables**
   - Display the current environment variables set by the extension
   - Helps verify the extension is working correctly

## Testing the Extension

1. **Install and activate the extension**
2. **Open a terminal normally** - should not show agent detection
3. **Ask Copilot to open a terminal** (via chat or commands)
4. **Check the terminal prompt** - should show `[🤖]` prefix if detected
5. **Run `echo $IS_AGENT_SESSION`** - should output `true` for agent terminals
6. **Run `echo $TERMINAL_MODE`** - should output `agent` for agent terminals

## Troubleshooting

### Extension not detecting Copilot terminals

1. Check that the extension is activated:
   ```
   Developer: Reload Window
   ```

2. Verify commands are registered:
   - Open Command Palette
   - Search for "Copilot Terminal Detection"
   - Commands should appear

3. Check extension output:
   - Open Developer Console (`Help > Toggle Developer Tools`)
   - Look for extension logs

### Environment variables not set

1. Restart VS Code after installing the extension
2. Try manually running the detect command
3. Check if your terminal name matches detection patterns

### Shell integration not working

1. Verify the shell configuration is added to the correct file
2. Restart your terminal or run `source ~/.zshrc` (or `source ~/.bashrc`)
3. Test with `echo $COPILOT_AGENT_DETECTED`
