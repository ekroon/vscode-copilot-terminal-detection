import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Track terminals created by Copilot agents
const copilotTerminals = new WeakSet<vscode.Terminal>();

// Logging system with different levels
enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3
}

class Logger {
	private static currentLevel: LogLevel = LogLevel.INFO;
	
	static setLevel(level: LogLevel) {
		this.currentLevel = level;
	}
	
	static debug(message: string, ...args: any[]) {
		if (this.currentLevel <= LogLevel.DEBUG) {
			console.log(`[DEBUG] ${message}`, ...args);
		}
	}
	
	static info(message: string, ...args: any[]) {
		if (this.currentLevel <= LogLevel.INFO) {
			console.log(`[INFO] ${message}`, ...args);
		}
	}
	
	static warn(message: string, ...args: any[]) {
		if (this.currentLevel <= LogLevel.WARN) {
			console.warn(`[WARN] ${message}`, ...args);
		}
	}
	
	static error(message: string, ...args: any[]) {
		if (this.currentLevel <= LogLevel.ERROR) {
			console.error(`[ERROR] ${message}`, ...args);
		}
	}
}

/**
 * Called when the extension is activated
 */
export function activate(context: vscode.ExtensionContext) {
	Logger.info('Copilot Terminal Detection extension activated');

	// Clean up any existing marker files from previous sessions
	removeAllAgentMarkerFiles();

	// Set up terminal monitoring
	const terminalOpenDisposable = setupTerminalMonitoring();
	const terminalCloseDisposable = setupTerminalCleanup();
	
	// Process existing terminals
	processExistingTerminals();

	// Register commands
	const commands = registerCommands();

	// Add all disposables to subscriptions
	context.subscriptions.push(
		terminalOpenDisposable,
		terminalCloseDisposable,
		...commands
	);

	Logger.info('Extension initialization complete');
}

/**
 * Sets up monitoring for new terminal creation
 */
function setupTerminalMonitoring(): vscode.Disposable {
	return vscode.window.onDidOpenTerminal((terminal) => {
		// Small delay to allow terminal to fully initialize
		setTimeout(() => {
			Logger.debug(`Processing new terminal: ${terminal.name}`);
			const isCopilot = detectCopilotTerminal(terminal);
			
			if (isCopilot) {
				createAgentMarkerFile(terminal);
				Logger.info(`Copilot terminal detected: ${terminal.name}`);
			} else {
				Logger.debug(`Standard terminal: ${terminal.name}`);
			}
		}, 200);
	});
}

/**
 * Sets up cleanup for terminal close events
 */
function setupTerminalCleanup(): vscode.Disposable {
	return vscode.window.onDidCloseTerminal((terminal) => {
		if (copilotTerminals.has(terminal)) {
			copilotTerminals.delete(terminal);
			removeAgentMarkerFile(terminal);
			Logger.info(`Copilot terminal closed: ${terminal.name}`);
		}
	});
}

/**
 * Processes terminals that were already open when extension activated
 */
function processExistingTerminals() {
	let foundCopilotTerminals = false;
	
	vscode.window.terminals.forEach(terminal => {
		Logger.debug(`Checking existing terminal: ${terminal.name}`);
		const isCopilot = detectCopilotTerminal(terminal);
		if (isCopilot) {
			foundCopilotTerminals = true;
			createAgentMarkerFile(terminal);
		}
	});

	if (foundCopilotTerminals) {
		Logger.info('Created marker files for existing Copilot terminals');
	}
}

/**
 * Registers all extension commands
 */
function registerCommands(): vscode.Disposable[] {
	const detectCommand = vscode.commands.registerCommand('copilot-terminal-detection.detectCopilot', () => {
		const activeTerminal = vscode.window.activeTerminal;
		if (activeTerminal) {
			const isCopilot = detectCopilotTerminal(activeTerminal);
			const message = isCopilot ? 
				'🤖 Copilot terminal detected and marker file created!' : 
				'Terminal is not from Copilot agent';
			vscode.window.showInformationMessage(message);
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
		showMarkerFileStatus();
	});

	return [detectCommand, createMarkerCommand, showStatusCommand];
}

/**
 * Shows status of marker files (for debugging)
 */
function showMarkerFileStatus() {
	const tempDir = os.tmpdir();
	try {
		const files = fs.readdirSync(tempDir);
		const markerFiles = files.filter(f => f.startsWith('.vscode_copilot_agent_'));
		
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
 * Detection patterns for Copilot terminals
 */
const COPILOT_PATTERNS = [
	'copilot',
	'agent',
	'@workspace',
	'@terminal',
	'github copilot',
	'ai assistant',
	'chat participant'
];

/**
 * Patterns for standard shells that should be excluded
 */
const EXCLUDE_PATTERNS = [
	'zsh',
	'bash',
	'cmd',
	'powershell',
	'fish',
	'sh'
];

/**
 * Detects if a terminal was created by a Copilot agent
 */
function detectCopilotTerminal(terminal: vscode.Terminal): boolean {
	const terminalName = terminal.name.toLowerCase().trim();
	
	Logger.debug(`Detecting terminal type: "${terminal.name}"`);

	// First check if this is a standard shell that should be excluded
	if (isStandardShell(terminalName)) {
		Logger.debug(`Standard shell excluded: ${terminal.name}`);
		return false;
	}

	// Check terminal name against Copilot patterns
	let isCopilotTerminal = hasMatchingPattern(terminalName, COPILOT_PATTERNS);

	// Check creation options for additional clues
	const creationOptions = terminal.creationOptions;
	if (creationOptions && 'name' in creationOptions && creationOptions.name) {
		const optionsName = creationOptions.name.toLowerCase().trim();
		
		// Double-check exclusions for creation options
		if (isStandardShell(optionsName)) {
			Logger.debug(`Standard shell in creation options excluded: ${creationOptions.name}`);
			return false;
		}
		
		// Check creation options against Copilot patterns
		if (hasMatchingPattern(optionsName, COPILOT_PATTERNS)) {
			isCopilotTerminal = true;
		}
	}

	// Check environment variables for Copilot indicators
	if (creationOptions && 'env' in creationOptions && creationOptions.env) {
		const env = creationOptions.env;
		if (env['COPILOT_AGENT'] || env['GITHUB_COPILOT'] || env['AI_ASSISTANT']) {
			Logger.debug('Found Copilot environment variables in creation options');
			isCopilotTerminal = true;
		}
	}

	// Track Copilot terminals
	if (isCopilotTerminal) {
		copilotTerminals.add(terminal);
		Logger.debug(`Copilot terminal identified: ${terminal.name}`);
	}

	return isCopilotTerminal;
}

/**
 * Checks if terminal name matches standard shell patterns
 */
function isStandardShell(name: string): boolean {
	return EXCLUDE_PATTERNS.some(pattern => 
		name === pattern || name.startsWith(pattern)
	);
}

/**
 * Checks if name matches any of the given patterns
 */
function hasMatchingPattern(name: string, patterns: string[]): boolean {
	return patterns.some(pattern => name.includes(pattern));
}

/**
 * Creates a marker file for a specific terminal's process ID
 */
function createAgentMarkerFile(terminal: vscode.Terminal) {
	const processId = terminal.processId;
	if (!processId) {
		Logger.warn('Cannot create marker file: terminal process ID not available');
		return;
	}
	
	processId.then(pid => {
		const markerPath = path.join(os.tmpdir(), `.vscode_copilot_agent_${pid}`);
		const markerData = {
			isAgentSession: true,
			terminalMode: 'agent',
			processId: pid,
			terminalName: terminal.name,
			timestamp: Date.now()
		};

		try {
			fs.writeFileSync(markerPath, JSON.stringify(markerData));
			Logger.debug(`Created marker file for PID ${pid}: ${markerPath}`);
		} catch (error) {
			Logger.error(`Failed to create marker file for PID ${pid}:`, error);
		}
	}, (error: any) => {
		Logger.error('Failed to get terminal process ID:', error);
	});
}

/**
 * Removes the agent marker file for a specific terminal
 */
function removeAgentMarkerFile(terminal: vscode.Terminal) {
	const processId = terminal.processId;
	if (!processId) {
		Logger.warn('Cannot remove marker file: terminal process ID not available');
		return;
	}
	
	processId.then(pid => {
		const markerPath = path.join(os.tmpdir(), `.vscode_copilot_agent_${pid}`);
		try {
			if (fs.existsSync(markerPath)) {
				fs.unlinkSync(markerPath);
				Logger.debug(`Removed marker file for PID ${pid}`);
			}
		} catch (error) {
			Logger.error(`Failed to remove marker file for PID ${pid}:`, error);
		}
	}, (error: any) => {
		Logger.error('Failed to get terminal process ID for cleanup:', error);
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
		
		if (markerFiles.length > 0) {
			Logger.debug(`Cleaning up ${markerFiles.length} marker files`);
			markerFiles.forEach(file => {
				const filePath = path.join(tempDir, file);
				try {
					fs.unlinkSync(filePath);
				} catch (error) {
					Logger.error(`Failed to remove marker file ${filePath}:`, error);
				}
			});
		}
	} catch (error) {
		Logger.error('Failed to clean up marker files:', error);
	}
}

/**
 * Called when the extension is deactivated
 */
export function deactivate() {
	removeAllAgentMarkerFiles();
	Logger.info('Copilot Terminal Detection extension deactivated');
}
