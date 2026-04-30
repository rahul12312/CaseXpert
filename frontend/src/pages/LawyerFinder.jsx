import React, { useEffect, useState } from 'react';
import api from '../lib/api.js';
import LawyerCard from '../components/LawyerCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const LawyerFinder = () => {
  const { user, isAuthenticated } = useAuth();
  const [specialization, setSpecialization] = useState('');
  const [language, setLanguage] = useState('');
  const [location, setLocation] = useState('');
  const [allLawyers, setAllLawyers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingMatch, setLoadingMatch] = useState(false);

  useEffect(() => {
    const loadAll = async () => {
      setLoadingAll(true);
      try {
        const { data } = await api.get('/lawyers/all');
        setAllLawyers(data.lawyers || []);
      } catch (error) {
        setAllLawyers([]);
      } finally {
        setLoadingAll(false);
      }
    };

    loadAll();
  }, []);

  const runMatch = async () => {
    if (!isAuthenticated) return;

    setLoadingMatch(true);
    try {
      const params = {};
      if (specialization) params.requiredSpecialization = specialization;
      if (language) params.language = language;
      if (location) params.location = location;
      const { data } = await api.get('/lawyers/match', { params });
      setMatches(data.lawyers || []);
    } catch (error) {
      setMatches([]);
    } finally {
      setLoadingMatch(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Find a Lawyer</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Explore the network or let CaseXpert suggest the best matches based on language,
          specialization, and location.
        </p>
      </header>
      <section className="grid gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm md:grid-cols-[280px,1fr]">
        <div className="space-y-3 border-b border-slate-200 dark:border-slate-700 pb-3 md:border-b-0 md:border-r md:pb-0 md:pr-3">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Matching filters</h2>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400" htmlFor="specialization">
              Specialization / Case type
            </label>
            <input
              id="specialization"
              type="text"
              value={specialization}
              onChange={e => setSpecialization(e.target.value)}
              placeholder="e.g. Criminal, Family, Corporate"
              className="h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 text-sm text-slate-800 dark:text-slate-200 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400" htmlFor="language">
              Preferred language
            </label>
            <input
              id="language"
              type="text"
              value={language}
              onChange={e => setLanguage(e.target.value)}
              placeholder="e.g. English, Hindi"
              className="h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 text-sm text-slate-800 dark:text-slate-200 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400" htmlFor="location">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="City / region"
              className="h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 text-sm text-slate-800 dark:text-slate-200 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <button
            type="button"
            onClick={runMatch}
            disabled={!isAuthenticated || loadingMatch}
            className="mt-1 inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isAuthenticated ? (loadingMatch ? 'Matching…' : 'Find best matches') : 'Login required'}
          </button>
          {!isAuthenticated && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Sign in via your firm account to run personalized matching.
            </p>
          )}
        </div>
        <div className="space-y-4">
          {matches.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">Top matches</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {matches.map(lawyer => (
                  <LawyerCard key={lawyer._id} item={lawyer} />
                ))}
              </div>
            </section>
          )}
          <section>
            <h2 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">All lawyers</h2>
            {loadingAll ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">Loading lawyers…</p>
            ) : allLawyers.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">No lawyers available yet.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {allLawyers.map(lawyer => (
                  <LawyerCard key={lawyer._id} item={lawyer} />
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
};

export default LawyerFinder;
