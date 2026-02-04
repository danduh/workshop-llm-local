# NASA MCP Server

NASA APOD (Astronomy Picture of the Day) MCP Server implementation in TypeScript.

## Configuration

The server can be configured via environment variables:

### Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `NASA_API_KEY` | NASA API key for authenticated requests | `DEMO_KEY` |
| `NASA_BASE_URL` | Base URL for NASA API (optional override) | `https://api.nasa.gov` |
| `NASA_TIMEOUT` | Request timeout in milliseconds | `10000` (10 seconds) |

### Getting a NASA API Key

1. Visit [https://api.nasa.gov/](https://api.nasa.gov/)
2. Sign up for a free API key
3. Use it by setting the `NASA_API_KEY` environment variable

**Note:** The `DEMO_KEY` has rate limits (30 requests per hour, 50 requests per day). For production use, register for your own API key.

## Development

### Prerequisites

- Node.js ≥ 18
- npm or yarn
- TypeScript knowledge

### Installation

```bash
npm install
```

### Build

```bash
npm run build
```

### Run

```bash
npm start
```

### Development Mode (with watch)

```bash
npm run watch
# In another terminal:
npm start
```

### Debug in VSCode

1. Open the project in VSCode
2. Press F5 or use the "Debug MCP Server" launch configuration
3. Set breakpoints in the TypeScript source files

### Test with MCP Inspector

The MCP Inspector is a tool for testing and debugging MCP servers interactively.

#### Installation & Launch

```bash
npm run build
npx @modelcontextprotocol/inspector
```

This will start the inspector and open a web interface (typically at `http://localhost:6274`).

#### Configuration in Inspector UI

When the inspector opens in your browser, configure the connection:

**Command:**
```
node
```

**Arguments (as JSON array):**
```json
["/Users/danielos/dev/workshop-llm-local/nasa-mcp/dist/index.js"]
```

Or use the absolute path to your compiled server.

#### With Custom API Key

```bash
NASA_API_KEY=your_key_here npx @modelcontextprotocol/inspector node dist/index.js
```

#### Troubleshooting

**Error: `spawn /path/to/dist/index.js EACCES`**

This occurs when trying to execute the `.js` file directly. The inspector needs to spawn `node` as the process.

**Solution:** Use `node` as the **Command** and the path to your `.js` file in **Arguments**, not the path as the command itself.

✅ **Correct:**
- Command: `node`
- Arguments: `["/path/to/nasa-mcp/dist/index.js"]`

❌ **Incorrect:**
- Command: `/path/to/nasa-mcp/dist/index.js`
- Arguments: `[]`

**Connection Error: "Did you add the proxy session token"**

This typically happens when the inspector UI can't communicate with the proxy server. Make sure:
1. The inspector terminal shows "MCP Inspector is up and running"
2. You're using the URL with the auth token pre-filled
3. The command and arguments are configured correctly (see above)

## Project Structure

```
nasa-mcp/
├── src/
│   ├── index.ts       # Main server entry point
│   └── config.ts      # Configuration management
├── dist/              # Compiled JavaScript output
├── .vscode/           # VSCode workspace settings
├── tsconfig.json      # TypeScript configuration
└── package.json       # Project metadata and dependencies
```

## Usage with Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "nasa-apod": {
      "command": "node",
      "args": ["/path/to/nasa-mcp/dist/index.js"],
      "env": {
        "NASA_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## License

ISC
