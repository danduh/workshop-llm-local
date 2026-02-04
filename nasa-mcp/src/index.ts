#!/usr/bin/env node

/**
 * NASA MCP Server
 * 
 * Provides access to NASA's Astronomy Picture of the Day (APOD) API
 * via the Model Context Protocol.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { loadConfig } from './config.js';

// Load configuration
const config = loadConfig();

// Server metadata
const SERVER_NAME = 'nasa-mcp';
const SERVER_VERSION = '1.0.0';

/**
 * Create and configure the MCP server
 */
function createServer(): Server {
  const server = new Server(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  return server;
}

/**
 * Main entry point
 */
async function main() {
  // Create server instance
  const server = createServer();

  // Create stdio transport
  const transport = new StdioServerTransport();

  // Connect server to transport
  await server.connect(transport);

  // Log startup (to stderr so it doesn't interfere with stdio protocol)
  console.error(`${SERVER_NAME} v${SERVER_VERSION} started`);
  console.error(`NASA API Key: ${config.apiKey === 'DEMO_KEY' ? 'DEMO_KEY (limited)' : 'Custom key'}`);
  console.error(`Base URL: ${config.baseUrl}`);
  console.error(`Timeout: ${config.timeout}ms`);
}

// Run the server
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
