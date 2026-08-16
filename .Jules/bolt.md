## 2026-01-23 - Initial Performance Audit
**Learning:** Found that `AnimatedGrid.tsx` uses React state to track mouse position, causing frequent re-renders of the component tree on every mouse move. Framer Motion's `useMotionValue` is a much more efficient way to handle this as it bypasses React's render cycle.
**Action:** Replace `useState` with `useMotionValue` in `AnimatedGrid.tsx`.
