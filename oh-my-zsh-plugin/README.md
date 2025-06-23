# Copilot Terminal Detection Oh My Zsh Plugin

A minimal Oh My Zsh plugin that detects if the current terminal is controlled by GitHub Copilot and sets the `COPILOT_AGENT_DETECTED` environment variable.

## Installation

### Method 1: Custom Plugin Directory

1. Copy the plugin file to your Oh My Zsh custom plugins directory:
   ```bash
   mkdir -p ~/.oh-my-zsh/custom/plugins/copilot-terminal-detection
   cp copilot-terminal-detection.plugin.zsh ~/.oh-my-zsh/custom/plugins/copilot-terminal-detection/
   ```

2. Add the plugin to your `~/.zshrc` file:
   ```bash
   plugins=(... copilot-terminal-detection)
   ```

3. Reload your shell:
   ```bash
   source ~/.zshrc
   ```

### Method 2: Direct Installation

1. Source the plugin directly in your `~/.zshrc`:
   ```bash
   source /path/to/copilot-terminal-detection.plugin.zsh
   ```

## Usage

The plugin automatically runs when your shell starts and sets the environment variable:

- `COPILOT_AGENT_DETECTED=true` - If the terminal is controlled by GitHub Copilot
- `COPILOT_AGENT_DETECTED=false` - If it's a regular terminal

### Checking the Status

```bash
echo $COPILOT_AGENT_DETECTED
```

### Using in Scripts or Prompt

```bash
if [[ "$COPILOT_AGENT_DETECTED" == "true" ]]; then
    echo "This is a Copilot terminal"
    # Add custom behavior for agent-controlled terminals
fi
```

### Example Prompt Integration

Add to your theme or `~/.zshrc`:

```bash
# Add Copilot indicator to prompt
if [[ "$COPILOT_AGENT_DETECTED" == "true" ]]; then
    PS1="[🤖] $PS1"
fi
```

## Features

- **Silent operation**: No output unless there's an error
- **Safe execution**: Won't break if the VS Code extension isn't loaded
- **Minimal footprint**: Only sets one environment variable
- **Process-based detection**: Works per-terminal, not globally
- **Cross-platform**: Works on macOS, Linux, and Windows (WSL)

## Requirements

- Oh My Zsh
- The VS Code Copilot Terminal Detection extension (for detection to work)
- Node.js (optional, for better JSON parsing)

## How It Works

The plugin checks for marker files created by the VS Code extension. These files are named `.vscode_copilot_agent_<PID>` and are stored in the system's temporary directory. The plugin walks up the process tree to find if any parent process has a corresponding marker file.

## Troubleshooting

If the plugin isn't working:

1. Ensure the VS Code extension is installed and active
2. Check if Node.js is available: `which node`
3. Verify the temp directory is accessible: `echo $TMPDIR`
4. Test manually: `ls $TMPDIR/.vscode_copilot_agent_*`
