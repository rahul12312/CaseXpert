import React, { useState, useRef } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { 
  User, Phone, Briefcase, Scale, Building2, GraduationCap, Award, Languages, 
  Clock, FileText, Link as LinkIcon, Shield, BadgeCheck, 
  ChevronDown, ChevronUp, AlertCircle, Plus, Trash2, Camera, Upload, Save, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CollapsibleSection = ({ title, icon: Icon, children, isOpen, onToggle, errorCount = 0 }) => (
  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden mb-6 transition-all duration-300">
    <button 
      type="button" 
      onClick={onToggle}
      className="w-full flex items-center justify-between px-6 py-4 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors focus:outline-none"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
          <Icon size={20} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        {errorCount > 0 && (
          <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-full">
            <AlertCircle size={12} /> {errorCount} Error{errorCount > 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="text-slate-400">
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
    </button>
    <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
      <div className="p-6 border-t border-slate-200 dark:border-slate-800 space-y-6">
        {children}
      </div>
    </div>
  </div>
);

const Input = React.forwardRef(({ label, error, required, type = "text", ...rest }, ref) => (
  <div className="space-y-1.5 w-full">
    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input 
      type={type} 
      ref={ref}
      className={`w-full rounded-lg border ${error ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'} bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 dark:text-white transition-all`}
      {...rest}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
  </div>
));
Input.displayName = 'Input';

const Select = React.forwardRef(({ label, error, required, options, ...rest }, ref) => (
  <div className="space-y-1.5 w-full">
    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select 
      ref={ref}
      className={`w-full rounded-lg border ${error ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'} bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 dark:text-white transition-all`}
      {...rest}
    >
      <option value="">Select an option</option>
      {options.map(opt => <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>)}
    </select>
    {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
  </div>
));
Select.displayName = 'Select';

const Textarea = React.forwardRef(({ label, error, required, ...rest }, ref) => (
  <div className="space-y-1.5 w-full">
    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea 
      ref={ref}
      className={`w-full rounded-lg border ${error ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'} bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 dark:text-white transition-all min-h-[100px]`}
      {...rest}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
  </div>
));
Textarea.displayName = 'Textarea';

// Simple Multi-Select Implementation
const MultiSelect = ({ label, options, selected, onChange, required, error }) => {
  const toggleOption = (value) => {
    const newSelected = selected.includes(value) 
      ? selected.filter(item => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const isSelected = selected.includes(opt);
          return (
            <button
              type="button"
              key={opt}
              onClick={() => toggleOption(opt)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                isSelected 
                  ? 'bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-300 font-medium' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
    </div>
  );
};

const FileUpload = ({ label, required, onChange, error, accept }) => (
  <div className="space-y-1.5 w-full">
    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
      <div className="space-y-1 text-center">
        <Upload className="mx-auto h-12 w-12 text-slate-400" />
        <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
          <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
            <span>Upload a file</span>
            <input type="file" className="sr-only" accept={accept} onChange={(e) => onChange(e.target.files[0])} />
          </label>
        </div>
        <p className="text-xs text-slate-500">PDF, PNG, JPG up to 10MB</p>
      </div>
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
  </div>
);

const Toggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
      {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
    </div>
    <label className="relative inline-flex cursor-pointer items-center">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className="peer h-6 w-11 rounded-full bg-slate-200 dark:bg-slate-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
    </label>
  </div>
);

// Form Data Options
const practiceAreaOptions = ["Civil Law", "Criminal Law", "Family Law", "Corporate Law", "Property Law", "Cyber Law", "Labour Law", "Consumer Law", "Tax Law", "Intellectual Property", "Arbitration", "Banking & Finance", "Immigration", "Environmental Law", "Other"];
const courtsOptions = ["Supreme Court", "High Court", "District Court", "Family Court", "Consumer Court", "Sessions Court", "Tribunal", "Other"];
const languageOptions = ["English", "Hindi", "Marathi", "Tamil", "Telugu", "Gujarati", "Bengali", "Kannada", "Malayalam", "Punjabi", "Urdu", "Others"];

const LawyerProfileSettings = () => {
  const { user } = useAuth();
  const [openSections, setOpenSections] = useState({
    personal: true, contact: false, professional: false, practice: false, courts: false,
    education: false, certifications: false, languages: false, availability: false, 
    documents: false, social: false, account: false, status: false
  });
  const [profilePreview, setProfilePreview] = useState(null);
  
  const { register, control, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm({
    defaultValues: {
      fullName: user?.name || '',
      email: user?.email || '',
      practiceAreas: [],
      courtsPracticing: [],
      languages: [],
      education: [{ degree: '', college: '', year: '' }],
      certifications: [],
      profileStatus: 'active',
      profileVisibility: 'public'
    }
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: "education" });
  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({ control, name: "certifications" });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getSectionErrors = (fields) => {
    return fields.reduce((count, field) => count + (errors[field] ? 1 : 0), 0);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePreview(URL.createObjectURL(file));
      setValue('profilePhoto', file);
    }
  };

  const onSubmit = async (data) => {
    console.log("Form Submitted:", data);
    // Mock save
    return new Promise(resolve => {
      setTimeout(() => {
        toast.success("Profile updated successfully!");
        resolve();
      }, 1500);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16 md:pt-20 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* Header & Sticky Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-[60px] md:top-[72px] z-20 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Profile Settings</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your professional identity and preferences.</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors">
              Save Draft
            </button>
            <button 
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm disabled:opacity-70 transition-colors"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Update Profile
            </button>
          </div>
        </div>

        <form className="space-y-2">
          
          {/* 1. Personal Information */}
          <CollapsibleSection title="Personal Information" icon={User} isOpen={openSections.personal} onToggle={() => toggleSection('personal')} errorCount={getSectionErrors(['fullName', 'barRegNo', 'yearsExperience'])}>
            <div className="flex flex-col sm:flex-row gap-8 items-start mb-6">
              <div className="flex flex-col items-center gap-3">
                <div className="relative h-32 w-32 rounded-full border-4 border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 overflow-hidden group cursor-pointer">
                  {profilePreview ? (
                    <img src={profilePreview} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-full w-full p-6 text-slate-300" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" />
                  </div>
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handlePhotoUpload} />
                </div>
                <span className="text-xs text-slate-500 font-medium">Profile Photo</span>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                <Input label="Full Name" required {...register("fullName", { required: "Full name is required" })} error={errors.fullName} />
                <Input label="Bar Council Registration Number" required {...register("barRegNo", { required: "Registration number is required" })} error={errors.barRegNo} />
                <Input label="Date of Birth" type="date" {...register("dob")} error={errors.dob} />
                <Select label="Gender" options={["Male", "Female", "Other", "Prefer not to say"]} {...register("gender")} error={errors.gender} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input label="Aadhaar / PAN (Optional)" {...register("govtId")} error={errors.govtId} />
              <Input label="Years of Experience" type="number" required {...register("yearsExperience", { required: "Experience is required", min: 0 })} error={errors.yearsExperience} />
              <div className="sm:col-span-2">
                <Textarea label="Bio / About Lawyer" placeholder="Tell potential clients about your expertise and background..." {...register("bio")} error={errors.bio} />
              </div>
            </div>
          </CollapsibleSection>

          {/* 2. Contact Information */}
          <CollapsibleSection title="Contact Information" icon={Phone} isOpen={openSections.contact} onToggle={() => toggleSection('contact')} errorCount={getSectionErrors(['email', 'mobile', 'officeAddress', 'city', 'state', 'pinCode'])}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input label="Email Address" type="email" required {...register("email", { required: "Email is required" })} error={errors.email} />
              <Input label="Mobile Number" type="tel" required {...register("mobile", { required: "Mobile is required" })} error={errors.mobile} />
              <Input label="Alternate Mobile Number" type="tel" {...register("altMobile")} />
              <Input label="Office Phone" type="tel" {...register("officePhone")} />
              <div className="sm:col-span-2">
                <Input label="Office Address" required {...register("officeAddress", { required: "Office address is required" })} error={errors.officeAddress} />
              </div>
              <Input label="City" required {...register("city", { required: "City is required" })} error={errors.city} />
              <Input label="State" required {...register("state", { required: "State is required" })} error={errors.state} />
              <Input label="PIN Code" required {...register("pinCode", { required: "PIN Code is required" })} error={errors.pinCode} />
              <Input label="Country" defaultValue="India" {...register("country")} />
            </div>
          </CollapsibleSection>

          {/* 3. Professional Information */}
          <CollapsibleSection title="Professional Information" icon={Briefcase} isOpen={openSections.professional} onToggle={() => toggleSection('professional')} errorCount={getSectionErrors(['barState', 'enrollmentDate'])}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input label="Law Firm Name (if any)" {...register("lawFirm")} />
              <Select label="Designation" options={["Advocate", "Senior Advocate", "Legal Consultant", "Partner", "Associate"]} {...register("designation")} />
              <Select label="Practice Type" options={["Independent", "Law Firm", "Corporate"]} {...register("practiceType")} />
              <Input label="Bar Council State" required {...register("barState", { required: "Bar Council State is required" })} error={errors.barState} />
              <Input label="Enrollment Date" type="date" required {...register("enrollmentDate", { required: "Enrollment Date is required" })} error={errors.enrollmentDate} />
              <Select label="License Status" options={["Active", "Suspended", "Retired"]} defaultValue="Active" {...register("licenseStatus")} />
              <Input label="Court Registration Number" {...register("courtRegNo")} />
              <Input label="GST Number (Optional)" {...register("gstNumber")} />
            </div>
          </CollapsibleSection>

          {/* 4. Practice Areas */}
          <CollapsibleSection title="Practice Areas" icon={Scale} isOpen={openSections.practice} onToggle={() => toggleSection('practice')}>
            <Controller
              name="practiceAreas"
              control={control}
              render={({ field }) => (
                <MultiSelect 
                  label="Select your areas of expertise" 
                  options={practiceAreaOptions} 
                  selected={field.value} 
                  onChange={field.onChange} 
                />
              )}
            />
          </CollapsibleSection>

          {/* 5. Courts Practicing In */}
          <CollapsibleSection title="Courts Practicing In" icon={Building2} isOpen={openSections.courts} onToggle={() => toggleSection('courts')}>
            <Controller
              name="courtsPracticing"
              control={control}
              render={({ field }) => (
                <MultiSelect 
                  label="Select the courts you practice in" 
                  options={courtsOptions} 
                  selected={field.value} 
                  onChange={field.onChange} 
                />
              )}
            />
          </CollapsibleSection>

          {/* 6. Education */}
          <CollapsibleSection title="Education" icon={GraduationCap} isOpen={openSections.education} onToggle={() => toggleSection('education')}>
            <div className="space-y-4">
              {eduFields.map((field, index) => (
                <div key={field.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-800/20 relative group">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Degree (e.g. LLB, LLM)" {...register(`education.${index}.degree`)} />
                    <Input label="College / University" {...register(`education.${index}.college`)} />
                    <Input label="Specialization" {...register(`education.${index}.specialization`)} />
                    <Input label="Graduation Year" type="number" {...register(`education.${index}.year`)} />
                  </div>
                  {index > 0 && (
                    <button type="button" onClick={() => removeEdu(index)} className="absolute top-2 right-2 p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => appendEdu({ degree: '', college: '', year: '' })} className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-4 py-2 rounded-lg transition-colors">
                <Plus size={16} /> Add Another Degree
              </button>
            </div>
          </CollapsibleSection>

          {/* 7. Certifications */}
          <CollapsibleSection title="Certifications" icon={Award} isOpen={openSections.certifications} onToggle={() => toggleSection('certifications')}>
            <div className="space-y-4">
              {certFields.map((field, index) => (
                <div key={field.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-800/20 relative group">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Certificate Name" {...register(`certifications.${index}.name`)} />
                    <Input label="Issued By" {...register(`certifications.${index}.issuer`)} />
                    <Input label="Issue Date" type="date" {...register(`certifications.${index}.date`)} />
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload Certificate</label>
                      <input type="file" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-800 dark:file:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 bg-white dark:bg-slate-900" />
                    </div>
                  </div>
                  <button type="button" onClick={() => removeCert(index)} className="absolute top-2 right-2 p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => appendCert({ name: '', issuer: '', date: '' })} className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-4 py-2 rounded-lg transition-colors">
                <Plus size={16} /> Add Certification
              </button>
            </div>
          </CollapsibleSection>

          {/* 8. Languages */}
          <CollapsibleSection title="Languages" icon={Languages} isOpen={openSections.languages} onToggle={() => toggleSection('languages')}>
            <Controller
              name="languages"
              control={control}
              render={({ field }) => (
                <MultiSelect 
                  label="Select languages you are fluent in" 
                  options={languageOptions} 
                  selected={field.value} 
                  onChange={field.onChange} 
                />
              )}
            />
          </CollapsibleSection>

          {/* 9. Availability */}
          <CollapsibleSection title="Availability & Fees" icon={Clock} isOpen={openSections.availability} onToggle={() => toggleSection('availability')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input label="Office Timings" placeholder="e.g. 10:00 AM - 6:00 PM" {...register("officeTimings")} />
              <Input label="Available Days" placeholder="e.g. Mon-Fri" {...register("availableDays")} />
              <Input label="Consultation Fee (₹)" type="number" placeholder="500" {...register("consultationFee")} />
              
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
                <Controller name="onlineConsultation" control={control} render={({ field }) => (
                  <Toggle label="Online Consultation" description="Available for video/audio calls" checked={field.value} onChange={field.onChange} />
                )} />
                <Controller name="emergencyContact" control={control} render={({ field }) => (
                  <Toggle label="Emergency Contact" description="Available for urgent legal matters" checked={field.value} onChange={field.onChange} />
                )} />
              </div>
            </div>
          </CollapsibleSection>

          {/* 10. Documents */}
          <CollapsibleSection title="Verification Documents" icon={FileText} isOpen={openSections.documents} onToggle={() => toggleSection('documents')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FileUpload label="Bar Council Certificate" required />
              <FileUpload label="Government ID (Aadhaar/PAN)" />
              <FileUpload label="Professional Resume" />
              <FileUpload label="Digital Signature" />
            </div>
          </CollapsibleSection>

          {/* 11. Social & Professional Links */}
          <CollapsibleSection title="Social & Professional Links" icon={LinkIcon} isOpen={openSections.social} onToggle={() => toggleSection('social')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input label="LinkedIn Profile" placeholder="https://linkedin.com/in/..." {...register("linkedin")} />
              <Input label="Personal Website" placeholder="https://..." {...register("website")} />
              <Input label="Facebook Page" placeholder="https://facebook.com/..." {...register("facebook")} />
              <Input label="Twitter / X" placeholder="https://twitter.com/..." {...register("twitter")} />
            </div>
          </CollapsibleSection>

          {/* 12. Account Settings */}
          <CollapsibleSection title="Account Settings" icon={Shield} isOpen={openSections.account} onToggle={() => toggleSection('account')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input label="Username" {...register("username")} />
                <button type="button" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">Change Password</button>
              </div>
              <div className="space-y-2 border-l border-slate-200 dark:border-slate-800 pl-6">
                <Controller name="twoFactorAuth" control={control} render={({ field }) => (
                  <Toggle label="Two-Factor Authentication" checked={field.value} onChange={field.onChange} />
                )} />
                <Controller name="emailNotifs" control={control} render={({ field }) => (
                  <Toggle label="Email Notifications" checked={field.value} onChange={field.onChange} />
                )} />
                <Controller name="smsNotifs" control={control} render={({ field }) => (
                  <Toggle label="SMS Notifications" checked={field.value} onChange={field.onChange} />
                )} />
              </div>
            </div>
          </CollapsibleSection>

          {/* 13. Profile Status */}
          <CollapsibleSection title="Profile Status & Visibility" icon={BadgeCheck} isOpen={openSections.status} onToggle={() => toggleSection('status')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Account Status</label>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    {['active', 'inactive'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setValue('profileStatus', status)}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${watch('profileStatus') === status ? 'bg-white shadow dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Profile Visibility</label>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    {['public', 'private'].map((vis) => (
                      <button
                        key={vis}
                        type="button"
                        onClick={() => setValue('profileVisibility', vis)}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${watch('profileVisibility') === vis ? 'bg-white shadow dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                      >
                        {vis}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center p-6 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-800/20">
                <BadgeCheck size={48} className="text-emerald-500 mb-2" />
                <h4 className="font-semibold text-slate-900 dark:text-white">Verified Lawyer Badge</h4>
                <p className="text-xs text-center text-slate-500 mt-2">Your profile is currently under review by our admin team for verification.</p>
              </div>
            </div>
          </CollapsibleSection>

        </form>
      </div>
    </div>
  );
};

export default LawyerProfileSettings;
