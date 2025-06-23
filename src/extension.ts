// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Track terminals created by Copilot agents
const copilotTerminals = new WeakSet<vscode.Terminal>();

export function activate(context: vscode.ExtensionContext) {
	console.log('[Copilot Terminal Detection] Extension activated');

	// Clean up any existing marker files on startup
	removeAllAgentMarkerFiles();

	// Listen for terminal creation events
	const terminalOpenDisposable = vscode.window.onDidOpenTerminal((terminal) => {
		// Delay detection to allow terminal initialization
		setTimeout(() => {
			const isCopilot = detectCopilotTerminal(terminal);
			if (isCopilot) {
				createAgentMarkerFile(terminal);
				console.log(`[Copilot Terminal Detection] Agent terminal detected: ${terminal.name}`);
			}
		}, 200);
	});

	// Listen for terminal close events to clean up
	const terminalCloseDisposable = vscode.window.onDidCloseTerminal((terminal) => {
		if (copilotTerminals.has(terminal)) {
			copilotTerminals.delete(terminal);
			removeAgentMarkerFile(terminal);
			console.log(`[Copilot Terminal Detection] Agent terminal closed: ${terminal.name}`);
		}
	});

	// Process existing terminals
	vscode.window.terminals.forEach(terminal => {
		const isCopilot = detectCopilotTerminal(terminal);
		if (isCopilot) {
			createAgentMarkerFile(terminal);
		}
	});

	// Register extension commands
	const detectCommand = vscode.commands.registerCommand('copilot-terminal-detection.detectCopilot', () => {
		const activeTerminal = vscode.window.activeTerminal;
		if (activeTerminal) {
			const isCopilot = detectCopilotTerminal(activeTerminal);
			vscode.window.showInformationMessage(
				isCopilot ? '🤖 Copilot terminal detected!' : 'Standard terminal detected'
			);
		} else {
			vscode.window.showWarningMessage('No active terminal found');
		}
	});

	const createMarkerCommand = vscode.commands.registerCommand('copilot-terminal-detection.createMarker', () => {
		const activeTerminal = vscode.window.activeTerminal;
		if (activeTerminal) {
			createAgentMarkerFile(activeTerminal);
			vscode.window.showInformationMessage('Marker file created for active terminal');
		} else {
			vscode.window.showWarningMessage('No active terminal found');
		}
	});

	const showStatusCommand = vscode.commands.registerCommand('copilot-terminal-detection.showStatus', () => {
		try {
			const tempDir = os.tmpdir();
			const files = fs.readdirSync(tempDir);
			const markerFiles = files.filter(f => f.startsWith('.vscode_copilot_agent_'));
			
			if (markerFiles.length === 0) {
				vscode.window.showInformationMessage('No agent marker files found');
			} else {
				const fileInfo = markerFiles.map(file => {
					const filePath = path.join(tempDir, file);
					try {
						const content = fs.readFileSync(filePath, 'utf8');
						const data = JSON.parse(content);
						return `PID ${data.processId}: ${data.terminalName}`;
					} catch {
						return `${file}: (invalid)`;
					}
				}).join(', ');
				
				vscode.window.showInformationMessage(`Agent marker files (${markerFiles.length}): ${fileInfo}`);
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
	
	// Patterns that indicate Copilot agent terminals
	const copilotPatterns = [
		'copilot', 'agent', '@workspace', '@terminal', 
		'github copilot', 'ai assistant', 'chat participant'
	];

	// Patterns that should NOT be considered Copilot terminals
	const excludePatterns = ['zsh', 'bash', 'cmd', 'powershell', 'fish', 'sh'];

	// First check if this is a standard shell (exclusion)
	const isStandardShell = excludePatterns.some(pattern => 
		terminalName === pattern || terminalName.startsWith(pattern)
	);

	if (isStandardShell) {
		return false;
	}

	// Check terminal name against Copilot patterns  
	let isCopilotTerminal = copilotPatterns.some(pattern => terminalName.includes(pattern));

	// Check creation options for additional clues
	const creationOptions = terminal.creationOptions;
	if (creationOptions && 'name' in creationOptions && creationOptions.name) {
		const optionsName = creationOptions.name.toLowerCase().trim();
		
		// Check exclusions for creation options
		const optionsIsStandardShell = excludePatterns.some(pattern => 
			optionsName === pattern || optionsName.startsWith(pattern)
		);
		
		if (optionsIsStandardShell) {
			return false;
		}
		
		// Check creation options against Copilot patterns
		if (!isCopilotTerminal) {
			isCopilotTerminal = copilotPatterns.some(pattern => optionsName.includes(pattern));
		}
	}

	// Check for Copilot-related environment variables
	if (creationOptions && 'env' in creationOptions && creationOptions.env) {
		const env = creationOptions.env;
		if (env['COPILOT_AGENT'] || env['GITHUB_COPILOT'] || env['AI_ASSISTANT']) {
			isCopilotTerminal = true;
		}
	}

	// Track detected Copilot terminals
	if (isCopilotTerminal) {
		copilotTerminals.add(terminal);
	}

	return isCopilotTerminal;
}

/**
 * Creates a marker file for a Copilot terminal's process ID
 */
function createAgentMarkerFile(terminal: vscode.Terminal) {
	const processId = terminal.processId;
	if (!processId) {
		console.warn('[Copilot Terminal Detection] Cannot create marker file: process ID not available');
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
			console.error(`[Copilot Terminal Detection] Failed to create marker file for PID ${pid}:`, error);
		}
	});
}

/**
 * Removes the marker file for a specific terminal
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
			console.error(`[Copilot Terminal Detection] Failed to remove marker file for PID ${pid}:`, error);
		}
	});
}

/**
 * Removes all agent marker files (cleanup)
 */
function removeAllAgentMarkerFiles() {
	try {
		const tempDir = os.tmpdir();
		const files = fs.readdirSync(tempDir);
		const markerFiles = files.filter(f => f.startsWith('.vscode_copilot_agent_'));
		
		markerFiles.forEach(file => {
			const filePath = path.join(tempDir, file);
			try {
				fs.unlinkSync(filePath);
			} catch (error) {
				console.error(`[Copilot Terminal Detection] Failed to remove marker file ${filePath}:`, error);
			}
		});
	} catch (error) {
		console.error('[Copilot Terminal Detection] Failed to clean up marker files:', error);
	}
}

export function deactivate() {
	removeAllAgentMarkerFiles();
	console.log('[Copilot Terminal Detection] Extension deactivated');
}
