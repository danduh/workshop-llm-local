Step 5 — Tool contract: nasa_apod (schema + docs)

Definition (deliverable): A formal tool definition using TypeScript interfaces and manual JSON Schema.

Description: Implemented the tool specification in `src/types.ts`:
- Tool name: `nasa_apod`
- Tool description: "Get NASA Astronomy Picture of the Day (APOD). Retrieve a specific date, date range, or random images."
- Input defined with `NasaApodInput` TypeScript interface:
  - `date?: string` (YYYY-MM-DD format)
  - `start_date?: string` (YYYY-MM-DD format)
  - `end_date?: string` (YYYY-MM-DD format)
  - `count?: number` (1-100)
  - `thumbs?: boolean` (default: false)
  - `api_key?: string`
- Constraint rules documented in JSON Schema descriptions:
  - `count` cannot be used with `date`, `start_date`, or `end_date`
  - `date` cannot be used with `start_date`, `end_date`, or `count`
  - `start_date` and `end_date` must be used together
- Manual JSON Schema defined in `NASA_APOD_JSON_SCHEMA` constant for MCP protocol
- Simple TypeScript interface provides type safety without runtime validation

Step 6 — Response contract for APOD output

Definition (deliverable): Typed response shapes using TypeScript interfaces.

Description: Implemented response contracts in `src/types.ts`:
- TypeScript interface `ApodEntry` defines single APOD entry:
  - `date: string` (Date of the APOD)
  - `title: string` (Title of the image or video)
  - `explanation: string` (Full description)
  - `media_type: 'image' | 'video'` (Union type)
  - `url: string` (URL of the image or video)
  - `hdurl?: string` (Optional high-resolution URL)
  - `thumbnail_url?: string` (Optional thumbnail for videos)
  - `copyright?: string` (Optional copyright information)
  - `service_version?: string` (Optional API version)
- Response type: `ApodResponse = ApodEntry | ApodEntry[]` (handles single or multiple entries)
- Tool registration completed in `src/index.ts` with `ListToolsRequestSchema` handler
- Tool invocation handler (`CallToolRequestSchema`) prepared but currently commented out, ready for implementation
- Handler should cast arguments to `NasaApodInput` type
- Handler should use NASA API client to fetch data
- Handler should format response as MCP content with text and structured metadata
- Error handling should return responses with `isError: true` flag