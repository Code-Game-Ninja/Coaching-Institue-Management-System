# UI/UX Design Specification
# Coaching Institute Data Management System (CIDMS)

> **Version:** 1.0.0  
> **Date:** March 6, 2026  
> **Author:** Frontend Specialist Agent  
> **Stack:** React 18 + Tailwind CSS v3  

---

## 📑 Table of Contents

1. [Design Principles](#1-design-principles)
2. [Design System (Tokens)](#2-design-system-tokens)
3. [Typography Scale](#3-typography-scale)
4. [Component Library](#4-component-library)
5. [Layout Specification](#5-layout-specification)
6. [Page Wireframes](#6-page-wireframes)
7. [Color & Status Logic](#7-color--status-logic)
8. [Responsive Breakpoints](#8-responsive-breakpoints)
9. [Interaction Patterns](#9-interaction-patterns)
10. [Accessibility Requirements](#10-accessibility-requirements)

---

## 1. Design Principles

| Principle | Application |
|-----------|------------|
| **Data Dense but Scannable** | Tables with clearly separated rows, bold key metrics |
| **Action-Oriented** | Primary action always visible per page (Add Student, Record Payment) |
| **Status at a Glance** | Color-coded badges for fee status, student status, batch status |
| **Zero Learning Curve** | Standard admin dashboard patterns (sidebar + topbar + content) |
| **Mobile-Aware** | Full functionality on tablet (1024px+), optimized for desktop (1280px+) |
| **Fast Feedback** | Loading spinners on all async operations, toasts for success/error |

---

## 2. Design System (Tokens)

### Color Palette

#### Primary Brand Colors (Blue)
```css
--color-primary-50:  #eff6ff;   /* Light background */
--color-primary-100: #dbeafe;   /* Hover state */
--color-primary-500: #3b82f6;   /* Primary buttons, links */
--color-primary-600: #2563eb;   /* Button hover */
--color-primary-700: #1d4ed8;   /* Active state */
--color-primary-900: #1e3a8a;   /* Sidebar background */
```

#### Semantic Colors
```css
/* Success */
--color-success-light: #dcfce7;  /* bg-green-100 */
--color-success:       #16a34a;  /* text-green-600 */

/* Warning */
--color-warning-light: #fef9c3;  /* bg-yellow-100 */
--color-warning:       #ca8a04;  /* text-yellow-600 */

/* Error/Danger */
--color-danger-light:  #fee2e2;  /* bg-red-100 */
--color-danger:        #dc2626;  /* text-red-600 */

/* Info */
--color-info-light:    #dbeafe;  /* bg-blue-100 */
--color-info:          #2563eb;  /* text-blue-600 */
```

#### Neutral Colors (Gray)
```css
--color-gray-50:  #f9fafb;  /* Page background */
--color-gray-100: #f3f4f6;  /* Card backgrounds */
--color-gray-200: #e5e7eb;  /* Borders, dividers */
--color-gray-400: #9ca3af;  /* Placeholder text */
--color-gray-600: #4b5563;  /* Secondary text */
--color-gray-800: #1f2937;  /* Primary text */
--color-gray-900: #111827;  /* Headings */
```

### Tailwind Config Extension

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};
```

---

## 3. Typography Scale

| Name | Tailwind Class | Size | Weight | Usage |
|------|---------------|------|--------|-------|
| Display | `text-3xl font-bold` | 30px | 700 | Page titles |
| Heading 1 | `text-2xl font-semibold` | 24px | 600 | Section headers |
| Heading 2 | `text-xl font-semibold` | 20px | 600 | Card titles |
| Heading 3 | `text-lg font-medium` | 18px | 500 | Subsections |
| Body | `text-sm` | 14px | 400 | Table cells, body text |
| Caption | `text-xs` | 12px | 400 | Labels, metadata |
| Stat | `text-4xl font-bold` | 36px | 700 | Dashboard stat numbers |

**Font:** Inter (loaded via Google Fonts or system font stack)

---

## 4. Component Library

### StatCard

Used on dashboard for key metrics.

```
┌─────────────────────────────────┐
│  [Icon]     Total Students      │
│                                 │
│     247                ↑ 12%    │
│   students          this month  │
└─────────────────────────────────┘
```

```jsx
// Props: title, value, icon, trend, trendDirection ('up'|'down'), color
<StatCard
  title="Total Students"
  value="247"
  icon={<UsersIcon />}
  trend="+12 this month"
  trendDirection="up"
  color="blue"
/>
```

---

### Badge

Color-coded status indicator.

```jsx
// Status variants
<Badge variant="success">Cleared</Badge>   // green
<Badge variant="warning">Pending</Badge>   // yellow
<Badge variant="danger">Overdue</Badge>    // red
<Badge variant="info">Active</Badge>       // blue
<Badge variant="gray">Inactive</Badge>     // gray
```

---

### Table

Reusable table with sorting headers, pagination, and empty state.

```
┌─────┬─────────────┬──────────┬──────────┬────────────┬─────────┐
│ #   │ Name        │ Phone    │ Course   │ Fee Status │ Actions │
├─────┼─────────────┼──────────┼──────────┼────────────┼─────────┤
│ 1   │ Rahul Sharma│ 9876...  │ JEE Mains│ [Pending]  │ ✏️ 🗑️   │
│ 2   │ Priya Singh │ 9123...  │ NEET     │ [Cleared]  │ ✏️ 🗑️   │
└─────┴─────────────┴──────────┴──────────┴────────────┴─────────┘
                           ← 1 2 3 ... 13 →
```

---

### Modal

Used for Add/Edit forms.

```
┌──────────────────────────────────────────┐
│  Add New Student                    [×]  │
│──────────────────────────────────────────│
│  Name *          [_____________________] │
│  Phone *         [_____________________] │
│  Email           [_____________________] │
│  Course *        [▼ Select Course     ] │
│  Batch *         [▼ Select Batch      ] │
│  Total Fees *    [_____________________] │
│  Admission Date  [_____________________] │
│                                          │
│            [Cancel]  [Add Student]       │
└──────────────────────────────────────────┘
```

Modal behavior:
- Closes on `Escape` key press
- Closes on backdrop click (with unsaved-changes guard)
- Focus trapped inside when open
- Scroll locked on body

---

### Toast Notification

```
┌────────────────────────────────────┐
│ ✅  Student added successfully     │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ ❌  Failed to record payment       │
└────────────────────────────────────┘
```

- Position: top-right
- Auto-dismiss: 4 seconds
- Manual dismiss: click X

---

### SearchBar + Filters

```
[🔍 Search by name or phone...  ]  [Course ▼]  [Batch ▼]  [Fee Status ▼]  [Clear Filters]
```

---

### LoadingSpinner

```jsx
// Full page loader (initial load)
<div className="flex items-center justify-center h-screen">
  <Spinner size="lg" />
</div>

// Table row loader (data fetching)
<TableSkeleton rows={10} />

// Button loader (form submit)
<Button isLoading>Saving...</Button>
```

---

## 5. Layout Specification

### Dashboard Shell

```
┌─────────────────────────────────────────────────────────────────┐
│                         TOP BAR                                 │
│  [≡ Menu]  CIDMS                          [👤 Admin] [Logout]   │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                  │
│   SIDEBAR    │           MAIN CONTENT AREA                      │
│   (240px)    │           (flex-1, overflow-y-auto)              │
│              │                                                  │
│ 📊 Dashboard │                                                  │
│ 👥 Students  │                                                  │
│ 📚 Courses   │                                                  │
│ 🗂️ Batches   │                                                  │
│ 💰 Payments  │                                                  │
│ 📊 Reports   │                                                  │
│              │                                                  │
│              │                                                  │
│   [Logout]   │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

**Sidebar specs:**
- Width: 240px (desktop), collapses to 0px on mobile (slide-in overlay)
- Background: `bg-primary-900` (dark blue `#1e3a8a`)
- Active link: `bg-primary-700` with left border accent
- Logo area: 64px height
- Bottom: Logout button pinned

**Top bar specs:**
- Height: 64px
- Background: `bg-white border-b border-gray-200`
- Left: Hamburger menu (mobile) + App name
- Right: Admin name + avatar + Logout

**Main content area:**
- Background: `bg-gray-50`
- Padding: `p-6` (24px)
- Max width: `max-w-7xl mx-auto`

---

## 6. Page Wireframes

### 6.1 Login Page

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    bg-gradient-to-br                            │
│                  from-primary-900 to-primary-700               │
│                                                                 │
│              ┌─────────────────────────────────┐               │
│              │                                 │               │
│              │    🏫  CIDMS                    │               │
│              │    Coaching Institute System    │               │
│              │                                 │               │
│              │    Admin Login                  │               │
│              │                                 │               │
│              │    Email                        │               │
│              │    [_________________________]  │               │
│              │                                 │               │
│              │    Password                     │               │
│              │    [_________________________]  │               │
│              │                                 │               │
│              │    [      Sign In           ]   │               │
│              │                                 │               │
│              └─────────────────────────────────┘               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 6.2 Dashboard Page

```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard          Good morning, Admin  |  Today: Mar 2026 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────┐ │
│  │ 👥 247     │  │ 📚 8       │  │ 💰 ₹12.4L  │  │⏳ ₹3.2L│ │
│  │ Students   │  │ Courses    │  │ Revenue    │  │Pending│ │
│  └────────────┘  └────────────┘  └────────────┘  └───────┘ │
│                                                             │
│  ┌─────────────────────────────┐  ┌────────────────────────┐│
│  │  Recent Registrations       │  │  Recent Payments        ││
│  │  ────────────────────────── │  │  ────────────────────── ││
│  │  Rahul S.   JEE   Mar 1     │  │  Priya S.  ₹5000  UPI  ││
│  │  Priya S.   NEET  Feb 28    │  │  Rahul S.  ₹3000  Cash ││
│  │  Arjun K.   JEE   Feb 27    │  │  Arjun K.  ₹8000  UPI  ││
│  │             [View all →]    │  │          [View all →]   ││
│  └─────────────────────────────┘  └────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

### 6.3 Students Page

```
┌─────────────────────────────────────────────────────────────┐
│  Students                              [+ Add Student]      │
├─────────────────────────────────────────────────────────────┤
│  [🔍 Search...]  [Course ▼]  [Batch ▼]  [Fee Status ▼]     │
├─────┬────────────────┬──────────┬──────────┬────────┬───────┤
│  #  │ Name           │ Phone    │ Course   │ Status │ Action│
├─────┼────────────────┼──────────┼──────────┼────────┼───────┤
│  1  │ Rahul Sharma   │ 9876...  │ JEE      │[Pending]│ 👁️✏️🗑│
│  2  │ Priya Singh    │ 9123...  │ NEET     │[Cleared]│ 👁️✏️🗑│
├─────┴────────────────┴──────────┴──────────┴────────┴───────┤
│  Showing 1–20 of 247              [← 1  2  3 ... 13 →]     │
└─────────────────────────────────────────────────────────────┘
```

---

### 6.4 Student Profile Page

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Students   Rahul Sharma    [Edit] [Delete]       │
├────────────────────────────┬────────────────────────────────┤
│                            │                                │
│  [Photo]                   │  COURSE: JEE Mains             │
│  Rahul Sharma              │  BATCH: Morning Batch A        │
│  📞 9876543210             │  TEACHER: Mr. Ramesh           │
│  ✉️  rahul@example.com     │  TIMING: 9:00–11:00 AM         │
│  📍 123 Main St, Delhi     │                                │
│                            │  Admission: 01 Jan 2026        │
│  ┌────────────────────┐    │                                │
│  │ FEES SUMMARY       │    │                                │
│  │ Total:   ₹15,000   │    │                                │
│  │ Paid:    ₹10,000   │    │                                │
│  │ Remaining: ₹5,000  │    │                                │
│  │ [Pending] badge    │    │                                │
│  │ [Record Payment]   │    │                                │
│  └────────────────────┘    │                                │
├────────────────────────────┴────────────────────────────────┤
│  Payment History                                            │
├──────┬──────────┬──────────────┬─────────────┬─────────────┤
│ #    │ Date     │ Amount       │ Mode        │ Notes       │
├──────┼──────────┼──────────────┼─────────────┼─────────────┤
│ 1    │ 15 Jan   │ ₹5,000       │ Cash        │ 1st install │
│ 2    │ 10 Feb   │ ₹5,000       │ UPI         │ 2nd install │
└──────┴──────────┴──────────────┴─────────────┴─────────────┘
```

---

### 6.5 Fees Management Page

```
┌─────────────────────────────────────────────────────────────┐
│  Fee Management                    [+ Record Payment]       │
├────────────────────────────────────┬────────────────────────┤
│  PENDING FEES                      │  PAYMENT HISTORY       │
├────────────────────────────────────┴────────────────────────┤
│  Total Pending: ₹3,28,500                                   │
│  [Course ▼]  [Batch ▼]                                      │
├──────┬─────────────┬──────────┬──────────┬──────────────────┤
│ Name │ Course      │ Batch    │ Total ₹  │ Remaining ₹      │
├──────┼─────────────┼──────────┼──────────┼──────────────────┤
│ Rahul│ JEE Mains   │ Morn. A  │ 15,000   │ 5,000  [Pay]     │
│ Arjun│ NEET Prep   │ Eve. B   │ 35,000   │ 20,000 [Pay]     │
└──────┴─────────────┴──────────┴──────────┴──────────────────┘
```

---

## 7. Color & Status Logic

### Student Status Badges

| Status | Background | Text | When |
|--------|-----------|------|------|
| `active` | `bg-green-100` | `text-green-700` | Currently enrolled |
| `inactive` | `bg-gray-100` | `text-gray-600` | Temporarily off |
| `completed` | `bg-blue-100` | `text-blue-700` | Course completed |

### Fee Status Badges

| Status | Background | Text | Condition |
|--------|-----------|------|-----------|
| `cleared` | `bg-green-100` | `text-green-700` | feesPaid >= totalFees |
| `pending` | `bg-yellow-100` | `text-yellow-700` | 0 < feesPaid < totalFees |
| `not paid` | `bg-red-100` | `text-red-700` | feesPaid === 0 |

### Payment Mode Icons

| Mode | Icon | Color |
|------|------|-------|
| Cash | 💵 | `text-green-600` |
| UPI | 📱 | `text-blue-600` |
| Bank Transfer | 🏦 | `text-purple-600` |

---

## 8. Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | < 768px | Sidebar hidden (hamburger), single column |
| Tablet | 768px – 1024px | Sidebar collapsible, tables scroll horizontally |
| Desktop | 1024px – 1280px | Full sidebar, 2-col dashboard |
| Wide | > 1280px | Full layout, max-w-7xl content |

### Sidebar Behavior

| Screen | Behavior |
|--------|---------|
| Desktop (≥1024px) | Always visible, fixed left |
| Tablet (768–1024px) | Collapsible toggle |
| Mobile (<768px) | Hidden by default, overlay when opened |

---

## 9. Interaction Patterns

### Add/Edit Entity Flow

```
1. Click "Add Student" button
2. Modal opens with empty form (or pre-filled for edit)
3. Admin fills form — inline validation on blur
4. Submit → Button shows loading state + disabled
5. API call made
6. Success → Modal closes + Table refreshes + Success toast
7. Error → Modal stays open + Error message shown in form
```

### Delete Confirmation Flow

```
1. Admin clicks 🗑️ Delete
2. Confirmation dialog: "Are you sure? This action cannot be undone."
3. [Cancel] or [Delete] button
4. On Delete → API call → Loading state → Success toast + Row removed
```

### Search Flow

```
1. Admin types in search box — 300ms debounce
2. API called with search param
3. Table updates with filtered results
4. "No results found" empty state shown if 0 results
5. Clear search restores full list
```

### Form Validation UX

```
- Required fields marked with red asterisk *
- Validation triggered on:
  - Field blur (for immediate feedback)
  - Form submit (catch all)
- Error message shown below field in red: text-red-500 text-xs
- Success indicator: border turns green on valid input
```

---

## 10. Accessibility Requirements

| Requirement | Implementation |
|------------|---------------|
| **Color contrast** | All text meets WCAG AA (4.5:1 minimum) |
| **Keyboard navigation** | All interactive elements focusable via Tab |
| **Modal focus trap** | Focus locked inside modal on open |
| **Form labels** | All inputs have associated `<label>` |
| **Error announcements** | `role="alert"` on error messages |
| **Loading state** | `aria-busy="true"` on loading containers |
| **Button descriptions** | `aria-label` on icon-only buttons |
| **Table headers** | `<th scope="col">` on all column headers |

---

*Next: See [PROJECT-PLAN.md](./PROJECT-PLAN.md) for development phases and task breakdown.*
