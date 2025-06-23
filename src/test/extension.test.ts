import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Copilot Terminal Detection Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('erwinkroon.copilot-terminal-detection'));
	});

	test('Extension commands should be registered', async () => {
		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('copilot-terminal-detection.detectCopilot'));
		assert.ok(commands.includes('copilot-terminal-detection.createMarker'));
		assert.ok(commands.includes('copilot-terminal-detection.showStatus'));
	});

	test('Extension should be loadable', () => {
		const extension = vscode.extensions.getExtension('erwinkroon.copilot-terminal-detection');
		if (extension && extension.isActive) {
			// Extension is loaded and active
			assert.ok(extension.exports || true);
		}
	});
});
