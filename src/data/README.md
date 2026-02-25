# Data Directory Structure

This directory contains all content files separate from the codebase.

## Current Structure

- `content/` - All markdown content files with frontmatter
- `locales/` - PO translation files (mirroring content structure)
- `nav/` - YAML navigation configuration files
- `images/` - optimized image assets

## Design Principle

**Content should be completely independent of implementation language.**

This allows you to:
- Switch from TypeScript to Rust, Go, or any other language
- Edit content without touching code
- Version control content separately if needed
- Use the same content with different frontends