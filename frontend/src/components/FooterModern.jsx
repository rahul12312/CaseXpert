import { Link } from 'react-router-dom';

const FooterModern = () => {

  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-900 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400 md:grid-cols-[2fr,1fr,1fr,1fr]">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-primary-600 text-white">
                <span className="text-sm font-semibold">⚖️</span>
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white dark:text-white">
                Case<span className="text-primary-600 dark:text-primary-400">Xpert</span>
              </span>
            </div>
            <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400">
              AI-powered legal assistance platform connecting clients with verified lawyers across India.
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500">
              contact@casexpert.com · +91 7845784578
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-400">
              Product
            </h3>
            <ul className="space-y-1">
              <li><Link to="/assistant" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">AI Assistant</Link></li>
              <li><Link to="/cases" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Case Tracker</Link></li>
              <li><Link to="/lawyers" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Find Lawyers</Link></li>
              <li><Link to="/consultation" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Video Consultation</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-400">
              Company
            </h3>
            <ul className="space-y-1">
              <li><Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</Link></li>
              <li><Link to="/careers" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Careers</Link></li>
              <li><Link to="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-400">
              Legal
            </h3>
            <ul className="space-y-1">
              <li><Link to="/legal/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/legal/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/legal/cookies" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Cookie Policy</Link></li>
              <li><Link to="/legal/disclaimer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Disclaimer</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-6 border-t border-slate-200 dark:border-slate-700 dark:border-slate-800 pt-3 text-center text-[11px] text-slate-400 dark:text-slate-500">
          <p>
            © {new Date().getFullYear()} CaseXpert. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterModern;
