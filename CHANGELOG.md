# Change Log

All notable changes to the "copilot-terminal-detection" extension will be documented in this file.

## [0.0.1] - 2025-06-23

### Added
- Initial release of Copilot Terminal Detection extension
- Automatic detection of terminals opened by GitHub Copilot agents
- Environment variable setting (`IS_AGENT_SESSION=true`, `TERMINAL_MODE=agent`)
- Terminal creation event monitoring using VS Code's `onDidOpenTerminal` API
- Pattern-based detection for Copilot-related terminal names
- Commands for manual detection and environment variable inspection:
  - `Copilot Terminal Detection: Detect Copilot Terminal`
  - `Copilot Terminal Detection: Show Environment Variables`
- Shell integration configuration for Zsh and Bash
- Comprehensive documentation and usage examples
- Demo script for testing functionality
- TypeScript implementation with proper error handling
- Extension tests with Jest framework

### Features
- **Automatic Detection**: Monitors terminal creation and identifies Copilot-controlled terminals
- **Environment Variables**: Sets environment variables automatically for shell integration
- **Shell Integration**: Provides ready-to-use shell configuration snippets
- **Manual Commands**: Includes commands for testing and debugging
- **Cross-Shell Support**: Works with Zsh, Bash, and other shells
- **Lightweight**: Minimal performance impact with efficient detection logic

### Technical Details
- Uses VS Code Extension API v1.101.0
- Implements `GlobalEnvironmentVariableCollection` for environment variable management
- Pattern matching for terminal name detection
- WeakSet for efficient terminal tracking
- TypeScript with Webpack bundling
- Comprehensive test suite