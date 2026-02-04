/**
 * Configuration for the NASA MCP Server
 */

export interface NasaConfig {
  /** NASA API key. Defaults to DEMO_KEY if not provided. */
  apiKey: string;
  
  /** Base URL for NASA API. Defaults to official endpoint. */
  baseUrl: string;
  
  /** Request timeout in milliseconds. Defaults to 10000 (10 seconds). */
  timeout: number;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: NasaConfig = {
  apiKey: 'DEMO_KEY',
  baseUrl: 'https://api.nasa.gov',
  timeout: 10000,
};

/**
 * Load configuration from environment variables with fallback to defaults
 */
export function loadConfig(): NasaConfig {
  return {
    apiKey: process.env.NASA_API_KEY || DEFAULT_CONFIG.apiKey,
    baseUrl: process.env.NASA_BASE_URL || DEFAULT_CONFIG.baseUrl,
    timeout: parseInt(process.env.NASA_TIMEOUT || '', 10) || DEFAULT_CONFIG.timeout,
  };
}
