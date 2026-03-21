# 🚫 Removed Social Login

I have removed the "Sign in with Google" and "Sign in with Github" buttons from the Login page as requested.

## Changes Made
- Modified `frontend/src/pages/Login.jsx` to remove the social login section.

## Verification
- Checked `Login.jsx` to ensure buttons are gone.
- Checked `Register.jsx` to ensure no social login existed there.
- Verified no other "Sign in with Google/Github" buttons exist in the codebase.

The authentication flow now relies solely on Email/Password login.
