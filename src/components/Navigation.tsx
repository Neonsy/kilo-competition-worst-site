'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Navigation labels differ by location
const navItems = {
  top: [
    { href: '/', label: 'Home', active: true },
    { href: '/exhibits', label: 'Exhibits', active: false },
    { href: '/tour', label: 'Tour', active: false },
    { href: '/help', label: 'Help', active: false },
    { href: '/settings', label: 'Settings', active: false },
  ],
  sidebar: [
    { href: '/', label: 'Start Here', active: true },
    { href: '/exhibits', label: 'View Things', active: false },
    { href: '/tour', label: 'Wizard Thing', active: false },
    { href: '/help', label: '???', active: false },
    { href: '/settings', label: 'Preferences', active: false },
  ],
  footer: [
    { href: '/', label: 'Main', active: true },
    { href: '/exhibits', label: 'Gallery', active: false },
    { href: '/tour', label: 'Begin Journey', active: false },
    { href: '/help', label: 'Assistance', active: false },
    { href: '/settings', label: 'Tweaks', active: false },
  ],
  floating: [
    { href: '/', label: 'Portal', active: true },
    { href: '/exhibits', label: 'Collections', active: false },
    { href: '/tour', label: 'Do Not Click', active: false },
    { href: '/help', label: 'Support', active: false },
    { href: '/settings', label: 'Knobs', active: false },
  ],
};

// Fake menu items that go nowhere
const fakeItems = [
  { label: 'Premium Zone ⭐', action: 'alert' },
  { label: 'Secret Page 🔒', action: '404' },
  { label: 'Click Here 👆', action: 'alert' },
  { label: 'Member Login 🚪', action: 'popup' },
];

export function TopNav() {
  const router = useRouter();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <nav 
      className="w-full bg-gradient-to-r from-[#39FF14] via-[#FF69B4] to-[#00FFFF] border-b-4 border-double border-[#8B4513]"
      style={{ fontFamily: "'Arial Black', sans-serif" }}
    >
      {/* Marquee banner */}
      <div className="marquee-container bg-[#7BA05B] border-b-2 border-dashed-[#8B4513]">
        <div className="marquee-content font-comic text-[#8B4513]">
          ⚠️ WELCOME TO THE MUSEUM OF BAD DECISIONS ⚠️ Your presence has been registered ⚠️ 
          By viewing this banner you agree to our terms ⚠️ NO REFUNDS ⚠️ 
          Best viewed in Internet Explorer 6 ⚠️ You are visitor #8,472,910 ⚠️
        </div>
      </div>
      
      <div className="flex items-center justify-between px-4 py-2">
        {/* Logo - slightly off center */}
        <Link 
          href="/help" 
          className="flex items-center gap-2 hover:opacity-80 transition-opacity ml-[13px]"
          title="Click to go home (this is a lie)"
        >
          <span className="text-4xl animate-bounce-chaotic">🏛️</span>
          <span 
            className="text-xl font-bold text-[#8B4513] animate-rainbow"
            style={{ fontFamily: "'Bangers', cursive" }}
          >
            MoBD
          </span>
        </Link>
        
        {/* Main nav items */}
        <div className="flex items-center gap-1">
          {navItems.top.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => {
                if (Math.random() > 0.82) {
                  e.preventDefault();
                  const wrongTarget = navItems.top[(index + 2) % navItems.top.length].href;
                  alert(`Routing optimization sent you to ${wrongTarget} instead.`);
                  router.push(wrongTarget);
                }
              }}
              className={`
                px-4 py-2 text-sm transition-all duration-100
                ${index % 2 === 0 ? 'bg-[#FFFF99]' : 'bg-[#E6E6FA]'}
                ${index === 0 ? 'border-2 border-dotted border-[#FF0000]' : ''}
                ${index === 1 ? 'border-4 border-double border-[#00FF00]' : ''}
                ${index === 2 ? 'border-3 border-solid border-[#0000FF] rounded-full' : ''}
                ${index === 3 ? 'bevel-ugly' : ''}
                ${index === 4 ? 'shadow-ugly' : ''}
                hover:translate-x-1 hover:bg-[#FF69B4]
              `}
              style={{ 
                fontFamily: index % 3 === 0 ? "'Comic Neue', cursive" : 
                           index % 3 === 1 ? "'Press Start 2P', cursive" : 
                           "'Times New Roman', serif",
                fontSize: index === 2 ? '10px' : '14px',
                transform: hoveredItem === item.href ? 'rotate(2deg)' : 'none',
              }}
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {item.label}
              {index === 2 && <span className="new-badge ml-1">NEW!</span>}
            </Link>
          ))}
        </div>
        
        {/* Fake items */}
        <div className="flex items-center gap-2">
          {fakeItems.slice(0, 2).map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.action === 'alert') {
                  alert('This feature is premium. Please upgrade to Premium Premium™ for $49.99/month');
                } else {
                  alert('404: The page you\'re looking for exists but doesn\'t want to be found.');
                }
              }}
              className="px-3 py-1 text-xs text-[#999999] bg-[#AAAAAA] border border-[#999999] cursor-pointer hover:text-[#666666]"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

export function SideNav() {
  const router = useRouter();

  return (
    <aside 
      className="w-48 min-h-screen bg-[#F5F5DC] border-r-8 border-ridge border-[#808080] p-4"
      style={{ fontFamily: "'VT323', monospace" }}
    >
      <div className="mb-6 text-center">
        <span className="text-2xl animate-pulse">📍</span>
        <p 
          className="text-xs text-[#777777] mt-1"
          style={{ fontFamily: "'Comic Neue', cursive" }}
        >
          You are somewhere
        </p>
      </div>
      
      <nav className="space-y-2">
        {navItems.sidebar.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => {
              if (Math.random() > 0.72) {
                e.preventDefault();
                const wrongTarget = navItems.sidebar[(index + 1) % navItems.sidebar.length].href;
                router.push(wrongTarget);
              }
            }}
            className={`
              block px-3 py-2 text-lg transition-all
              ${index % 2 === 0 ? 'text-right' : 'text-left'}
              ${index === 0 ? 'bg-[#39FF14] text-[#8B4513] font-bold' : ''}
              ${index === 1 ? 'bg-[#FF69B4] text-white' : ''}
              ${index === 2 ? 'bg-[#00FFFF] text-[#8B4513] animate-wiggle' : ''}
              ${index === 3 ? 'bg-[#7BA05B] text-[#FFFF99]' : ''}
              ${index === 4 ? 'bg-[#8B4513] text-[#F5F5DC]' : ''}
              hover:pl-6 hover:shadow-lg
            `}
            style={{
              borderLeft: index % 2 === 0 ? '4px solid #FF0000' : 'none',
              borderRight: index % 2 !== 0 ? '4px solid #0000FF' : 'none',
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      
      {/* Fake ad */}
      <div className="mt-8 fake-ad text-xs">
        <p className="font-bold" style={{ fontFamily: "'Bangers', cursive" }}>
          🎰 WIN BIG! 🎰
        </p>
        <p className="text-[8px] mt-1">
          You are the 1,000,000th visitor!
          <br />
          Click to claim your prize*
        </p>
        <p className="text-[6px] text-[#666666] mt-2">
          *Prize is more of this website
        </p>
      </div>
      
      {/* Visitor counter */}
      <div className="mt-6 text-center">
        <p className="text-xs mb-1" style={{ fontFamily: "'Comic Neue', cursive" }}>
          Visitors:
        </p>
        <div className="visitor-counter text-lg">
          8,472,910
        </div>
      </div>
    </aside>
  );
}

export function FooterNav() {
  const router = useRouter();

  return (
    <footer 
      id="footer"
      className="bg-[#8B4513] border-t-4 border-double border-[#39FF14] p-6"
      style={{ fontFamily: "'Times New Roman', serif" }}
    >
      {/* Breadcrumbs that lie */}
      <div className="text-center mb-4 text-[#FFFF99] text-xs">
        <span style={{ fontFamily: "'Courier New', monospace" }}>
          Home &gt; Home &gt; Settings &gt; Tour &gt; Home &gt; You Are Here
        </span>
      </div>
      
      <div className="flex justify-center gap-4 flex-wrap">
        {navItems.footer.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => {
              if (Math.random() > 0.9) {
                e.preventDefault();
                const wrongTarget = navItems.footer[(index + 3) % navItems.footer.length].href;
                router.push(wrongTarget);
              }
            }}
            className={`
              px-4 py-2 text-sm text-[#F5F5DC] 
              hover:text-[#39FF14] transition-colors
              ${index === 2 ? 'animate-blink-fast' : ''}
            `}
            style={{
              textDecoration: index % 2 === 0 ? 'underline' : 'none',
              fontStyle: index === 1 ? 'italic' : 'normal',
              fontWeight: index === 3 ? 'bold' : 'normal',
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>
      
      {/* Disclaimer */}
      <div className="disclaimer mt-6 text-center">
        <p>
          © 2026 Museum of Bad Decisions™ | All Wrongs Reserved | 
          By scrolling to this footer you have agreed to arbitration in a court of our choosing | 
          Your IP address has been logged and judged | 
          This website may contain traces of irony |
          No humans were harmed in the making of this website (several were mildly inconvenienced) |
          The views expressed are not views at all |
          End of line.
        </p>
      </div>
      
      {/* Date in different formats */}
      <div className="text-center mt-4 text-[#999999] text-xs">
        <span>Last updated: 02/16/2026</span>
        <span className="mx-2">|</span>
        <span>16 Feb 2026</span>
        <span className="mx-2">|</span>
        <span>2026-02-16</span>
      </div>
    </footer>
  );
}

export function FloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 200 });

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) {
        setPosition({
          x: 12 + Math.floor(Math.random() * 60),
          y: 130 + Math.floor(Math.random() * Math.max(window.innerHeight - 260, 120)),
        });
      }
    }, 9000);

    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <div 
      className="fixed z-[9999]"
      style={{ 
        right: `${position.x}px`, 
        top: `${position.y}px`,
      }}
    >
      {isOpen ? (
        <div 
          className="bg-[#E6E6FA] border-4 border-outset border-[#808080] p-3 shadow-lg"
          style={{ fontFamily: "'Comic Neue', cursive" }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-sm animate-rainbow">Quick Menu</span>
            <button 
              onClick={() => setIsOpen(false)}
              className="btn-tiny-close"
            >
              ✕
            </button>
          </div>
          
          <nav className="space-y-1">
            {navItems.floating.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  block px-2 py-1 text-xs
                  ${index === 2 ? 'text-[#FF0000] font-bold animate-pulse' : 'text-[#8B4513]'}
                  hover:bg-[#FFFF99]
                `}
                style={{
                  fontFamily: index % 2 === 0 ? "'Bangers', cursive" : "'Neucha', cursive",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          {/* Fake items in floating menu */}
          <div className="mt-2 pt-2 border-t border-dashed border-[#808080]">
            {fakeItems.slice(2).map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  if (item.action === 'alert') {
                    alert('CLICK HERE? More like CLICK NOWHERE! 😂');
                  } else {
                    alert('Member Login: You are already a member. Of this website. Forever.');
                  }
                }}
                className="block w-full text-left px-2 py-1 text-xs text-[#999999] hover:text-[#666666]"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#FF69B4] text-white px-4 py-2 rounded-full shadow-lg animate-pulse-color hover:animate-shake"
          style={{ fontFamily: "'Bangers', cursive" }}
        >
          📍 Menu?
        </button>
      )}
    </div>
  );
}

export function Navigation() {
  return (
    <>
      <TopNav />
      <div className="flex">
        <SideNav />
        <main className="flex-1">
          {/* Content will be rendered here by pages */}
        </main>
      </div>
      <FloatingWidget />
      <FooterNav />
    </>
  );
}
