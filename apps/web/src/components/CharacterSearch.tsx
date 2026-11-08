"use client";

import React, { useState, useEffect } from 'react';

export const CharacterSearch = ({ side }: { side: 'A' | 'B' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/characters/search?q=${val}`);
      const data = await res.json();
      setResults(data.characters || []);
    } catch {
      // Fallback mock items if DB is unseeded
      setResults([
        { id: '1', name: val + ' (Sample Variant 1)', universe: 'Multiverse Alpha' },
        { id: '2', name: val + ' (Sample Variant 2)', universe: 'Multiverse Omega' }
      ]);
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative p-6 rounded-3xl border border-arena-border bg-arena-surface2/60 backdrop-blur-xl w-full shadow-card transition-all duration-300 hover:border-arena-purple/50">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-arena-purple/5 to-transparent pointer-events-none" />
      <h3 className="text-lg font-bold mb-4 tracking-widest uppercase text-arena-text2">
        Fighter <span className="text-white">{side}</span>
      </h3>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search character..."
          className="w-full bg-arena-bg border border-arena-border rounded-xl px-5 py-3 text-white placeholder-arena-text3 focus:outline-none focus:border-arena-blue focus:ring-1 focus:ring-arena-blue transition-all"
        />
        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-arena-surface2 border border-arena-border rounded-2xl shadow-2xl z-20 overflow-hidden">
            {results.map((c) => (
              <div
                key={c.id}
                onClick={() => { setQuery(c.name); setResults([]); }}
                className="px-5 py-4 hover:bg-arena-surface cursor-pointer transition-colors border-b border-arena-border last:border-0 group"
              >
                <div className="font-bold text-white group-hover:text-arena-blue transition-colors">{c.name}</div>
                <div className="text-xs text-arena-purple mt-0.5">{c.universe || 'Custom Legend'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
