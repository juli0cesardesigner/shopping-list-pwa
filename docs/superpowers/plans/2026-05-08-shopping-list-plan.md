# Implementation Plan: Minimalist Shopping List App

## Phase 1: Setup and Foundation
1. **Initialize Next.js Project**
   - Run `npx create-next-app@latest .` with Tailwind CSS, TypeScript, and App Router.
   - Clean up default boilerplate styles.
   
2. **Install Dependencies**
   - `@supabase/supabase-js` for database and auth interactions.
   - `framer-motion` for smooth transition animations.
   - `lucide-react` for clean, minimalist icons.

## Phase 2: Backend (Supabase)
3. **Database & Auth Configuration**
   - Create the `items` table with columns: `id`, `user_id`, `name`, `quantity`, `is_completed`, `created_at`.
   - Enable Anonymous Sign-ins in the Supabase Auth settings.
   - Set up Row Level Security (RLS) policies to ensure users can only access their own data:
     - `SELECT`, `INSERT`, `UPDATE`, `DELETE` where `auth.uid() = user_id`.
   - Setup local environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

## Phase 3: Frontend Development
4. **Setup Supabase Client & Auth Hook**
   - Create a singleton Supabase client.
   - Implement a React Context or Hook to handle the Anonymous Login on initial load and provide the `user_id` to the app.

5. **UI Components Construction**
   - **Main Layout**: A mobile-first container with constraints on maximum width for desktop viewing.
   - **Header & Input Area**: A sticky top section with inputs for "Item Name" and "Quantity", plus an "Add" button.
   - **Active List Section**: Renders pending items. 
   - **Completed List Section**: Renders completed items with lower opacity, pushed to the bottom.
   - **FAB (Floating Action Button)**: Positioned at the bottom right, only visible when there are completed items, used to clear them.

6. **Interactions & State Integration**
   - Fetch items from Supabase on mount.
   - Optimistic UI updates for adding, checking, and deleting items.
   - Use `framer-motion`'s `<AnimatePresence>` and `layout` properties on the list items to automatically animate them moving from the "Active" to "Completed" sections when checked.

## Phase 4: Polish & Deployment
7. **Aesthetic & Visual Excellence Polish**
   - Implement subtle glassmorphism effects on the header and FAB.
   - Ensure typography and spacing align with premium minimalist design standards.
   - Verify smooth 60fps animations.

8. **Deployment**
   - Initialize Git repository and commit code.
   - Connect repository to Vercel and deploy.
   - Add production Supabase environment variables to Vercel.
