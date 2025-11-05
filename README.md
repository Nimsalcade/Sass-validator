# Next.js 14 App with Split-View Layout

A modern Next.js 14 application featuring a split-view layout with chat panel and document workspace, built with TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- ⚡ **Next.js 14** with App Router
- 🎨 **Tailwind CSS v4** for styling
- 🧩 **shadcn/ui** design system components
- 🌓 **Dark mode** with next-themes
- 🔍 **TypeScript** for type safety
- 🎯 **TanStack Query** for data fetching
- ✨ **ESLint** & **Prettier** for code quality
- 🪝 **Husky** & **lint-staged** for pre-commit hooks
- 📁 **Absolute imports** via TypeScript path mapping

## Architecture

The application features a split-view layout:

- **Left Panel**: Chat interface with message input
- **Right Panel**: Document workspace
- **Top Navigation**: App navigation with dark mode toggle

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Or using npm
npm install
```

### Development

```bash
# Start development server
pnpm dev

# Or using npm
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint errors
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm typecheck` - Run TypeScript type checking

## Project Structure

```
src/
├── app/                    # App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page with split-view
│   └── globals.css        # Global styles & design tokens
├── components/
│   ├── ui/                # shadcn/ui components
│   │   └── button.tsx
│   ├── chat-panel.tsx     # Chat interface
│   ├── document-workspace.tsx
│   ├── navigation.tsx     # Top navigation
│   ├── theme-provider.tsx # Dark mode provider
│   ├── theme-toggle.tsx   # Dark mode toggle
│   └── query-provider.tsx # TanStack Query provider
├── lib/
│   └── utils.ts           # Utility functions (cn helper)
└── env.ts                 # Environment variables
```

## Code Quality

The project includes automated code quality checks:

- **Pre-commit hooks**: Automatically format and lint staged files
- **TypeScript**: Strict type checking
- **ESLint**: Next.js, React, and TanStack Query rules
- **Prettier**: Consistent code formatting

## Design System

The app uses shadcn/ui with a custom color palette defined in `globals.css`. Colors support both light and dark modes and use modern OKLCH color space for better perceptual uniformity.

### Adding shadcn/ui Components

```bash
# Install shadcn/ui CLI (if not already installed)
pnpm add -D shadcn-ui

# Add components
npx shadcn-ui@latest add [component-name]
```

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

See `.env.example` for all available variables.

## Tech Stack

- **Framework**: Next.js 16.0.1
- **React**: 19.2.0
- **TypeScript**: 5.9.3
- **Styling**: Tailwind CSS 4.1.16
- **UI Components**: shadcn/ui (class-variance-authority, lucide-react)
- **State Management**: TanStack Query 5.90.7
- **Theme**: next-themes 0.4.6
- **Linting**: ESLint 9.39.1 with Next.js config
- **Formatting**: Prettier 3.6.2
- **Git Hooks**: Husky 9.1.7 + lint-staged 16.2.6

## License

MIT
