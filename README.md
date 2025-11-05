# Asset Generator

AI-powered asset generator for creating landing pages and email outreach sequences.

## Features

- **AI-Powered Generation**: Generate high-converting landing pages and email sequences using OpenAI
- **Smart Caching**: Automatic caching of repeated requests to improve performance and reduce costs
- **Error Handling & Retries**: Robust error handling with automatic retries for invalid JSON responses
- **Structured Output**: All generated content follows structured schemas for consistency
- **Asset Management**: View, edit, and save generated assets to your project document area
- **Search & Filter**: Organize assets with tags, search functionality, and status tracking

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: React, TypeScript, Tailwind CSS
- **AI**: OpenAI GPT-4
- **State Management**: React Query
- **Caching**: Node-Cache
- **Validation**: Zod schemas

## Getting Started

### Prerequisites

- Node.js 18+
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### Development

Start the development server:

```bash
npm run dev
```

This will start both the backend server (port 3001) and frontend development server (port 3000).

### Production Build

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Usage

### Generating Assets

1. Navigate to the "Generate" page
2. Select asset type (Landing Page or Email Sequence)
3. Fill in the required parameters:
   - Target Audience
   - Industry
   - Tone
   - Keywords (optional)
   - Specific Requirements (optional)
4. Click "Generate Asset" to create the content

### Managing Assets

- **View Assets**: Browse all generated assets on the "Assets" page
- **Search & Filter**: Find assets by type or search terms
- **Edit**: Update asset details, status, and tags
- **Delete**: Remove unwanted assets

### Asset Types

#### Landing Pages
Generated landing pages include:
- Hero section
- Features section
- Testimonials
- Pricing
- Call-to-action
- About section
- Contact section

#### Email Sequences
Generated email sequences include:
- 5-7 step outreach sequence
- Personalized subject lines
- Email body content
- Send timing recommendations
- Personalization tokens

## API Endpoints

### Assets
- `POST /api/assets/generate` - Generate new asset
- `POST /api/assets/save` - Save generated asset
- `GET /api/assets` - List all assets
- `GET /api/assets/:id` - Get single asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset

### Cache Management
- `GET /api/assets/cache/stats` - Get cache statistics
- `POST /api/assets/cache/clear` - Clear cache

## Schemas

The application uses Zod schemas for type validation:

- `LandingPageSchema` - Landing page structure
- `EmailSequenceSchema` - Email sequence structure
- `AssetRecordSchema` - Asset record structure
- `AssetGenerationRequestSchema` - Generation request structure

## Error Handling

The application includes comprehensive error handling:

- **API Errors**: Automatic retries with exponential backoff
- **JSON Parsing**: Multiple attempts to fix common JSON issues
- **Validation**: Schema validation for all data
- **User Feedback**: Clear error messages and loading states

## Caching

- **TTL**: 1 hour cache duration
- **Key Strategy**: Based on asset type and parameters
- **Management**: Cache statistics and manual clearing available

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.