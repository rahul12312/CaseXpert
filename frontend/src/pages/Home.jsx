import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FAQSection from '../components/FAQSection';
import {
  Bot, Briefcase, Gavel, Video, FileText,
  BarChart2, BookOpen, ArrowRight, Lock
} from 'lucide-react';

const FadeIn = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        } ${className}`}
    >
      {children}
    </div>
  );
};

const FeatureSection = ({ feature, index, isAuthenticated }) => {
  const isEven = index % 2 === 0;
  const destination = isAuthenticated ? feature.link : '/login';

  return (
    <div className={`flex flex-col-reverse ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 md:gap-24 py-8`}>
      {/* Text Content */}
      <div className="flex-1 w-full space-y-8">
        <FadeIn>
          <div className="flex items-center gap-2 mb-4">
            <span className={`h-8 w-1 rounded-full bg-gradient-to-b ${feature.gradient}`}></span>
            <span className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{feature.tagline}</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
            <Link
              to={destination}
              className="hover:text-blue-700 transition-colors cursor-pointer inline-flex items-start gap-3"
              title={`Open ${feature.title}`}
            >
              {feature.title}
            </Link>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
            {feature.description}
          </p>

          <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Capabilities Column */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className={`w-1.5 h-1.5 rounded-sm bg-slate-400`}></div>
                  Core Competencies
                </h4>
                <ul className="space-y-3">
                  {feature.useCases.map((useCase, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed group">
                      <div className={`mt-1.5 w-1 h-1 rounded-full bg-slate-300 group-hover:bg-slate-50 dark:bg-slate-9500 transition-colors`}></div>
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Value Column */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className={`w-1.5 h-1.5 rounded-sm bg-slate-400`}></div>
                  Strategic Value
                </h4>
                <ul className="space-y-3">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed group">
                      <div className={`mt-1.5 w-1 h-1 rounded-full bg-slate-300 group-hover:bg-slate-50 dark:bg-slate-9500 transition-colors`}></div>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-10 flex items-center gap-4">
            <Link
              to={destination}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-md transition-all hover:scale-105 hover:shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
            >
              <span>Try it Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>
      </div>

      <div className="flex-1 w-full">
        <FadeIn delay={200}>
          <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl group transform hover:-translate-y-2 transition-transform duration-500 border border-slate-100 dark:border-slate-800 dark:border-slate-800">
            <img
              src={feature.image}
              alt={feature.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Subtle Overlay to ensure professional look */}
            <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/5 transition-colors"></div>

            {/* Optional: Keep Icon small in corner if needed, or remove completely. Using just image as requested. */}
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

const Home = () => {
  const { isAuthenticated, isLawyer } = useAuth();

  const features = [
    {
      title: "AI Legal Assistant",
      tagline: "24/7 Intelligence",
      description: "Your responsive legal companion capable of answering queries, summarizing complex documents, and providing preliminary legal guidance whenever you need it.",
      useCases: ["Document Summarization", "Quick Legal Research", "Case Strategy Planning"],
      benefits: ["Instant Availability", "Cost-effective", "Reduces Research Time"],
      link: "/assistant",
      icon: Bot,
      gradient: "from-violet-600 to-indigo-600",
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Case Tracker",
      tagline: "Centralized Management",
      description: "A powerful dashboard to monitor all your legal matters. Track hearing dates, filing statuses, and organize case documents in one secure location.",
      useCases: ["Litigation Management", "Hearing Reminders", "Document Archival"],
      benefits: ["Real-time Updates", "Never Miss a Deadline", "Organized Evidence"],
      link: "/cases",
      icon: Briefcase,
      gradient: "from-blue-600 to-cyan-600",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Lawyer Marketplace",
      tagline: "Expert Connection",
      description: "Connect with a verified network of top-tier legal professionals. Filter by specialization, experience, location, and budget to find your perfect legal match.",
      useCases: ["Finding Specialists", "Comparing Fees", "Reading Verified Reviews"],
      benefits: ["Verified Credentials", "Transparent Pricing", "Diverse Expertise"],
      link: "/lawyers",
      icon: Gavel,
      gradient: "from-amber-500 to-orange-600",
      image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Video Consultation",
      tagline: "Seamless Communication",
      description: "Secure, high-quality video conferencing built directly into the platform. Conduct confidential client-lawyer meetings without needing external software.",
      useCases: ["Remote Consultations", "Urgent Advice", "Client Interviews"],
      benefits: ["End-to-End Encryption", "Integrated Scheduling", "Time Saving"],
      link: "/consultation",
      icon: Video,
      gradient: "from-rose-500 to-pink-600",
      image: "https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Document Drafting & Secure Storage",
      tagline: "Automated Drafting",
      description: "Generate legally binding documents in minutes. Our automated engine helps you draft contracts, agreements, and notices using lawyer-approved templates.",
      useCases: ["Rental Agreements", "NDAs & Contracts", "Legal Notices"],
      benefits: ["Error-free Drafts", "Instant Generation", "Compliance Ready"],
      link: "/documents",
      icon: FileText,
      gradient: "from-emerald-500 to-green-600",
      image: "https://images.unsplash.com/photo-1618044733300-9472054094ee?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Advanced Reports",
      tagline: "Data Insights",
      description: "Gain deep insights into your legal portfolio with AI-powered analytics. Visualize case progress, expenditure, and outcome probabilities through interactive charts.",
      useCases: ["Spending Analysis", "Outcome Prediction", "Performance Tracking"],
      benefits: ["Data-driven Decisions", "Visual Clarity", "Strategic Forecasting"],
      link: "/reports",
      icon: BarChart2,
      gradient: "from-fuchsia-600 to-purple-600",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Knowledge Hub",
      tagline: "Stay Informed",
      description: "A curated library of the latest legal news, amendments, and expert articles. Keep yourself updated with the changing legal landscape.",
      useCases: ["Legal Research", "Staying Updated", "Educational Reading"],
      benefits: ["Curated Content", "Daily Updates", "Reliable Sources"],
      link: "/news",
      icon: BookOpen,
      gradient: "from-sky-500 to-blue-600",
      image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <div className="flex flex-1 flex-col gap-12 md:gap-32 pb-20 w-full max-w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative mt-2 md:mt-4 flex min-h-[400px] md:min-h-[500px] items-center justify-center overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-900 px-4 sm:px-8 py-12 text-white shadow-2xl transition-all duration-500 hover:shadow-blue-500/10">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -ml-32 -mb-32"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">
              <span className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></span>
              Legal Platform
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white">
              CaseXpert — AI Legal Platform
            </h1>

            <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg md:text-xl leading-relaxed text-slate-300 font-medium">
              Your intelligent legal companion — AI-powered assistance, expert lawyers, and smart tools for every legal need.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to={isAuthenticated ? '/assistant' : '/register'}
                className="group relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 px-10 py-5 font-bold text-slate-950 shadow-xl transition-all hover:scale-[1.02] hover:shadow-yellow-500/30 active:scale-95 w-full sm:w-auto"
              >
                <span className="relative z-10">Try AI Assistant Now</span>
                <div className="absolute inset-0 rounded-2xl bg-white dark:bg-slate-900 opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features Zig-Zag Layout */}
      <section className="px-2 sm:px-6 md:px-12 w-full space-y-16 md:space-y-24">
        <div className="text-center max-w-3xl mx-auto px-4">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Everything You Need for Legal Success
            </h2>
            <p className="mt-4 text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium">
              A complete legal platform from consultation to case management.
            </p>
          </FadeIn>
        </div>

        <div className="space-y-24 md:space-y-32">
          {features.map((feature, index) => (
            <FeatureSection key={index} feature={feature} index={index} isAuthenticated={isAuthenticated} />
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <div className="w-full px-4">
        <FAQSection />
      </div>

      {/* Final CTA */}
      <section className="px-2 sm:px-4 w-full">
        <div className="rounded-[2.5rem] md:rounded-[3rem] bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-900 px-6 py-16 text-white shadow-2xl text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>

          <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-black tracking-tight md:text-5xl">
              Ready to Protect Your Rights?
            </h2>
            <p className="text-lg text-slate-100/80 max-w-2xl mx-auto font-medium">
              Join thousands of users who trust CaseXpert for their legal needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to={isAuthenticated ? (isLawyer() ? '/lawyer/dashboard' : '/assistant') : '/register'}
                className="inline-flex items-center rounded-2xl bg-amber-400 px-10 py-5 font-bold text-slate-950 shadow-xl hover:bg-amber-300 transition-all transform hover:scale-105 w-full sm:w-auto justify-center"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
