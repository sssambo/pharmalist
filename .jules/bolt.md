## 2024-07-04 - Backend I/O Bottleneck
**Learning:** Using synchronous `fs.readFileSync` and `fs.writeFileSync` in request handlers (like `/api/raw-medicines` and `/api/raw-medicines/validate`) blocks the Node.js event loop. In a production environment with concurrent requests, this drastically reduces throughput, as all other requests must wait for the file I/O to complete before they can be processed.
**Action:** Replaced synchronous I/O with `fs.promises.readFile` and `fs.promises.writeFile` to ensure the event loop remains unblocked and the server can handle concurrent requests efficiently.

## 2024-07-04 - Unbounded File Upload Vulnerability
**Learning:** Initializing `multer` with `memoryStorage()` without a `fileSize` limit allows an attacker or a faulty client to upload arbitrarily large files, causing the Node.js server to run out of memory and crash (DoS).
**Action:** Added a `limits: { fileSize: 5 * 1024 * 1024 }` (5MB) boundary to the `multer` configuration to prevent memory exhaustion.

## 2024-07-04 - Heavy Mongoose Queries
**Learning:** Default Mongoose queries (e.g., `ValidName.find()`) return heavy Mongoose Document objects with many internal methods and state tracking mechanisms. This causes significant CPU and memory overhead during data serialization, especially for read-only arrays.
**Action:** Used `.lean()` on read-only queries (like fetching lists) to return plain JavaScript objects. Mapped the `_id` field to `id` manually because `.lean()` bypasses the `toJSON` schema transform.

## 2024-07-04 - React Unnecessary Derivation Overhead
**Learning:** React re-runs the entire component function on every render (e.g., when a modal opens/closes, state updates, or props change). Deriving complex state, like grouping two large arrays via loops and object/Set allocations, directly in the component body creates a massive, unnecessary performance bottleneck and triggers excess garbage collection.
**Action:** Wrapped expensive derivations in `useMemo` hooks (e.g., `unvalidatedByName` grouping, and search `filtered` arrays) so they are only recalculated when their specific dependencies (`rawMedicines`, `validNames`, `search`) change. Lifted repetitive string manipulations (like `search.toLowerCase()`) outside of loops inside the memo.
