# NASA MCP Server - SDK Information

## Current SDK Version

This project uses **@modelcontextprotocol/sdk v1.25.3** (v1 API).

### Key Classes & Imports (v1)

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
```

### Server Setup Pattern (v1)

```typescript
const server = new Server(
  {
    name: 'server-name',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: [...] };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Handle tool calls
});

// Connect to stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
```

## Migration to v2 (Future)

When v2 becomes available, the migration will involve:

1. **Package changes:**
   ```bash
   npm uninstall @modelcontextprotocol/sdk
   npm install @modelcontextprotocol/server
   ```

2. **Import updates:**
   ```typescript
   // v2 imports
   import { McpServer, StdioServerTransport } from '@modelcontextprotocol/server';
   ```

3. **API changes:**
   - `Server` → `McpServer`
   - `server.setRequestHandler()` → `server.registerTool()`
   - Input schemas require full Zod object wrapping

## References

- [MCP TypeScript SDK GitHub](https://github.com/modelcontextprotocol/typescript-sdk)
- [v1 Documentation](https://github.com/modelcontextprotocol/typescript-sdk/tree/v1)
- [Migration Guide (v1→v2)](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/migration.md)

```bash
npx @modelcontextprotocol/inspector /Users/danielos/dev/workshop-llm-local/nasa-mcp/dist/index.js  
```