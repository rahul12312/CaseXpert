# 🚀 CaseXpert Multilingual - Quick Reference Card

## Installation Commands
```bash
# Frontend
cd frontend
npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend

# Backend
cd backend
npm install i18n
node migrations/add_language_to_users.js
```

## Frontend Usage

### Import Translation Hook
```javascript
import { useTranslation } from 'react-i18next';
```

### Basic Usage
```javascript
const { t } = useTranslation('namespace');

// Simple translation
<h1>{t('title')}</h1>

// With variable
<p>{t('welcome', { name: userName })}</p>

// Multiple namespaces
const { t } = useTranslation(['common', 'auth']);
<button>{t('common:button.submit')}</button>
```

### Change Language
```javascript
import { changeLanguage } from '../i18n/config';
await changeLanguage('hi'); // Switch to Hindi
```

## Backend Usage

### Use Translator in Controllers
```javascript
exports.myFunction = async (req, res) => {
  const { t } = req; // Auto-attached by middleware
  
  return res.json({
    success: true,
    message: t('success.created')
  });
};
```

### Localized Response Helpers
```javascript
// Success
return res.localizedJson(200, 'booking.confirmed', { booking: data });

// Error
return res.localizedError(404, 'case.not_found');
```

## Translation Key Format
```
{category}.{subcategory}.{type}.{name}

Examples:
common.button.submit
auth.login.error.invalidCredentials
cases.list.message.noResults
```

## Supported Languages
- **en** - English
- **hi** - Hindi (हिंदी)
- **mr** - Marathi (मराठी)

## Common Translation Keys

### Buttons
```
common.button.submit → Submit
common.button.save → Save
common.button.cancel → Cancel
```

### Statuses
```
common.status.active → Active
common.status.pending → Pending
common.status.completed → Completed
```

### Auth
```
auth.login.title → Welcome Back
auth.login.button.submit → Log In
auth.login.error.invalidCredentials → Invalid email or password
```

### Validation
```
validation.email.required → Email is required
validation.email.invalid → Please enter a valid email
validation.password.minLength → Password must be at least {{min}} characters
```

## Files to Update

### Server.js
```javascript
const { languageMiddleware } = require('./middleware/languageDetector');
app.use(languageMiddleware); // Add before routes
```

### Component Example
```javascript
// Before
<button>Login</button>

// After
import { useTranslation } from 'react-i18next';
const { t } = useTranslation('auth');
<button>{t('login.button.submit')}</button>
```

## API Integration
```javascript
// Language automatically sent in JWT
const response = await axios.get('/api/cases', {
  headers: {
    'Authorization': `Bearer ${token}` // Includes preferred_language
  }
});

// Update language
await axios.put('/api/auth/update-language', {
  preferred_language: 'hi'
});
```

## Debugging

### Check Current Language
```javascript
import { getCurrentLanguage } from '../i18n/config';
console.log(getCurrentLanguage()); // e.g., 'en'
```

### Test Translation
```javascript
console.log(t('auth.login.title')); // Should show translation
```

### Backend Logging
```javascript
console.log(req.language); // Current language code
console.log(req.t('test.key')); // Test translation
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Translations not loading | Check i18n config imported in main.jsx |
| Language not persisting | Verify JWT includes preferred_language |
| Backend still English | Add language middleware to server.js |
| Missing translation | Check JSON file exists and key is correct |

## Quick Test

1. ✅ Change language in UI
2. ✅ Refresh page - language persisted?
3. ✅ Login - JWT includes language?
4. ✅ API response in correct language?

---

**Docs**: See `MULTILINGUAL_USAGE_GUIDE.md` for detailed examples  
**Plan**: See `MULTILINGUAL_IMPLEMENTATION_PLAN.md` for architecture
