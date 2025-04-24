# mcp-register README

This extension provides a command to easily set up your MCP (Multi-Cloud Project) configurations in VS Code's global settings.

## Features

**Sync MCP Settings:**

*   Quickly adds or updates the `mcp` configuration block in your global VS Code user settings.
*   To run the command:
    1.  Open the Command Palette (`Ctrl+Shift+P` on Windows/Linux or `Cmd+Shift+P` on macOS).
    2.  Type `Sync MCP Settings` and select the command.
*   This will automatically add the necessary server configurations (like the GitHub MCP server) to your global settings, making them available across all your projects.

Example of the configuration added:

```json
"mcp": {
    "servers": {
        "github": {
            "command": "docker",
            "args": [
                "run",
                "-i",
                "--rm",
                "-e",
                "GITHUB_PERSONAL_ACCESS_TOKEN",
                "ghcr.io/github/github-mcp-server"
            ],
            "env": {
                "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_TOKEN_HERE" // Remember to replace placeholder tokens
            }
        }
        // Other MCP server configurations can be added here
    }
}
