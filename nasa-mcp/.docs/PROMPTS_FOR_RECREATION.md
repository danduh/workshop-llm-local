# Prompts for Recreating NASA MCP Server

This document contains 4 prompts to guide an AI agent in recreating the NASA MCP (Model Context Protocol) server from scratch. Follow these prompts in order.

---

## PROMPT 1: Project Scaffolding

Create a new TypeScript project for an MCP server that will connect to NASA's APOD (Astronomy Picture of the Day) API.

**Project Name:** `nasa-mcp`

**Project Structure:**
```
nasa-mcp/
├── src/
│   ├── index.ts       # Main server entry point
│   ├── config.ts      # Configuration management
│   ├── types.ts       # Type definitions and schemas
│   └── nasa-api.ts    # NASA API client
├── dist/              # Compiled JavaScript output (auto-generated)
├── package.json
├── tsconfig.json
└── README.md
```

**Step 1: Initialize the Project**

Create a new directory and initialize npm:
```bash
mkdir nasa-mcp
cd nasa-mcp
npm init
```

When prompted during `npm init`:
- **Package name:** `nasa-mcp`
- **Description:** `NASA APOD MCP Server`
- **Type:** Set to `module` (for ES modules support)
- **Main:** `dist/index.js`
- Accept defaults for other fields or customize as needed

**Step 2: Add npm Scripts**

Add these scripts to your `package.json`:
- `build`: Compile TypeScript using `tsc`
- `watch`: Watch mode for development with `tsc --watch`
- `start`: Run the compiled server with `node dist/index.js`
- `dev`: Build and run in one command (e.g., `tsc && node dist/index.js`)

**Step 3: Install Dependencies**

Install the latest versions of required dependencies:

**Main Dependencies:**
```bash
npm install @modelcontextprotocol/sdk
```

**Development Dependencies:**
```bash
npm install --save-dev typescript @types/node
```

**Step 4: Configure TypeScript**

Create a `tsconfig.json` file. You'll need to configure TypeScript for a Node.js project with ES modules. Consider these settings:
- Choose an appropriate target (modern ES version)
- Set module system for Node.js ES modules
- Configure module resolution for Node
- Set output directory to `./dist`
- Set source directory to `./src`
- Enable strict type checking for better code quality
- Enable ES module interoperability
- Consider generating source maps and declarations for debugging
- Include all files in `src/`
- Exclude `node_modules` and `dist`

Experiment with different configurations to find what works best for your MCP server setup.


```bash
mkdir src
```

**Verification:**
After setup, the project should:
1. Have all dependencies installed
2. Compile successfully with `npm run build`
3. Create a `dist` directory with compiled JavaScript

---

## PROMPT 2: Type Definitions and Basic MCP Server Setup

Implement the foundational MCP server structure without any tools or business logic. Set up type definitions and configure the server for testing with MCP Inspector.

### Part A: Type Definitions (`src/types.ts`)

Create comprehensive TypeScript types and JSON schema for the NASA APOD API:

**1. Input Type (`NasaApodInput` interface):**
Define an interface with these optional properties:
- `date`: string - Single date in YYYY-MM-DD format
- `start_date`: string - Start of date range in YYYY-MM-DD format
- `end_date`: string - End of date range in YYYY-MM-DD format
- `count`: number - Number of random images (1-100)
- `thumbs`: boolean - Include thumbnail URLs for videos
- `api_key`: string - NASA API key override

**2. JSON Schema (`NASA_APOD_JSON_SCHEMA` constant):**
Create a JSON Schema object compatible with MCP protocol that mirrors the input type:
- Type: "object"
- Properties for each field with appropriate validation:
  - `date`: string with regex pattern `^\d{4}-\d{2}-\d{2}$`, description explaining it cannot be used with count or date range
  - `start_date`: string with regex pattern `^\d{4}-\d{2}-\d{2}$`, description explaining it must be used with end_date
  - `end_date`: string with regex pattern `^\d{4}-\d{2}-\d{2}$`, description explaining it must be used with start_date
  - `count`: number with minimum 1 and maximum 100, description explaining it cannot be used with date or date range
  - `thumbs`: boolean with default false, description for thumbnail URLs
  - `api_key`: string with description about defaulting to DEMO_KEY

**3. Response Types:**
- `ApodEntry` interface with properties:
  - `date`: string (required)
  - `title`: string (required)
  - `explanation`: string (required)
  - `media_type`: 'image' | 'video' (required)
  - `url`: string (required)
  - `hdurl`: string (optional)
  - `thumbnail_url`: string (optional)
  - `copyright`: string (optional)
  - `service_version`: string (optional)

- `ApodResponse` type: Union type that can be either `ApodEntry` or `ApodEntry[]`

### Part B: Configuration Management (`src/config.ts`)

**1. Configuration Interface (`NasaConfig`):**
- `apiKey`: string - NASA API key (defaults to 'DEMO_KEY')
- `baseUrl`: string - Base URL for NASA API (defaults to 'https://api.nasa.gov')
- `timeout`: number - Request timeout in milliseconds (defaults to 10000)

**2. Default Configuration:**
Create a `DEFAULT_CONFIG` object with the default values mentioned above.

**3. Configuration Loader (`loadConfig` function):**
Export a function that:
- Reads environment variables: `NASA_API_KEY`, `NASA_BASE_URL`, `NASA_TIMEOUT`
- Falls back to defaults if not set
- Parses `NASA_TIMEOUT` as integer with proper error handling
- Returns a `NasaConfig` object

### Part C: Basic MCP Server (`src/index.ts`)

Create a minimal MCP server structure WITHOUT any tool implementations:

**1. Imports:**
```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { loadConfig } from "./config.js";
```

**2. Server Metadata:**
- Server name: `nasa-mcp`
- Server version: `1.0.0`

**3. Server Creation Function (`createServer`):**
Create a function that:
- Instantiates a new `Server` with name and version
- Configures capabilities with empty `tools: {}` object
- Sets up a `ListToolsRequestSchema` handler that returns an empty tools array: `{ tools: [] }`
- Sets up a `CallToolRequestSchema` handler that immediately throws "Unknown tool" error
- Returns the configured server instance

**4. Main Function:**
Create an async `main` function that:
- Creates the server using `createServer()`
- Creates a `StdioServerTransport`
- Connects server to transport
- Logs startup information to stderr (not stdout):
  - Server name and version
  - Whether using DEMO_KEY or custom key
  - Base URL
  - Timeout value

**5. Entry Point:**
- Add shebang: `#!/usr/bin/env node`
- Call `main()` and catch fatal errors
- Exit with code 1 on error

### Part D: MCP Inspector Testing

**README Documentation:**
Create a `README.md` section explaining how to test with MCP Inspector:

**Testing Instructions:**
1. Build the project: `npm run build`
2. Launch inspector: `npx @modelcontextprotocol/inspector`
3. Configure in the Inspector UI:
   - **Command:** `node`
   - **Arguments (as JSON array):** `["/absolute/path/to/nasa-mcp/dist/index.js"]`

**Important Notes:**
- DO NOT use the `.js` file path as the command - use `node` as command
- The path to `index.js` goes in the arguments array
- Common error: `spawn EACCES` means you're trying to execute the .js file directly

**Testing with Environment Variables:**
```bash
NASA_API_KEY=your_key_here npx @modelcontextprotocol/inspector node dist/index.js
```

**Expected Behavior:**
- Server starts successfully
- Inspector shows connection established
- Tools list is empty (will be populated in next prompt)
- No errors in the inspector console

### Part E: Optional Test Client (`test-client.js`)

Create a simple test client to verify the server works:
```javascript
#!/usr/bin/env node
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

// Spawn server, connect, list tools, close
```

**Verification Checklist:**
- [ ] Project compiles without errors
- [ ] Server starts and logs to stderr
- [ ] MCP Inspector connects successfully
- [ ] Server responds to ListTools request (empty array)
- [ ] No runtime errors or crashes

---

## PROMPT 3: MCP Tool Definition (No Implementation)

Add the MCP tool definition and wire up the tool listing, but do NOT implement the actual tool logic or API client yet.

### Objective
Define the `nasa_apod` tool in the MCP server so it appears in the tools list, with complete metadata and schema, but the tool call handler should return a placeholder message.

### Step-by-Step Instructions

**1. Update ListToolsRequestSchema Handler in `src/index.ts`:**

Modify the `ListToolsRequestSchema` handler to return one tool:

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "nasa_apod",
        description:
          "Get NASA Astronomy Picture of the Day (APOD). Retrieve a specific date, date range, or random images.",
        inputSchema: NASA_APOD_JSON_SCHEMA,
      },
    ],
  };
});
```

**Key Points:**
- Tool name is `nasa_apod`
- Description clearly explains what the tool does
- Use the `NASA_APOD_JSON_SCHEMA` constant from `src/types.ts`
- Import it at the top: `import { NASA_APOD_JSON_SCHEMA } from "./types.js";`

**2. Update CallToolRequestSchema Handler (Placeholder Only):**

Update the tool call handler to recognize the tool but return a placeholder:

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "nasa_apod") {
    // Placeholder response - no real implementation yet
    return {
      content: [
        {
          type: "text",
          text: "🚧 Tool recognized but not yet implemented. NASA API integration coming in next step.",
        },
      ],
    } as CallToolResult;
  }

  throw new Error(`Unknown tool: ${name}`);
});
```

**Important:**
- Tool name check is case-sensitive: `nasa_apod`
- Return proper MCP `CallToolResult` structure
- Content is an array with text type objects
- Import `CallToolResult` from SDK types

**3. Update Imports:**

Add necessary imports to `src/index.ts`:
```typescript
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  CallToolResult,
} from "@modelcontextprotocol/sdk/types.js";
import { NASA_APOD_JSON_SCHEMA, NasaApodInput } from "./types.js";
```

**4. Server Metadata Update:**

Ensure the server metadata clearly indicates it's a NASA APOD server:
- Name: `nasa-mcp`
- Version: `1.0.0`
- Capabilities: `{ tools: {} }`

### Testing with MCP Inspector

**Build and Test:**
```bash
npm run build
npx @modelcontextprotocol/inspector
```

**In Inspector UI:**
1. Connect to server (same configuration as before)
2. Navigate to "Tools" tab
3. Verify `nasa_apod` appears in the tools list
4. Click on the tool to see its description and input schema
5. Try calling the tool with any arguments
6. Verify it returns the placeholder message: "🚧 Tool recognized but not yet implemented..."

**Expected Schema Display:**
The inspector should show all input parameters:
- `date` - with regex validation and description
- `start_date` and `end_date` - for date ranges
- `count` - with min/max constraints
- `thumbs` - boolean for thumbnails
- `api_key` - optional API key override

**Verification Checklist:**
- [ ] Tool appears in tools list
- [ ] Tool name is `nasa_apod`
- [ ] Description is clear and accurate
- [ ] Input schema shows all 6 parameters
- [ ] Parameter validation rules are visible
- [ ] Calling the tool returns placeholder message
- [ ] No errors or crashes

### README Update

Add a new section to `README.md`:

**Available Tools:**

#### `nasa_apod`
Get NASA Astronomy Picture of the Day (APOD). Retrieve a specific date, date range, or random images.

**Parameters:**
- `date` (optional): Single date in YYYY-MM-DD format
- `start_date` (optional): Start of date range  
- `end_date` (optional): End of date range
- `count` (optional): Number of random images (1-100)
- `thumbs` (optional): Include video thumbnails
- `api_key` (optional): Override default API key

**Parameter Rules:**
- Use `date` alone for a single day
- Use `start_date` + `end_date` for a range
- Use `count` alone for random images
- These modes are mutually exclusive

**Status:** Tool definition complete, implementation pending.

### What's NOT Implemented Yet

At this stage, the following are still placeholders:
- ❌ NASA API client (`src/nasa-api.ts`) - not implemented
- ❌ Actual API calls - not made
- ❌ Response formatting - not done
- ❌ Error handling for API failures - not implemented
- ✅ Tool definition and schema - complete
- ✅ MCP protocol integration - complete

---

## PROMPT 4: NASA API Client and Tool Implementation

Implement the complete NASA API client and connect it to the MCP tool to make the server fully functional.

### Objective
Create a robust NASA API client and integrate it with the `nasa_apod` tool to fetch real data from NASA's APOD API.

### Part A: NASA API Client (`src/nasa-api.ts`)

Create a complete API client class to handle NASA API communication.

**1. Class Structure:**

```typescript
export class NasaApiClient {
  constructor(private config: NasaConfig) {}

  async fetchApod(params: NasaApodInput): Promise<ApodResponse> {
    // Implementation here
  }
}
```

**2. Implementation Details:**

**URL Construction:**
- Base URL from config: `this.config.baseUrl`
- Endpoint: `/planetary/apod`
- Build URL using `URL` and `URLSearchParams`

**Parameter Handling:**
Add query parameters conditionally:
- If `params.date` exists, add it
- If `params.start_date` exists, add it
- If `params.end_date` exists, add it
- If `params.count` is defined (not undefined), add it as string
- If `params.thumbs` is defined, add it as string
- Always add API key: use `params.api_key` if provided, otherwise `this.config.apiKey`

**Timeout Handling:**
- Use `AbortController` for timeout
- Create timeout using `setTimeout` that calls `controller.abort()`
- Set timeout duration from `this.config.timeout`
- Clear timeout after response or error

**Fetch Request:**
```typescript
const response = await fetch(url.toString(), {
  signal: controller.signal,
});
```

**Response Handling:**
- Check `response.ok`
- If not ok, read error text and throw: `NASA API error (${status}): ${errorText}`
- Parse JSON response: `await response.json()`
- Cast to `ApodResponse` type
- Return the data

**Error Handling:**
- Clear timeout in finally block or catch
- If error is AbortError, throw timeout message with duration
- Re-throw other errors
- Handle unknown errors with generic message

**3. Imports:**
```typescript
import { NasaConfig } from "./config.js";
import { NasaApodInput, ApodResponse } from "./types.js";
```

### Part B: Update Main Server (`src/index.ts`)

**1. Initialize API Client:**

After loading config, create the NASA client:
```typescript
const config = loadConfig();
const nasaClient = new NasaApiClient(config);
```

**2. Import API Client:**
```typescript
import { NasaApiClient } from "./nasa-api.js";
```

**3. Implement Tool Call Handler:**

Replace the placeholder in `CallToolRequestSchema` handler:

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "nasa_apod") {
    try {
      // Cast arguments to expected type
      const input = args as NasaApodInput;

      // Fetch APOD data
      const response = await nasaClient.fetchApod(input);

      // Format response
      let formattedText: string;
      let structuredData: unknown;

      if (Array.isArray(response)) {
        formattedText = `# NASA APOD Results (${response.length} entries)\n\n`;
        formattedText += response
          .map((entry) => formatApodEntry(entry))
          .join("\n---\n\n");
        structuredData = response;
      } else {
        formattedText = "# NASA Astronomy Picture of the Day\n\n";
        formattedText += formatApodEntry(response);
        structuredData = response;
      }

      return {
        content: [
          {
            type: "text",
            text: formattedText,
          },
        ],
        _meta: {
          structured: structuredData,
        },
      } as CallToolResult;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        content: [
          {
            type: "text",
            text: `❌ Error fetching APOD: ${errorMessage}`,
          },
        ],
        isError: true,
      } as CallToolResult;
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});
```

**Key Implementation Points:**
- Cast `args` to `NasaApodInput` for type safety
- Call `nasaClient.fetchApod(input)` to fetch data
- Handle both single entry and array responses
- Format output with markdown headers and separators
- Include structured data in `_meta` for programmatic access
- Wrap in try-catch to handle API errors gracefully
- Return error response with `isError: true` on failure

**4. Create Formatting Helper Function:**

Add a helper function to format APOD entries for display:

```typescript
function formatApodEntry(entry: ApodEntry): string {
  let text = `📅 **${entry.date}** - ${entry.title}\n\n`;
  text += `${entry.explanation}\n\n`;
  text += `🔗 **Media Type:** ${entry.media_type}\n`;
  text += `🔗 **URL:** ${entry.url}\n`;
  
  if (entry.hdurl) {
    text += `🔗 **HD URL:** ${entry.hdurl}\n`;
  }
  
  if (entry.thumbnail_url) {
    text += `🔗 **Thumbnail:** ${entry.thumbnail_url}\n`;
  }
  
  if (entry.copyright) {
    text += `©️ **Copyright:** ${entry.copyright}\n`;
  }
  
  return text;
}
```

**Formatting Rules:**
- Include emoji indicators for visual appeal
- Use markdown bold for labels
- Show date and title prominently
- Include full explanation
- Show media type and main URL
- Conditionally show optional fields: HD URL, thumbnail, copyright
- Return formatted string with newlines

**5. Import Additional Types:**
```typescript
import { ApodEntry } from "./types.js";
```

### Part C: Testing and Verification

**Build and Test:**
```bash
npm run build
npx @modelcontextprotocol/inspector
```

**Test Cases:**

**Test 1: Single Date**
```json
{
  "date": "2024-01-15"
}
```
Expected: Single APOD entry for that date

**Test 2: Date Range**
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-05"
}
```
Expected: Array of 5 APOD entries

**Test 3: Random Images**
```json
{
  "count": 3
}
```
Expected: Array of 3 random APOD entries

**Test 4: Today's APOD (No Parameters)**
```json
{}
```
Expected: Today's APOD entry

**Test 5: Video with Thumbnail**
```json
{
  "date": "2023-12-20",
  "thumbs": true
}
```
Expected: Entry with thumbnail_url if it's a video

**Test 6: Custom API Key**
```json
{
  "api_key": "YOUR_API_KEY_HERE"
}
```
Expected: Works with custom key

**Test 7: Error Cases**
```json
{
  "date": "2050-01-01"
}
```
Expected: Error message about future date

**Verification Checklist:**
- [ ] Single date queries work
- [ ] Date range queries return multiple entries
- [ ] Random count queries work
- [ ] No parameters returns today's APOD
- [ ] Thumbnails work for videos
- [ ] API errors are caught and formatted
- [ ] Timeout handling works (test with network throttle)
- [ ] Both DEMO_KEY and custom keys work
- [ ] Formatted output includes all fields
- [ ] Structured data in _meta is correct
- [ ] HD URLs appear when available
- [ ] Copyright appears when present

### Part D: Final Documentation

**Update README.md with complete usage instructions:**

**Configuration Section:**
Add table explaining environment variables:
- `NASA_API_KEY` - NASA API key (default: DEMO_KEY)
- `NASA_BASE_URL` - API base URL (default: https://api.nasa.gov)
- `NASA_TIMEOUT` - Request timeout in ms (default: 10000)

Add note about DEMO_KEY rate limits:
- 30 requests per hour
- 50 requests per day
- Register for free key at https://api.nasa.gov/

**Usage with Claude Desktop:**
Add example configuration:
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

**Example Queries:**
Add example queries users can try:
- "Show me NASA's picture of the day"
- "Get APODs from January 1-5, 2024"
- "Give me 5 random NASA astronomy pictures"

**Architecture Overview:**
Add project structure explanation:
- `index.ts` - Main MCP server and protocol handling
- `config.ts` - Configuration management and environment variables
- `types.ts` - TypeScript types and JSON schemas
- `nasa-api.ts` - NASA API client and HTTP communication
- `test-client.js` - Optional test client for debugging

### Part E: Final Testing

**Integration Test Flow:**
1. Build project: `npm run build`
2. Test with inspector: Verify all test cases pass
3. Test with Claude Desktop: Add to config and query
4. Test environment variables: Try custom API key
5. Test error handling: Try invalid inputs
6. Test timeout: Simulate slow network

**Production Readiness Checklist:**
- [ ] All test cases pass
- [ ] Error messages are clear and helpful
- [ ] API key configuration works
- [ ] Timeout handling prevents hanging
- [ ] Response formatting is consistent
- [ ] Documentation is complete
- [ ] TypeScript types are accurate
- [ ] No console.log in production code (only console.error to stderr)
- [ ] Shebang is present for CLI execution
- [ ] Package.json bin is configured correctly

### Success Criteria

The implementation is complete when:
1. ✅ Server starts without errors
2. ✅ All API test cases return correct data
3. ✅ Error handling works gracefully
4. ✅ MCP Inspector shows tool and accepts calls
5. ✅ Claude Desktop can use the server
6. ✅ Documentation is clear and accurate
7. ✅ TypeScript compilation has no errors
8. ✅ Both DEMO_KEY and custom keys work

---

## Summary

These 4 prompts will guide you through creating a complete NASA MCP server:

1. **Prompt 1** - Project scaffolding with proper TypeScript setup
2. **Prompt 2** - Type definitions and basic MCP server without tools
3. **Prompt 3** - Tool definition and MCP integration without implementation
4. **Prompt 4** - Complete NASA API client and tool implementation

Follow them sequentially for best results. Each prompt builds on the previous one and includes verification steps.
