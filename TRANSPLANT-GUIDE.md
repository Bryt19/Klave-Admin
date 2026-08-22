# Transplant Guide

## Component Map
* **Side Drawer (`src/pages/staff/components/StaffActivityDrawer.tsx`)**: The panel that slides in from the right to display a staff member's activity.
  * *Dependencies*: `src/context/AppContext.tsx`, `src/pages/staff/page.tsx`, `src/types/index.ts`.
* **Settings Page (`src/pages/settings/page.tsx`)**: The page component with a left navigation panel and right content panel.
  * *Dependencies*: `src/context/AppContext.tsx`, `src/hooks/useActionLock.ts`, `src/utils/api.ts`, `src/components/admin/ErrorLogViewer.tsx`.
* **Sidebar (`src/components/layout/Sidebar.tsx`)**: The left navigation component.
  * *Dependencies*: `src/context/AppContext.tsx`, `src/components/feature/HelpSupportModal.tsx`, `src/components/feature/UpgradeModal.tsx`, `src/utils/syncManager.ts`, `src/utils/offlineDB.ts`.
* **AppShell (`src/components/layout/AppShell.tsx`)**: The main layout wrapper that contains the sidebar and renders page content inside it.
  * *Dependencies*: `Sidebar.tsx`, `OfflineBanner.tsx`, `SyncStatusPanel.tsx`, `ReceiptPreviewPanel.tsx`, `SyncConflictModal.tsx`, `src/utils/api.ts`, `src/context/AppContext.tsx`.
* **Shared UI Primitives**: 
  * `src/components/ui/Skeleton.tsx` (Used by `ErrorLogViewer` inside the Settings Page).
  * `src/components/ui/ConfirmModal.tsx` (Used by multiple components).

## Layer Structure
The UI is built from the outermost shell inward:
1. The entry point renders the **AppShell** (Layout Wrapper).
2. The **AppShell** renders the **Sidebar** on the left and a scrollable content area on the right.
3. Inside the content area, the **current page component** (e.g., Settings Page or Staff Page) is rendered.
4. The page component may conditionally render a **drawer component** (like the side drawer) on top as a fixed overlay.

## Copy Order
Start with foundational files and end with specific components to avoid broken imports:
1. `src/fonts.css`
2. `src/App.css`
3. `src/index.css`
4. `postcss.config.js`
5. `tailwind.config.js`
6. `src/types/index.ts`
7. `src/utils/offlineDB.ts`
8. `src/utils/heartbeat.ts`
9. `src/utils/api.ts`
10. `src/utils/syncManager.ts`
11. `src/utils/inventory.ts`
12. `src/utils/errorLogger.ts`
13. `src/utils/formatters.ts`
14. `src/context/AppContext.tsx`
15. `src/pages/staff/components/StaffCard.tsx`
16. `src/components/ui/Skeleton.tsx`
17. `src/utils/routeUtils.ts`
18. `src/hooks/useActionLock.ts`
19. `src/components/ui/ConfirmModal.tsx`
20. `src/pages/staff/page.tsx`
21. `src/pages/staff/components/StaffActivityDrawer.tsx`
22. `src/components/admin/ErrorLogViewer.tsx`
23. `src/pages/settings/page.tsx`
24. `src/utils/print.ts`
25. `src/hooks/useHotkeys.ts`
26. `src/components/feature/HelpSupportModal.tsx`
27. `src/components/feature/UpgradeModal.tsx`
28. `src/components/layout/Sidebar.tsx`
29. `src/components/layout/OfflineBanner.tsx`
30. `src/components/layout/SyncStatusPanel.tsx`
31. `src/components/receipt/SaleReceipt.tsx`
32. `src/components/receipt/ReceiptPreviewPanel.tsx`
33. `src/components/SyncConflictModal.tsx`
34. `src/components/layout/AppShell.tsx`

## Dependencies
Packages used by these components (from `package.json`):
* `react`: ^18.2.0
* `react-dom`: ^18.2.0
* `react-router-dom`: ^7.14.2
* `remixicon`: ^4.9.1
* `lucide-react`: ^1.33.0
* `sonner`: ^2.0.7
* `tailwindcss`: ^3.4.19
* `postcss`: ^8.5.12
* `idb`: ^8.0.3

*(Note: There is no Framer Motion, Radix UI, clsx, tailwind-merge, or cva referenced in the package.json. Animations are achieved through Tailwind CSS transitions.)*

## Patterns to Know
1. **Drawer Open/Close**: Controlled entirely by a fixed position overlay with a backdrop. The open state is handled by the parent component (conditionally rendering the drawer). The close action is triggered when the user clicks the dark backdrop or the close button, which fires the `onClose` prop passed to the drawer.
2. **Settings Page Layout**: Uses a local React state (`tab`) to switch between sections. When a user clicks a section in the left navigation, the state updates, and the main content panel re-renders with the appropriate component for that tab. URL parameters aren't used for navigation inside settings, though it does check `location.state` for an initial tab.
3. **Sidebar Role Visibility**: The sidebar uses an array of configuration objects (`allNavItems`) defining links and their required roles. The user's role is extracted from the global `useApp` context. The links are then filtered based on the role and conditionally rendered. It handles collapsed and expanded states via a `sidebarCollapsed` context state which toggles Tailwind width classes (`w-16` vs `w-sidebar`), combined with CSS transitions.

## What to Change
When adapting these components into the admin dashboard:
* **Context Imports**: Update any `useApp()` hook imports to point to the admin project's context instead of the pharmacy `AppContext`.
* **Navigation Links**: Replace the `allNavItems` configuration array in `Sidebar.tsx` with admin-specific routes.
* **Prop Names**: Clean up component prop structures that refer to pharmacy-specific domain models (like `drugId` or `batchNumber`) and replace them with admin entities.
* **Data Fetching**: Replace internal API calls (e.g., `api.drugs.*` or `api.staff.*`) with admin-specific API endpoints in components like the Settings Page or Drawer.
* **Global States**: The `StaffActivityDrawer` fetches `transactions` directly from `useApp()`. This pattern needs to be refactored to fetch data specific to admin activity, or be passed in through props to decouple it from context.
