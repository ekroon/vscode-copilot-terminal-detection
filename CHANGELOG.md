# Change Log

All notable changes to the "Copilot Terminal Detection" extension will be documented in this file.

## [0.1.0] - 2025-06-23

### Added
- ✨ Initial release of Copilot Terminal Detection extension
- 🔍 Automatic detection of GitHub Copilot controlled terminals
- 🎯 Per-terminal detection using process-based marker files
- 🐚 Complete Oh My Zsh plugin for seamless shell integration
- ⚡ `COPILOT_AGENT_DETECTED` environment variable for shell customization
- 🛡️ Safe operation that won't break if extension isn't loaded
- 📝 Comprehensive documentation and usage examples
- 🎨 Custom icon and marketplace-ready packaging

### Features
- Process-based terminal detection (not global)
- Marker files stored in system temp directory
- Shell integration through Oh My Zsh plugin
- Support for custom prompts, aliases, and shell behavior
- Automatic cleanup of marker files on terminal close
- Extension commands for manual testing and status checking

### Commands
- `Copilot Terminal Detection: Detect Copilot Terminal` - Manual detection
- `Copilot Terminal Detection: Create Marker File` - Testing utility
- `Copilot Terminal Detection: Show Marker File Status` - Debug information

### Technical Details
- Uses VS Code's `onDidOpenTerminal` and `onDidCloseTerminal` APIs
- Detects Copilot terminals by name patterns (copilot, agent, @workspace, etc.)
- Creates unique marker files per terminal process ID
- Oh My Zsh plugin walks process tree for detection
- Cross-platform support (macOS, Linux, Windows WSL)

## [Unreleased]
- Potential features for future releases
- Additional shell integrations (bash, fish)
- More customization options
- Enhanced terminal detection patterns