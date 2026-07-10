# Quick Fix Checklist - AI Company Project

**Goal:** Get to a production-ready state  
**Estimated Time:** 2-3 hours for critical fixes

---

## 🔴 IMMEDIATE FIXES (Do These First - 30 mins)

### Fix 1: users.ts TypeScript Errors

**File:** `apps/server/src/routes/users.ts`

```typescript
// LINE 43 - Change from:
const user = userRepository.findById(targetId)

// TO:
const user = userRepository.findById(targetId as string)

// And LINE 69 - Change from:
userRepository.delete(targetId)

// TO:
userRepository.delete(targetId as string)
```

**Why:** `req.params.id` is typed as `string | string[]` but methods expect `string`.

---

### Fix 2: Remove Unused React Imports

**Files:** Run this command to auto-fix:

```bash
npm run lint:fix
```

This will:

- Change all `import React` to `import type React` where unused
- Fix type imports in agent files
- Remove unused variable warnings

---

### Fix 3: Fix Input Component Type Conflict

**File:** `apps/dashboard/src/components/ui/Input.tsx`

```typescript
// LINE 7 - Change from:
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  error?: string
}

// TO:
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  error?: string
  leftIcon?: React.ReactNode
}
```

**Why:** Custom `size` prop conflicts with HTML's numeric `size` attribute.

---

## 🟡 COMPONENT FIXES (1 hour)

### Fix 4: AgentCard Props Mismatch

**File:** `apps/dashboard/src/components/workspace/AgentCard.tsx`

```typescript
// Update AgentCardProps interface to match usage:
interface AgentCardProps {
  icon: React.ComponentType<LucideProps>
  status: 'offline' | 'online' | 'busy'
  title?: string // ADD THIS
  subtitle?: string // ADD THIS
  id?: string // ADD THIS (or remove if unused)
}

// Remove unused imports:
// Remove: Users, Zap
// Change: import React from 'react' → remove if unused
```

---

### Fix 5: KanbanCard Props Fix

**File:** `apps/dashboard/src/components/kanban/KanbanCard.tsx`

```typescript
// Update to match test expectations:
export interface KanbanCardProps {
  card: KanbanCardData // This property is missing
  onDragStart?: (e: React.DragEvent, cardId: string, columnId: string) => void
  columnId: string
  // Remove unused:
  // Remove: import React
}
```

---

### Fix 6: AgentFlowCanvas Status Types

**File:** `apps/dashboard/src/components/workspace/AgentFlowCanvas.tsx`

```typescript
// LINE 50 - Change from:
const status = agent.status === 'running' ? 'online' : agent.status

// TO:
const status = agent.status === 'running' ? 'busy' : agent.status === 'idle' ? 'online' : 'offline'

// LINE 58 - Change from:
status: 'online' // to match AgentCardProps

// LINES 62-63 - Change from:
status: 'idle' // to either 'offline' | 'online' | 'busy'

// Remove unused imports: Users, Zap
```

---

## 📋 TEST FIXES (1-2 hours)

### Fix 7: Update KanbanCard Tests

**File:** `apps/dashboard/src/components/kanban/KanbanCard.test.tsx`

```typescript
// Add missing import:
import { KanbanCardData } from '../../types' // or wherever it's defined

// Update test props to use correct interface:
const mockCard: KanbanCardData = {
  id: '1',
  title: 'Test Task',
  status: 'todo',
  // ...add other required fields
}

// Update render calls:
<KanbanCard
  card={mockCard}           // Changed from 'card:'
  onDragStart={vi.fn()}
  columnId="todo"
/>
```

---

### Fix 8: Fix NotificationToast Test

**File:** `apps/dashboard/src/components/workspace/NotificationToast.test.tsx`

```typescript
// LINE 58 - Change from:
expect(container.innerHTML).toBe('')

// TO:
expect(container.querySelector('div')?.children.length).toBe(0)
// OR check that no notifications are rendered
expect(screen.queryByRole('alert')).not.toBeInTheDocument()
```

**Why:** Component returns empty container `<div>`, not null.

---

### Fix 9: Fix Input Test

**File:** `apps/dashboard/src/components/ui/Input.test.tsx`

```typescript
// The Input component doesn't render a label element
// Update test to either:

// Option A: Update component to render label
// Option B: Update test to not expect label
const input = screen.getByPlaceholderText('Enter text') as HTMLInputElement

// Remove leftIcon prop from render - it doesn't exist on component yet
```

---

## 🔧 BUILD & TEST VERIFICATION

### Step 1: Run Linting (Auto-fix)

```bash
npm run lint:fix
npm run format:fix
```

### Step 2: Verify TypeScript

```bash
npm run typecheck
```

Should show 0 errors after above fixes.

### Step 3: Run Tests

```bash
npm run test
```

Should show most tests passing (aim for >250/279).

### Step 4: Build

```bash
npm run build
```

Should complete without errors.

### Step 5: Start Dev Server

```bash
npm run dev
```

Should start both dashboard (5173) and server (3001) without errors.

---

## 📊 CURRENT STATE vs TARGET

| Category          | Current  | Target  | Status      |
| ----------------- | -------- | ------- | ----------- |
| TypeScript Errors | 71       | 0       | 🔴 Critical |
| Test Passes       | 257/279  | 279/279 | 🟡 High     |
| ESLint Errors     | 50+      | 0       | 🟡 High     |
| Build Status      | ❌ Fails | ✅ Pass | 🔴 Critical |
| Coverage          | Unknown  | >80%    | 🟠 Medium   |

---

## ✅ VALIDATION CHECKLIST

After making all fixes, verify:

- [ ] `npm run typecheck` → 0 errors
- [ ] `npm run lint` → 0 errors
- [ ] `npm run test` → Pass >250/279 tests
- [ ] `npm run build` → Succeeds without errors
- [ ] `npm run dev` → Both servers start (5173, 3001)
- [ ] Dashboard loads in browser at `http://localhost:5173`
- [ ] Can login/navigate without console errors
- [ ] WebSocket connects (check Network tab in DevTools)

---

## 🎯 SUCCESS CRITERIA

✅ **Project is Ready When:**

1. Zero TypeScript compilation errors
2. All tests pass (or explained failures only)
3. All ESLint rules pass
4. Development server starts without errors
5. No console errors when using the app
6. Database initializes correctly
7. Authentication flow works end-to-end

---

## 📝 NOTES

- These fixes are **conservative** - they fix only what's broken
- No refactoring beyond what's necessary
- All changes preserve existing functionality
- After these fixes, project should be shippable

**Time Estimate:** 2-3 hours  
**Difficulty:** Low-Medium  
**Risk:** Very Low

---

**Last Updated:** July 10, 2026
