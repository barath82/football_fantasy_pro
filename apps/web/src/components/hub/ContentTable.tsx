import { useState } from 'react';
import { ExternalLink, Search, ChevronUp, ChevronDown } from 'lucide-react';
import type { ContentLink } from '../../data/contentLinks';
import { ContentTypeBadge, SourceTypeBadge, PaidBadge } from './Badge';
import { filterBySearch, formatDate } from '../../utils/aggregations';

type SortKey = 'title' | 'sourceName' | 'contentType' | 'publishedAt';

interface ContentTableProps {
  links: ContentLink[];
  maxRows?: number;
}

export function ContentTable({ links, maxRows }: ContentTableProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('publishedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = filterBySearch(links, search);

  const sorted = [...filtered].sort((a, b) => {
    let av = a[sortKey] ?? '';
    let bv = b[sortKey] ?? '';
    if (typeof av === 'string') av = av.toLowerCase();
    if (typeof bv === 'string') bv = bv.toLowerCase();
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const rows = maxRows ? sorted.slice(0, maxRows) : sorted;

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronUp size={11} className="text-slate-600" />;
    return sortDir === 'asc' ? (
      <ChevronUp size={11} className="text-violet-400" />
    ) : (
      <ChevronDown size={11} className="text-violet-400" />
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center bg-slate-800 border border-slate-700/60 rounded-lg px-3 py-2 gap-2 flex-1 max-w-xs focus-within:border-violet-500/50 transition-colors shadow-hub-card">
          <Search size={13} className="text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Filter content..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none w-full"
          />
        </div>
        <span className="text-slate-500 text-xs">{filtered.length} results</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700/50 shadow-hub-card">
        <table className="w-full min-w-[680px]">
          <thead>
            <tr className="border-b border-slate-700/50 bg-slate-800/80">
              {(
                [
                  { key: 'title', label: 'Title' },
                  { key: 'sourceName', label: 'Source' },
                  { key: 'contentType', label: 'Type' },
                  { key: 'publishedAt', label: 'Date' },
                ] as { key: SortKey; label: string }[]
              ).map(col => (
                <th key={col.key} className="text-left py-2.5 px-4 first:pl-5">
                  <button
                    onClick={() => handleSort(col.key)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition-colors"
                  >
                    {col.label}
                    <SortIcon col={col.key} />
                  </button>
                </th>
              ))}
              <th className="text-right py-2.5 px-4 pr-5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Link
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-500 text-sm">
                  No content matches your search.
                </td>
              </tr>
            )}
            {rows.map((link, i) => (
              <tr
                key={link.id}
                className={`border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors ${
                  i === rows.length - 1 ? 'border-b-0' : ''
                }`}
              >
                <td className="py-3 px-4 pl-5 max-w-[320px]">
                  <div className="text-xs text-slate-200 font-medium leading-snug line-clamp-1 mb-0.5">
                    {link.title}
                  </div>
                  {link.expertName && (
                    <div className="text-[10px] text-slate-500">{link.expertName}</div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-slate-400">{link.sourceName}</span>
                    <SourceTypeBadge type={link.sourceType} />
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col gap-1">
                    <ContentTypeBadge type={link.contentType} size="xs" />
                    <PaidBadge isPaid={link.isPaid} />
                  </div>
                </td>
                <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                  {formatDate(link.publishedAt)}
                </td>
                <td className="py-3 px-4 pr-5 text-right">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 transition-colors font-medium"
                  >
                    Open <ExternalLink size={10} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
