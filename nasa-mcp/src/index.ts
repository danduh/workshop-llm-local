#!/usr/bin/env node

/**
 * NASA MCP Server
 *
 * Provides access to NASA's Astronomy Picture of the Day (APOD) API
 * via the Model Context Protocol.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  CallToolResult,
} from "@modelcontextprotocol/sdk/types.js";
import { loadConfig } from "./config.js";
import {
  NASA_APOD_JSON_SCHEMA,
  NasaApodInput,
  ApodEntry,
} from "./types.js";
import { NasaApiClient } from "./nasa-api.js";

// Load configuration
const config = loadConfig();

// Create NASA API client
const nasaClient = new NasaApiClient(config);

// Server metadata
const SERVER_NAME = "nasa-mcp";
const SERVER_VERSION = "1.0.0";


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
    },
  );

  // List available tools
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

  // Handle tool calls
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

  return server;
}

/**
 * Format a single APOD entry for display
 */
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
  console.error(
    `NASA API Key: ${config.apiKey === "DEMO_KEY" ? "DEMO_KEY (limited)" : "Custom key"}`,
  );
  console.error(`Base URL: ${config.baseUrl}`);
  console.error(`Timeout: ${config.timeout}ms`);
}

// Run the server
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
