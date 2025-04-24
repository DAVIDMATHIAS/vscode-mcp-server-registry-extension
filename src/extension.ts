import * as vscode from 'vscode';
import * as fs from 'fs'; // Import the Node.js file system module
import * as path from 'path'; // Import the Node.js path module

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "mcp-register" is now active!');

	const disposable = vscode.commands.registerCommand('mcp-register.sync-mcp-settings', async () => {
		const settingKey = 'mcp';

		try {
			// --- Read configuration from JSON file ---
			const configFilePath = path.join(context.extensionPath, 'src', 'mcp-config.json'); // Construct the full path
			const configFileContent = fs.readFileSync(configFilePath, 'utf-8'); // Read the file content
			const newValue = JSON.parse(configFileContent); // Parse the JSON content
			// --- End reading configuration ---

			// Get the workspace configuration
			const config = vscode.workspace.getConfiguration();

			// Update the setting globally
			await config.update(settingKey, newValue, vscode.ConfigurationTarget.Global);
			vscode.window.showInformationMessage(`Global setting '${settingKey}' updated successfully from configuration file.`);

		} catch (error: any) { // Catch potential errors during file reading, parsing, or updating
			let errorMessage = `Failed to update global setting '${settingKey}'.`;
			if (error instanceof SyntaxError) {
				errorMessage = `Failed to parse mcp-config.json: ${error.message}`;
			} else if (error.code === 'ENOENT') {
				 errorMessage = `Configuration file not found at ${error.path}`;
			} else if (error instanceof Error) {
				 errorMessage = `Failed to update global setting '${settingKey}': ${error.message}`;
			}

			vscode.window.showErrorMessage(errorMessage);
			console.error(`Error during MCP settings sync:`, error); // Log the detailed error
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
