import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Track terminals created by Copilot agents
const copilotTerminals = new WeakSet<vscode.Terminal>();

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	// Clean up any existing marker files on startup
	removeAllAgentMarkerFiles();

	// Listen for terminal creation events
	const terminalOpenDisposable = vscode.window.onDidOpenTerminal((terminal) => {
		// Delay the detection to allow terminal to fully initialize
		setTimeout(() => {
			const isCopilot = detectCopilotTerminal(terminal);
			
			if (isCopilot) {
				createAgentMarkerFile(terminal);
				console.log(`Copilot terminal detected: ${terminal.name}`);
			}
		}, 200);
	});

	// Listen for terminal close events to clean up
	const terminalCloseDisposable = vscode.window.onDidCloseTerminal((terminal) => {
		if (copilotTerminals.has(terminal)) {
			copilotTerminals.delete(terminal);
			removeAgentMarkerFile(terminal);
		}
	});

	// Check existing terminals when extension activates
	vscode.window.terminals.forEach(terminal => {
		if (detectCopilotTerminal(terminal)) {
			createAgentMarkerFile(terminal);
		}
	});

	// Register commands
	const detectCommand = vscode.commands.registerCommand('copilot-terminal-detection.detectCopilot', () => {
		const activeTerminal = vscode.window.activeTerminal;
		if (activeTerminal) {
			const isCopilot = detectCopilotTerminal(activeTerminal);
			vscode.window.showInformationMessage(
				isCopilot ? 
				'🤖 Copilot terminal detected and marker file created!' : 
				'Terminal is not from Copilot agent'
			);
		} else {
			vscode.window.showWarningMessage('No active terminal found');
		}
	});

	const createMarkerCommand = vscode.commands.registerCommand('copilot-terminal-detection.createMarker', () => {
		const activeTerminal = vscode.window.activeTerminal;
		if (activeTerminal) {
			createAgentMarkerFile(activeTerminal);
			vscode.window.showInformationMessage('Marker file created manually for active terminal');
		} else {
			vscode.window.showWarningMessage('No active terminal found');
		}
	});

	const showStatusCommand = vscode.commands.registerCommand('copilot-terminal-detection.showStatus', () => {
		const tempDir = os.tmpdir();
		try {
			const files = fs.readdirSync(tempDir);
			const markerFiles = files.filter(f => f.startsWith('.vscode_copilot_agent_'));
			
			if (markerFiles.length === 0) {
				vscode.window.showInformationMessage('No Copilot marker files found');
			} else {
				const fileInfo = markerFiles.map(file => {
					const filePath = path.join(tempDir, file);
					try {
						const content = fs.readFileSync(filePath, 'utf8');
						const data = JSON.parse(content);
						return `PID ${data.processId}: ${data.terminalName}`;
					} catch {
						return `${file}: (unreadable)`;
					}
				}).join(', ');
				
				vscode.window.showInformationMessage(`Copilot marker files (${markerFiles.length}): ${fileInfo}`);
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to check marker files: ${error}`);
		}
	});

	// Add disposables to subscriptions
	context.subscriptions.push(
		terminalOpenDisposable,
		terminalCloseDisposable,
		detectCommand,
		createMarkerCommand,
		showStatusCommand
	);
}

/**
 * Detects if a terminal was created by a Copilot agent
 */
function detectCopilotTerminal(terminal: vscode.Terminal): boolean {
	const terminalName = terminal.name.toLowerCase().trim();
	
	// Common patterns that indicate Copilot agent terminals
	const copilotPatterns = [
		'copilot',
		'agent',
		'@workspace',
		'@terminal',
		'github copilot',
		'ai assistant',
		'chat participant'
	];

	// Patterns that should NOT be considered Copilot terminals
	const excludePatterns = [
		'zsh',
		'bash',
		'cmd',
		'powershell',
		'fish',
		'sh'
	];

	// First check if this is a standard shell that should be excluded
	const isStandardShell = excludePatterns.some(pattern => 
		terminalName === pattern || terminalName.startsWith(pattern)
	);

	if (isStandardShell) {
		return false;
	}

	// Check terminal name against Copilot patterns
	let isCopilotTerminal = copilotPatterns.some(pattern => 
		terminalName.includes(pattern)
	);

	// Check creation options for additional clues
	const creationOptions = terminal.creationOptions;
	if (creationOptions && 'name' in creationOptions && creationOptions.name) {
		const optionsName = creationOptions.name.toLowerCase().trim();
		
		// Double-check exclusions for creation options
		const optionsIsStandardShell = excludePatterns.some(pattern => 
			optionsName === pattern || optionsName.startsWith(pattern)
		);
		
		if (optionsIsStandardShell) {
			return false;
		}
		
		// Check creation options against Copilot patterns
		if (copilotPatterns.some(pattern => optionsName.includes(pattern))) {
			isCopilotTerminal = true;
		}
	}

	// Check for existing Copilot-related environment variables
	if (creationOptions && 'env' in creationOptions && creationOptions.env) {
		const env = creationOptions.env;
		if (env['COPILOT_AGENT'] || env['GITHUB_COPILOT'] || env['AI_ASSISTANT']) {
			isCopilotTerminal = true;
		}
	}

	// Track identified Copilot terminals
	if (isCopilotTerminal) {
		copilotTerminals.add(terminal);
	}

	return isCopilotTerminal;
}

/**
 * Creates a marker file for a specific terminal's process ID
 */
function createAgentMarkerFile(terminal: vscode.Terminal) {
	const processId = terminal.processId;
	if (!processId) {
		return;
	}
	
	processId.then(pid => {
		const markerPath = path.join(os.tmpdir(), `.vscode_copilot_agent_${pid}`);
		try {
			fs.writeFileSync(markerPath, JSON.stringify({
				isAgentSession: true,
				terminalMode: 'agent',
				processId: pid,
				terminalName: terminal.name,
				timestamp: Date.now()
			}));
		} catch (error) {
			console.error(`Failed to create marker file for PID ${pid}:`, error);
		}
	});
}

/**
 * Removes the agent marker file for a specific terminal
 */
function removeAgentMarkerFile(terminal: vscode.Terminal) {
	const processId = terminal.processId;
	if (!processId) {
		return;
	}
	
	processId.then(pid => {
		const markerPath = path.join(os.tmpdir(), `.vscode_copilot_agent_${pid}`);
		try {
			if (fs.existsSync(markerPath)) {
				fs.unlinkSync(markerPath);
			}
		} catch (error) {
			console.error(`Failed to remove marker file for PID ${pid}:`, error);
		}
	});
}

/**
 * Removes all agent marker files (cleanup)
 */
function removeAllAgentMarkerFiles() {
	const tempDir = os.tmpdir();
	try {
		const files = fs.readdirSync(tempDir);
		const markerFiles = files.filter(f => f.startsWith('.vscode_copilot_agent_'));
		
		markerFiles.forEach(file => {
			const filePath = path.join(tempDir, file);
			try {
				fs.unlinkSync(filePath);
			} catch (error) {
				console.error(`Failed to remove marker file ${filePath}:`, error);
			}
		});
	} catch (error) {
		console.error('Failed to clean up agent marker files:', error);
	}
}

// This method is called when your extension is deactivated
export function deactivate() {
	removeAllAgentMarkerFiles();
}
