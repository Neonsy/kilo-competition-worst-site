'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TopNav, SideNav, FooterNav, FloatingWidget } from '@/components/Navigation';
import { PopupManager } from '@/components/Popups';
import { HellButton } from '@/components/HellButton';
import { exhibits, exhibitCategories } from '@/data/exhibits';
import { getRandomDisclaimer } from '@/data/disclaimers';

type ViewMode = 'grid' | 'list' | 'chaos';

export default function ExhibitsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('regret');
  const [searchTerm, setSearchTerm] = useState('');
  const [randomSwitches, setRandomSwitches] = useState(0);
  const disclaimer = getRandomDisclaimer();

  // Randomly switch view mode
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.9) {
        const modes: ViewMode[] = ['grid', 'list', 'chaos'];
        setViewMode(modes[Math.floor(Math.random() * modes.length)]);
        setRandomSwitches(prev => prev + 1);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Filter and sort exhibits
  const filteredExhibits = exhibits
    .filter(e => selectedCategory === 'all' || e.category === selectedCategory)
    .filter(e => searchTerm === '' || e.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'regret': return b.regretValue - a.regretValue;
        case 'visitors': return parseInt(b.visitors) - parseInt(a.visitors);
        case 'rating': return b.rating - a.rating;
        case 'chaos': return Math.random() - 0.5;
        default: return 0;
      }
    });

  const handleViewModeChange = (mode: ViewMode) => {
    // Sometimes change to a different mode than requested
    if (Math.random() > 0.8) {
      const modes: ViewMode[] = ['grid', 'list', 'chaos'];
      setViewMode(modes[Math.floor(Math.random() * modes.length)]);
    } else {
      setViewMode(mode);
    }
  };

  return (
    <PopupManager>
      <div className="min-h-screen flex flex-col">
        <TopNav />
        
        <div className="flex flex-1">
          <SideNav />
          
          <main className="flex-1 overflow-x-hidden">
            {/* Header */}
            <section 
              className="p-4 md:p-8 bg-gradient-to-r from-[#FF69B4] to-[#00FFFF]"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 20px,
                    rgba(255,255,255,0.1) 20px,
                    rgba(255,255,255,0.1) 40px
                  )
                `,
              }}
            >
              <h1 
                className="text-3xl md:text-5xl text-center animate-rainbow"
                style={{ 
                  fontFamily: "'Bangers', cursive",
                  textShadow: '3px 3px 0 #8B4513',
                }}
              >
                🎨 EXHIBIT GALLERY 🎨
              </h1>
              
              <p 
                className="text-center mt-2 text-[#8B4513]"
                style={{ fontFamily: "'Comic Neue', cursive" }}
              >
                Explore our collection of terrible interactive experiences
              </p>
              
              {randomSwitches > 0 && (
                <p 
                  className="text-center text-xs text-[#FF0000] animate-blink mt-2"
                  style={{ fontFamily: "'VT323', monospace" }}
                >
                  ⚠️ View mode has changed randomly {randomSwitches} time(s) ⚠️
                </p>
              )}
            </section>

            {/* Filters Section - Overly Complicated */}
            <section 
              className="p-4 bg-[#F5F5DC] border-b-4 border-double border-[#8B4513]"
              style={{ fontFamily: "'Comic Neue', cursive" }}
            >
              <div className="max-w-6xl mx-auto">
                {/* Search */}
                <div className="mb-4">
                  <label className="block text-sm mb-1" style={{ textAlign: 'right' }}>
                    Search (results may vary):
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type to search..."
                    className="w-full px-3 py-2 border-2 border-[#808080] bg-white"
                    style={{ fontFamily: "'VT323', monospace" }}
                  />
                </div>

                {/* View Mode Toggle */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span 
                    className="text-sm"
                    style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '8px' }}
                  >
                    VIEW MODE:
                  </span>
                  {(['grid', 'list', 'chaos'] as ViewMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleViewModeChange(mode)}
                      className={`
                        px-4 py-2 text-sm transition-all
                        ${viewMode === mode 
                          ? 'bg-[#39FF14] text-[#8B4513] font-bold' 
                          : 'bg-[#808080] text-white'}
                        hover:shadow-lg
                      `}
                      style={{
                        fontFamily: viewMode === mode ? "'Bangers', cursive" : "'VT323', monospace",
                        border: viewMode === mode ? '3px dashed #FF0000' : '1px solid #606060',
                        transform: viewMode === mode ? 'scale(1.1)' : 'none',
                      }}
                    >
                      {mode.toUpperCase()}
                      {mode === 'chaos' && ' 🔥'}
                    </button>
                  ))}
                </div>

                {/* Category Filter */}
                <div className="mb-4">
                  <label 
                    className="block text-sm mb-2"
                    style={{ fontFamily: "'Times New Roman', serif" }}
                  >
                    Filter by Category:
                  </label>
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`
                        px-3 py-1 text-xs
                        ${selectedCategory === 'all' 
                          ? 'bg-[#FF69B4] text-white' 
                          : 'bg-white text-[#808080] border border-[#808080]'}
                      `}
                    >
                      All
                    </button>
                    {exhibitCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`
                          px-2 py-1 text-xs
                          ${selectedCategory === cat 
                            ? 'bg-[#00FFFF] text-[#8B4513]' 
                            : 'bg-[#E6E6FA] text-[#808080]'}
                        `}
                        style={{ fontFamily: "'VT323', monospace" }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <label 
                    className="text-sm"
                    style={{ fontFamily: "'Arial Black', sans-serif" }}
                  >
                    Sort by:
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1 border-2 border-[#808080] bg-white"
                    style={{ fontFamily: "'VT323', monospace" }}
                  >
                    <option value="regret">Regret Value (High to Low)</option>
                    <option value="visitors">Visitor Count</option>
                    <option value="rating">Rating</option>
                    <option value="chaos">Chaos (Random)</option>
                  </select>
                  
                  <span 
                    className="text-xs text-[#999999] ml-4"
                    style={{ fontFamily: "'Comic Neue', cursive" }}
                  >
                    Showing {filteredExhibits.length} of {exhibits.length} exhibits
                  </span>
                </div>
              </div>
            </section>

            {/* Exhibits Display */}
            <section className="p-4 md:p-8">
              <div className="max-w-6xl mx-auto">
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredExhibits.map((exhibit, index) => (
                      <ExhibitCard key={exhibit.id} exhibit={exhibit} index={index} />
                    ))}
                  </div>
                )}

                {viewMode === 'list' && (
                  <div className="space-y-4">
                    {filteredExhibits.map((exhibit, index) => (
                      <ExhibitListItem key={exhibit.id} exhibit={exhibit} index={index} />
                    ))}
                  </div>
                )}

                {viewMode === 'chaos' && (
                  <div className="relative min-h-[800px]">
                    {filteredExhibits.map((exhibit, index) => (
                      <div
                        key={exhibit.id}
                        className="absolute"
                        style={{
                          left: `${(index % 4) * 25 + Math.random() * 10}%`,
                          top: `${Math.floor(index / 4) * 200 + Math.random() * 50}px`,
                          transform: `rotate(${(Math.random() - 0.5) * 20}deg)`,
                          zIndex: index,
                        }}
                      >
                        <ExhibitCard exhibit={exhibit} index={index} />
                      </div>
                    ))}
                  </div>
                )}

                {filteredExhibits.length === 0 && (
                  <div 
                    className="text-center py-12"
                    style={{ fontFamily: "'Comic Neue', cursive" }}
                  >
                    <span className="text-6xl">🔍</span>
                    <p className="mt-4 text-xl text-[#808080]">
                      No exhibits found. Your search was too specific.
                    </p>
                    <p className="text-sm text-[#999999] mt-2">
                      (Or maybe we just don't have what you're looking for. Have you tried looking elsewhere?)
                    </p>
                    <HellButton
                      variant="link"
                      label="Reset filters"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                        setSortBy('regret');
                      }}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Pagination that doesn't work properly */}
            <section className="p-4 bg-[#E6E6FA] border-t-4 border-[#808080]">
              <div className="flex justify-center items-center gap-2">
                <button
                  className="px-3 py-1 bg-[#808080] text-white"
                  style={{ fontFamily: "'VT323', monospace" }}
                  onClick={() => alert('Previous page is not available. Time only moves forward here.')}
                >
                  ◀ Prev
                </button>
                
                {[1, 2, 3, 47, 999].map((page) => (
                  <button
                    key={page}
                    className={`px-3 py-1 ${page === 1 ? 'bg-[#39FF14] text-[#8B4513]' : 'bg-white text-[#808080] border border-[#808080]'}`}
                    style={{ fontFamily: "'VT323', monospace" }}
                    onClick={() => page !== 1 && alert(`Page ${page} does not exist. All exhibits are on page 1.`)}
                  >
                    {page}
                  </button>
                ))}
                
                <span className="text-[#999999]">...</span>
                
                <button
                  className="px-3 py-1 bg-[#808080] text-white"
                  style={{ fontFamily: "'VT323', monospace" }}
                  onClick={() => alert('Next page is loading... (it will never finish loading)')}
                >
                  Next ▶
                </button>
              </div>
              
              <p className="text-center text-xs text-[#999999] mt-2">
                Showing all {filteredExhibits.length} results on page 1 of ∞
              </p>
            </section>

            {/* Disclaimer */}
            <div className="disclaimer p-4 text-center">
              {disclaimer}
              <br />
              Exhibit availability may vary. Some exhibits may be imaginary. 
              Premium exhibits require Premium Premium™ subscription ($49.99/month).
            </div>
          </main>
        </div>

        <FooterNav />
        <FloatingWidget />
      </div>
    </PopupManager>
  );
}

// Exhibit Card Component
function ExhibitCard({ exhibit, index }: { exhibit: typeof exhibits[0]; index: number }) {
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);

  const fonts = [
    "'Comic Neue', cursive",
    "'Bangers', cursive",
    "'VT323', monospace",
    "'Times New Roman', serif",
  ];
  const titleFont = fonts[index % fonts.length];

  const handleInteraction = () => {
    setInteractionCount(prev => prev + 1);
    if (interactionCount >= 3) {
      alert('You have interacted enough. Please move along.');
    }
  };

  return (
    <div
      className={`
        border-4 p-4 transition-all
        ${index % 3 === 0 ? 'border-dotted border-[#FF69B4] bg-[#FFFF99]' : ''}
        ${index % 3 === 1 ? 'border-double border-[#39FF14] bg-[#E6E6FA]' : ''}
        ${index % 3 === 2 ? 'border-solid border-[#00FFFF] bg-[#F5F5DC]' : ''}
        ${exhibit.premium ? 'shadow-neon' : 'shadow-ugly'}
        hover:scale-105
      `}
      style={{
        transform: `rotate(${(index % 5 - 2) * 0.5}deg)`,
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <span className="text-3xl">{exhibit.icon}</span>
        <div className="flex gap-1">
          {exhibit.premium && (
            <span className="new-badge text-[8px]">PREMIUM</span>
          )}
          <span 
            className="text-xs px-2 py-1 bg-[#808080] text-white"
            style={{ fontFamily: "'VT323', monospace" }}
          >
            ⭐ {exhibit.rating}/5
          </span>
        </div>
      </div>

      {/* Title */}
      <h3
        className="text-lg font-bold mb-2"
        style={{ fontFamily: titleFont }}
      >
        {exhibit.title}
      </h3>

      {/* Description */}
      <p
        className="text-sm mb-3"
        style={{ 
          fontFamily: "'Comic Neue', cursive",
          textAlign: index % 2 === 0 ? 'justify' : 'left',
        }}
      >
        {exhibit.description}
      </p>

      {/* Interactive Element Preview */}
      <div 
        className="my-3 p-2 bg-white border-2 border-[#808080]"
        style={{ fontFamily: "'VT323', monospace" }}
      >
        <p className="text-xs text-[#999999] mb-1">Interactive Element:</p>
        <button
          onClick={handleInteraction}
          className="w-full py-2 bg-[#C0C0C0] border-2 border-outset hover:bg-[#A0A0A0]"
        >
          {exhibit.interactiveLabel}
        </button>
      </div>

      {/* Stats */}
      <div 
        className="flex justify-between text-xs text-[#999999] mb-2"
        style={{ fontFamily: "'VT323', monospace" }}
      >
        <span>👥 {exhibit.visitors} visitors</span>
        <span>💔 Regret: {exhibit.regretValue}</span>
      </div>

      {/* Category */}
      <div className="mb-2">
        <span 
          className="text-xs px-2 py-1 bg-[#E6E6FA] border border-[#808080]"
          style={{ fontFamily: "'Comic Neue', cursive" }}
        >
          📁 {exhibit.category}
        </span>
      </div>

      {/* Learn More */}
      <button
        onClick={() => setShowLearnMore(!showLearnMore)}
        className="w-full text-left text-xs text-[#0066CC] underline"
        style={{ fontFamily: "'Comic Neue', cursive" }}
      >
        {showLearnMore ? '▲ Show Less' : '▼ Learn More (not recommended)'}
      </button>

      {showLearnMore && (
        <div 
          className="mt-2 p-3 bg-[#F5F5DC] border border-[#808080] text-xs"
          style={{ 
            fontFamily: "'Times New Roman', serif",
            maxHeight: '150px',
            overflow: 'scroll',
          }}
        >
          <p className="font-bold mb-1" style={{ fontFamily: "'Bangers', cursive" }}>
            About This Exhibit:
          </p>
          <p>{exhibit.learnMoreText}</p>
          <p className="mt-2 text-[8px] text-[#999999]">
            Added: {exhibit.dateAdded} | Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-3">
        <Link href={`/tour?exhibit=${exhibit.id}`}>
          <HellButton
            variant={index % 4 === 0 ? 'glossy' : index % 4 === 1 ? 'win95' : 'flat'}
            label={index % 3 === 0 ? 'Visit Exhibit' : index % 3 === 1 ? 'Enter...' : 'Go →'}
            size="small"
          />
        </Link>
      </div>
    </div>
  );
}

// List Item Component
function ExhibitListItem({ exhibit, index }: { exhibit: typeof exhibits[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`
        flex gap-4 p-4 border-2
        ${index % 2 === 0 ? 'bg-white border-[#808080]' : 'bg-[#F5F5DC] border-[#39FF14]'}
      `}
      style={{
        borderStyle: index % 3 === 0 ? 'dotted' : index % 3 === 1 ? 'dashed' : 'solid',
      }}
    >
      {/* Icon */}
      <div 
        className="text-4xl flex-shrink-0"
        style={{ transform: `rotate(${(Math.random() - 0.5) * 10}deg)` }}
      >
        {exhibit.icon}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h3
            className="text-lg font-bold"
            style={{ fontFamily: index % 2 === 0 ? "'Bangers', cursive" : "'Comic Neue', cursive" }}
          >
            {exhibit.title}
            {exhibit.premium && <span className="new-badge ml-2 text-[8px]">PREMIUM</span>}
          </h3>
          <span 
            className="text-xs"
            style={{ fontFamily: "'VT323', monospace" }}
          >
            {exhibit.dateAdded}
          </span>
        </div>

        <p 
          className="text-sm mt-1"
          style={{ 
            fontFamily: "'Times New Roman', serif",
            textAlign: 'justify',
          }}
        >
          {exhibit.description}
        </p>

        <div 
          className="flex gap-4 mt-2 text-xs"
          style={{ fontFamily: "'VT323', monospace" }}
        >
          <span>⭐ {exhibit.rating}/5</span>
          <span>👥 {exhibit.visitors}</span>
          <span>💔 Regret: {exhibit.regretValue}</span>
          <span>📁 {exhibit.category}</span>
        </div>

        {expanded && (
          <div 
            className="mt-3 p-3 bg-[#E6E6FA] border border-[#808080] text-xs"
            style={{ fontFamily: "'Comic Neue', cursive" }}
          >
            <p className="font-bold mb-1">About:</p>
            <p>{exhibit.learnMoreText}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 justify-center">
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-3 py-1 text-xs bg-[#E6E6FA] border border-[#808080]"
        >
          {expanded ? 'Less' : 'More'}
        </button>
        <Link href={`/tour?exhibit=${exhibit.id}`}>
          <button
            className="px-3 py-1 text-xs bg-[#39FF14] text-[#8B4513] font-bold"
          >
            Visit
          </button>
        </Link>
      </div>
    </div>
  );
}
