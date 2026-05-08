# Shopping List App Design

## Overview
A minimalist, mobile-first web application for individual users to manage a simple shopping list. The app prioritizes a clean UI, fast interactions, and no-friction usage (no explicit login required).

## Architecture
- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Animations**: Framer Motion
- **Backend / DB**: Supabase (PostgreSQL)
- **Authentication**: Supabase Anonymous Sign-in (creates a persistent session behind the scenes without user interaction)
- **Deployment**: Vercel
- **Version Control**: GitHub

## UI/UX & Layout
- **Aesthetic**: Minimalist design, neutral color palette (off-white/light gray or premium dark mode), modern typography (Inter/Geist), and subtle glassmorphism effects.
- **Mobile-First Layout**:
  - **Top**: Header and input field for adding new items (Name and Quantity).
  - **Middle**: Active list of items to buy.
  - **Bottom**: Section with lower opacity for completed/purchased items.
  - **Floating Action Button (FAB)**: A discrete button to clear all completed items.
- **Interactions**: When an item is marked as purchased via its checkbox, it automatically and smoothly transitions (via Framer Motion) to the completed section at the bottom.

## Data Model
- **`items` table (Supabase)**:
  - `id`: UUID (Primary Key)
  - `user_id`: UUID (Foreign Key to Supabase Auth, used via Anonymous Login)
  - `name`: Text (e.g., "Maçã")
  - `quantity`: Text (e.g., "2", "1kg")
  - `is_completed`: Boolean (default: `false`)
  - `created_at`: Timestamp (for sorting)

## Security (RLS)
- Supabase Row Level Security (RLS) will be enabled on the `items` table so that users (identified by their anonymous `user_id`) can only select, insert, update, or delete their own items.
