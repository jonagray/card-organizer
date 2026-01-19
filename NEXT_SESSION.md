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

### 5. [INCOMPLETE - TO BE SPECIFIED]

**Priority: TBD**
**Estimated Time: TBD**

- _Task description pending_

---

## Testing Checklist

After implementing fixes:

- [ ] Desktop browser testing (Chrome, Firefox, Safari)
- [ ] Mobile browser testing (iOS Safari, Android Chrome)
- [ ] Verify orange gradient displays correctly
- [ ] Test add card form on mobile (no zoom issue)
- [ ] Test edit card form on mobile (no zoom issue)
- [ ] Verify card flip animation speed feels natural
- [ ] Verify welcome page text is readable against new orange background
- [ ] Check accessibility (contrast ratios, focus states)
- [ ] Test across different screen sizes

---

## Notes

- All changes should maintain existing functionality
- Keep accessibility in mind (WCAG contrast ratios)
- Test on real mobile devices if possible
- Commit changes with clear, descriptive messages

**Session Branch:** TBD (will be created in next session)

**Last Updated:** 2026-01-19
