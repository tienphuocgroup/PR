# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
A Payment Request Form application built with React, TypeScript, and Vite. This Vietnamese-language web app handles payment request creation with PDF export capabilities, specifically designed for TPG (Tiến Phước Group) company payment workflows.

## Development Commands
```bash
# Development server (DO NOT run - user will start manually)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Architecture and Key Components

### Core Technologies
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite with React plugin
- **Form Management**: React Hook Form with Zod validation
- **PDF Generation**: 
  - `@react-pdf/renderer` for React-based PDF creation
  - `pdfmake` for programmatic PDF generation
  - `pdf-lib` for PDF manipulation
- **Styling**: Tailwind CSS with PostCSS
- **State Persistence**: JS Cookie for form data persistence

### Project Structure
```
src/
├── components/
│   ├── PaymentRequestForm.tsx    # Main form component with JSON import feature
│   ├── DetailTable.tsx            # Payment details table component
│   ├── ModernPDFActions.tsx       # PDF generation action buttons
│   └── ui/                        # Reusable UI components
│       ├── FileUpload.tsx         # PDF file upload handler
│       └── FormField.tsx          # Generic form field wrapper
├── types/
│   └── index.ts                   # TypeScript interfaces (PaymentRequest, PaymentDetail)
├── utils/
│   ├── validation.ts              # Zod schemas for form validation
│   ├── formatters.ts              # Currency and date formatting utilities
│   ├── modernPdf.tsx              # PDF document definition generator
│   ├── pdfService.ts              # PDF generation and export logic
│   └── imageUtils.ts              # Image handling for PDF generation
└── App.tsx                        # Root application component
```

### Key Design Patterns

1. **Form State Management**: Uses React Hook Form with Zod validation for type-safe form handling. Form data is automatically persisted to cookies with 7-day expiration.

2. **PDF Generation**: Multiple PDF generation approaches:
   - Modern PDF with custom fonts (Noto Sans for Vietnamese support)
   - Includes TPG logo image embedding
   - Complex table layouts with merged cells and borders

3. **JSON Import Feature**: Collapsible JSON input section using Headless UI Disclosure component for bulk data entry into payment details table.

4. **Component Organization**: 
   - Smart components handle business logic (PaymentRequestForm)
   - Presentational components in `ui/` folder for reusability
   - Utility functions separated by concern (validation, formatting, PDF)

### Important Implementation Details

1. **Vietnamese Language Support**: The entire UI is in Vietnamese, including form labels, validation messages, and PDF content.

2. **Currency Handling**: 
   - Automatic conversion of numbers to Vietnamese currency text
   - Support for both VND and foreign currency amounts in detail items

3. **PDF Custom Fonts**: Noto Sans fonts are embedded for proper Vietnamese character rendering in PDFs.

4. **Vite Configuration**: Special handling for CommonJS modules and font assets, with optimized dependencies for PDF libraries.

5. **Form Validation Rules**:
   - Required fields: ngày, nguoiDeNghi, boPhan, noiDungThanhToan, nhaCungCap
   - Numeric validation for monetary amounts
   - PDF-only file attachments

## Development Guidelines

1. **Component Creation**: Follow existing patterns in `components/` - use TypeScript interfaces, React Hook Form integration where applicable.

2. **PDF Modifications**: When modifying PDF templates, test with Vietnamese text to ensure proper font rendering.

3. **Form Changes**: Update both the TypeScript interface in `types/index.ts` and Zod schema in `utils/validation.ts`.

4. **Styling**: Use Tailwind CSS utility classes consistently with the existing color scheme (blue/indigo accents).

5. **State Management**: Leverage React Hook Form's watch() for reactive updates and form state synchronization.