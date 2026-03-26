import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Search, ChevronDown } from 'lucide-react';
import type { Technology } from '../../types';

interface TechPickerProps {
  selected: Technology[];
  onChange: (techs: Technology[]) => void;
}

export default function TechPicker({ selected, onChange }: TechPickerProps) {
  const [library, setLibrary] = useState<Technology[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get<Technology[]>('/api/admin/technologies')
      .then((r) => setLibrary(r.data))
      .catch(() => {});
  }, []);

  const isSelected = (id: number) => selected.some((t) => t.id === id);

  const toggle = (tech: Technology) => {
    if (isSelected(tech.id)) {
      onChange(selected.filter((t) => t.id !== tech.id));
    } else {
      onChange([...selected, tech]);
    }
  };

  const filtered = library.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((tech) => (
            <span
              key={tech.id}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
              style={{ background: tech.color + '25', border: `1px solid ${tech.color}50`, color: tech.color }}
            >
              {tech.icon_url && (
                <img src={tech.icon_url} alt="" className="w-3.5 h-3.5 object-contain" />
              )}
              {tech.name}
              <button
                type="button"
                onClick={() => toggle(tech)}
                className="ml-0.5 opacity-70 hover:opacity-100"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors"
        style={{
          background: '#0a0a0f',
          border: `1px solid ${open ? '#c9a96e' : '#2a2a35'}`,
          color: '#9ca3af',
        }}
      >
        <span>{selected.length > 0 ? `${selected.length} selected` : 'Select technologies...'}</span>
        <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="mt-1 rounded-lg overflow-hidden"
          style={{ background: '#111118', border: '1px solid #2a2a35' }}
        >
          {/* Search */}
          <div className="px-3 py-2" style={{ borderBottom: '1px solid #2a2a35' }}>
            <div className="flex items-center gap-2">
              <Search size={13} style={{ color: '#6b7280' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: '#e5e7eb' }}
                autoFocus
              />
            </div>
          </div>

          {/* Tech grid */}
          <div className="p-2 max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: '#6b7280' }}>
                {library.length === 0 ? 'No technologies in library yet' : 'No results'}
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {filtered.map((tech) => {
                  const sel = isSelected(tech.id);
                  return (
                    <button
                      key={tech.id}
                      type="button"
                      onClick={() => toggle(tech)}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-all text-left"
                      style={{
                        background: sel ? tech.color + '25' : 'transparent',
                        border: `1px solid ${sel ? tech.color + '60' : '#2a2a35'}`,
                        color: sel ? tech.color : '#9ca3af',
                      }}
                    >
                      {tech.icon_url ? (
                        <img src={tech.icon_url} alt="" className="w-4 h-4 object-contain flex-shrink-0" />
                      ) : (
                        <span
                          className="w-4 h-4 rounded-sm flex-shrink-0"
                          style={{ background: tech.color + '40', border: `1px solid ${tech.color}60` }}
                        />
                      )}
                      <span className="truncate">{tech.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-3 py-2" style={{ borderTop: '1px solid #2a2a35' }}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs w-full text-center"
              style={{ color: '#c9a96e' }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
