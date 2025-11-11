# Card Organizer - Future Roadmap

This document outlines planned features and improvements for future development sessions.

## Planned Features

### 1. Text Recognition (OCR)
**Priority: High**
- Implement AWS Textract for automatic text extraction from card images
- Extract text from both printed and handwritten messages
- Store extracted text in database for searchability
- Add manual text correction/editing interface
- Enable full-text search across all cards
- Display confidence scores for extracted text

**Benefits:**
- Search cards by message content
- Find cards from specific people by handwriting
- Create searchable archive of card messages

---

### 2. Email Verification & Password Reset
**Priority: High**
- Add email verification during signup process
- Implement "forgot password" functionality via email
- Send verification tokens via email service (SendGrid, AWS SES, or similar)
- Add email confirmation before account activation
- Secure password reset flow with time-limited tokens

**Benefits:**
- Improved account security
- Prevent fake/spam accounts
- Allow users to recover forgotten passwords

---

### 3. User Profile Management
**Priority: High**
- Add profile editing page
- Allow users to update:
  - Display name
  - Email address (with re-verification)
  - Password change functionality
  - Profile preferences (default sort, view mode, etc.)
- Add profile avatar/photo option
- Account deletion capability

**Benefits:**
- Users can maintain their own information
- Better user control and privacy

---

## Additional Recommended Features

### 4. Card Sharing & Collaboration
**Priority: Medium**
- Share specific cards with other users (family members, friends)
- Create shared collections (e.g., "Family Christmas Cards")
- View-only vs. edit permissions
- Invite family members to contribute cards

**Benefits:**
- Families can build shared card archives
- Multiple users can preserve memories together
- Great for elderly relatives who want to share their collection

---

### 5. Image Optimization & Enhancement
**Priority: Medium**
- Automatic image compression on upload
- Smart crop/rotate tools
- Brightness/contrast adjustments
- Remove shadows or glare from photos
- Generate optimized thumbnails for faster loading

**Benefits:**
- Reduced storage costs
- Faster page load times
- Better quality card images

---

### 6. Advanced Search & Filtering
**Priority: Medium**
- Combine multiple filters (e.g., "Christmas cards from Mom in 2020")
- Date range filtering
- Tag system (beyond just occasions)
- Save custom searches/views
- Recently viewed cards
- Favorite/starred cards

**Benefits:**
- Quickly find specific cards
- Better organization for large collections
- Personalized browsing experience

---

### 7. Export & Backup Features
**Priority: Medium**
- Export individual cards as PDF
- Download all card images as ZIP
- Create printable layouts (photo book style)
- Export metadata as CSV/JSON
- Automatic backup reminders
- Restore from backup functionality

**Benefits:**
- Data portability
- Create physical photo books
- Peace of mind with backups

---

### 8. Bulk Operations
**Priority: Low**
- Select multiple cards for batch actions
- Bulk delete
- Bulk edit metadata (change occasion, add notes)
- Bulk move to collections
- Bulk export

**Benefits:**
- Time savings for large collections
- Easier organization management

---

### 9. Calendar & Reminder Integration
**Priority: Low**
- Link cards to specific dates/events
- Set reminders for recurring occasions
- "On this day" notifications (show cards from past years)
- Birthday/anniversary reminders from cards received
- Timeline view of cards by date

**Benefits:**
- Never forget to send cards
- Nostalgic "memory lane" experience
- Better connection to special occasions

---

### 10. Mobile App (Progressive Web App)
**Priority: Low**
- Convert to PWA for offline access
- Install as mobile app
- Mobile-optimized upload flow
- Camera integration for quick card capture
- Push notifications

**Benefits:**
- Better mobile experience
- Capture cards immediately when received
- Native app feel

---

### 11. Statistics & Insights Dashboard
**Priority: Low**
- Total cards by person, occasion, year
- Most frequent card senders
- Card collection growth over time
- Visualizations (charts, graphs)
- "Wrapped" style yearly summaries

**Benefits:**
- Fun insights into card collection
- Identify meaningful relationships
- Shareable statistics

---

### 12. Social Features
**Priority: Low**
- Send digital thank-you notes through the app
- Create card wishlists
- Integration with online card retailers
- Card sending reminders based on your collection

**Benefits:**
- Close the loop on card giving/receiving
- Strengthen relationships

---

## Technical Improvements

### Performance Enhancements
- Implement CDN (CloudFront) for S3 images
- Add image lazy loading
- Implement pagination for card grid
- Add caching layer (Redis)
- Database query optimization

### Security Improvements
- Two-factor authentication (2FA)
- Session management improvements
- GDPR compliance features
- Audit logging
- Regular security audits

### UX/UI Improvements
- Dark mode
- Accessibility improvements (WCAG 2.1 compliance)
- Multiple theme options
- Customizable card grid layouts
- Keyboard shortcuts
- Drag-and-drop card reordering

---

## Implementation Priority

**Phase 1 (Next 3 months):**
1. Text Recognition (OCR)
2. Email Verification & Password Reset
3. User Profile Management

**Phase 2 (3-6 months):**
4. Card Sharing & Collaboration
5. Image Optimization & Enhancement
6. Advanced Search & Filtering

**Phase 3 (6-12 months):**
7. Export & Backup Features
8. Calendar & Reminder Integration
9. Statistics & Insights Dashboard

**Phase 4 (Future):**
10. Mobile App (PWA)
11. Social Features
12. Bulk Operations

---

## Notes

- Prioritization based on user value and implementation complexity
- Each feature should be implemented with proper testing
- User feedback will influence priority adjustments
- Performance and security remain ongoing concerns

Last Updated: 2025-11-11
