#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testServer() {
  console.log('Starting MCP client...');
  
  // Spawn the server process
  const serverProcess = spawn('node', [join(__dirname, 'dist/index.js')], {
    env: { ...process.env, NASA_API_KEY: 'DEMO_KEY' }
  });

  // Create client transport
  const transport = new StdioClientTransport({
    reader: serverProcess.stdout,
    writer: serverProcess.stdin
  });

  // Create client
  const client = new Client({
    name: 'test-client',
    version: '1.0.0'
  }, {
    capabilities: {}
  });

  try {
    // Connect to server
    await client.connect(transport);
    console.log('✓ Connected to server');

    // List available tools
    const tools = await client.listTools();
    console.log('\n📋 Available tools:');
    console.log(JSON.stringify(tools, null, 2));

    // You can test tool calls here once tools are implemented
    // const result = await client.callTool({ name: 'nasa_apod', arguments: {} });
    // console.log('\n🔧 Tool result:', result);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    serverProcess.kill();
    console.log('\n✓ Client closed');
  }
}

testServer().catch(console.error);
