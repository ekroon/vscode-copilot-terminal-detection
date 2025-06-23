import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Copilot Terminal Detection Test Suite', () => {
	test('Extension should be present', () => {
		const extension = vscode.extensions.getExtension('erwinkroon.copilot-terminal-detection');
		assert.ok(extension, 'Extension should be installed');
	});

	test('Extension commands should be registered', async () => {
		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('copilot-terminal-detection.detectCopilot'), 'Detect command should be registered');
		assert.ok(commands.includes('copilot-terminal-detection.createMarker'), 'Create marker command should be registered');
		assert.ok(commands.includes('copilot-terminal-detection.showStatus'), 'Show status command should be registered');
	});

	test('Extension should activate without errors', async () => {
		const extension = vscode.extensions.getExtension('erwinkroon.copilot-terminal-detection');
		if (extension && !extension.isActive) {
			await extension.activate();
		}
		assert.ok(extension?.isActive, 'Extension should be active');
	});
});
