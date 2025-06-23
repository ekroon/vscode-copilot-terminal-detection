# Copilot Terminal Detection

A VS Code extension that automatically detects when GitHub Copilot is controlling the terminal and provides shell integration through an Oh My Zsh plugin.

## Features

- **Automatic Detection**: Automatically detects when terminals are opened by Copilot agents
- **Per-Terminal Detection**: Each terminal is independently detected (not global)
- **Oh My Zsh Plugin**: Easy integration with Oh My Zsh through a custom plugin
- **Environment Variable**: Sets `COPILOT_AGENT_DETECTED` for shell scripts to use
- **Safe Operation**: Won't break if the extension isn't loaded

## How It Works

The extension monitors terminal creation events and creates unique marker files for each Copilot terminal using their process ID. The Oh My Zsh plugin checks for these marker files by walking up the process tree to determine if the current shell is running under a Copilot terminal.

### Detection Logic

The extension identifies Copilot terminals by checking for patterns in terminal names:
- `copilot`
- `agent`
- `@workspace`
- `@terminal`
- `github copilot`
- `ai assistant`
- `chat participant`

## Installation

### 1. Install the VS Code Extension

Install the extension from the VS Code marketplace or package it locally:

```bash
npm install
npm run compile
npx vsce package
code --install-extension copilot-terminal-detection-*.vsix
```

### 2. Install the Oh My Zsh Plugin

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
