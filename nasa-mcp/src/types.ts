/**
 * NASA APOD API Types and Schemas
 */

/**
 * Input parameters for the nasa_apod tool
 */
export interface NasaApodInput {
  date?: string;
  start_date?: string;
  end_date?: string;
  count?: number;
  thumbs?: boolean;
  api_key?: string;
}

/**
 * JSON Schema for MCP protocol
 */
export const NASA_APOD_JSON_SCHEMA = {
  type: "object" as const,
  properties: {
    date: {
      type: "string",
      pattern: "^\\d{4}-\\d{2}-\\d{2}$",
      description: "Date of the APOD to retrieve (YYYY-MM-DD format). Cannot be used with count or date range."
    },
    start_date: {
      type: "string",
      pattern: "^\\d{4}-\\d{2}-\\d{2}$",
      description: "Start of date range (YYYY-MM-DD). Must be used with end_date. Cannot be used with date or count."
    },
    end_date: {
      type: "string",
      pattern: "^\\d{4}-\\d{2}-\\d{2}$",
      description: "End of date range (YYYY-MM-DD). Must be used with start_date. Cannot be used with date or count."
    },
    count: {
      type: "number",
      minimum: 1,
      maximum: 100,
      description: "Number of random images to retrieve (1-100). Cannot be used with date or date range."
    },
    thumbs: {
      type: "boolean",
      default: false,
      description: "If true, return thumbnail URL for video entries."
    },
    api_key: {
      type: "string",
      description: "NASA API key. Defaults to DEMO_KEY if not provided."
    }
  }
};

/**
 * Single APOD entry from NASA API
 */
export interface ApodEntry {
  date: string;
  title: string;
  explanation: string;
  media_type: 'image' | 'video';
  url: string;
  hdurl?: string;
  thumbnail_url?: string;
  copyright?: string;
  service_version?: string;
}

/**
 * Response type from NASA APOD API
 * Can be a single entry or an array of entries
 */
export type ApodResponse = ApodEntry | ApodEntry[];