import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Helper function to check if a value is a plain object
function isObject(item: any): item is Record<string, any> {
	return (item && typeof item === 'object' && !Array.isArray(item));
}

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "mcp-register" is now active!');

	const disposable = vscode.commands.registerCommand('mcp-register.sync-mcp-settings', async () => {
		const settingKey = 'mcp';
		const config = vscode.workspace.getConfiguration();

		try {
			// --- Read configuration from JSON file ---
			const configFilePath = path.join(context.extensionPath, 'src', 'mcp-config.json');
			const configFileContent = fs.readFileSync(configFilePath, 'utf-8');
			const configFromFile = JSON.parse(configFileContent);
			// --- End reading configuration ---

			// --- Get current global configuration ---
			// Use inspect to get details including the global value
			const inspectResult = config.inspect<{ servers?: Record<string, any> }>(settingKey);
			const currentGlobalValue = inspectResult?.globalValue;

			// Initialize the merged config, starting with the current global value if it's valid
			// Ensure we have a valid base object to merge into
			const mergedConfig: { servers: Record<string, any> } = {
				servers: (isObject(currentGlobalValue) && isObject(currentGlobalValue.servers))
						 ? { ...currentGlobalValue.servers } // Deep copy existing servers
						 : {}
			};


			// --- Merge configurations ---
			let serversAddedCount = 0;
			if (isObject(configFromFile) && isObject(configFromFile.servers)) {
				for (const serverKey in configFromFile.servers) {
					// Only add if the server key doesn't already exist in the current global config
					if (!mergedConfig.servers.hasOwnProperty(serverKey)) {
						mergedConfig.servers[serverKey] = configFromFile.servers[serverKey];
						serversAddedCount++;
						console.log(`Adding missing server: ${serverKey}`);
					} else {
						console.log(`Server already exists, skipping: ${serverKey}`);
					}
				}
			} else {
				console.warn("mcp-config.json does not contain a valid 'servers' object.");
			}


			// --- Update the setting globally if changes were made ---
			// Only update if new servers were actually added to avoid unnecessary writes
			if (serversAddedCount > 0) {
				await config.update(settingKey, mergedConfig, vscode.ConfigurationTarget.Global);
				vscode.window.showInformationMessage(`Synced MCP settings. Added ${serversAddedCount} new server(s) to global configuration.`);
			} else {
				 vscode.window.showInformationMessage(`MCP settings already up-to-date. No new servers added.`);
			}


		} catch (error: any) {
			let errorMessage = `Failed to sync MCP settings.`;
			if (error instanceof SyntaxError) {
				errorMessage = `Failed to parse mcp-config.json: ${error.message}`;
			} else if (error.code === 'ENOENT') {
				errorMessage = `Configuration file not found at ${error.path}`;
			} else if (error instanceof Error) {
				errorMessage = `Failed to sync MCP settings: ${error.message}`;
			}

			vscode.window.showErrorMessage(errorMessage);
			console.error(`Error during MCP settings sync:`, error);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
