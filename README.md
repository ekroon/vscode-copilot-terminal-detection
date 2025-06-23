# Copilot Terminal Detection

A VS Code extension that automatically detects when GitHub Copilot is controlling the terminal and sets environment variables that the shell can read to modify its behavior accordingly.

## Features

- **Automatic Detection**: Automatically detects when terminals are opened by Copilot agents
- **Environment Variables**: Sets `IS_AGENT_SESSION=true` and `TERMINAL_MODE=agent` for Copilot-controlled terminals
- **Shell Integration**: Provides shell configuration for seamless integration
- **Manual Commands**: Includes commands for manual detection and environment variable inspection

## How It Works

The extension monitors terminal creation events using VS Code's `onDidOpenTerminal` API and analyzes terminal names and creation options to identify Copilot-initiated terminals. When a Copilot terminal is detected, it automatically sets environment variables using VS Code's `GlobalEnvironmentVariableCollection` API.

### Detection Logic

The extension identifies Copilot terminals by checking for patterns in terminal names:
- `copilot`
- `agent`
- `@workspace`
- `@terminal`
- `github copilot`
- `ai assistant`
- `chat participant`

## Shell Integration

Add this configuration to your `~/.zshrc` file to detect agent-controlled terminals:

```bash
# Agent detection using environment variables set by VS Code extension
if [[ "$IS_AGENT_SESSION" == "true" ]] || [[ "$TERMINAL_MODE" == "agent" ]]; then
    export COPILOT_AGENT_DETECTED=true
    export PS1="[🤖] $PS1"
    echo "🤖 Agent-controlled terminal detected"
else
    export COPILOT_AGENT_DETECTED=false
fi
```

For Bash users, add to `~/.bashrc`:

```bash
# Agent detection using environment variables set by VS Code extension
if [[ "$IS_AGENT_SESSION" == "true" ]] || [[ "$TERMINAL_MODE" == "agent" ]]; then
    export COPILOT_AGENT_DETECTED=true
    export PS1="[🤖] $PS1"
    echo "🤖 Agent-controlled terminal detected"
else
    export COPILOT_AGENT_DETECTED=false
fi
```

## Commands

The extension provides the following commands:

- `Copilot Terminal Detection: Detect Copilot Terminal` - Manually detect if the active terminal is from Copilot
- `Copilot Terminal Detection: Show Environment Variables` - Display currently set environment variables

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Press `F5` to run the extension in a new Extension Development Host window
4. Test the extension by opening terminals through Copilot

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
