# Usage Examples

This document provides examples of how to use the Copilot Terminal Detection extension.

## Oh My Zsh Plugin (Recommended)

The easiest way to use this extension is through the Oh My Zsh plugin.

### Installation

1. Copy the plugin to your Oh My Zsh custom plugins directory:
   ```bash
   mkdir -p ~/.oh-my-zsh/custom/plugins/copilot-terminal-detection
   cp oh-my-zsh-plugin/copilot-terminal-detection.plugin.zsh ~/.oh-my-zsh/custom/plugins/copilot-terminal-detection/
   ```

2. Add the plugin to your `~/.zshrc` file:
   ```bash
   plugins=(... copilot-terminal-detection)
   ```

3. Reload your shell:
   ```bash
   source ~/.zshrc
   ```

### Usage

The plugin automatically sets the `COPILOT_AGENT_DETECTED` environment variable:

```bash
# Check if running in a Copilot terminal
if [[ "$COPILOT_AGENT_DETECTED" == "true" ]]; then
    echo "🤖 This is a Copilot-controlled terminal"
else
    echo "💻 This is a regular terminal"
fi
```

## Practical .zshrc Integration Examples

Here are real-world examples of how to integrate the Copilot terminal detection into your `~/.zshrc`:

### Example 1: Enhanced Prompt with Agent Indicator

```bash
# Add to your ~/.zshrc
plugins=(... copilot-terminal-detection)

# Load Oh My Zsh (this loads the plugins and sets COPILOT_AGENT_DETECTED)
source $ZSH/oh-my-zsh.sh

# Now customize prompt based on terminal type (after plugins are loaded)
if [[ "$COPILOT_AGENT_DETECTED" == "true" ]]; then
    # Agent-controlled terminal - bright cyan with robot emoji
    PROMPT='%F{cyan}[🤖 AI]%f %F{green}%n@%m%f:%F{blue}%~%f$ '
    # Optional: Set right prompt with additional info
    RPROMPT='%F{magenta}[Agent Mode]%f'
else
    # Regular terminal - standard colors
    PROMPT='%F{green}%n@%m%f:%F{blue}%~%f$ '
fi
```

### Example 2: Agent-Friendly Aliases and Functions

```bash
# Add to your ~/.zshrc
plugins=(... copilot-terminal-detection)

# Load Oh My Zsh first
source $ZSH/oh-my-zsh.sh

# Set up agent-specific aliases when in Copilot terminal (after plugin loads)
if [[ "$COPILOT_AGENT_DETECTED" == "true" ]]; then
    # More verbose and colorful output for AI readability
    alias ll='ls -laGF'
    alias ls='ls -GF'
    alias grep='grep --color=always'
    alias cat='cat -n'  # Show line numbers
    alias tree='tree -C -L 2'  # Colored tree with depth limit
    
    # Agent-friendly git aliases
    alias gst='git status --porcelain=v1'
    alias glog='git log --oneline --graph --decorate -10'
    alias gdiff='git diff --color=always'
    
    # Helper function for AI context
    whereami() {
        echo "📍 Current Context:"
        echo "Directory: $(pwd)"
        echo "Git branch: $(git branch --show-current 2>/dev/null || echo 'not a git repo')"
        echo "Files: $(ls -1 | wc -l | tr -d ' ') items"
        echo "Disk usage: $(du -sh . 2>/dev/null | cut -f1)"
    }
else
    # Standard aliases for regular terminal use
    alias ll='ls -la'
    alias ls='ls'
fi
```

### Example 3: Conditional Oh My Zsh Theme

```bash
# Add to your ~/.zshrc
plugins=(... copilot-terminal-detection)

# Load Oh My Zsh first
source $ZSH/oh-my-zsh.sh

# Choose theme based on terminal type (after plugin detection)
if [[ "$COPILOT_AGENT_DETECTED" == "true" ]]; then
    # Override prompt for agent mode (since theme is already loaded)
    PROMPT='%F{cyan}[🤖]%f '"$PROMPT"
    
    # Or you can set a completely custom prompt
    PROMPT='%F{cyan}[🤖 AI]%f %F{green}%n@%m%f:%F{blue}%~%f$(git_prompt_info) $ '
else
    # Keep the default theme prompt
    # PROMPT remains as set by ZSH_THEME
fi
```

### Example 4: Environment Variables and Path Modifications

```bash
# Add to your ~/.zshrc
plugins=(... copilot-terminal-detection)

# Load Oh My Zsh first
source $ZSH/oh-my-zsh.sh

# Configure environment after plugin detection
if [[ "$COPILOT_AGENT_DETECTED" == "true" ]]; then
    # Set environment variables for agent-friendly behavior
    export PAGER="less -R"  # Always use colors in pager
    export GREP_OPTIONS="--color=always"
    export TREE_COLORS="1"
    export CLICOLOR=1
    export LSCOLORS="ExFxCxDxBxegedabagacad"
    
    # Add useful tools to PATH if they exist
    [[ -d "/usr/local/bin" ]] && export PATH="/usr/local/bin:$PATH"
    [[ -d "$HOME/.local/bin" ]] && export PATH="$HOME/.local/bin:$PATH"
    
    # Set up auto-completion for agent terminals
    autoload -U compinit && compinit
    zstyle ':completion:*' menu select
    zstyle ':completion:*' list-colors "${(s.:.)LS_COLORS}"
fi
```

### Example 5: Conditional Plugin Loading

```bash
# Add to your ~/.zshrc - Load different plugins based on terminal type
# Note: For this example, you'd need to detect before loading Oh My Zsh
# This is more advanced and requires sourcing the plugin detection directly

# First, manually source the detection plugin to get COPILOT_AGENT_DETECTED early
source ~/.oh-my-zsh/custom/plugins/copilot-terminal-detection/copilot-terminal-detection.plugin.zsh

if [[ "$COPILOT_AGENT_DETECTED" == "true" ]]; then
    # Load plugins useful for AI/agent interaction
    plugins=(
        git
        docker
        kubectl
        npm
        node
        python
        copilot-terminal-detection
        zsh-syntax-highlighting
        zsh-autosuggestions
    )
else
    # Minimal plugins for regular terminal use
    plugins=(
        git
        copilot-terminal-detection
    )
fi

# Now load Oh My Zsh with the conditional plugins
source $ZSH/oh-my-zsh.sh
```

### Example 6: Agent Mode Notification

```bash
# Add to your ~/.zshrc
plugins=(... copilot-terminal-detection)

# Load Oh My Zsh first
source $ZSH/oh-my-zsh.sh

# Show a welcome message for agent terminals (after detection)
if [[ "$COPILOT_AGENT_DETECTED" == "true" ]]; then
    echo "🤖 AI Agent Terminal Active"
    echo "   • Enhanced output formatting enabled"
    echo "   • Verbose aliases loaded"
    echo "   • Type 'whereami' for context info"
    echo ""
fi
```

## Manual Integration (Alternative)

If you don't use Oh My Zsh, you can source the plugin directly:

### For Zsh users (macOS default)

Add to your `~/.zshrc`:

```bash
# Source the Copilot detection plugin
source /path/to/oh-my-zsh-plugin/copilot-terminal-detection.plugin.zsh

# Use the detection result
if [[ "$COPILOT_AGENT_DETECTED" == "true" ]]; then
    export PS1="[🤖] $PS1"
    echo "🤖 Agent-controlled terminal detected"
fi
```

### For Bash users

Add to your `~/.bashrc`:

```bash
# Source the Copilot detection plugin (works in bash too)
source /path/to/oh-my-zsh-plugin/copilot-terminal-detection.plugin.zsh

# Use the detection result
if [[ "$COPILOT_AGENT_DETECTED" == "true" ]]; then
    export PS1="[🤖] $PS1"
    echo "🤖 Agent-controlled terminal detected"
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
if [[ "$COPILOT_AGENT_DETECTED" == "true" ]]; then
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
