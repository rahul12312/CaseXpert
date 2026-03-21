import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  Video,
  Search,
  Calendar,
  ExternalLink,
  Eye,
  Clock,
  PlayCircle,
  Filter,
  Share2,
  Bookmark
} from 'lucide-react';
import api from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const NewsHub = () => {
  const { isAuthenticated, isLawyer } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('news'); // 'news' or 'videos'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  // Categories derived from DB schema
  const newsCategories = ['All', 'Supreme Court', 'High Court', 'Central Law', 'State Law', 'Amendment', 'Judgment', 'Other'];
  const videoCategories = ['All', 'IPC', 'CrPC', 'Constitution', 'Property', 'Family', 'Corporate', 'Other'];

  const currentCategories = activeTab === 'news' ? newsCategories : videoCategories;

  useEffect(() => {
    fetchData();
  }, [activeTab, categoryFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'news' ? '/updates/news' : '/updates/videos';
      const params = {};
      if (categoryFilter && categoryFilter !== 'All') {
        params.category = categoryFilter;
      }

      const { data } = await api.get(endpoint, { params });
      setItems(data.data || []);
    } catch (error) {
      console.error("Failed to fetch updates:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recent';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header Section */}
      <header className="rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Auto-Updating Live Feed</span>
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight">Legal Knowledge Hub</h1>
          <p className="text-slate-300 text-lg">
            Stay informed with curated legal news, verified updates, and expert video explainers.
            Updated every 4 hours from trusted government and legal sources.
          </p>
        </div>
        {/* Decorative background element */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col gap-6 lg:flex-row">

        {/* Left Sidebar - Filters & Navigation */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
          {/* Navigation Tabs */}
          <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            <button
              onClick={() => {
                setActiveTab('news');
                setCategoryFilter('All');
                setItems([]); // Clear list immediately
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'news'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              <Newspaper className="h-5 w-5" />
              Legal News
            </button>
            <button
              onClick={() => {
                setActiveTab('videos');
                setCategoryFilter('All');
                setItems([]); // Clear list immediately
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'videos'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              <Video className="h-5 w-5" />
              Video Explainers
            </button>
          </div>

          {/* Categories Filter */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Filter className="h-4 w-4" />
              Filter by Topic
            </div>
            <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
              {currentCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-md px-3 py-2 text-left text-xs font-medium transition-colors ${categoryFilter === cat || (cat === 'All' && !categoryFilter)
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          {/* Daily Legal Fact - "Something Different" */}
          <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white shadow-lg overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-white/20">
                  <PlayCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Did You Know?</span>
              </div>
              <h4 className="font-bold text-lg mb-2">Fundamental Rights</h4>
              <p className="text-xs text-blue-100 leading-relaxed mb-4">
                The Right to Privacy is a fundamental right under Article 21 of the Indian Constitution, as ruled by the Supreme Court in the landmark Puttaswamy judgment.
              </p>
              <button
                onClick={() => alert('Feature coming soon: Dive deep into legal facts!')}
                className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold transition-all border border-white/10"
              >
                Learn More
              </button>
            </div>
            {/* Decorative circles */}
            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/5"></div>
            <div className="absolute -left-2 top-0 w-12 h-12 rounded-full bg-blue-400/10"></div>
          </div>
        </aside>


        {/* Right Content - Grid */}
        <section className="flex-1">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-200"></div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500">
              <Search className="mb-2 h-8 w-8 text-slate-400" />
              <p>No updates found for this category.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                activeTab === 'news' ? (
                  // News Card
                  <article key={item.id} className="group relative flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                    <div className="p-5 flex flex-col h-full">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          {item.category}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.published_date)}
                        </div>
                      </div>

                      <h3 className="mb-2 text-lg font-bold text-slate-900 line-clamp-2 md:text-xl group-hover:text-blue-600">
                        {item.title}
                      </h3>

                      <p className="mb-4 flex-1 text-sm text-slate-600 line-clamp-3 leading-relaxed">
                        {item.summary || 'No summary available for this legal update.'}
                      </p>

                      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                          <span className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold uppercase">
                            {item.source ? item.source.substring(0, 2) : 'LX'}
                          </span>
                          {item.source || 'Legal India'}
                        </div>

                        <div className="flex gap-2">
                          <a
                            href={item.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                          >
                            Read Full <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                ) : (
                  // Video Card
                  <div key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                    {/* YouTube Embed */}
                    <div className="relative aspect-video w-full bg-black">
                      <iframe
                        className="absolute inset-0 h-full w-full"
                        src={`https://www.youtube.com/embed/${item.video_id}`}
                        title={item.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>

                    <div className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                          {item.category}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {item.duration}
                        </span>
                      </div>

                      <h3 className="mb-2 text-base font-bold text-slate-900 line-clamp-2">
                        {item.title}
                      </h3>

                      <div className="flex items-center justify-between text-xs text-slate-500 mt-3">
                        <div className="flex items-center gap-2">
                          <PlayCircle className="h-3 w-3 text-red-600" />
                          <span className="font-medium text-slate-700">{item.channel_name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {item.view_count}</span>
                          <span>• {formatDate(item.published_date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Premium CTA Banner - Inspired by User Image */}
      <div className="mt-8 rounded-2xl bg-[#0F172A] p-0.5 shadow-xl overflow-hidden group">
        <div className="rounded-[15px] bg-gradient-to-r from-slate-900 via-blue-900 to-blue-600 p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-3">Ready to Transform Your Legal Practice?</h2>
            <p className="text-slate-300 text-lg max-w-xl">
              Join thousands of legal professionals who trust CaseXpert for their case management and AI humanized legal needs.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                if (isAuthenticated) {
                  navigate(isLawyer() ? '/lawyer/dashboard' : '/dashboard');
                } else {
                  navigate('/register');
                }
              }}
              className="px-8 py-3 bg-[#FCB827] hover:bg-[#EAA616] text-slate-900 font-bold rounded-full shadow-lg shadow-yellow-500/20 transform transition-transform hover:scale-105"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
            </button>
          </div>

          {/* Abstract glows */}
          <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-blue-500/20 blur-[120px] group-hover:bg-blue-400/30 transition-all duration-700"></div>
          <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-[100px]"></div>
        </div>
      </div>

      {/* Disclaimer Section */}
      <footer className="mt-8 rounded-lg bg-slate-50 p-4 border border-slate-200 text-center">
        <p className="text-xs text-slate-500">
          <strong>Disclaimer:</strong> The content provided in this Legal Knowledge Hub is for educational and informational purposes only
          and does not constitute legal advice. Casexpert aggregates verified news and videos but is not responsible for the accuracy
          of third-party content. Please consult a qualified lawyer for specific legal issues.
        </p>
      </footer>
    </div>
  );
};

export default NewsHub;
