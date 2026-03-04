# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in a chat interface, Claude generates React code via tool calls, and the result renders in a sandboxed iframe preview.

## Commands

- `npm run dev` — Start dev server (Turbopack, port 3000)
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run test` — Run all tests (Vitest)
- `npx vitest run src/path/to/test.test.ts` — Run a single test file
- `npm run setup` — Install deps + generate Prisma client + run migrations
- `npm run db:reset` — Reset database

## Architecture

**Stack**: Next.js 15 App Router, React 19, TypeScript (strict), Tailwind CSS v4, Prisma/SQLite, Vercel AI SDK + Anthropic Claude, Monaco Editor.

**Key flow**: Chat input → `POST /api/chat` (streams AI response with tool calls) → `FileSystemProvider` applies tool calls to the in-memory virtual file system → `CodeEditor` displays files, `PreviewFrame` renders `/App.jsx` in an iframe via Babel standalone.

### Core modules

- **`src/lib/file-system.ts`** — `VirtualFileSystem` class: in-memory FS with create/read/update/delete, path normalization, serialize/deserialize. No disk writes.
- **`src/lib/contexts/chat-context.tsx`** — Chat state management, calls `/api/chat` with serialized file system.
- **`src/lib/contexts/file-system-context.tsx`** — VFS state, processes AI tool call results (`str_replace_editor`, `file_manager`).
- **`src/lib/tools/`** — AI tool definitions: `str-replace.ts` (create/view/replace/insert/undo), `file-manager.ts` (rename/delete).
- **`src/lib/prompts/generation.tsx`** — System prompt instructing Claude to generate React components with `/App.jsx` as entry point.
- **`src/lib/provider.ts`** — Returns Claude Haiku model or a mock provider when `ANTHROPIC_API_KEY` is unset.
- **`src/lib/auth.ts`** — JWT session management (jose), httpOnly cookies, 7-day expiry.
- **`src/actions/`** — Server actions for auth (signUp/signIn/signOut/getUser) and projects (create/get/list).

### UI components

- **`src/components/ui/`** — shadcn/ui components (new-york style).
- **`src/components/chat/`** — `ChatInterface`, `MessageList`, `MessageInput`, `MarkdownRenderer`.
- **`src/components/editor/`** — `CodeEditor` (Monaco), `FileTree`.
- **`src/components/preview/PreviewFrame.tsx`** — Renders generated React in iframe with Babel transform.

### Database

Prisma with SQLite (`prisma/schema.prisma`). Models: `User` (email, password) and `Project` (messages as JSON, data as serialized VFS). Generated client outputs to `src/generated/prisma`.

## Conventions

- Path alias: `@/*` maps to `src/*`
- Components use default exports; utilities use named exports
- Tests are colocated in `__tests__/` directories next to source files
- Testing stack: Vitest + @testing-library/react + jsdom