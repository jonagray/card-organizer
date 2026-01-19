# Next Session - Pending Tasks

This document tracks immediate fixes and modifications to implement in the next development session.

## Tasks to Complete

### 1. Change Color Scheme: Purple → Orange Gradient
**Priority: High**
**Estimated Time: 30-60 minutes**

- Replace purple gradient theme with orange gradient app-wide
- Update all gradient backgrounds, buttons, and accent colors
- Maintain visual consistency across all components
- Ensure sufficient contrast for accessibility

**Files to modify:**
- `frontend/styles.css` - Main stylesheet with gradient definitions
- Potentially `frontend/index.html` if inline styles exist

**Current purple theme locations to update:**
- Header gradient background
- Button hover states
- Card borders/accents
- Modal overlays
- Any other purple accent colors

---

### 2. Fix Mobile Zoom Bug (Add/Edit Card)
**Priority: High**
**Estimated Time: 1-2 hours**

**Issue:**
When adding a new card or editing an existing card on mobile devices, the page automatically zooms in, requiring users to manually zoom back out.

**Root Cause:**
Likely caused by:
- Input field focus causing viewport zoom
- Missing viewport meta tag constraints
- Input font-size below 16px (iOS auto-zoom trigger)

**Potential Fixes:**
1. Ensure input fields have `font-size: 16px` or larger
2. Add/verify viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">`
3. Use `touch-action` CSS property if needed
4. Test on actual mobile devices (iOS Safari, Android Chrome)

**Files to modify:**
- `frontend/index.html` - Viewport meta tag
- `frontend/styles.css` - Input field font sizes
- `frontend/app.js` - Modal/form display logic if needed

---

### 3. Slow Down Card Flip Animation
**Priority: Medium**
**Estimated Time: 15-30 minutes**

**Change:**
Make a slight adjustment to slow down the card flip transition for better visual experience.

**Current Implementation:**
- Likely using CSS transitions or animations
- Find current transition duration (probably 0.3s - 0.6s range)
- Increase by 10-20% for subtle slowdown

**Suggested Change:**
- If current is `0.4s`, try `0.5s` or `0.6s`
- Maintain easing function for smooth motion
- Test to ensure it doesn't feel sluggish

**Files to modify:**
- `frontend/styles.css` - Card flip transition/animation
- Possibly `frontend/app.js` if JavaScript-based animation

**CSS Classes to Check:**
- `.card-viewer`, `.card-page`, `.flip-transition` or similar

---

### 4. Darken Welcome Page Text
**Priority: High**
**Estimated Time: 15-30 minutes**

**Issue:**
The welcome/landing page text is too light and difficult to read.

**Fix:**
- Increase text color darkness for better readability
- Ensure WCAG AA contrast ratio compliance (4.5:1 for normal text, 3:1 for large text)
- Test against new orange gradient background
- May need to adjust text shadows or add background overlays for readability

**Files to modify:**
- `frontend/styles.css` - Welcome page text color
- `frontend/index.html` - If inline styles exist on welcome text

**Elements to check:**
- Hero/welcome heading text
- Subtitle/description text
- Any call-to-action text on landing page
- Login/signup form labels if they're part of welcome page

---

### 5. Remove Header Bar Text
**Priority: Medium**
**Estimated Time: 10-15 minutes**

**Change:**
Remove "Greeting card organizer" text from the header bar, leaving it blank/empty.

**Fix:**
- Locate header bar title/text element
- Either remove the text entirely or replace with empty string
- Ensure header bar maintains proper spacing/layout without text
- Consider if logo or other visual element should remain

**Files to modify:**
- `frontend/index.html` - Header bar text/title element
- `frontend/styles.css` - May need to adjust header spacing if text is removed

**Elements to check:**
- Header title/h1 element
- Header bar height/padding
- Any centered/aligned elements that depend on title text

---

### 6. Remove Login/Register Buttons from Landing Page Header
**Priority: High**
**Estimated Time: 15-20 minutes**

**Issue:**
Login and Register buttons appear twice when viewing the landing page - once in the header and once in the main content area. This is redundant and confusing.

**Fix:**
- Hide or remove Login/Register buttons from header when on the landing page
- Keep buttons in header for authenticated users (when logged in)
- Buttons should only appear in main content on landing page

**Implementation Options:**
- Add conditional display logic based on authentication state
- Use CSS to hide header buttons on landing page specifically
- Or add JavaScript to toggle visibility

**Files to modify:**
- `frontend/index.html` - Header button elements
- `frontend/app.js` - Add/modify authentication state logic
- `frontend/styles.css` - Conditional styling if needed

---

### 7. Fix Card Preview Image Cut-off in Mobile View
**Priority: High**
**Estimated Time: 1-1.5 hours**

**Issue:**
Card preview images get cut off in mobile view - users cannot see the entire image in the preview thumbnails.

**Fix:**
- All grid items should be the same size (uniform grid)
- Images should be scaled down to fit inside using `object-fit: contain`
- Cards maintain their flip orientation aspect ratio (vertical vs horizontal)
- Some cards may have whitespace around them to maintain aspect ratio

**Implementation Details:**
- Update card grid CSS for mobile breakpoints
- Change from `object-fit: cover` to `object-fit: contain`
- Ensure consistent grid item dimensions
- Add background color/styling for whitespace areas

**Files to modify:**
- `frontend/styles.css` - Card grid layout, mobile breakpoints, object-fit property
- Test with both horizontal and vertical flip orientation cards

**Testing:**
- Test with various card orientations
- Verify no images are cropped
- Ensure grid looks clean with consistent spacing

---

### 8. Implement Multiple People Tags for "To" and "From" Fields
**Priority: High**
**Estimated Time: 2-3 hours**

**Feature:**
Allow cards to be tagged with multiple recipients and/or multiple senders (e.g., a card sent to both "Adriana" and "Jonathan").

**Current Limitation:**
"To" and "From" fields only support a single person, making it difficult to organize cards sent to/from multiple people.

**Requirements:**
- Both "To" and "From" fields support multiple people as tags/chips
- Display all names in card preview (e.g., "To: Adriana, Jonathan")
- Hybrid dropdown/autocomplete similar to Task #9
- Type and press Enter or select from dropdown to add each person
- Remove tags/chips with click or backspace
- Search/filter should work with any person in the tag list

**Implementation:**
- Update Card schema to change `to` and `from` from String to Array
- Create tag/chip UI component for adding/removing people
- Implement autocomplete dropdown from existing people
- Update search/filter logic to search within arrays
- Update card display to show multiple names

**Database Migration Needed:**
- Convert existing single-value `to` and `from` fields to arrays
- Migration script to update existing cards: `to: "John"` → `to: ["John"]`

**Files to modify:**
- `backend/models/Card.js` - Schema change (String → [String])
- `backend/server.js` - Update endpoints, search/filter logic
- `frontend/app.js` - Tag input UI, autocomplete logic, form handling
- `frontend/styles.css` - Tag/chip styling
- `frontend/index.html` - Update form inputs if needed

**UI Component:**
- Similar to email recipient fields (Gmail, Outlook style)
- Show tags as removable chips
- Dropdown appears as you type
- Click dropdown item or press Enter to add

---

### 9. Implement Hybrid Dropdown/Autocomplete for All Form Fields
**Priority: High**
**Estimated Time: 3-4 hours**

**Feature:**
Add smart autocomplete dropdowns to all card form fields, suggesting previously used values while still allowing new custom entries.

**Problem Solved:**
Users currently have to remember exact formatting of previous entries (e.g., "Melissa" vs "Melissa Jones"). This leads to duplicate/inconsistent data.

**Fields to Update:**
- **From** - Suggest previously used sender names
- **To** - Suggest previously used recipient names
- **Occasion** - Suggest common occasions (Birthday, Christmas, Anniversary, etc.) + previously used custom occasions
- **Title** - Suggest previously used titles (optional - may not be useful)
- **Notes** - Keep as regular text field (too varied for autocomplete)

**Requirements:**
- Dropdown shows existing values from database
- Can still type new custom values not in dropdown
- Autocomplete filters as user types
- Works on both desktop and mobile
- Case-insensitive matching
- Shows all options by default, narrows as user types

**Implementation:**
- Create reusable autocomplete component
- Fetch unique values for each field from backend
- Add new endpoint: `GET /api/autocomplete/:field` (returns unique values)
- Update frontend forms to use autocomplete component
- Cache autocomplete data to reduce API calls
- Update values list when new card is added

**Occasion Field Specifics:**
- Hybrid mode: predefined + custom
- Predefined occasions: Birthday, Christmas, Anniversary, Wedding, Graduation, Thank You, etc.
- Show predefined first, then custom occasions alphabetically
- Allow users to add completely new occasions

**Files to modify:**
- `backend/server.js` - Add autocomplete endpoint
- `frontend/app.js` - Create autocomplete component, integrate with forms
- `frontend/styles.css` - Dropdown styling, mobile-responsive
- `frontend/index.html` - Update form inputs if needed

**UI/UX:**
- Dropdown appears on focus or typing
- Arrow keys to navigate dropdown
- Enter or click to select
- Escape to close dropdown
- Works with keyboard navigation for accessibility

**Performance:**
- Cache autocomplete results in memory (frontend)
- Refresh cache when new card added
- Debounce API calls if fetching on every keystroke

---

## Testing Checklist

After implementing fixes:

**Visual & UI:**
- [ ] Desktop browser testing (Chrome, Firefox, Safari)
- [ ] Mobile browser testing (iOS Safari, Android Chrome)
- [ ] Verify orange gradient displays correctly across all pages
- [ ] Verify welcome page text is readable against new orange background
- [ ] Verify card flip animation speed feels natural
- [ ] Check accessibility (contrast ratios, focus states)
- [ ] Test across different screen sizes

**Mobile-Specific:**
- [ ] Test add card form on mobile (no zoom issue)
- [ ] Test edit card form on mobile (no zoom issue)
- [ ] Verify card preview images show completely (no cut-off)
- [ ] Test autocomplete dropdowns on mobile devices

**Authentication & Navigation:**
- [ ] Verify Login/Register buttons only show in main content on landing page
- [ ] Verify header buttons display correctly when logged in
- [ ] Verify header bar looks good without "Greeting card organizer" text

**Data Entry & Autocomplete (Tasks 8 & 9):**
- [ ] Test adding multiple people to "To" field (tag/chip interface)
- [ ] Test adding multiple people to "From" field (tag/chip interface)
- [ ] Verify autocomplete works for From, To, Occasion fields
- [ ] Test typing new custom values not in dropdown
- [ ] Test dropdown keyboard navigation (arrow keys, Enter, Escape)
- [ ] Verify existing cards display multiple recipients/senders correctly
- [ ] Test search/filter with multi-person cards

**Database Migration:**
- [ ] Run migration script to convert existing cards (to/from String → Array)
- [ ] Verify existing cards still display correctly after migration
- [ ] Verify no data loss during migration

---

## Implementation Order Recommendation

Given the dependencies between tasks, suggested implementation order:

**Phase 1 - Visual Changes (1-2 hours):**
1. Task #1: Purple → Orange gradient
2. Task #4: Darken welcome text
3. Task #5: Remove header bar text
4. Task #3: Slow down card flip

**Phase 2 - Layout & Navigation (1-2 hours):**
5. Task #6: Remove duplicate login/register buttons
6. Task #2: Fix mobile zoom bug
7. Task #7: Fix card preview image cut-off

**Phase 3 - Data Model & Backend (1 hour):**
8. Task #8 (Part 1): Update database schema for multi-person tags
9. Create database migration script
10. Task #9 (Part 1): Add autocomplete API endpoint

**Phase 4 - Frontend Features (3-4 hours):**
11. Task #9 (Part 2): Build autocomplete component
12. Task #8 (Part 2): Build tag/chip component for multiple people
13. Integrate components with add/edit card forms

**Total Estimated Time: 9-12 hours**

---

## Notes

- All changes should maintain existing functionality
- Keep accessibility in mind (WCAG contrast ratios)
- Test on real mobile devices if possible
- Commit changes with clear, descriptive messages
- Tasks 8 & 9 require database schema changes - backup database before running migration
- Consider creating a migration script that can be run separately from the main deployment

**Session Branch:** TBD (will be created in next session)

**Last Updated:** 2026-01-19
