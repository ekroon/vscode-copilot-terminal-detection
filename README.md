> [!IMPORTANT]
> This can be replaced with a [VSCode configuration](https://github.com/ekroon/dotfiles/blob/b6e2066f6bd4ab14cad9e2b1d2dd735e494e0dcf/docs/vscode-configuration.md).


# Copilot Terminal Detection

[![Version](https://img.shields.io/visual-studio-marketplace/v/erwinkroon.copilot-terminal-detection)](https://marketplace.visualstudio.com/items?itemName=erwinkroon.copilot-terminal-detection)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/erwinkroon.copilot-terminal-detection)](https://marketplace.visualstudio.com/items?itemName=erwinkroon.copilot-terminal-detection)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/erwinkroon.copilot-terminal-detection)](https://marketplace.visualstudio.com/items?itemName=erwinkroon.copilot-terminal-detection)

A VS Code extension that automatically detects when GitHub Copilot is controlling the terminal and provides seamless shell integration through an Oh My Zsh plugin.

## ✨ Features

- **🔍 Automatic Detection**: Instantly detects when terminals are opened by Copilot agents
- **🎯 Per-Terminal Precision**: Each terminal is independently detected (not global)
- **🐚 Oh My Zsh Integration**: Easy setup with a custom Oh My Zsh plugin
- **⚡ Environment Variables**: Sets `COPILOT_AGENT_DETECTED` for shell customization
- **🛡️ Safe Operation**: Won't break if the extension isn't loaded
- **🎨 Customizable**: Modify prompts, aliases, and behavior per terminal type

## 🚀 Quick Start

### 1. Install the Extension
Install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=erwinkroon.copilot-terminal-detection) or search for "Copilot Terminal Detection" in VS Code.

### 2. Install the Oh My Zsh Plugin
```bash
# Copy the plugin to your Oh My Zsh directory
mkdir -p ~/.oh-my-zsh/custom/plugins/copilot-terminal-detection
cp oh-my-zsh-plugin/copilot-terminal-detection.plugin.zsh ~/.oh-my-zsh/custom/plugins/copilot-terminal-detection/

# Add to your ~/.zshrc
plugins=(... copilot-terminal-detection)

# Reload your shell
source ~/.zshrc
```

### 3. Enjoy the Magic! ✨
- Open a Copilot terminal → Automatically detected
- Open a regular terminal → Normal behavior
- Customize your experience with the environment variable

## 📖 Usage

The plugin automatically sets the `COPILOT_AGENT_DETECTED` environment variable:

```bash
# Check if running in a Copilot terminal
if [[ "$COPILOT_AGENT_DETECTED" == "true" ]]; then
    echo "🤖 This is a Copilot-controlled terminal"
else
    echo "💻 This is a regular terminal"
fi
```

### Custom Prompt

```bash
# Add to your ~/.zshrc for custom prompt
if [[ "$COPILOT_AGENT_DETECTED" == "true" ]]; then
    PS1="[🤖] $PS1"
```

## Commands

The extension provides the following commands:

- `Copilot Terminal Detection: Detect Copilot Terminal` - Manually detect if the active terminal is from Copilot
- `Copilot Terminal Detection: Create Marker` - Manually create a marker file for testing
- `Copilot Terminal Detection: Show Status` - Display current marker files and their status

## Development

### Building

```bash
npm run compile
```

### Testing

```bash
npm run test
```

### Packaging

```bash
npm run package
```

## Configuration

The extension works out of the box with no configuration required. It automatically activates when VS Code starts and begins monitoring terminal creation events.

## Environment Variables Set

When a Copilot terminal is detected, the following environment variables are set:

- `IS_AGENT_SESSION=true` - Indicates the terminal is controlled by an agent
- `TERMINAL_MODE=agent` - Specifies the terminal mode as agent-controlled

These variables are available to shell scripts and can be used to modify shell behavior, prompts, or other terminal-related functionality.

## Technical Details

The extension uses:
- VS Code's `window.onDidOpenTerminal` event to monitor terminal creation
- `GlobalEnvironmentVariableCollection` API to set environment variables
- Terminal name and creation option analysis for detection
- WeakSet to track Copilot terminals for cleanup

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.
