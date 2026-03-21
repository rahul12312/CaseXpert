import React from 'react';

const statusColors = {
  open: 'bg-emerald-50 text-emerald-700',
  in_progress: 'bg-amber-50 text-amber-700',
  closed: 'bg-slate-200 text-slate-700',
  archived: 'bg-slate-100 text-slate-500',
};

const CaseCard = ({ item }) => {
  const statusClass = statusColors[item.status] || 'bg-slate-100 text-slate-600';

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
          <p className="mt-1 text-xs text-slate-500">Case ID: {item._id}</p>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${statusClass}`}>
          {item.status?.replace('_', ' ')}
        </span>
      </header>
      <p className="text-sm text-slate-700 line-clamp-3">{item.description}</p>
      <div className="mt-2 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
        <div>
          <span className="font-medium text-slate-600">Client: </span>
          <span>{item.userId?.name || 'N/A'}</span>
        </div>
        <div>
          <span className="font-medium text-slate-600">Lawyer: </span>
          <span>{item.lawyerId?.userId?.name || 'Unassigned'}</span>
        </div>
        <div>
          <span className="font-medium text-slate-600">Created: </span>
          <span>{item.createdAt && new Date(item.createdAt).toLocaleDateString()}</span>
        </div>
        <div>
          <span className="font-medium text-slate-600">Deadlines: </span>
          <span>{Array.isArray(item.deadlines) ? item.deadlines.length : 0}</span>
        </div>
      </div>
    </article>
  );
};

export default CaseCard;
