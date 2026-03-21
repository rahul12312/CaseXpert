# 🌍 CaseXpert Multilingual Implementation Guide

## 📚 Table of Contents
1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Frontend Usage](#frontend-usage)
4. [Backend Usage](#backend-usage)
5. [Component Examples](#component-examples)
6. [API Integration](#api-integration)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Installation

### Frontend Dependencies
```bash
cd frontend
npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend
```

### Backend Dependencies
```bash
cd backend
npm install i18n
```

### Database Migration
Run the migration to add language preference column:
```bash
cd backend
node migrations/add_language_to_users.js
```

---

## ⚡ Quick Start

### 1. Frontend Setup

**Initialize i18n in your app:**

The i18n configuration is already imported in `main.jsx`:
```javascript
import './i18n/config';
```

**Add Language Switcher to Navbar:**

Update your `Navbar.jsx`:
```javascript
import LanguageSwitcher from './LanguageSwitcher';

// In your navbar component
<LanguageSwitcher />
```

### 2. Backend Setup

**Add language middleware to server.js:**

```javascript
const { languageMiddleware } = require('./middleware/languageDetector');

// After body parser, before routes
app.use(languageMiddleware);
```

---

## 🎨 Frontend Usage

### Using Translations in Components

#### Basic Translation
```javascript
import { useTranslation } from 'react-i18next';

function LoginPage() {
  const { t } = useTranslation('auth');
  
  return (
    <div>
      <h1>{t('login.title')}</h1>
      <button>{t('login.button.submit')}</button>
    </div>
  );
}
```

#### Multiple Namespaces
```javascript
function Dashboard() {
  const { t } = useTranslation(['dashboard', 'common']);
  
  return (
    <div>
      <h1>{t('dashboard:title')}</h1>
      <button>{t('common:button.save')}</button>
    </div>
  );
}
```

#### With Variables
```javascript
function Welcome({ userName }) {
  const { t } = useTranslation('dashboard');
  
  return <h1>{t('welcome', { name: userName })}</h1>;
  // Output: "Welcome back, John!" (en)
  // Output: "स्वागत है, John!" (hi)
}
```

#### Pluralization
```javascript
function CaseList({ cases }) {
  const { t } = useTranslation('cases');
  
  return (
    <p>{t('list.showing', { count: cases.length })}</p>
  );
}
```

### Changing Language Programmatically

```javascript
import { changeLanguage } from '../i18n/config';

function SettingsPage() {
  const handleLanguageChange = async (lang) => {
    await changeLanguage(lang);
    // Language changed!
  };
  
  return (
    <select onChange={(e) => handleLanguageChange(e.target.value)}>
      <option value="en">English</option>
      <option value="hi">हिंदी</option>
      <option value="mr">मराठी</option>
    </select>
  );
}
```

### Form Validation with Translations

```javascript
import { useTranslation } from 'react-i18next';

function RegisterForm() {
  const { t } = useTranslation('validation');
  const [errors, setErrors] = useState({});

  const validate = (values) => {
    const newErrors = {};
    
    if (!values.email) {
      newErrors.email = t('email.required');
    } else if (!isValidEmail(values.email)) {
      newErrors.email = t('email.invalid');
    }
    
    if (!values.password) {
      newErrors.password = t('password.required');
    } else if (values.password.length < 8) {
      newErrors.password = t('password.minLength', { min: 8 });
    }
    
    return newErrors;
  };
  
  // ... rest of component
}
```

### Error Handling with Translations

```javascript
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

function CaseForm() {
  const { t } = useTranslation(['cases', 'errors']);

  const handleSubmit = async (data) => {
    try {
      await createCase(data);
      toast.success(t('cases:create.success'));
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error(t('errors:authentication.session_expired'));
      } else {
        toast.error(t('errors:general.unknown'));
      }
    }
  };
}
```

---

## 🔧 Backend Usage

### Using Translator in Controllers

The language middleware automatically attaches `req.t()` to all requests:

```javascript
exports.createCase = async (req, res) => {
  try {
    const { t } = req; // Translator function
    
    // ... create case logic
    
    return res.json({
      success: true,
      message: t('success.case_created'),
      data: newCase
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: req.t('errors.generic')
    });
  }
};
```

### Using Localized Response Helpers

```javascript
// Success response
exports.createBooking = async (req, res) => {
  // ... booking logic
  
  return res.localizedJson(200, 'booking.booking_confirmed', {
    booking: newBooking
  });
};

// Error response
exports.getCase = async (req, res) => {
  const case = await findCase(req.params.id);
  
  if (!case) {
    return res.localizedError(404, 'case.not_found');
  }
  
  return res.json({ success: true, data: case });
};
```

### With Interpolation

```javascript
exports.sendNotification = async (req, res) => {
  const notification = req.t('notification.hearing_reminder', {
    case_title: caseData.title,
    date: formatDate(hearing.date, req.language)
  });
  
  // Send notification...
};
```

---

## 📖 Component Examples

### Complete Login Component
```javascript
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

function Login() {
  const { t } = useTranslation(['auth', 'common', 'validation']);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = t('validation:email.required');
    }
    
    if (!formData.password) {
      newErrors.password = t('validation:password.required');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/auth/login', formData);
      
      localStorage.setItem('token', response.data.token);
      toast.success(t('auth:login.message.success'));
      navigate('/dashboard');
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error(t('auth:login.error.invalidCredentials'));
      } else {
        toast.error(t('common:message.error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>{t('auth:login.title')}</h1>
      <p>{t('auth:login.subtitle')}</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{t('auth:login.label.email')}</label>
          <input
            type="email"
            placeholder={t('auth:login.placeholder.email')}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>
        
        <div className="form-group">
          <label>{t('auth:login.label.password')}</label>
          <input
            type="password"
            placeholder={t('auth:login.placeholder.password')}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? t('common:message.loading') : t('auth:login.button.submit')}
        </button>
      </form>
      
      <a href="/forgot-password">{t('auth:login.link.forgotPassword')}</a>
    </div>
  );
}

export default Login;
```

### Date Formatting Component
```javascript
import React from 'react';
import { useTranslation } from 'react-i18next';

function LocalizedDate({ date, format = 'long' }) {
  const { i18n } = useTranslation();
  
  const formatDate = () => {
    const options = format === 'long' 
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : { year: 'numeric', month: 'short', day: 'numeric' };
    
    return new Intl.DateTimeFormat(i18n.language, options).format(new Date(date));
  };
  
  return <span>{formatDate()}</span>;
}

export default LocalizedDate;
```

---

## 🔌 API Integration

### Making Requests with Language

The language is automatically included in the JWT token. Just send the token:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001'
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API responses will automatically be in user's language
const response = await api.get('/api/cases');
console.log(response.data.message); // Localized message
```

### Updating Language Preference

```javascript
async function updateLanguage(newLanguage) {
  try {
    const response = await api.put('/api/auth/update-language', {
      preferred_language: newLanguage
    });
    
    // Update token with new language preference
    localStorage.setItem('token', response.data.token);
    
    toast.success('Language updated successfully!');
    return true;
  } catch (error) {
    toast.error('Failed to update language');
    return false;
  }
}
```

---

## ✨ Best Practices

### 1. Never Hardcode Text
❌ **Bad:**
```javascript
<button>Login</button>
```

✅ **Good:**
```javascript
<button>{t('common:button.submit')}</button>
```

### 2. Use Namespace Organization
```javascript
// Load only needed namespaces
const { t } = useTranslation(['auth', 'common']);

// Not all namespaces
const { t } = useTranslation();
```

### 3. Provide Context in Translation Keys
```javascript
{
  "login": {
    "button": {
      "submit": "Login",        // Clear context
      "google": "Login with Google"
    }
  }
}
```

### 4. Handle Missing Translations Gracefully
```javascript
// i18n config already has fallback to English
// But you can add additional safety:
const safeTranslate = (key, options = {}) => {
  try {
    return t(key, options);
  } catch (error) {
    console.error(`Translation error for key: ${key}`);
    return key;
  }
};
```

### 5. Use Consistent Naming Convention
```
{category}.{subcategory}.{type}.{name}

Examples:
auth.login.button.submit
auth.register.error.email_exists
cases.list.message.no_results
lawyer.profile.label.experience
```

---

## 🐛 Troubleshooting

### Issue: Translations not loading
**Solution:**
1. Check if i18n config is imported in `main.jsx`
2. Verify JSON files are valid (no trailing commas)
3. Check console for errors

### Issue: Language not persisting
**Solution:**
1. Ensure localStorage is enabled
2. Check if JWT token includes `preferred_language`
3. Verify backend migration ran successfully

### Issue: Backend responses still in English
**Solution:**
1. Add language middleware to server.js
2. Check that JWT token is being sent correctly
3. Verify language detection middleware is working

### Issue: Date formatting not working
**Solution:**
```javascript
// Use Intl API properly
new Intl.DateTimeFormat(i18n.language, options).format(date)
```

---

## 🎓 Advanced Features

### Lazy Loading Translations
```javascript
// Already configured in i18n/config.js
// Translations are loaded on demand per namespace
```

### Adding New Language
1. Create new locale folder: `locales/fr/`
2. Copy all JSON files from `locales/en/`
3. Translate content
4. Add to supported languages in `i18n/config.js`
5. Add to backend translator.js

### RTL Support (Future)
The system is ready for RTL languages. Just add:
```javascript
document.documentElement.dir = isRTL(language) ? 'rtl' : 'ltr';
```

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review the implementation plan
3. Check console for errors
4. Contact development team

---

**Status:** ✅ Production Ready  
**Version:** 1.0  
**Last Updated:** 2026-02-15
