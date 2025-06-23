import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Track terminals created by Copilot agents
const copilotTerminals = new WeakSet<vscode.Terminal>();

// Simple logging interface for structured output
const logger = {
	info: (message: string) => console.log(`[Copilot Terminal] ${message}`),
	debug: (message: string) => console.log(`[Debug] ${message}`),
	warn: (message: string) => console.warn(`[Warning] ${message}`),
	error: (message: string, error?: any) => console.error(`[Error] ${message}`, error || '')
};

// Terminal detection patterns - defined once for efficiency
const COPILOT_PATTERNS = ['copilot', 'agent', '@workspace', '@terminal', 'github copilot', 'ai assistant', 'chat participant'];
const EXCLUDE_PATTERNS = ['zsh', 'bash', 'cmd', 'powershell', 'fish', 'sh'];
const MARKER_PREFIX = '.vscode_copilot_agent_';

export function activate(context: vscode.ExtensionContext) {
	logger.info('Extension activating...');

	// Clean up any existing marker files from previous sessions
	removeAllAgentMarkerFiles();

	// Listen for terminal creation events
	const terminalOpenDisposable = vscode.window.onDidOpenTerminal((terminal) => {
		// Delay detection to allow terminal initialization
		setTimeout(() => {
			const isCopilot = detectCopilotTerminal(terminal);
			
			if (isCopilot) {
				createAgentMarkerFile(terminal);
				logger.info(`Copilot terminal detected: ${terminal.name}`);
			}
		}, 200);
	});

	// Listen for terminal close events to clean up marker files
	const terminalCloseDisposable = vscode.window.onDidCloseTerminal((terminal) => {
		if (copilotTerminals.has(terminal)) {
			copilotTerminals.delete(terminal);
			removeAgentMarkerFile(terminal);
			logger.debug(`Cleaned up Copilot terminal: ${terminal.name}`);
		}
	});

	// Check existing terminals on activation
	vscode.window.terminals.forEach(terminal => {
		if (detectCopilotTerminal(terminal)) {
			createAgentMarkerFile(terminal);
		}
	});

	// Register extension commands
	const commands = [
		vscode.commands.registerCommand('copilot-terminal-detection.detectCopilot', handleDetectCommand),
		vscode.commands.registerCommand('copilot-terminal-detection.createMarker', handleCreateMarkerCommand),
		vscode.commands.registerCommand('copilot-terminal-detection.showStatus', handleShowStatusCommand)
	];

	// Add all disposables to subscriptions
	context.subscriptions.push(
		terminalOpenDisposable,
		terminalCloseDisposable,
		...commands
	);

	logger.info('Extension activated successfully');
}

// Command handlers
function handleDetectCommand() {
	const activeTerminal = vscode.window.activeTerminal;
	if (!activeTerminal) {
		vscode.window.showWarningMessage('No active terminal found');
		return;
	}

	const isCopilot = detectCopilotTerminal(activeTerminal);
	const message = isCopilot ? 
		'🤖 Copilot terminal detected!' : 
		'Terminal is not from Copilot agent';
	vscode.window.showInformationMessage(message);
}

function handleCreateMarkerCommand() {
	const activeTerminal = vscode.window.activeTerminal;
	if (!activeTerminal) {
		vscode.window.showWarningMessage('No active terminal found');
		return;
	}

	createAgentMarkerFile(activeTerminal);
	vscode.window.showInformationMessage('Marker file created for active terminal');
}

function handleShowStatusCommand() {
	try {
		const tempDir = os.tmpdir();
		const files = fs.readdirSync(tempDir);
		const markerFiles = files.filter(f => f.startsWith(MARKER_PREFIX));
		
		if (markerFiles.length === 0) {
			vscode.window.showInformationMessage('No Copilot marker files found');
			return;
		}

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
	} catch (error) {
		vscode.window.showErrorMessage(`Failed to check marker files: ${error}`);
	}
}

/**
 * Detects if a terminal was created by a Copilot agent based on naming patterns
 */
function detectCopilotTerminal(terminal: vscode.Terminal): boolean {
	const terminalName = terminal.name.toLowerCase().trim();

	// First check if this is a standard shell (exclusion takes priority)
	if (EXCLUDE_PATTERNS.some(pattern => terminalName === pattern || terminalName.startsWith(pattern))) {
		return false;
	}

	// Check terminal name against Copilot patterns
	let isCopilotTerminal = COPILOT_PATTERNS.some(pattern => terminalName.includes(pattern));

	// Check creation options for additional detection
	const creationOptions = terminal.creationOptions;
	if (creationOptions && 'name' in creationOptions && creationOptions.name) {
		const optionsName = creationOptions.name.toLowerCase().trim();
		
		// Apply same exclusion logic to creation options
		if (EXCLUDE_PATTERNS.some(pattern => optionsName === pattern || optionsName.startsWith(pattern))) {
			return false;
		}
		
		// Check creation options against Copilot patterns
		if (COPILOT_PATTERNS.some(pattern => optionsName.includes(pattern))) {
			isCopilotTerminal = true;
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
		logger.debug(`Copilot terminal detected: ${terminal.name}`);
	}

	return isCopilotTerminal;
}

/**
 * Creates a marker file for a Copilot terminal's process ID
 */
function createAgentMarkerFile(terminal: vscode.Terminal) {
	const processId = terminal.processId;
	if (!processId) {
		logger.warn('Cannot create marker file: terminal process ID not available');
		return;
	}
	
	processId.then(pid => {
		const markerPath = path.join(os.tmpdir(), `${MARKER_PREFIX}${pid}`);
		const markerData = {
			isAgentSession: true,
			terminalMode: 'agent',
			processId: pid,
			terminalName: terminal.name,
			timestamp: Date.now()
		};

		try {
			fs.writeFileSync(markerPath, JSON.stringify(markerData));
			logger.debug(`Created marker file for PID ${pid}`);
		} catch (error) {
			logger.error(`Failed to create marker file for PID ${pid}:`, error);
		}
	});
}

/**
 * Removes the marker file for a specific terminal
 */
function removeAgentMarkerFile(terminal: vscode.Terminal) {
	const processId = terminal.processId;
	if (!processId) {
		logger.warn('Cannot remove marker file: terminal process ID not available');
		return;
	}
	
	processId.then(pid => {
		const markerPath = path.join(os.tmpdir(), `${MARKER_PREFIX}${pid}`);
		try {
			if (fs.existsSync(markerPath)) {
				fs.unlinkSync(markerPath);
				logger.debug(`Removed marker file for PID ${pid}`);
			}
		} catch (error) {
			logger.error(`Failed to remove marker file for PID ${pid}:`, error);
		}
	});
}

/**
 * Removes all agent marker files during cleanup
 */
function removeAllAgentMarkerFiles() {
	try {
		const tempDir = os.tmpdir();
		const files = fs.readdirSync(tempDir);
		const markerFiles = files.filter(f => f.startsWith(MARKER_PREFIX));
		
		markerFiles.forEach(file => {
			const filePath = path.join(tempDir, file);
			try {
				fs.unlinkSync(filePath);
			} catch (error) {
				logger.error(`Failed to remove marker file ${file}:`, error);
			}
		});

		if (markerFiles.length > 0) {
			logger.debug(`Cleaned up ${markerFiles.length} marker files`);
		}
	} catch (error) {
		logger.error('Failed to clean up marker files:', error);
	}
}

export function deactivate() {
	removeAllAgentMarkerFiles();
	logger.info('Extension deactivated');
}
