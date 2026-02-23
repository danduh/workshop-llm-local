# Phase 2: NASA APOD Tool Implementation

## Workshop Guide — Building the nasa_apod Tool

This phase implements the `nasa_apod` tool that fetches data from NASA's Astronomy Picture of the Day (APOD) API.

---

## What We Built

### Step 5: Tool Contract (`nasa_apod`)

**Files Created:**
- [`src/types.ts`](../src/types.ts) - TypeScript interfaces and JSON Schema

**Tool Specification:**

Input parameters defined with TypeScript interface:
```typescript
interface NasaApodInput {
  date?: string;          // YYYY-MM-DD format
  start_date?: string;    // YYYY-MM-DD format
  end_date?: string;      // YYYY-MM-DD format
  count?: number;         // 1-100 random images
  thumbs?: boolean;       // Include video thumbnails
  api_key?: string;       // Override API key
}
```

**Parameter Constraints (Documented in Schema):**
1. ❌ `count` cannot be used with `date`, `start_date`, or `end_date`
2. ❌ `date` cannot be used with `start_date`, `end_date`, or `count`
3. ✅ `start_date` and `end_date` must be used together

**Implementation Status:**
- Tool registration completed with `ListToolsRequestSchema` handler
- Constraint validation should be implemented in tool handler (currently not enforced)
- Manual JSON Schema defined in `NASA_APOD_JSON_SCHEMA` constant

---

### Step 6: Response Contract

**Files Created:**
- [`src/types.ts`](../src/types.ts) - Response type definitions
- [`src/nasa-api.ts`](../src/nasa-api.ts) - API client (prepared for implementation)
- [`src/index.ts`](../src/index.ts) - Tool registration (handler ready to implement)

**APOD Entry Type:**

```typescript
interface ApodEntry {
  date: string;              // Date of the APOD
  title: string;             // Title of the image/video
  explanation: string;       // Description
  media_type: 'image' | 'video';
  url: string;               // Media URL
  hdurl?: string;            // High-res image URL (optional)
  thumbnail_url?: string;    // Video thumbnail (optional)
  copyright?: string;        // Copyright info (optional)
  service_version?: string;  // API version (optional)
}
```

**Response Type:**
- Single entry: `ApodEntry`
- Multiple entries: `ApodEntry[]`
- Type: `ApodResponse = ApodEntry | ApodEntry[]`

**Implementation Status:**
- Type definitions complete
- Tool invocation handler (`CallToolRequestSchema`) prepared in `src/index.ts` but commented out
- Handler should format responses with text content and structured metadata
- Error handling pattern prepared with `isError` flag

---

## Architecture Overview

```
┌─────────────────┐
│   MCP Client    │
│  (Claude/CLI)   │
└────────┬────────┘
         │ stdio
         │ CallToolRequest
         ▼
┌─────────────────────────────────────┐
│          MCP Server                 │
│  (src/index.ts)                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Tool Handler                │   │
│  │  - Validate params           │   │
│  │  - Call API client           │   │
│  │  - Format response           │   │
│  └──────────┬──────────────────┘   │
│             │                       │
│  ┌──────────▼──────────────────┐   │
│  │  NasaApiClient              │   │
│  │  (src/nasa-api.ts)          │   │
│  │  - Build URL                │   │
│  │  - Fetch with timeout       │   │
│  │  - Handle errors            │   │
│  └──────────┬──────────────────┘   │
└─────────────┼──────────────────────┘
              │ HTTPS
              ▼
    ┌─────────────────────┐
    │   NASA APOD API     │
    │ api.nasa.gov        │
    └─────────────────────┘
```

---

## Key Implementation Details

### 1. Type Safety (src/types.ts)

Simple TypeScript interfaces provide compile-time type checking:

```typescript
// Input interface
export interface NasaApodInput {
  date?: string;
  start_date?: string;
  end_date?: string;
  count?: number;
  thumbs?: boolean;
  api_key?: string;
}

// JSON Schema for MCP protocol
export const NASA_APOD_JSON_SCHEMA = {
  type: 'object',
  properties: { /* ... */ }
};
```

No runtime validation currently implemented. Constraints documented in JSON Schema descriptions.

### 2. API Client (src/nasa-api.ts)

NASA API client class prepared for fetching APOD data. Implementation should include:
- URL construction with query parameters
- Timeout support using AbortController
- HTTP error handling
- Return typed `ApodResponse`

Currently not instantiated in index.ts - ready for integration.

### 3. Tool Registration (src/index.ts)

Tool registration with MCP server is complete:

```typescript
// Register tool with MCP server
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'nasa_apod',
        description: 'Get NASA Astronomy Picture of the Day...',
        inputSchema: NASA_APOD_JSON_SCHEMA,
      },
    ],
  };
});
```

Tool invocation handler prepared but currently commented out. Implementation should:
1. Cast arguments to `NasaApodInput` type
2. Call NASA API client with parameters
3. Format response as MCP content array with text and structured metadata
4. Handle errors with `isError` flag and descriptive messages

---

## Testing the Tool

**Current Status:** Tool registration is complete and visible in MCP Inspector. Tool invocation handler is prepared but not yet connected, so actual API calls are not yet functional.

### Using MCP Inspector

1. **Build the server:**
   ```bash
   npm run build
   ```

2. **Start the inspector:**
   ```bash
   npx @modelcontextprotocol/inspector
   ```

3. **Configure in browser:**
   - Command: `node`
   - Arguments: `["/path/to/nasa-mcp/dist/index.js"]`

4. **Verify tool is listed:**
   The `nasa_apod` tool should appear with its full schema definition.

5. **Tool invocation ready for implementation:**
   Once the handler is uncommented and API client instantiated, test with these parameter combinations:

   **Get today's APOD:**
   ```json
   {}
   ```

   **Specific date:**
   ```json
   {
     "date": "2024-01-15"
   }
   ```

   **Date range:**
   ```json
   {
     "start_date": "2024-01-01",
     "end_date": "2024-01-07"
   }
   ```

   **Random images:**
   ```json
   {
     "count": 5
   }
   ```

### Using Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "nasa-apod": {
      "command": "node",
      "args": ["/Users/danielos/dev/workshop-llm-local/nasa-mcp/dist/index.js"],
      "env": {
        "NASA_API_KEY": "DEMO_KEY"
      }
    }
  }
}
```

Then ask Claude:
- "Show me today's astronomy picture"
- "Get NASA's picture for January 15, 2024"
- "Show me 5 random astronomy pictures"

---

## Error Handling

Error handling patterns are prepared in the commented-out tool handler:

1. **Parameter Validation Errors:**
   Should validate mutual exclusivity constraints and return:
   ```json
   {
     "isError": true,
     "content": [{"type": "text", "text": "❌ Invalid parameters: ..."}]
   }
   ```

2. **API Errors:**
   Should catch NASA API errors and return:
   ```json
   {
     "isError": true,
     "content": [{"type": "text", "text": "❌ Error fetching APOD: NASA API error..."}]
   }
   ```

3. **Timeout Errors:**
   Should handle AbortController timeout and return:
   ```json
   {
     "isError": true,
     "content": [{"type": "text", "text": "❌ Error fetching APOD: Request timeout..."}]
   }
   ```

---

## Response Formatting

Response formatting prepared in commented-out handler. Should format entries as:

### Single Entry

```markdown
# NASA Astronomy Picture of the Day

📅 **2024-01-15** - The Crab Nebula

A supernova remnant from 1054 AD, the Crab Nebula spans about 10 light-years...

🔗 **Media Type:** image
🔗 **URL:** https://apod.nasa.gov/apod/image/2401/crab_hubble.jpg
🔗 **HD URL:** https://apod.nasa.gov/apod/image/2401/crab_hubble_hd.jpg
```

### Multiple Entries

```markdown
# NASA APOD Results (3 entries)

📅 **2024-01-01** - Title 1
...
---

📅 **2024-01-02** - Title 2
...
---

📅 **2024-01-03** - Title 3
...
```

---

## What's Next?

Phase 2 foundation complete:
- ✅ TypeScript interfaces for input/output types
- ✅ Manual JSON Schema for MCP protocol
- ✅ Tool registration with MCP server
- ✅ Server starts and lists tools correctly

**To complete implementation:**
1. Instantiate `NasaApiClient` in index.ts
2. Uncomment `CallToolRequestSchema` handler
3. Add parameter validation logic if desired
4. Implement response formatting function
5. Test with MCP Inspector
6. Integrate with Claude Desktop

**Future enhancements could include:**
- Runtime parameter validation
- Caching responses to reduce API calls
- Image analysis with vision models
- Resource endpoints for browsing history
- Prompt templates for astronomy queries

---

## API Rate Limits

**DEMO_KEY:**
- 30 requests per hour
- 50 requests per day

**Free API Key (register at api.nasa.gov):**
- 1,000 requests per hour

Set your key:
```bash
export NASA_API_KEY=your_api_key_here
```

Or in Claude Desktop config `env` field.

---

## Files Modified/Created in Phase 2

| File | Purpose |
|------|---------|
| `src/types.ts` | TypeScript types, JSON Schema, validation |
| `src/nasa-api.ts` | NASA API client with fetch logic |
| `src/index.ts` | Tool registration and request handling |
| `.docs/Phase_2_info.md` | This documentation |

---

## Troubleshooting

**Build errors?**
```bash
npm run build
```

**Tool not showing in inspector?**
- Check server started successfully
- Look for "nasa-mcp v1.0.0 started" in stderr
- Verify ListToolsRequestSchema handler is registered

**API errors?**
- Check NASA_API_KEY is valid
- Verify internet connection
- Check api.nasa.gov status
- Review timeout settings (default 10s)

**Validation errors?**
- Read the error message carefully
- Check parameter constraints documented above
- Only one of: `date`, `date range`, or `count`

---

**🎉 Phase 2 Complete! Ready to explore the cosmos!**
