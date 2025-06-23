<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Copilot Terminal Detection Extension

This is a VS Code extension project. Please use the get_vscode_api with a query as input to fetch the latest VS Code API references.

## Project Purpose
This extension automatically detects when GitHub Copilot is controlling the terminal and sets environment variables that the shell can read to modify its behavior accordingly.

## Key Features
- Detect when terminals are opened by Copilot agents
- Automatically set environment variables: IS_AGENT_SESSION=true and TERMINAL_MODE=agent
- Enable shell scripts to detect agent-controlled sessions

## Technical Requirements
- Monitor terminal creation events
- Identify Copilot-initiated terminals
- Set environment variables in the terminal environment
- Provide seamless integration with shell configurations
