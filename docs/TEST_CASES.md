# Test Cases - Bread Kitchen Website

**Project:** Bread Kitchen Bakery Website
**Designer:** Jordan Asseff
**Developer:** Claude (AI Assistant)
**Date:** December 2024

---

## TC-001: Custom Date Input - Auto-Advance Functionality

**Description:** Verify that the date input automatically advances cursor from year to month to day when typing.

**Preconditions:** User is on the Courses page with the inquiry modal open.

**Test Steps:**
1. Click "Inquire" button on any course
2. Click on the preferred date input field
3. Type 4 digits for the year (e.g., "2025")
4. Observe cursor position
5. Type 2 digits for month (e.g., "06")
6. Observe cursor position
7. Type 2 digits for day (e.g., "15")

**Expected Result:** Cursor automatically jumps from year field to month field after 4 digits, then from month to day after 2 digits.

**Status:** PASS

**Tested By:** Jordan Asseff (Designer)

---

## TC-002: Custom Date Input - Backspace Navigation

**Description:** Verify that pressing backspace in an empty field navigates to the previous field.

**Preconditions:** User has entered a complete date in the inquiry modal.

**Test Steps:**
1. Enter a full date (e.g., 2025/06/15)
2. Clear the day field using backspace
3. With day field empty and cursor at position 0, press backspace again
4. Observe cursor moves to month field
5. Clear month field using backspace
6. With month field empty and cursor at position 0, press backspace again
7. Observe cursor moves to year field

**Expected Result:** Backspace in empty field (or at cursor position 0) navigates to previous field.

**Status:** PASS (after multiple iterations)

**Tested By:** Jordan Asseff (Designer)

**Notes:** Initial implementation had issues - required multiple debugging sessions to fix state timing issues.

---

## TC-003: Horizontal Scroll Prevention

**Description:** Verify no horizontal scrolling occurs on any page while maintaining sticky header.

**Preconditions:** Website loaded in browser.

**Test Steps:**
1. Navigate to Home page - check for horizontal scroll
2. Navigate to About page - check for horizontal scroll
3. Navigate to Courses page - check for horizontal scroll
4. Navigate to Contact page - check for horizontal scroll
5. On each page, scroll vertically and verify header remains sticky

**Expected Result:** No horizontal scroll bar appears on any page. Header remains fixed at top when scrolling.

**Status:** PASS

**Tested By:** Jordan Asseff (Designer)

**Notes:** Initial fix using `overflow-x: hidden` broke sticky header. Resolved by using `overflow-x: clip` instead.

---

## TC-004: Course Inquiry Modal - Form Display

**Description:** Verify inquiry modal opens with all required fields.

**Preconditions:** User is on the Courses page.

**Test Steps:**
1. Click "Inquire" button on any course card
2. Verify modal appears with overlay
3. Verify form contains: Name, Email, Course Selection, Preferred Date, Preferred Time, Number of Participants, Message
4. Verify close button (X) is visible
5. Click X or outside modal to close

**Expected Result:** Modal displays all fields correctly and can be closed.

**Status:** PASS

**Tested By:** Jordan Asseff (Designer)

---

## TC-005: Visual Styling - Critical CTA Areas

**Description:** Verify distinctive styling applied to Current Menu and Newsletter signup sections.

**Preconditions:** Website loaded in browser.

**Test Steps:**
1. Navigate to Home page
2. Scroll to "Current Menu" section
3. Verify sage/teal color palette with orb gradient
4. Scroll to "Weekly Fresh Bread" newsletter section
5. Verify coral/rose color palette with orb gradient
6. Navigate to Courses page
7. Verify same distinctive styling on equivalent sections

**Expected Result:** Critical CTA areas have distinctive, attention-grabbing styling that differs from standard sections.

**Status:** PASS

**Tested By:** Jordan Asseff (Designer)

---

## TC-006: About Page - Section Order and Images

**Description:** Verify Meet the Baker section appears first with correct image.

**Preconditions:** User navigates to About page.

**Test Steps:**
1. Navigate to About page
2. Verify "Meet the Baker" article appears before other content
3. Verify keiko.jpg is displayed for Meet the Baker section
4. Verify images have depth/edge effects applied

**Expected Result:** Meet the Baker section is first, uses keiko.jpg, and has proper styling effects.

**Status:** PASS

**Tested By:** Jordan Asseff (Designer)

---

## TC-007: Contact Page - Card Styling

**Description:** Verify depth and edge effects on Contact page cards.

**Preconditions:** User navigates to Contact page.

**Test Steps:**
1. Navigate to Contact page
2. Inspect the contact form card
3. Inspect the three info cards (location, phone, hours)
4. Verify all cards have box-shadow depth effects
5. Verify gradient borders (brighter top-left, subtle bottom-right)

**Expected Result:** All four cards display consistent depth and edge styling.

**Status:** PASS

**Tested By:** Jordan Asseff (Designer)

---

## TC-008: Masonry Gallery - Image Spacing

**Description:** Verify increased gap between masonry gallery images.

**Preconditions:** User views a page with masonry image gallery.

**Test Steps:**
1. Navigate to page with masonry gallery
2. Inspect gap between images
3. Verify gap is 16px (increased from original 6px)

**Expected Result:** Masonry images have 16px spacing between them.

**Status:** PASS

**Tested By:** Jordan Asseff (Designer)

---

## TC-009: Hero Section Styling - Orb Gradients

**Description:** Verify hero sections have orb gradients and faded edges.

**Preconditions:** Website loaded in browser.

**Test Steps:**
1. Navigate to Contact page
2. Verify "Contact Us" heading has subtle color orb behind it
3. Verify bottom edge fades into next section
4. Navigate to About page
5. Verify same styling on "About Us" hero
6. Scroll to "What We Believe" section
7. Verify orb gradient with faded top AND bottom edges

**Expected Result:** Hero sections display orb gradients with appropriate edge fading.

**Status:** PASS

**Tested By:** Jordan Asseff (Designer)

---

## TC-010: Date Input - Year Maximum Value

**Description:** Verify date input restricts year to maximum of 2040.

**Preconditions:** Inquiry modal is open on Courses page.

**Test Steps:**
1. Open inquiry modal
2. In date field, attempt to enter year "2050"
3. Verify field accepts input but form validation limits to 2040

**Expected Result:** Date input has max constraint of 2040-12-31.

**Status:** PASS

**Tested By:** Jordan Asseff (Designer)
