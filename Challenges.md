# Development Challenges and Solutions

This document outlines the major challenges faced during the development of the Patient Registration System and how they were addressed.

## 1. Multi-Tab Synchronization

### Challenge

Implementing real-time data synchronization across multiple browser tabs was crucial for maintaining data consistency, especially when:

- Multiple users access the application in different tabs
- Data is modified in one tab while another tab is viewing the same data
- Ensuring all tabs reflect the latest state of patient records

### Solution

Implemented a custom tab synchronization system:

```typescript
// TabSyncContext.tsx
export const TabSyncProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const broadcastEvent = (event: TabSyncEvent) => {
    // Broadcast to all tabs
    window.dispatchEvent(new CustomEvent("tabSync", { detail: event }));
  };

  // Listen for events from other tabs
  useEffect(() => {
    const handleTabSync = (event: CustomEvent) => {
      const { type } = event.detail;
      if (type === "PATIENT_ADDED" || type === "PATIENT_DELETED") {
        // Refresh data
        loadPatients();
      }
    };
    window.addEventListener("tabSync", handleTabSync as EventListener);
    return () =>
      window.removeEventListener("tabSync", handleTabSync as EventListener);
  }, []);
};
```

Key features:

- Custom event system for cross-tab communication
- Automatic data refresh when changes occur in any tab
- Connection state tracking between tabs
- Event-based synchronization for patient additions and deletions

## 2. Database Persistence

### Challenge

Maintaining patient data across page refreshes and browser sessions while using an in-browser database:

- Data loss prevention during page refreshes
- Handling database initialization and recovery
- Managing database worker lifecycle
- Ensuring data integrity

### Solution

Implemented a robust database management system using PGlite with IndexedDB:

```typescript
// db.ts
let dbInstance: PGliteWorker | null = null;
let isInitializing = false;

export const initDatabase = async (): Promise<PGliteWorker> => {
  if (isInitializing) {
    // Wait for initialization to complete
    while (isInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return dbInstance!;
  }

  if (!dbInstance) {
    isInitializing = true;
    try {
      const workerInstance = new Worker(
        new URL("/pglite-worker.js", import.meta.url),
        { type: "module" }
      );
      dbInstance = new PGliteWorker(workerInstance);
      await initSchema(dbInstance);
    } catch (error) {
      dbInstance = null;
      throw error;
    } finally {
      isInitializing = false;
    }
  }
  return dbInstance;
};
```

Key features:

- Singleton pattern for database instance management
- IndexedDB storage for persistent data
- Robust error handling and recovery
- Schema initialization and versioning
- Worker-based database operations

## 3. Bundle Size Optimization

### Challenge

During development, I encountered a significant bundle size issue with PGlite:

- Initial bundle size was too large, affecting application load time
- PGlite worker was being included in the main bundle
- Development builds were slow due to large dependency tree
- Production builds were exceeding optimal size limits

### Solution

Optimized the bundle size by configuring Vite to handle PGlite dependencies correctly:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Exclude PGlite from dependency optimization
    exclude: ["@electric-sql/pglite"],
  },
  worker: {
    // Ensure proper worker bundling
    format: "es",
  },
});
```

Key features of the solution:

- Excluded PGlite from Vite's dependency optimization
- Properly configured worker bundling
- Separated worker code from main bundle
- Improved build and development performance

Impact:

- Reduced main bundle size significantly
- Faster development builds
- Improved application load time
- Better development experience with hot module replacement

## Lessons Learned

1. **Browser Storage**: Using IndexedDB through PGlite provided a reliable solution for persistent storage, but required careful management of database initialization and worker lifecycle.

2. **Cross-Tab Communication**: The custom event system proved effective for synchronizing data across tabs, though it required careful consideration of event handling and cleanup.

These challenges and their solutions have resulted in a robust, user-friendly application that maintains data consistency across browser sessions and multiple tabs while providing a safe and efficient way to manage patient records.
