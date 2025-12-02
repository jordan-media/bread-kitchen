# Issue Log - Bread Kitchen Website

**Project:** Bread Kitchen Bakery Website
**Designer:** Jordan Asseff
**Developer:** Claude (AI Assistant)
**Date:** December 2024

---

## Issue #001: Backspace Navigation Not Working (Month to Year)

**Reported By:** Jordan Asseff (Designer)
**Assigned To:** Claude (Developer)
**Priority:** High
**Status:** RESOLVED

**Description:**
When pressing backspace in the month field after clearing it, the cursor does not automatically jump back to the year field.

**Steps to Reproduce:**
1. Open course inquiry modal
2. Enter a complete date
3. Clear day field, backspace jumps to month (works)
4. Clear month field, backspace does NOT jump to year (broken)

**Root Cause:**
Initial implementation checked React state value which was stale due to async state updates. The `handleDateKeyDown` function was checking `inquiryData[field]` instead of `e.target.value`.

**Resolution:**
Changed implementation to check `e.target.value` directly and also verify cursor position is at 0:

```javascript
const handleDateKeyDown = (e, field, prevRef) => {
    const inputValue = e.target.value;
    const selectionStart = e.target.selectionStart;
    if (e.key === 'Backspace' && prevRef?.current) {
        if (inputValue === '' || selectionStart === 0) {
            e.preventDefault();
            isBackspaceNav.current = true;
            prevRef.current.focus();
        }
    }
};
```

**Date Resolved:** December 2024

---

## Issue #002: Horizontal Scroll Breaking Sticky Header

**Reported By:** Jordan Asseff (Designer)
**Assigned To:** Claude (Developer)
**Priority:** High
**Status:** RESOLVED

**Description:**
After implementing `overflow-x: hidden` to prevent horizontal scrolling, the sticky header stopped working.

**Steps to Reproduce:**
1. Apply `overflow-x: hidden` to html element
2. Scroll down on any page
3. Header no longer stays fixed at top

**Root Cause:**
`overflow-x: hidden` creates a new scroll container, which breaks `position: sticky` behavior.

**Resolution:**
Changed from `overflow-x: hidden` to `overflow-x: clip` in index.css:

```css
html {
    overflow-x: clip;
}
```

The `clip` value prevents horizontal overflow without creating a new scroll container.

**Date Resolved:** December 2024

---

## Issue #003: Cannot Click on Year Field When Filled

**Reported By:** Jordan Asseff (Designer)
**Assigned To:** Claude (Developer)
**Priority:** Medium
**Status:** RESOLVED

**Description:**
When the year field is filled and user tries to click directly on it to edit, the auto-placement logic redirects focus to the first empty field.

**Steps to Reproduce:**
1. Enter year "2025" in date input
2. Try to click directly on year field to edit it
3. Focus jumps to month field instead

**Root Cause:**
The `handleDateFocus` function always redirected to the first incomplete field, even when user was navigating backwards via backspace.

**Resolution:**
Added `isBackspaceNav` ref to track when navigation is from backspace, bypassing auto-placement:

```javascript
const isBackspaceNav = useRef(false);

const handleDateFocus = (e, currentField) => {
    if (isBackspaceNav.current) {
        isBackspaceNav.current = false;
        return; // Skip auto-placement for backspace navigation
    }
    // ... rest of auto-placement logic
};
```

**Date Resolved:** December 2024

---

## Issue #004: Date Input Visual Styling Inconsistency

**Reported By:** Jordan Asseff (Designer)
**Assigned To:** Claude (Developer)
**Priority:** Medium
**Status:** RESOLVED

**Description:**
Designer requested native date input look but with custom auto-advance mechanics. Initial custom implementation looked different from native inputs.

**Steps to Reproduce:**
1. View original native date input styling
2. Compare to custom three-field implementation
3. Note visual differences

**Resolution:**
Styled the custom date input container to match the form's existing input styling:
- Matching border color (#CFD8B3)
- Matching background color (#FEFBE3)
- Matching border-radius (6px)
- Matching padding (12px 14px)
- Transparent backgrounds on individual segment inputs

**Date Resolved:** December 2024

---

## Issue #005: Small Boxes Around Date Segments

**Reported By:** Jordan Asseff (Designer)
**Assigned To:** Claude (Developer)
**Priority:** Low
**Status:** RESOLVED

**Description:**
Individual year/month/day input fields had visible borders creating a "boxed" appearance.

**Steps to Reproduce:**
1. Open inquiry modal
2. View date input field
3. Notice individual boxes around YYYY, MM, DD segments

**Resolution:**
Added CSS to remove borders from segment inputs:

```css
.date-segment {
    border: none !important;
    background: transparent !important;
}
```

**Date Resolved:** December 2024

---

## Summary

| Issue # | Description | Priority | Status |
|---------|-------------|----------|--------|
| #001 | Backspace navigation month to year | High | Resolved |
| #002 | Horizontal scroll breaking sticky header | High | Resolved |
| #003 | Cannot click on year field when filled | Medium | Resolved |
| #004 | Date input visual styling | Medium | Resolved |
| #005 | Small boxes around date segments | Low | Resolved |

**Total Issues:** 5
**Resolved:** 5
**Open:** 0
