import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// ========================================
// INDIAN STATES & CITIES DATA (COMPREHENSIVE)
// ========================================
const INDIAN_STATES_CITIES = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Nellore', 'Kurnool', 'Rajahmundry'],
  'Arunachal Pradesh': ['Itanagar', 'Tawang', 'Pasighat', 'Ziro'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Tinsukia'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia', 'Arrah'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Bharuch'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Hisar', 'Rohtak', 'Karnal'],
  'Himachal Pradesh': ['Shimla', 'Manali', 'Dharamshala', 'Solan', 'Mandi', 'Kullu'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubli-Dharwad', 'Belagavi', 'Davanagere', 'Ballari', 'Shivamogga', 'Tumakuru', 'Udupi'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Alappuzha', 'Palakkad', 'Kannur', 'Kottayam'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Satna', 'Ratlam', 'Rewa'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Nanded'],
  'Manipur': ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur'],
  'Meghalaya': ['Shillong', 'Tura', 'Jowai', 'Cherrapunji'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip'],
  'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Wokha'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri', 'Sambalpur', 'Berhampur'],
  'Punjab': ['Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Alwar', 'Bharatpur', 'Sikar', 'Pali'],
  'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli', 'Tirunelveli', 'Erode', 'Vellore', 'Thanjavur', 'Tiruppur'],
  'Telangana': ['Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam', 'Ramagundam', 'Mahbubnagar'],
  'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailasahar'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Prayagraj', 'Meerut', 'Noida', 'Bareilly', 'Aligarh'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Rishikesh', 'Haldwani', 'Nainital', 'Roorkee'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Darjeeling', 'Kharagpur', 'Bardhaman', 'Haldia']
};

const INDIAN_LANGUAGES = [
  'Hindi', 'English', 'Bengali', 'Telugu', 'Marathi',
  'Tamil', 'Gujarati', 'Urdu', 'Kannada', 'Odia',
  'Malayalam', 'Punjabi', 'Assamese', 'Maithili', 'Sanskrit'
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // ========================================
  // FORM STATE
  // ========================================
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    gender: '',
    state: '',
    city: '',
    selectedLanguages: [],
    experienceYears: '',
    specialization: '',
    barIdNumber: '',
  });

  // ========================================
  // VALIDATION ERRORS STATE
  // ========================================
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    gender: '',
    state: '',
    city: '',
    selectedLanguages: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableCities, setAvailableCities] = useState([]);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const isLawyer = form.role === 'lawyer';

  // ========================================
  // UPDATE CITIES WHEN STATE CHANGES
  // ========================================
  useEffect(() => {
    if (form.state && INDIAN_STATES_CITIES[form.state]) {
      setAvailableCities(INDIAN_STATES_CITIES[form.state]);
      // Reset city if it doesn't exist in new state
      if (!INDIAN_STATES_CITIES[form.state].includes(form.city)) {
        setForm(prev => ({ ...prev, city: '' }));
      }
    } else {
      setAvailableCities([]);
      setForm(prev => ({ ...prev, city: '' }));
    }
  }, [form.state]);

  // ========================================
  // VALIDATION FUNCTIONS
  // ========================================

  /**
   * Validate Full Name - Only alphabetic characters and spaces
   */
  const validateName = (name) => {
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!name.trim()) {
      return 'This field is mandatory';
    }
    if (!nameRegex.test(name)) {
      return 'Full name should contain only letters';
    }
    return '';
  };

  /**
   * Validate Email - Proper email format
   */
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim()) {
      return 'This field is mandatory';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  /**
   * Validate Mobile Number - Exactly 10 digits
   */
  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    if (!phone.trim()) {
      return 'This field is mandatory';
    }
    if (!phoneRegex.test(phone)) {
      return 'Mobile number must be exactly 10 digits';
    }
    return '';
  };

  /**
   * Validate Password - Min 8 chars, uppercase, lowercase, number, special char
   */
  const validatePassword = (password) => {
    if (!password) {
      return 'This field is mandatory';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return 'Password must include uppercase, lowercase, number and special character';
    }

    return '';
  };

  // ========================================
  // HANDLE INPUT CHANGES WITH VALIDATION
  // ========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for phone - only allow digits and max 10
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, ''); // Remove non-digits
      const limitedValue = numericValue.slice(0, 10); // Max 10 digits
      setForm(prev => ({ ...prev, [name]: limitedValue }));

      // Validate on change
      const phoneError = validatePhone(limitedValue);
      setErrors(prev => ({ ...prev, phone: phoneError }));
      return;
    }

    // Special handling for name - only allow letters and spaces
    if (name === 'name') {
      // Allow typing but validate
      setForm(prev => ({ ...prev, [name]: value }));
      const nameError = validateName(value);
      setErrors(prev => ({ ...prev, name: nameError }));
      return;
    }

    // Handle other fields
    setForm(prev => ({ ...prev, [name]: value }));

    // Real-time validation
    if (name === 'email') {
      const emailError = validateEmail(value);
      setErrors(prev => ({ ...prev, email: emailError }));
    } else if (name === 'password') {
      const passwordError = validatePassword(value);
      setErrors(prev => ({ ...prev, password: passwordError }));
    }
  };

  // ========================================
  // HANDLE LANGUAGE SELECTION (Multi-select)
  // ========================================
  const toggleLanguage = (language) => {
    setForm(prev => {
      const isSelected = prev.selectedLanguages.includes(language);
      const newLanguages = isSelected
        ? prev.selectedLanguages.filter(lang => lang !== language)
        : [...prev.selectedLanguages, language];

      return { ...prev, selectedLanguages: newLanguages };
    });
  };

  // ========================================
  // CHECK IF FORM IS VALID
  // ========================================
  const isFormValid = () => {
    const hasNoErrors = Object.values(errors).every(error => error === '');
    const requiredFieldsFilled =
      form.name.trim() !== '' &&
      form.email.trim() !== '' &&
      form.phone.trim() !== '' &&
      form.password.trim() !== '' &&
      form.gender.trim() !== '' &&
      form.state.trim() !== '' &&
      form.city.trim() !== '' &&
      form.selectedLanguages.length > 0;

    return hasNoErrors && requiredFieldsFilled;
  };

  // ========================================
  // HANDLE FORM SUBMISSION
  // ========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Final validation check
    const nameError = validateName(form.name);
    const emailError = validateEmail(form.email);
    const phoneError = validatePhone(form.phone);
    const passwordError = validatePassword(form.password);

    // Check gender, state, city, and languages
    const genderError = !form.gender ? 'This field is mandatory' : '';
    const stateError = !form.state ? 'This field is mandatory' : '';
    const cityError = !form.city ? 'This field is mandatory' : '';
    const languagesError = form.selectedLanguages.length === 0 ? 'Please select at least one language' : '';

    if (nameError || emailError || phoneError || passwordError || genderError || stateError || cityError || languagesError) {
      setErrors({
        name: nameError,
        email: emailError,
        phone: phoneError,
        password: passwordError,
        gender: genderError,
        state: stateError,
        city: cityError,
        selectedLanguages: languagesError
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
        gender: form.gender,
        location: `${form.city}, ${form.state}`,
        languages: form.selectedLanguages,
        state: form.state,
        city: form.city
      };

      if (isLawyer) {
        if (form.experienceYears) {
          payload.experienceYears = Number(form.experienceYears) || 0;
        }
        if (form.specialization.trim()) {
          payload.specialization = form.specialization
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
        }
        if (form.barIdNumber.trim()) {
          payload.barIdNumber = form.barIdNumber.trim();
        }
      }

      await register(payload);

      // Redirect to login page
      navigate('/login', { state: { message: 'Registration successful! Please login to continue.' } });

    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Registration failed. Please check your details and try again.';
      setError(errorMsg);
      console.error('Registration error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RENDER COMPONENT
  // ========================================
  return (
    <div className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white">
            <span className="text-2xl">⚖️</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Your Account</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Join CaseXpert - Your Legal Assistance Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ========== BASIC INFORMATION ========== */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${errors.name
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500'
                  } bg-white text-slate-900 dark:bg-slate-800 dark:text-white`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <span>⚠️</span> {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${errors.email
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500'
                  } bg-white text-slate-900 dark:bg-slate-800 dark:text-white`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <span>⚠️</span> {errors.email}
                </p>
              )}
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={form.phone}
                onChange={handleChange}
                maxLength={10}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${errors.phone
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500'
                  } bg-white text-slate-900 dark:bg-slate-800 dark:text-white`}
                placeholder="10-digit mobile number"
              />
              {errors.phone && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <span>⚠️</span> {errors.phone}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${errors.password
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500'
                  } bg-white text-slate-900 dark:bg-slate-800 dark:text-white`}
                placeholder="Create a strong password"
              />
              {errors.password && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <span>⚠️</span> {errors.password}
                </p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label htmlFor="gender" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
                className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${errors.gender
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500'
                  } bg-white text-slate-900 dark:bg-slate-800 dark:text-white`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <span>⚠️</span> {errors.gender}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                I am a <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
              >
                <option value="user">Client (Looking for legal assistance)</option>
                <option value="lawyer">Lawyer (Providing legal services)</option>
              </select>
            </div>
          </div>

          {/* ========== ADDITIONAL DETAILS ========== */}
          <div className="space-y-4 rounded-xl border-2 border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span>📍</span> Additional Details
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {/* State */}
              <div className="space-y-2">
                <label htmlFor="state" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  id="state"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">Select State</option>
                  {Object.keys(INDIAN_STATES_CITIES).map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.state}
                  </p>
                )}
              </div>

              {/* City */}
              <div className="space-y-2">
                <label htmlFor="city" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  disabled={!form.state}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">
                    {form.state ? 'Select City' : 'First select a state'}
                  </option>
                  {availableCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.city}
                  </p>
                )}
              </div>

              {/* Languages (Multi-select) */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Languages <span className="text-red-500">*</span>
                </label>

                {/* Selected Languages Display */}
                <div className="min-h-[42px] rounded-lg border border-slate-300 bg-white px-3 py-2 flex flex-wrap gap-2 cursor-pointer"
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}>
                  {form.selectedLanguages.length > 0 ? (
                    form.selectedLanguages.map(lang => (
                      <span key={lang} className="inline-flex items-center gap-1 rounded-md bg-primary-100 px-2 py-1 text-xs font-medium text-primary-700">
                        {lang}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLanguage(lang);
                          }}
                          className="text-primary-900 hover:text-primary-600"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">Select languages you speak</span>
                  )}
                </div>

                {/* Language Dropdown */}
                {showLanguageDropdown && (
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-300 bg-white shadow-lg">
                    {INDIAN_LANGUAGES.map(language => (
                      <label
                        key={language}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.selectedLanguages.includes(language)}
                          onChange={() => toggleLanguage(language)}
                          className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                        />
                        <span className="text-sm text-slate-900">{language}</span>
                      </label>
                    ))}
                  </div>
                )}
                {errors.selectedLanguages && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.selectedLanguages}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ========== LAWYER-SPECIFIC FIELDS ========== */}
          {isLawyer && (
            <div className="space-y-4 rounded-xl border-2 border-primary-200 bg-primary-50 p-5 dark:border-primary-800 dark:bg-primary-900/20">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <span>👨‍⚖️</span> Professional Information
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Experience Years */}
                <div className="space-y-2">
                  <label htmlFor="experienceYears" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Years of Experience
                  </label>
                  <input
                    id="experienceYears"
                    name="experienceYears"
                    type="number"
                    min="0"
                    value={form.experienceYears}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g., 5"
                  />
                </div>

                {/* Specialization */}
                <div className="space-y-2">
                  <label htmlFor="specialization" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Specialization
                  </label>
                  <input
                    id="specialization"
                    name="specialization"
                    type="text"
                    value={form.specialization}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g., Criminal Law, Family Law"
                  />
                </div>

                {/* Bar ID Number */}
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="barIdNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Bar Council ID Number
                  </label>
                  <input
                    id="barIdNumber"
                    name="barIdNumber"
                    type="text"
                    value={form.barIdNumber}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    placeholder="Enter your Bar Council registration number"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========== ERROR MESSAGE ========== */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800 flex items-center gap-2">
                <span>❌</span> {error}
              </p>
            </div>
          )}

          {/* ========== SUBMIT BUTTON ========== */}
          <div className="space-y-4">
            <button
              type="submit"
              disabled={!isFormValid() || loading}
              className={`w-full rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-md transition-all ${!isFormValid() || loading
                ? 'cursor-not-allowed bg-slate-400'
                : 'bg-slate-900 hover:bg-slate-800 hover:shadow-lg'
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
