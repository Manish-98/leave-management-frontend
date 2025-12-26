# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server with HMR
- `npm run build` - TypeScript build check (`tsc -b`) + Vite production build
- `npm run lint` - Run ESLint on all files
- `npm run preview` - Preview production build locally

### Build Process
The build command runs two operations sequentially:
1. `tsc -b` - Type checking using project references
2. `vite build` - Production bundling and optimization

## Architecture Overview

This is a **React 19 + TypeScript + Vite** frontend application for leave management. The project uses modern web tooling and strict type checking.

### Technology Stack
- **Frontend**: React 19.2.0 with latest React features
- **Language**: TypeScript 5.9.3 (strict mode enabled)
- **Build Tool**: Vite 7.2.4 with HMR
- **Module System**: ES Modules (ESNext)
- **JSX**: React 19 JSX transform (no runtime required)

### TypeScript Configuration
The project uses **TypeScript project references** with separate configs:
- `tsconfig.json` - Root config with project references
- `tsconfig.app.json` - Application code configuration (strict, ES2022 target, bundler mode)
- `tsconfig.node.json` - Node/build tool configuration (ES2023 target)

**Important TypeScript settings:**
- Strict mode enabled (`strict: true`)
- No unused locals/parameters allowed
- No fallthrough cases in switch
- Force module detection (ESM)
- React JSX transform enabled

### Project Structure
```
src/
├── main.tsx           # Application entry point
├── App.tsx            # Root component
├── App.css            # Component styles
├── index.css          # Global styles
└── assets/            # Static assets (images, etc.)

public/                # Static assets served directly
index.html             # HTML entry point with app mount
```

### Linting Configuration
ESLint uses the modern **flat config format** with:
- JavaScript recommended rules
- TypeScript ESLint recommended rules
- React Hooks rules (enforces Rules of Hooks)
- React Refresh rules (ensures HMR compatibility)
- Browser environment globals

The `dist/` directory is globally ignored.

### Development Practices
- **React 19 patterns** - Using latest React features and best practices
- **Hot Module Replacement** - Enabled via Vite for fast development iteration
- **Type safety** - Comprehensive TypeScript strict mode enforcement
- **ESLint strictness** - Code quality enforced via linting (run `npm run lint` before commits)

## Current State

The application is in early development using the Vite + React template. The current `App.tsx` contains a placeholder counter component. Business logic for leave management functionality has not yet been implemented.

## Next Development Steps

When implementing leave management features:
1. Establish routing structure (consider React Router)
2. Implement state management for leave requests
3. Create API integration layer for backend communication
4. Build core components for leave request forms, approvals, and dashboards
5. Maintain TypeScript strict mode compliance throughout development
