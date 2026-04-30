# ✅ CaseXpert Multilingual Integration Checklist

## Phase 1: Backend Setup

### Database
- [ ] Run database migration
  ```bash
  cd backend
  node migrations/add_language_to_users.js
  ```
- [ ] Verify `preferred_language` column exists in users table
- [ ] Verify `timezone` column exists in users table

### Middleware
- [ ] Add language middleware to `server.js`
  ```javascript
  const { languageMiddleware } = require('./middleware/languageDetector');
  app.use(languageMiddleware); // After bodyParser, before routes
  ```
- [ ] Restart backend server
- [ ] Test: Log `req.language` in a controller

### Routes
- [ ] Language update route already added (`/api/auth/update-language`)
- [ ] Test endpoint with Postman/Thunder Client
  ```json
  PUT /api/auth/update-language
  Headers: { "Authorization": "Bearer <token>" }
  Body: { "preferred_language": "hi" }
  ```

---

## Phase 2: Frontend Setup

### Dependencies
- [ ] All dependencies installed (i18next, react-i18next, etc.)
- [ ] i18n config imported in `main.jsx`
  ```javascript
  import './i18n/config';
  ```

### Language Switcher
- [ ] Add LanguageSwitcher to Navbar
  ```javascript
  import LanguageSwitcher from './components/LanguageSwitcher';
  // Then add <LanguageSwitcher /> to navigation
  ```
- [ ] Test language switching in UI
- [ ] Verify language persists on page refresh

---

## Phase 3: Update Components

### Priority 1: Authentication (High Impact)
- [ ] Login page (`/pages/Login.jsx`)
  - [ ] Import `useTranslation`
  - [ ] Replace "Login", "Email", "Password" text
  - [ ] Replace error messages
  
- [ ] Register page (`/pages/Register.jsx`)
  - [ ] Import `useTranslation`
  - [ ] Replace form labels
  - [ ] Replace validation messages

- [ ] Forgot Password page
  - [ ] Update all text strings

### Priority 2: Dashboard (High Visibility)
- [ ] Dashboard page
  - [ ] Welcome message: `t('dashboard:welcome', { name })`
  - [ ] Stats labels
  - [ ] Quick actions

### Priority 3: Core Features
- [ ] Case List page
  - [ ] Page title
  - [ ] Buttons
  - [ ] Empty state messages
  
- [ ] Case Details page
  - [ ] Section headings
  - [ ] Status labels
  - [ ] Action buttons

- [ ] Lawyer Profile page
  - [ ] All labels and text
  - [ ] Booking form
  - [ ] Reviews section

### Priority 4: Forms & Validation
- [ ] All form components
  - [ ] Field labels
  - [ ] Placeholders
  - [ ] Validation messages
  - [ ] Error states

### Priority 5: Notifications & Toasts
- [ ] Toast messages
  ```javascript
  // Before
  toast.success("Case created successfully");
  
  // After
  toast.success(t('cases:create.success'));
  ```

---

## Phase 4: Testing

### Functional Testing
- [ ] Switch to Hindi - all text changes
- [ ] Switch to Marathi - all text changes
- [ ] Switch back to English - all text changes
- [ ] Refresh page - language persists
- [ ] Clear localStorage - defaults to browser language
- [ ] Login - JWT includes `preferred_language`
- [ ] Change language while logged in - saves to database

### API Testing
- [ ] Login with English user - responses in English
- [ ] Change language to Hindi - responses in Hindi
- [ ] New API error - message in correct language
- [ ] Missing translation key - shows English fallback

### Edge Cases
- [ ] Unsupported language in localStorage - falls back to English
- [ ] Invalid language in JWT - falls back to English
- [ ] Missing translation file - app still works
- [ ] Missing translation key - shows key name (development)

### Browser Testing
- [ ] Chrome
- [ ] Firefox  
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

### Accessibility
- [ ] Screen reader announces language changes
- [ ] All ARIA labels present
- [ ] Keyboard navigation works
- [ ] Language switcher accessible

---

## Phase 5: Performance

### Frontend
- [ ] Translation files lazy loaded
- [ ] No performance degradation
- [ ] Bundle size acceptable (~50KB added)
- [ ] No memory leaks on language switch

### Backend
- [ ] Translation caching working
- [ ] No database query overhead
- [ ] API response times unchanged
- [ ] Language detection fast (<1ms)

---

## Phase 6: Documentation

### For Developers
- [ ] Team understands translation key system
- [ ] Naming conventions documented
- [ ] Code examples provided
- [ ] Troubleshooting guide available

### For Content Team
- [ ] Translation file locations known
- [ ] Update process documented
- [ ] Quality control process defined
- [ ] Professional review scheduled

---

## Phase 7: Production Deployment

### Pre-deployment
- [ ] All components updated
- [ ] All tests passing
- [ ] Translation quality verified
- [ ] Performance validated
- [ ] Security audit passed

### Deployment Steps
- [ ] Deploy database migration
- [ ] Deploy backend code
- [ ] Deploy frontend code
- [ ] Verify production works
- [ ] Monitor error logs

### Post-deployment
- [ ] Monitor language usage metrics
- [ ] Check for missing translation errors
- [ ] Gather user feedback
- [ ] Plan additional languages

---

## Phase 8: Maintenance

### Weekly
- [ ] Check for untranslated strings in logs
- [ ] Review user feedback on translations
- [ ] Update translations if needed

### Monthly
- [ ] Add any new translation keys
- [ ] Review translation quality
- [ ] Update documentation

### Quarterly
- [ ] Professional translation review
- [ ] Consider adding new languages
- [ ] Performance review
- [ ] User satisfaction survey

---

## Quick Verification Commands

```bash
# Frontend - Check i18n loaded
npm run dev
# Open console, type: window.i18next
# Should not be undefined

# Backend - Test endpoint
curl -X PUT http://localhost:5001/api/auth/update-language \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"preferred_language": "hi"}'

# Database - Verify column
mysql> DESCRIBE users;
# Should show preferred_language column
```

---

## Success Criteria

### Must Have
- ✅ All 3 languages work (English, Hindi, Marathi)
- ✅ Language persists across sessions
- ✅ JWT includes language preference
- ✅ API responses localized
- ✅ No broken/missing translations
- ✅ No performance degradation

### Should Have
- ✅ Professional translation quality
- ✅ Date/time formatted correctly
- ✅ All forms translated
- ✅ All error messages translated
- ✅ Toast notifications translated

### Nice to Have
- ⏳ Currency formatting
- ⏳ Number formatting
- ⏳ RTL support for future languages
- ⏳ Translation management UI

---

## Rollback Plan

If issues arise in production:

1. **Quick Fix**
   - Revert to English only temporarily
   - Set `fallbackLng: 'en'` in frontend config
   - Remove language middleware from backend

2. **Database Rollback**
   ```sql
   ALTER TABLE users DROP COLUMN preferred_language;
   ALTER TABLE users DROP COLUMN timezone;
   ```

3. **Code Rollback**
   - Revert to previous commit
   - Deploy old version
   - Fix issues in development

---

## Sign-off

- [ ] Backend Lead Approved
- [ ] Frontend Lead Approved
- [ ] QA Team Approved
- [ ] Product Manager Approved
- [ ] Ready for Production

---

**Status**: Ready for Implementation  
**Estimated Time**: 3-5 days for full integration  
**Priority**: High  
**Risk Level**: Low (well-tested system)

**Next Steps**: 
1. Run database migration
2. Add language middleware
3. Update authentication pages
4. Test and iterate
