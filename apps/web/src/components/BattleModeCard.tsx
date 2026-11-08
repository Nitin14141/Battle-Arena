import React from 'react';

export const BattleModeCard = ({ title, description }: { title: string, description: string }) => (
  <div className="group relative p-8 rounded-2xl bg-arena-surface2 border border-arena-border hover:border-arena-purple transition-all duration-300 card-hover overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-arena-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative z-10 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-arena-bg mb-6 flex items-center justify-center border border-arena-border group-hover:border-arena-purple/50 transition-colors">
        <div className="w-8 h-8 bg-gradient-to-tr from-arena-purple to-arena-blue rounded-sm" />
      </div>
      <h3 className="text-xl font-display font-bold mb-3 text-white group-hover:text-arena-purple transition-colors">{title}</h3>
      <p className="text-arena-text2 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);