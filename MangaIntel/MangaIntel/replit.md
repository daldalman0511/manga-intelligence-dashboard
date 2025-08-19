# Overview

This is a Japanese media monitoring and analytics application built as a full-stack web platform. The system aggregates news articles from various sources, performs sentiment analysis, and provides real-time insights into market trends and competitor activity. It features a modern dashboard interface for tracking news sentiment, company mentions, trending topics, and critical alerts in the Japanese media landscape.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Modern component-based architecture using React 18 with TypeScript for type safety
- **Vite Build System**: Fast development server and optimized production builds
- **shadcn/ui Design System**: Comprehensive UI component library with Radix UI primitives for accessibility
- **TailwindCSS**: Utility-first CSS framework with custom theming and responsive design
- **Wouter Router**: Lightweight client-side routing solution
- **TanStack Query**: Server state management with caching, background updates, and optimistic updates

## Backend Architecture
- **Express.js Server**: RESTful API with TypeScript, middleware-based request processing
- **Drizzle ORM**: Type-safe database interactions with PostgreSQL using schema-first approach
- **Scheduled Services**: Background job processing for news aggregation, sentiment analysis, and trend monitoring
- **In-Memory Storage**: Development storage layer with interface for easy database migration
- **Modular Service Layer**: Separate services for news aggregation, sentiment analysis, and scheduling

## Data Management
- **Database Schema**: PostgreSQL with tables for users, companies, news sources, articles, alerts, and trends
- **Real-time Analytics**: Live computation of article statistics, sentiment metrics, and company mentions
- **Content Processing**: Article categorization, keyword extraction, and importance scoring
- **Search Functionality**: Full-text search across article titles and content

## API Design
- **RESTful Endpoints**: Standard HTTP methods with JSON responses
- **Resource-based URLs**: Organized by entities (articles, companies, analytics, alerts, trends)
- **Query Parameters**: Flexible filtering, pagination, and search capabilities
- **Error Handling**: Centralized error middleware with structured error responses

## Development Environment
- **Hot Module Replacement**: Vite-powered development with instant updates
- **TypeScript Compilation**: Shared types between frontend and backend
- **Path Aliases**: Clean import statements using @/ prefixes
- **Development Logging**: Structured request/response logging for API debugging

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL provider using @neondatabase/serverless driver
- **Drizzle Kit**: Database migration and schema management tools
- **Connection Pooling**: Built-in connection management for serverless environments

## UI Framework
- **Radix UI**: Headless component primitives for accessibility and keyboard navigation
- **Lucide Icons**: Comprehensive icon library with React components
- **Class Variance Authority**: Type-safe component variant management
- **Date-fns**: Modern date manipulation and formatting utilities

## Development Tools
- **ESBuild**: Fast JavaScript bundler for production server builds
- **PostCSS**: CSS processing with autoprefixer for browser compatibility
- **TypeScript**: Static type checking across the entire application
- **React Hook Form**: Form state management with validation support

## Scheduled Services
- **News Aggregation**: RSS feed parsing and web scraping for content collection
- **Sentiment Analysis**: Text processing for emotional tone detection
- **Trend Monitoring**: Keyword frequency analysis and change detection
- **Alert System**: Real-time notification generation based on predefined criteria

## Session Management
- **Connect-pg-simple**: PostgreSQL-backed session storage for user authentication
- **Express Session**: Server-side session management with secure cookies