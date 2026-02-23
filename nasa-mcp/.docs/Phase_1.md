NASA MCP (APOD) in TypeScript — Step-by-step plan (deliverables only)
Step 1 — Project scaffold in TypeScript

Definition (deliverable): A new repo/folder with TypeScript tooling configured.

Description: Create a Node + TypeScript project structure (package config, tsconfig, lint/format placeholders) ready to compile to a runnable CLI server. No MCP logic yet.

Step 2 — VSCode workspace setup

Definition (deliverable): A .vscode/ folder with workspace settings.

Description: Add settings for TypeScript, formatting, and debugging ergonomics. Include a VSCode launch configuration that can run the server via Node (compiled output) or via a TypeScript runner (your choice later).

Step 3 — Configuration model for NASA API

Definition (deliverable): A typed configuration spec (documented, not implemented).

Description: Define how the server will read config: NASA_API_KEY (default DEMO_KEY), optional base URL override, and timeouts. Provide a small README section describing expected env vars and defaults.

Step 4 — MCP server skeleton (no tools yet)

Definition (deliverable): A TypeScript “server shell” that starts and advertises capabilities.

Description: Define the server metadata (name/version), transport choice (stdio), and empty capabilities. This proves the server can start under VSCode debug and stay running.

# INPECTOR WORKS