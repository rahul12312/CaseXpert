import React, { useState, useEffect, useRef } from 'react';
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
  // 22 Scheduled Languages (8th Schedule of the Indian Constitution)
  'Assamese', 'Bengali', 'Bodo', 'Dogri', 'Gujarati',
  'Hindi', 'Kannada', 'Kashmiri', 'Konkani', 'Maithili',
  'Malayalam', 'Manipuri', 'Marathi', 'Nepali', 'Odia',
  'Punjabi', 'Sanskrit', 'Santali', 'Sindhi', 'Tamil',
  'Telugu', 'Urdu',
  // Other widely spoken languages
  'English', 'Bhojpuri', 'Chhattisgarhi', 'Garhwali', 'Kumaoni',
  'Magahi', 'Mizo', 'Rajasthani', 'Tulu'
];

const STATE_LANGUAGES_MAP = {
  'Andhra Pradesh': ['English', 'Hindi', 'Telugu', 'Urdu', 'Tamil', 'Kannada', 'Odia'],
  'Arunachal Pradesh': ['English', 'Hindi', 'Assamese', 'Bengali', 'Nepali'],
  'Assam': ['English', 'Hindi', 'Assamese', 'Bengali', 'Bodo', 'Nepali', 'Manipuri'],
  'Bihar': ['English', 'Hindi', 'Maithili', 'Bhojpuri', 'Magahi', 'Urdu', 'Bengali'],
  'Chhattisgarh': ['English', 'Hindi', 'Chhattisgarhi', 'Marathi', 'Odia', 'Telugu'],
  'Goa': ['English', 'Hindi', 'Konkani', 'Marathi', 'Kannada', 'Urdu'],
  'Gujarat': ['English', 'Hindi', 'Gujarati', 'Sindhi', 'Urdu', 'Marathi'],
  'Haryana': ['English', 'Hindi', 'Punjabi', 'Urdu'],
  'Himachal Pradesh': ['English', 'Hindi', 'Punjabi', 'Nepali', 'Garhwali'],
  'Jharkhand': ['English', 'Hindi', 'Santali', 'Maithili', 'Bengali', 'Odia', 'Urdu', 'Bhojpuri'],
  'Karnataka': ['English', 'Hindi', 'Kannada', 'Telugu', 'Marathi', 'Tamil', 'Urdu', 'Tulu', 'Konkani'],
  'Kerala': ['English', 'Hindi', 'Malayalam', 'Tamil', 'Kannada', 'Tulu'],
  'Madhya Pradesh': ['English', 'Hindi', 'Marathi', 'Urdu', 'Sindhi', 'Gujarati', 'Bhojpuri'],
  'Maharashtra': ['English', 'Hindi', 'Marathi', 'Gujarati', 'Urdu', 'Kannada', 'Sindhi', 'Konkani'],
  'Manipur': ['English', 'Hindi', 'Manipuri', 'Bengali', 'Nepali'],
  'Meghalaya': ['English', 'Hindi', 'Assamese', 'Bengali', 'Nepali'],
  'Mizoram': ['English', 'Hindi', 'Mizo', 'Bengali', 'Nepali'],
  'Nagaland': ['English', 'Hindi', 'Assamese', 'Bengali', 'Nepali'],
  'Odisha': ['English', 'Hindi', 'Odia', 'Telugu', 'Bengali', 'Santali', 'Urdu'],
  'Punjab': ['English', 'Hindi', 'Punjabi', 'Urdu'],
  'Rajasthan': ['English', 'Hindi', 'Rajasthani', 'Punjabi', 'Gujarati', 'Urdu', 'Sindhi'],
  'Sikkim': ['English', 'Hindi', 'Nepali', 'Bengali', 'Manipuri', 'Assamese'],
  'Tamil Nadu': ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Urdu'],
  'Telangana': ['English', 'Hindi', 'Telugu', 'Urdu', 'Marathi', 'Kannada', 'Tamil'],
  'Tripura': ['English', 'Hindi', 'Bengali', 'Manipuri', 'Nepali'],
  'Uttar Pradesh': ['English', 'Hindi', 'Urdu', 'Bhojpuri', 'Punjabi', 'Bengali', 'Maithili'],
  'Uttarakhand': ['English', 'Hindi', 'Urdu', 'Sanskrit', 'Garhwali', 'Kumaoni', 'Nepali', 'Punjabi'],
  'West Bengal': ['English', 'Hindi', 'Bengali', 'Odia', 'Urdu', 'Santali', 'Nepali', 'Rajasthani']
};

const Register = () => {
  const { sendOTP, verifyOTP, resendOTP, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // OTP step state
  const [step, setStep] = useState(1); // 1 = form, 2 = OTP
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingPayload, setPendingPayload] = useState(null);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devOtpMessage, setDevOtpMessage] = useState(''); // DEV: shows OTP on screen
  const otpRefs = useRef([]);

  useEffect(() => {
    // If already logged in, go straight to home
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

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
  const [availableLanguages, setAvailableLanguages] = useState(['Hindi', 'English']);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const isLawyer = form.role === 'lawyer';

  // ========================================
  // UPDATE CITIES AND LANGUAGES WHEN STATE CHANGES
  // ========================================
  useEffect(() => {
    if (form.state && INDIAN_STATES_CITIES[form.state]) {
      setAvailableCities(INDIAN_STATES_CITIES[form.state]);
      // Reset city if it doesn't exist in new state
      if (!INDIAN_STATES_CITIES[form.state].includes(form.city)) {
        setForm(prev => ({ ...prev, city: '' }));
      }
      
      // Update available languages based on state
      const stateLangs = STATE_LANGUAGES_MAP[form.state] || ['English', 'Hindi'];
      const uniqueLangs = [...new Set(stateLangs)];
      const filteredLangs = INDIAN_LANGUAGES.filter(lang => uniqueLangs.includes(lang));
      setAvailableLanguages(filteredLangs);
      
      // Remove selected languages that are no longer available in the new state
      setForm(prev => ({
        ...prev,
        selectedLanguages: prev.selectedLanguages.filter(lang => uniqueLangs.includes(lang))
      }));

    } else {
      setAvailableCities([]);
      setAvailableLanguages(['Hindi', 'English']);
      setForm(prev => ({ 
        ...prev, 
        city: '',
        selectedLanguages: prev.selectedLanguages.filter(lang => ['Hindi', 'English'].includes(lang))
      }));
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
        name: form.name, email: form.email, phone: form.phone,
        password: form.password, role: form.role, gender: form.gender,
        location: `${form.city}, ${form.state}`,
        languages: form.selectedLanguages, state: form.state, city: form.city,
        ...(isLawyer && {
          experienceYears: Number(form.experienceYears) || 0,
          specialization: form.specialization.split(',').map(s => s.trim()).filter(Boolean),
          barIdNumber: form.barIdNumber.trim(),
        }),
      };
      const result = await sendOTP(payload);
      setPendingEmail(form.email.toLowerCase());
      setPendingPayload(payload);
      setResendCooldown(60);
      setStep(2);
      // DEV MODE: auto-fill OTP if backend returns it
      if (result?.devOtp) {
        const digits = result.devOtp.toString().split('');
        setOtpDigits(digits);
        setDevOtpMessage(`🔧 Dev Mode OTP: ${result.devOtp} (auto-filled)`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    setOtpError('');
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
  };

  const handleVerifyOTP = async () => {
    const otp = otpDigits.join('');
    if (otp.length !== 6) { setOtpError('Please enter the complete 6-digit code'); return; }
    setOtpLoading(true); setOtpError('');
    try {
      await verifyOTP(pendingEmail, otp, pendingPayload);
      navigate('/');
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      setOtpDigits(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally { setOtpLoading(false); }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    try {
      const result = await resendOTP(pendingEmail);
      setResendCooldown(60);
      setOtpError('');
      setOtpDigits(['', '', '', '', '', '']);
      // DEV MODE: auto-fill new OTP if backend returns it
      if (result?.devOtp) {
        const digits = result.devOtp.toString().split('');
        setOtpDigits(digits);
        setDevOtpMessage(`🔧 Dev Mode OTP: ${result.devOtp} (auto-filled)`);
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };


  // ========================================
  // RENDER COMPONENT
  // ========================================
  // ── OTP VERIFICATION SCREEN ──
  if (step === 2) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-lg text-center">
          <div className="mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-3xl">📧</div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Check your email</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              We sent a 6-digit code to<br />
              <span className="font-semibold text-slate-700 dark:text-slate-300">{pendingEmail}</span>
            </p>
          </div>

          {/* DEV MODE: Show OTP on screen when email isn't configured */}
          {devOtpMessage && (
            <div className="mb-4 rounded-xl border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 text-center">
              <p className="text-sm font-bold text-yellow-700 dark:text-yellow-300">{devOtpMessage}</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Check backend console for the OTP code too</p>
            </div>
          )}


          <div className="flex justify-center gap-3 mb-6">
            {otpDigits.map((digit, i) => (
              <input
                key={i}
                ref={el => otpRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                className={`h-14 w-12 rounded-xl border-2 text-center text-2xl font-bold transition-all focus:outline-none ${
                  otpError
                    ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600'
                    : digit
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800`}
              />
            ))}
          </div>

          {otpError && (
            <p className="mb-4 text-sm text-red-600 flex items-center justify-center gap-1"><span>⚠️</span> {otpError}</p>
          )}

          <button
            onClick={handleVerifyOTP}
            disabled={otpLoading || otpDigits.join('').length !== 6}
            className={`w-full rounded-xl py-3 text-sm font-semibold text-white shadow transition-all ${
              otpLoading || otpDigits.join('').length !== 6
                ? 'cursor-not-allowed bg-slate-300 dark:bg-slate-700'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
            }`}
          >
            {otpLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Verifying...
              </span>
            ) : '✅ Verify & Create Account'}
          </button>

          <div className="mt-5 flex items-center justify-center gap-1 text-sm">
            <span className="text-slate-500 dark:text-slate-400">Didn't get the code?</span>
            {resendCooldown > 0 ? (
              <span className="text-slate-400">Resend in {resendCooldown}s</span>
            ) : (
              <button onClick={handleResendOTP} className="font-semibold text-blue-600 hover:underline">Resend OTP</button>
            )}
          </div>

          <button onClick={() => { setStep(1); setOtpDigits(['','','','','','']); setOtpError(''); }}
            className="mt-4 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            ← Back to registration form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white">
            <span className="text-2xl">⚖️</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white dark:text-white">Create Your Account</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 dark:text-slate-400">
            Join CaseXpert - Your Legal Assistance Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ========== BASIC INFORMATION ========== */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
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
                  } bg-white dark:bg-slate-900 text-slate-900 dark:text-white dark:bg-slate-800 dark:text-white`}
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
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
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
                  } bg-white dark:bg-slate-900 text-slate-900 dark:text-white dark:bg-slate-800 dark:text-white`}
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
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
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
                  } bg-white dark:bg-slate-900 text-slate-900 dark:text-white dark:bg-slate-800 dark:text-white`}
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
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
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
                  } bg-white dark:bg-slate-900 text-slate-900 dark:text-white dark:bg-slate-800 dark:text-white`}
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
              <label htmlFor="gender" className="block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
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
                  } bg-white dark:bg-slate-900 text-slate-900 dark:text-white dark:bg-slate-800 dark:text-white`}
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
              <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
                I am a <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
              >
                <option value="user">Client (Looking for legal assistance)</option>
                <option value="lawyer">Lawyer (Providing legal services)</option>
              </select>
            </div>
          </div>

          {/* ========== ADDITIONAL DETAILS ========== */}
          <div className="space-y-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-5 dark:border-slate-700 dark:bg-slate-800/50">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white dark:text-white flex items-center gap-2">
              <span>📍</span> Additional Details
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {/* State */}
              <div className="space-y-2">
                <label htmlFor="state" className="block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  id="state"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
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
                <label htmlFor="city" className="block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  disabled={!form.state}
                  className="w-full rounded-lg border border-slate-300 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:bg-slate-800 disabled:text-slate-500 dark:text-slate-400 dark:bg-slate-800 dark:text-white"
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
                  Languages <span className="text-red-500">*</span>
                </label>

                {/* Selected Languages Display */}
                <div className="min-h-[42px] rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 flex flex-wrap gap-2 cursor-pointer"
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}>
                  {form.selectedLanguages.length > 0 ? (
                    form.selectedLanguages.map(lang => (
                      <span key={lang} className="inline-flex items-center gap-1 rounded-md bg-blue-100 dark:bg-blue-900/40 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-200">
                        {lang}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLanguage(lang);
                          }}
                          className="text-blue-900 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-100"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500 dark:text-slate-400">Select languages you speak</span>
                  )}
                </div>

                {/* Language Dropdown */}
                {showLanguageDropdown && (
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-300 bg-white dark:bg-slate-900 shadow-lg">
                    {availableLanguages.map(language => (
                      <label
                        key={language}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.selectedLanguages.includes(language)}
                          onChange={() => toggleLanguage(language)}
                          className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                        />
                        <span className="text-sm text-slate-900 dark:text-white">{language}</span>
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
              <h3 className="text-base font-semibold text-slate-900 dark:text-white dark:text-white flex items-center gap-2">
                <span>👨‍⚖️</span> Professional Information
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Experience Years */}
                <div className="space-y-2">
                  <label htmlFor="experienceYears" className="block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
                    Years of Experience
                  </label>
                  <input
                    id="experienceYears"
                    name="experienceYears"
                    type="number"
                    min="0"
                    value={form.experienceYears}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g., 5"
                  />
                </div>

                {/* Specialization */}
                <div className="space-y-2">
                  <label htmlFor="specialization" className="block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
                    Specialization
                  </label>
                  <input
                    id="specialization"
                    name="specialization"
                    type="text"
                    value={form.specialization}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g., Criminal Law, Family Law"
                  />
                </div>

                {/* Bar ID Number */}
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="barIdNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
                    Bar Council ID Number
                  </label>
                  <input
                    id="barIdNumber"
                    name="barIdNumber"
                    type="text"
                    value={form.barIdNumber}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
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

            <p className="text-center text-sm text-slate-600 dark:text-slate-400 dark:text-slate-400">
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
