// ============================================
// FRONTEND SIGNUP API INTEGRATION
// Complete working example for React/JavaScript
// ============================================

// Backend URL - MUST USE THIS
const API_BASE_URL = 'http://localhost:5001/api';

// ============================================
// METHOD 1: Using Fetch API (Vanilla JS/React)
// ============================================

async function signupUser(userData) {
  try {
    console.log('📤 Sending signup request to:', `${API_BASE_URL}/auth/register`);
    console.log('📦 User data:', userData);

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    console.log('📥 Response status:', response.status);
    
    const data = await response.json();
    console.log('📥 Response data:', data);

    if (data.success) {
      console.log('✅ Signup successful!');
      console.log('User ID:', data.data.userId);
      console.log('Token:', data.data.token);
      
      // Save token to localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      
      return data;
    } else {
      console.error('❌ Signup failed:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    throw error;
  }
}

// ============================================
// METHOD 2: Using Axios (React)
// ============================================

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api'
});

async function signupUserAxios(userData) {
  try {
    const response = await api.post('/auth/register', userData);
    
    if (response.data.success) {
      // Save token
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      return response.data;
    }
  } catch (error) {
    console.error('Signup error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// METHOD 3: React Component Example
// ============================================

import React, { useState } from 'react';

function SignupForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    user_type: 'client'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        
        // Redirect to dashboard or home
        window.location.href = '/dashboard';
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error. Please check if backend is running on port 5001');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">Registration successful!</div>}

      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <input
        type="tel"
        name="phone"
        placeholder="Phone (optional)"
        value={formData.phone}
        onChange={handleChange}
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />

      <select
        name="user_type"
        value={formData.user_type}
        onChange={handleChange}
      >
        <option value="client">Client</option>
        <option value="lawyer">Lawyer</option>
      </select>

      <button type="submit" disabled={loading}>
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
}

export default SignupForm;

// ============================================
// USAGE EXAMPLES
// ============================================

// Example 1: Simple signup
signupUser({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+919999999999',
  password: 'password123',
  user_type: 'client'
})
.then(data => {
  console.log('Signup successful:', data);
})
.catch(error => {
  console.error('Signup failed:', error);
});

// Example 2: With async/await
async function handleSignup() {
  try {
    const result = await signupUser({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'securepass',
      user_type: 'lawyer'
    });
    
    console.log('User registered:', result.data);
    // Redirect or update UI
  } catch (error) {
    alert('Signup failed: ' + error.message);
  }
}

// ============================================
// EXPECTED REQUEST FORMAT
// ============================================

/*
POST http://localhost:5001/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919999999999",     // Optional
  "password": "password123",
  "user_type": "client"          // Optional: "client", "lawyer", or "admin"
}
*/

// ============================================
// EXPECTED SUCCESS RESPONSE
// ============================================

/*
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": 7,
    "name": "John Doe",
    "email": "john@example.com",
    "user_type": "client",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
*/

// ============================================
// EXPECTED ERROR RESPONSE
// ============================================

/*
{
  "success": false,
  "message": "User with this email or phone already exists"
}

OR

{
  "success": false,
  "message": "Name, email, and password are required"
}
*/

// ============================================
// TROUBLESHOOTING
// ============================================

/*
1. Network Error:
   - Check if backend is running: http://localhost:5001
   - Verify CORS is enabled in server.js
   - Check browser console for CORS errors

2. 404 Not Found:
   - Verify URL: http://localhost:5001/api/auth/register
   - Check if authRoutes is properly imported in server.js

3. 500 Internal Server Error:
   - Check backend console logs
   - Verify database connection
   - Check if all required fields are sent

4. 409 Conflict:
   - User already exists with that email/phone
   - Try different email

5. 400 Bad Request:
   - Missing required fields (name, email, password)
   - Check request body format
*/
