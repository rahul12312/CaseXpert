import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Briefcase, User, Scale, Building2, Calendar, FileText, 
  CheckCircle2, Video, UploadCloud, ListTodo, History, 
  IndianRupee, BellRing, Save, Send, RotateCcw, X, Plus,
  ChevronDown, AlertCircle, File, Download, Trash2, Clock
} from 'lucide-react';
import api from '../lib/api';
import Toast from '../components/Toast';

// ---------------------------------------------------------
// ZOD SCHEMA DEFINITION
// ---------------------------------------------------------
const caseSchema = z.object({
  // Section 1: Case Information
  title: z.string().min(5, "Title must be at least 5 characters"),
  case_number: z.string().min(3, "Case number is required"),
  case_type: z.string().min(1, "Case type is required"),
  priority: z.string().min(1, "Priority is required"),
  description: z.string().optional(),

  // Section 2: Client Info
  client_name: z.string().min(2, "Client name must be at least 2 characters").nonempty("Client name is required"),
  client_email: z.string().regex(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, "Client email must be a @gmail.com address").nonempty("Client email is required"),
  client_phone: z.string().regex(/^\d{10}$/, "Mobile number must be exactly 10 digits (no characters allowed)").nonempty("Client phone is required"),
  client_address: z.string().min(5, "Address must be at least 5 characters").optional().or(z.literal("")),

  // Section 3: Advocate Info
  lawyer_id: z.string().optional(),
  lawyer_email: z.string().regex(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, "Lawyer email must be a @gmail.com address").optional().or(z.literal("")),
  lawyer_phone: z.string().regex(/^\d{10}$/, "Lawyer mobile number must be exactly 10 digits (no characters allowed)").optional().or(z.literal("")),
  team_members: z.string().optional(),

  // Section 4: Court Details
  court_name: z.string().optional(),
  court_location: z.string().optional(),
  judge_name: z.string().optional(),
  court_room: z.string().optional(),

  // Section 5: Important Dates
  filing_date: z.string().optional(),
  registration_date: z.string().optional(),
  last_hearing_date: z.string().optional(),
  next_hearing_date: z.string().optional(),
  expected_closure_date: z.string().optional(),

  // Section 6: Case Status
  status: z.string().min(1, "Status is required"),

  // Section 7: Hearing Info
  hearing_date: z.string().optional(),
  hearing_notes: z.string().optional(),
  hearing_outcome: z.string().optional(),
  next_action: z.string().optional(),

  // Section 11: Financial Info
  total_fees: z.coerce.number().min(0).optional(),
  paid_amount: z.coerce.number().min(0).optional(),
  payment_status: z.string().optional(),

  // Section 12: Notifications
  reminder_hearing: z.boolean().default(false),
  reminder_document: z.boolean().default(false),
  reminder_payment: z.boolean().default(false),
  reminder_task: z.boolean().default(false),
});

// ---------------------------------------------------------
// REUSABLE UI COMPONENTS
// ---------------------------------------------------------

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="mb-6 flex items-start gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
      <Icon size={24} />
    </div>
    <div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
      {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
    </div>
  </div>
);

const Label = ({ children, required }) => (
  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const InputError = ({ error }) => {
  if (!error) return null;
  return <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {error.message}</p>;
};

// ---------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------
export default function CreateCase() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const assignedLawyerId = queryParams.get('lawyer_id');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [tasks, setTasks] = useState([]);
  
  // Timeline mock data
  const timelineEvents = [
    { id: 1, date: new Date().toLocaleDateString(), user: "System", status: "New", note: "Case file initialized" }
  ];

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      title: '',
      case_number: `CN-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      case_type: 'civil',
      priority: 'medium',
      status: 'New',
      lawyer_id: assignedLawyerId || '',
      total_fees: 0,
      paid_amount: 0,
      reminder_hearing: false,
      reminder_document: false,
      reminder_payment: false,
      reminder_task: false
    }
  });

  const totalFees = watch('total_fees') || 0;
  const paidAmount = watch('paid_amount') || 0;
  const remainingAmount = Math.max(0, totalFees - paidAmount);

  // File Upload Handlers
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newFiles = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type || 'Document',
      date: new Date().toLocaleDateString()
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Task Handlers
  const addTask = () => {
    setTasks(prev => [...prev, { id: Date.now(), name: '', assignedTo: '', dueDate: '', status: 'Pending', remarks: '' }]);
  };

  const updateTask = (id, field, value) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Map advanced fields to the current supported backend schema
      const payload = {
        title: data.title,
        case_number: data.case_number,
        case_type: data.case_type,
        priority: data.priority,
        // We pack additional unsupported data into description for now until backend supports it
        description: data.description || '',
        court_name: data.court_name || undefined,
        filing_date: data.filing_date || undefined,
        lawyer_id: data.lawyer_id ? parseInt(data.lawyer_id, 10) : undefined
      };

      const response = await api.post('/cases', payload);
      
      if (response.data.success) {
        setToast({ show: true, type: 'success', message: 'Case created successfully!' });
        setTimeout(() => navigate('/cases'), 2000);
      }
    } catch (error) {
      console.error(error);
      setToast({ show: true, type: 'error', message: error.response?.data?.message || 'Failed to create case. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:bg-slate-950 [color-scheme:light] dark:[color-scheme:dark]";
  const selectClass = "w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white appearance-none [color-scheme:light] dark:[color-scheme:dark]";

  return (
    <div className="min-h-screen bg-slate-50/50 pb-32 dark:bg-slate-950">
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ show: false, type: '', message: '' })}
          duration={3000}
        />
      )}

      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-8 dark:bg-slate-900 dark:border-slate-800">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Create New Case Tracker</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Initialize a comprehensive legal workspace with advanced tracking capabilities.</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* Section 1: Case Information */}
          <Card className="p-6 sm:p-8">
            <SectionHeader icon={Briefcase} title="1. Case Information" description="Fundamental details identifying this legal matter." />
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label required>Case Title</Label>
                <input {...register('title')} placeholder="e.g. Smith vs. Jones Property Dispute" className={inputClass} />
                <InputError error={errors.title} />
              </div>
              
              <div>
                <Label required>Case Number (Auto-generated)</Label>
                <input {...register('case_number')} readOnly className={`${inputClass} opacity-70 cursor-not-allowed`} />
                <InputError error={errors.case_number} />
              </div>

              <div>
                <Label required>Case Type</Label>
                <div className="relative">
                  <select {...register('case_type')} className={selectClass}>
                    <option value="civil">Civil</option>
                    <option value="criminal">Criminal</option>
                    <option value="family">Family</option>
                    <option value="property">Property</option>
                    <option value="corporate">Corporate</option>
                    <option value="labor">Labor</option>
                    <option value="consumer">Consumer</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16}/>
                </div>
                <InputError error={errors.case_type} />
              </div>

              <div>
                <Label required>Case Priority</Label>
                <div className="relative">
                  <select {...register('priority')} className={selectClass}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16}/>
                </div>
                <InputError error={errors.priority} />
              </div>

              <div className="sm:col-span-2">
                <Label>Case Description</Label>
                <textarea {...register('description')} rows={4} placeholder="Briefly summarize the facts and core issues..." className={inputClass} />
              </div>
            </div>
          </Card>

          {/* Section 2: Client Information */}
          <Card className="p-6 sm:p-8">
            <SectionHeader icon={User} title="2. Client Information" description="Contact details of the primary client." />
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label required>Client Name</Label>
                <input {...register('client_name')} placeholder="Full Name" className={inputClass} />
                <InputError error={errors.client_name} />
              </div>
              <div>
                <Label required>Email Address</Label>
                <input type="email" {...register('client_email')} placeholder="client@example.com" className={inputClass} />
                <InputError error={errors.client_email} />
              </div>
              <div>
                <Label required>Phone Number</Label>
                <input 
                  type="tel" 
                  {...register('client_phone', {
                    onChange: (e) => {
                      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    }
                  })} 
                  placeholder="9876543210" 
                  className={inputClass} 
                />
                <InputError error={errors.client_phone} />
              </div>
              <div className="sm:col-span-2">
                <Label>Address</Label>
                <textarea {...register('client_address')} rows={2} placeholder="Residential or Corporate Address" className={inputClass} />
                <InputError error={errors.client_address} />
              </div>
            </div>
          </Card>

          {/* Section 3: Advocate Information */}
          <Card className="p-6 sm:p-8">
            <SectionHeader icon={Scale} title="3. Advocate Information" description="Legal team assigned to handle this case." />
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label>Assigned Lawyer ID</Label>
                <input {...register('lawyer_id')} placeholder="ID" className={inputClass} />
                <InputError error={errors.lawyer_id} />
              </div>
              <div>
                <Label>Lawyer Email</Label>
                <input type="email" {...register('lawyer_email')} placeholder="advocate@lawfirm.com" className={inputClass} />
                <InputError error={errors.lawyer_email} />
              </div>
              <div>
                <Label>Contact Number</Label>
                <input 
                  type="tel" 
                  {...register('lawyer_phone', {
                    onChange: (e) => {
                      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    }
                  })} 
                  placeholder="9876543210" 
                  className={inputClass} 
                />
                <InputError error={errors.lawyer_phone} />
              </div>
              <div>
                <Label>Legal Team Members</Label>
                <input {...register('team_members')} placeholder="Comma separated names" className={inputClass} />
              </div>
            </div>
          </Card>

          {/* Section 4: Court Details */}
          <Card className="p-6 sm:p-8">
            <SectionHeader icon={Building2} title="4. Court Details" description="Jurisdiction and venue information." />
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label>Court Name</Label>
                <input {...register('court_name')} placeholder="e.g. Supreme Court" className={inputClass} />
              </div>
              <div>
                <Label>Court Location</Label>
                <input {...register('court_location')} placeholder="City, State" className={inputClass} />
              </div>
              <div>
                <Label>Judge Name</Label>
                <input {...register('judge_name')} placeholder="Hon'ble Justice Name" className={inputClass} />
              </div>
              <div>
                <Label>Court Room Number</Label>
                <input {...register('court_room')} placeholder="e.g. Room 14B" className={inputClass} />
              </div>
            </div>
          </Card>

          {/* Section 5: Important Dates */}
          <Card className="p-6 sm:p-8">
            <SectionHeader icon={Calendar} title="5. Important Dates" description="Critical timeline markers for this case." />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label>Filing Date</Label>
                <input type="date" {...register('filing_date')} className={inputClass} />
              </div>
              <div>
                <Label>Registration Date</Label>
                <input type="date" {...register('registration_date')} className={inputClass} />
              </div>
              <div>
                <Label>Last Hearing Date</Label>
                <input type="date" {...register('last_hearing_date')} className={inputClass} />
              </div>
              <div>
                <Label>Next Hearing Date</Label>
                <input type="date" {...register('next_hearing_date')} className={inputClass} />
              </div>
              <div>
                <Label>Expected Closure</Label>
                <input type="date" {...register('expected_closure_date')} className={inputClass} />
              </div>
            </div>
          </Card>

          {/* Section 6 & 7: Status & Hearing */}
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="p-6 sm:p-8">
              <SectionHeader icon={CheckCircle2} title="6. Status Tracking" description="Current phase of the litigation." />
              <Label required>Case Status</Label>
              <div className="relative">
                <select {...register('status')} className={selectClass}>
                  <option value="New">New</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Filed">Filed</option>
                  <option value="Hearing Scheduled">Hearing Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending">Pending</option>
                  <option value="Adjourned">Adjourned</option>
                  <option value="Judgment Reserved">Judgment Reserved</option>
                  <option value="Closed">Closed</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16}/>
              </div>
              <InputError error={errors.status} />
            </Card>

            <Card className="p-6 sm:p-8">
              <SectionHeader icon={Video} title="7. Hearing Info" description="Latest hearing outcome." />
              <div className="space-y-4">
                <div>
                  <Label>Outcome</Label>
                  <input {...register('hearing_outcome')} placeholder="Result of last hearing" className={inputClass} />
                </div>
                <div>
                  <Label>Next Action Required</Label>
                  <input {...register('next_action')} placeholder="What needs to be done next?" className={inputClass} />
                </div>
              </div>
            </Card>
          </div>

          {/* Section 8: Document Upload */}
          <Card className="p-6 sm:p-8">
            <SectionHeader icon={UploadCloud} title="8. Document Upload" description="Secure evidentiary file storage." />
            
            <div className="mt-2 flex justify-center rounded-2xl border-2 border-dashed border-slate-300 px-6 py-10 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                <div className="mt-4 flex text-sm leading-6 text-slate-600 dark:text-slate-400 justify-center">
                  <label className="relative cursor-pointer rounded-md font-semibold text-blue-600 focus-within:outline-none hover:text-blue-500">
                    <span>Upload files</span>
                    <input type="file" multiple className="sr-only" onChange={handleFileUpload} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-slate-500">PDF, DOCX, JPG, PNG up to 10MB</p>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-6 border rounded-xl overflow-hidden dark:border-slate-800">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">File Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white hidden sm:table-cell">Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white hidden md:table-cell">Size</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {uploadedFiles.map((file) => (
                      <tr key={file.id}>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-300 flex items-center gap-2">
                          <File size={16} className="text-slate-400"/>
                          <span className="truncate max-w-[150px] sm:max-w-xs">{file.name}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{file.date}</td>
                        <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{file.size}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button type="button" className="p-1.5 text-slate-400 hover:text-blue-600"><Download size={16}/></button>
                            <button type="button" onClick={() => removeFile(file.id)} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Section 9: Task Management */}
          <Card className="p-6 sm:p-8 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5 mb-6 gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  <ListTodo size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">9. Task Management</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Assign and track action items.</p>
                </div>
              </div>
              <button type="button" onClick={addTask} className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 transition-colors">
                <Plus size={16}/> Add Task
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                No tasks assigned yet. Click "Add Task" to create one.
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map(task => (
                  <div key={task.id} className="flex flex-col md:flex-row gap-3 p-4 border rounded-xl bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800 relative group">
                    <button type="button" onClick={() => removeTask(task.id)} className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-red-500 md:hidden group-hover:block transition-opacity">
                      <X size={16}/>
                    </button>
                    <input type="text" placeholder="Task Name" value={task.name} onChange={(e) => updateTask(task.id, 'name', e.target.value)} className={`${inputClass} md:w-1/3`} />
                    <input type="text" placeholder="Assigned To" value={task.assignedTo} onChange={(e) => updateTask(task.id, 'assignedTo', e.target.value)} className={`${inputClass} md:w-1/4`} />
                    <input type="date" value={task.dueDate} onChange={(e) => updateTask(task.id, 'dueDate', e.target.value)} className={`${inputClass} md:w-1/6`} />
                    <div className="relative md:w-1/6">
                      <select value={task.status} onChange={(e) => updateTask(task.id, 'status', e.target.value)} className={selectClass}>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14}/>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Section 10 & 11: Timeline and Financials */}
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="p-6 sm:p-8">
              <SectionHeader icon={History} title="10. Progress Updates" description="Audit log of major changes." />
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent dark:before:via-slate-700">
                {timelineEvents.map((event) => (
                  <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm dark:bg-blue-900/50 dark:border-slate-900 z-10">
                      <Clock size={16} />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{event.status}</div>
                        <time className="text-xs font-medium text-slate-500">{event.date}</time>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs">{event.note}</div>
                      <div className="text-slate-400 text-[10px] mt-2 font-semibold">By {event.user}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 sm:p-8">
              <SectionHeader icon={IndianRupee} title="11. Financial Info" description="Billing and payment tracking." />
              <div className="space-y-6">
                <div>
                  <Label>Total Case Fees</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                    <input type="number" {...register('total_fees')} className={`${inputClass} pl-10`} placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <Label>Paid Amount</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                    <input type="number" {...register('paid_amount')} className={`${inputClass} pl-10`} placeholder="0.00" />
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center dark:bg-slate-900/50 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Remaining Balance</span>
                  <span className="text-xl font-black text-rose-500 flex items-center"><IndianRupee size={20}/> {remainingAmount}</span>
                </div>
                <div>
                  <Label>Payment Status</Label>
                  <div className="relative">
                    <select {...register('payment_status')} className={selectClass}>
                      <option value="Pending">Pending</option>
                      <option value="Partial">Partial</option>
                      <option value="Paid">Fully Paid</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16}/>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Section 12: Notifications */}
          <Card className="p-6 sm:p-8">
            <SectionHeader icon={BellRing} title="12. Notifications & Reminders" description="Configure automated alerts." />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer dark:border-slate-800 dark:hover:bg-slate-900/50 transition-colors">
                <input type="checkbox" {...register('reminder_hearing')} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-600 dark:bg-slate-800" />
                <span className="font-medium text-slate-900 dark:text-slate-200">Hearing Reminder</span>
              </label>
              <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer dark:border-slate-800 dark:hover:bg-slate-900/50 transition-colors">
                <input type="checkbox" {...register('reminder_document')} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-600 dark:bg-slate-800" />
                <span className="font-medium text-slate-900 dark:text-slate-200">Document Submission</span>
              </label>
              <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer dark:border-slate-800 dark:hover:bg-slate-900/50 transition-colors">
                <input type="checkbox" {...register('reminder_payment')} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-600 dark:bg-slate-800" />
                <span className="font-medium text-slate-900 dark:text-slate-200">Payment Reminder</span>
              </label>
              <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer dark:border-slate-800 dark:hover:bg-slate-900/50 transition-colors">
                <input type="checkbox" {...register('reminder_task')} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-600 dark:bg-slate-800" />
                <span className="font-medium text-slate-900 dark:text-slate-200">Task Deadline</span>
              </label>
            </div>
          </Card>

          {/* Sticky Action Footer */}
          <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/80 p-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Unsaved Changes</p>
              </div>
              <div className="flex flex-1 md:flex-none justify-end gap-3">
                <button type="button" onClick={() => reset()} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 flex-1 md:flex-none transition-colors">
                  <RotateCcw size={16} /> Reset
                </button>
                <button type="button" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 hidden sm:flex transition-colors">
                  <Save size={16} /> Save Draft
                </button>
                <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex-1 md:flex-none shadow-lg shadow-blue-500/20 transition-all">
                  {isSubmitting ? (
                    <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/> Creating...</>
                  ) : (
                    <><Send size={16} /> Submit Case</>
                  )}
                </button>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
