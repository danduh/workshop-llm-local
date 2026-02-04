/**
 * NASA API Client
 * 
 * Handles communication with NASA's APOD API
 */

import { NasaConfig } from "./config.js";
import { NasaApodInput, ApodResponse } from "./types.js";

export class NasaApiClient {
  constructor(private config: NasaConfig) {}

  /**
   * Fetch APOD data from NASA API
   */
  async fetchApod(params: NasaApodInput): Promise<ApodResponse> {
    // Build URL with query parameters
    const url = new URL('/planetary/apod', this.config.baseUrl);
    
    // Add parameters to query string
    const searchParams = new URLSearchParams();
    
    if (params.date) {
      searchParams.append('date', params.date);
    }
    if (params.start_date) {
      searchParams.append('start_date', params.start_date);
    }
    if (params.end_date) {
      searchParams.append('end_date', params.end_date);
    }
    if (params.count !== undefined) {
      searchParams.append('count', params.count.toString());
    }
    if (params.thumbs !== undefined) {
      searchParams.append('thumbs', params.thumbs.toString());
    }
    
    // Always include API key
    const apiKey = params.api_key || this.config.apiKey;
    searchParams.append('api_key', apiKey);
    
    url.search = searchParams.toString();

    // Set up timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`NASA API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return data as ApodResponse;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${this.config.timeout}ms`);
        }
        throw error;
      }
      
      throw new Error('Unknown error occurred');
    }
  }
}
