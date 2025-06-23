# Copilot Terminal Detection

[![Version](https://img.shields.io/visual-studio-marketplace/v/erwinkroon.copilot-terminal-detection)](https://marketplace.visualstudio.com/items?itemName=erwinkroon.copilot-terminal-detection)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/erwinkroon.copilot-terminal-detection)](https://marketplace.visualstudio.com/items?itemName=erwinkroon.copilot-terminal-detection)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/erwinkroon.copilot-terminal-detection)](https://marketplace.visualstudio.com/items?itemName=erwinkroon.copilot-terminal-detection)

A VS Code extension that automatically detects when GitHub Copilot is controlling the terminal and provides seamless shell integration through an Oh My Zsh plugin.

## ✨ Features

- **🔍 Automatic Detection**: Instantly detects when terminals are opened by Copilot agents
- **🎯 Per-Terminal Precision**: Each terminal is independently detected (not global)
- **🐚 Oh My Zsh Integration**: Easy setup with a custom Oh My Zsh plugin
- **⚡ Environment Variables**: Shell plugin sets `COPILOT_AGENT_DETECTED` for customization
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
- Open a Copilot terminal → See `🤖` indicators
- Open a regular terminal → Normal behavior
- Customize your experience with the environment variable

## Usage

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
fi
```

## Commands

The extension provides the following commands:

- `Copilot Terminal Detection: Detect Copilot Terminal` - Manually detect if the active terminal is from Copilot
- `Copilot Terminal Detection: Create Marker File` - Manually create a marker file for testing
- `Copilot Terminal Detection: Show Marker File Status` - Display current marker files and their status

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

## How It Works

The extension uses a file-based detection approach:

1. **VS Code Extension**: Monitors terminal creation using `onDidOpenTerminal` event
2. **Pattern Detection**: Identifies Copilot terminals by name patterns (copilot, agent, @workspace, etc.)
3. **Marker Files**: Creates unique marker files in the system temp directory for each Copilot terminal
4. **Shell Integration**: Oh My Zsh plugin walks the process tree to find marker files
5. **Environment Variables**: Shell plugin sets `COPILOT_AGENT_DETECTED=true` when markers are found

## Technical Details

The extension uses:
- VS Code's `onDidOpenTerminal` and `onDidCloseTerminal` APIs
- Process-based marker files stored in system temp directory
- Terminal name and creation option analysis for detection
- WeakSet to track Copilot terminals for cleanup
- Cross-platform support (macOS, Linux, Windows WSL)

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.
