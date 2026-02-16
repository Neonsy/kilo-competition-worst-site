'use client';

import Link from 'next/link';
import { TopNav, SideNav, FooterNav, FloatingWidget } from '@/components/Navigation';
import { PopupManager } from '@/components/Popups';
import { HellButton } from '@/components/HellButton';
import { getRandomTestimonials } from '@/data/testimonials';
import { getRandomDisclaimer } from '@/data/disclaimers';

export default function Home() {
  const testimonials = getRandomTestimonials(4);
  const disclaimer = getRandomDisclaimer();

  return (
    <PopupManager>
      <div className="min-h-screen flex flex-col">
        <TopNav />
        
        <div className="flex flex-1">
          <SideNav />
          
          <main className="flex-1 overflow-x-hidden">
            {/* Hero Section - Maximum Overwhelm */}
            <section 
              className="relative min-h-[70vh] bg-gradient-to-br from-[#39FF14] via-[#FF69B4] to-[#00FFFF] p-4 md:p-8"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 80%, rgba(255,255,0,0.3) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(255,0,255,0.3) 0%, transparent 50%),
                  linear-gradient(45deg, #39FF14, #FF69B4, #00FFFF)
                `,
              }}
            >
              {/* Starburst decorations */}
              <div className="absolute top-4 left-4 starburst w-24 h-24 flex items-center justify-center">
                <span className="text-white text-xs" style={{ fontFamily: "'Bangers', cursive" }}>
                  FREE*!
                </span>
              </div>
              
              <div className="absolute top-4 right-4">
                <span className="new-badge text-lg">NEW!</span>
              </div>
              
              <div className="absolute bottom-4 left-1/4 animate-float">
                <span className="text-6xl">🎭</span>
              </div>
              
              <div className="absolute bottom-8 right-1/4 animate-bounce-chaotic">
                <span className="text-5xl">🎪</span>
              </div>
              
              {/* Main title - blinking and chaotic */}
              <div className="text-center relative z-10">
                <h1 
                  className="text-4xl md:text-7xl font-bold mb-4 animate-rainbow"
                  style={{ 
                    fontFamily: "'Bangers', cursive",
                    textShadow: '4px 4px 0 #8B4513, 8px 8px 0 #000',
                    transform: 'rotate(-2deg)',
                  }}
                >
                  🏛️ THE MUSEUM OF BAD DECISIONS 🏛️
                </h1>
                
                <h2 
                  className="text-xl md:text-3xl animate-blink-fast"
                  style={{ 
                    fontFamily: "'Comic Neue', cursive",
                    color: '#FFFF00',
                    textShadow: '2px 2px 0 #000',
                  }}
                >
                  Where Every Click Is A Mistake™
                </h2>
                
                <p 
                  className="mt-4 text-lg md:text-xl max-w-2xl mx-auto"
                  style={{ 
                    fontFamily: "'Times New Roman', serif",
                    color: '#8B4513',
                    textAlign: 'justify', // Painful justification
                    lineHeight: 2.4,
                  }}
                >
                  <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '10px' }}>
                    WELCOME
                  </span>
                  , valued visitor #8,472,910! You have been chosen to experience our 
                  <span style={{ fontFamily: "'Rock Salt', cursive", color: '#FF0000' }}>
                    WORLD-CLASS
                  </span>
                  {' '}collection of 
                  <span style={{ fontFamily: "'Creepster', cursive" }}>terrible choices</span>
                  , 
                  <span style={{ fontFamily: "'Gloria Hallelujah', cursive" }}>questionable designs</span>
                  , and 
                  <span style={{ fontFamily: "'Special Elite', cursive" }}>regrettable experiences</span>
                  . Your presence has been noted and will be remembered forever.
                </p>
                
                {/* CTA Button - blinking and annoying */}
                <div className="mt-8">
                  <Link href="/tour">
                    <button
                      className="px-8 py-4 text-xl md:text-2xl font-bold animate-pulse-color rounded-lg shadow-chaos"
                      style={{ 
                        fontFamily: "'Bangers', cursive",
                        background: 'linear-gradient(180deg, #FF69B4 0%, #FF1493 100%)',
                        border: '4px dashed #39FF14',
                        color: 'white',
                        textShadow: '2px 2px 0 #000',
                        transform: 'rotate(1deg)',
                      }}
                    >
                      🎫 START YOUR TOUR OF REGRET 🎫
                    </button>
                  </Link>
                  
                  <p 
                    className="mt-2 text-xs animate-blink"
                    style={{ fontFamily: "'VT323', monospace", color: '#FF0000' }}
                  >
                    ⚠️ WARNING: Tour may cause mild existential dread ⚠️
                  </p>
                </div>
              </div>
            </section>
            
            {/* Fake News Ticker */}
            <div className="marquee-container bg-[#8B4513] py-2">
              <div 
                className="marquee-content text-[#FFFF99]"
                style={{ fontFamily: "'VT323', monospace" }}
              >
                📰 BREAKING: Local person makes bad decision, visits museum about it | 
                📰 STUDY: 97% of visitors regret visiting (the other 3% lied) | 
                📰 WEATHER: Cloudy with a chance of poor choices | 
                📰 ALERT: Your session will expire in -3 minutes | 
                📰 NOTICE: By reading this ticker you agree to our terms | 
                📰 UPDATE: Website still terrible, management proud | 
                📰 TIP: The exit is not where you think it is |
              </div>
            </div>
            
            {/* Welcome Section - Corporate Speak */}
            <section 
              className="p-8 md:p-16 bg-[#F5F5DC]"
              style={{ 
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%238B4513\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M0 0h20v20H0V0zm20 20h20v20H20V20z\'/%3E%3C/g%3E%3C/svg%3E")',
              }}
            >
              <div className="max-w-4xl mx-auto">
                <h2 
                  className="text-3xl md:text-4xl text-center mb-8"
                  style={{ 
                    fontFamily: "'Arial Black', sans-serif",
                    color: '#008080',
                    textShadow: '3px 3px 0 #FFFF99',
                  }}
                >
                  💼 A Message From Our Board of Directors 💼
                </h2>
                
                <div 
                  className="bg-white p-6 border-4 border-double border-[#808080] shadow-ugly"
                  style={{ fontFamily: "'Times New Roman', serif" }}
                >
                  <p className="text-lg leading-relaxed text-justify mb-4">
                    <span style={{ fontFamily: "'Comic Neue', cursive", fontSize: '22px' }}>
                      Dear Valued Visitor™,
                    </span>
                  </p>
                  
                  <p className="text-base leading-relaxed text-justify mb-4" style={{ textAlign: 'right' }}>
                    We are <span style={{ fontFamily: "'Bangers', cursive" }}>THRILLED</span> to 
                    welcome you to our premier establishment dedicated to the preservation and 
                    celebration of humanity's most questionable choices. Our 
                    <span style={{ fontFamily: "'Gloria Hallelujah', cursive" }}>award-winning</span>
                    {' '}exhibits have been carefully curated by our team of 
                    <span style={{ fontFamily: "'Creepster', cursive" }}>certified regret specialists</span>.
                  </p>
                  
                  <p className="text-sm leading-relaxed mb-4" style={{ textAlign: 'center' }}>
                    <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '8px' }}>
                      PLEASE NOTE:
                    </span>
                    {' '}Your visit constitutes a binding agreement to surrender your emotional 
                    well-being to the Museum for purposes of research and mild amusement. 
                    <span style={{ fontFamily: "'VT323', monospace" }}>
                      No take-backsies.
                    </span>
                  </p>
                  
                  <p 
                    className="text-xs text-[#999999] text-center mt-4"
                    style={{ fontFamily: "'VT323', monospace" }}
                  >
                    {disclaimer}
                  </p>
                </div>
              </div>
            </section>
            
            {/* Features Grid - Different styles per card */}
            <section className="p-8 bg-gradient-to-b from-[#E6E6FA] to-[#FFFF99]">
              <h2 
                className="text-2xl md:text-3xl text-center mb-8"
                style={{ 
                  fontFamily: "'Bangers', cursive",
                  color: '#FF69B4',
                  transform: 'rotate(1deg)',
                }}
              >
                ✨ EXPLORE OUR "FEATURES" ✨
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {/* Feature 1 - Skeuomorphic */}
                <div className="skeuomorphic p-6 text-center">
                  <span className="text-4xl">🔘</span>
                  <h3 
                    className="text-xl mt-4 mb-2"
                    style={{ fontFamily: "'Arial Black', sans-serif" }}
                  >
                    Interactive Exhibits
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ fontFamily: "'Times New Roman', serif" }}
                  >
                    Click things. Touch things. Regret things. Our exhibits are designed to 
                    maximize engagement and minimize satisfaction.
                  </p>
                </div>
                
                {/* Feature 2 - Win95 style */}
                <div className="win95 p-6 text-center">
                  <span className="text-4xl">📊</span>
                  <h3 
                    className="text-xl mt-4 mb-2"
                    style={{ fontFamily: "'VT323', monospace" }}
                  >
                    Regret Analytics™
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ fontFamily: "'VT323', monospace" }}
                  >
                    Our proprietary algorithm calculates your personal regret score using 
                    advanced chaos mathematics and vibes.
                  </p>
                </div>
                
                {/* Feature 3 - Glossy */}
                <div className="glossy p-6 text-center">
                  <span className="text-4xl">🏆</span>
                  <h3 
                    className="text-xl mt-4 mb-2"
                    style={{ fontFamily: "'Bangers', cursive" }}
                  >
                    Certificate of Regret
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ fontFamily: "'Comic Neue', cursive" }}
                  >
                    Complete our tour and receive a personalized certificate documenting 
                    your poor life choices.
                  </p>
                </div>
              </div>
            </section>
            
            {/* Fake Ad */}
            <section className="p-4">
              <div className="fake-ad max-w-md mx-auto">
                <p 
                  className="text-xl font-bold animate-wiggle"
                  style={{ fontFamily: "'Bangers', cursive" }}
                >
                  🎰 YOU WON'T BELIEVE THESE EXHIBITS! 🎰
                </p>
                <p 
                  className="text-sm mt-2"
                  style={{ fontFamily: "'Comic Neue', cursive" }}
                >
                  Doctors HATE this one weird trick to maximize your regret!
                </p>
                <button
                  onClick={() => alert('This ad is fake. Like your hopes of a good user experience.')}
                  className="mt-4 px-4 py-2 bg-[#FF0000] text-white font-bold animate-pulse"
                  style={{ fontFamily: "'Arial Black', sans-serif" }}
                >
                  CLICK HERE (don't)
                </button>
                <p className="text-[6px] text-[#666666] mt-2">
                  *Not a real ad. Museum not responsible for curiosity-based clicking.
                </p>
              </div>
            </section>
            
            {/* Testimonials - Spreadsheet style */}
            <section 
              className="p-8 bg-[#C0C0C0]"
              style={{ fontFamily: "'VT323', monospace" }}
            >
              <h2 
                className="text-2xl text-center mb-6"
                style={{ 
                  fontFamily: "'Arial Black', sans-serif",
                  color: '#800000',
                }}
              >
                📋 VISITOR TESTIMONIALS (VERIFIED*)
              </h2>
              
              <div className="overflow-x-auto">
                <table className="spreadsheet w-full max-w-4xl mx-auto">
                  <thead>
                    <tr>
                      <th>Visitor</th>
                      <th>Location</th>
                      <th>Testimonial</th>
                      <th>Rating</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testimonials.map((t, i) => (
                      <tr key={t.id} style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#E0E0E0' }}>
                        <td>
                          <span className="mr-1">{t.avatar}</span>
                          <span style={{ fontFamily: "'Comic Neue', cursive" }}>{t.name}</span>
                        </td>
                        <td style={{ fontFamily: "'Times New Roman', serif" }}>{t.location}</td>
                        <td style={{ fontFamily: "'Gloria Hallelujah', cursive", fontSize: '12px' }}>
                          "{t.text}"
                        </td>
                        <td style={{ fontFamily: "'Bangers', cursive", color: t.rating >= 4 ? '#39FF14' : '#FF0000' }}>
                          {'⭐'.repeat(t.rating)}
                        </td>
                        <td style={{ fontFamily: "'Courier New', monospace", fontSize: '10px' }}>
                          {t.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <p className="text-[8px] text-center text-[#666666] mt-4">
                *Verification process consists of us believing you exist. No actual verification performed.
              </p>
            </section>
            
            {/* Chat App Style Section */}
            <section className="p-8 bg-[#E6E6FA]">
              <h2 
                className="text-2xl text-center mb-6"
                style={{ fontFamily: "'Bangers', cursive", color: '#8B4513' }}
              >
                💬 LIVE CHAT WITH OUR AI GUIDE
              </h2>
              
              <div className="chat-container max-w-md mx-auto">
                <div className="chat-message bot">
                  <p className="text-xs text-[#666666] mb-1">MuseumBot v0.97b</p>
                  <p>Welcome to the Museum! How can I not help you today?</p>
                </div>
                
                <div className="chat-message user">
                  <p>I'd like to find the exit.</p>
                </div>
                
                <div className="chat-message bot">
                  <p>I understand you're looking for the exit. Have you considered staying forever? 
                  The exit is currently under maintenance. Expected completion: never.</p>
                </div>
                
                <div className="chat-message user">
                  <p>Can I speak to a human?</p>
                </div>
                
                <div className="chat-message bot">
                  <p>Connecting you to a human... 
                  <span className="animate-blink">█</span>
                  <br />
                  <span className="text-xs text-[#999999]">
                    (There are no humans. There is only MuseumBot.)
                  </span>
                  </p>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Type a message (we're not listening)..."
                    className="flex-1 px-3 py-2 border-2 border-[#808080]"
                    style={{ fontFamily: "'Comic Neue', cursive" }}
                    disabled
                  />
                  <button
                    className="px-4 py-2 bg-[#808080] text-white"
                    style={{ fontFamily: "'VT323', monospace" }}
                    onClick={() => alert('Chat feature is permanently offline. Like your hopes.')}
                  >
                    Send
                  </button>
                </div>
              </div>
            </section>
            
            {/* Final CTA - Printed Flyer Style */}
            <section className="p-8 bg-[#7BA05B]">
              <div className="flyer max-w-lg mx-auto">
                <h2 
                  className="text-3xl text-center"
                  style={{ fontFamily: "'Bangers', cursive" }}
                >
                  🎟️ DON'T MISS OUT! 🎟️
                </h2>
                
                <p 
                  className="text-center mt-4 text-lg"
                  style={{ fontFamily: "'Comic Neue', cursive" }}
                >
                  Start your journey through the 
                  <span style={{ fontFamily: "'Rock Salt', cursive", color: '#FF0000' }}>
                    {' '}HALL OF BAD DECISIONS{' '}
                  </span>
                  today!
                </p>
                
                <div className="text-center mt-6">
                  <Link href="/tour">
                    <HellButton
                      variant="pill"
                      label="BEGIN YOUR REGRET JOURNEY"
                      size="massive"
                    />
                  </Link>
                </div>
                
                <div className="flyer-tear-off mt-6">
                  <p 
                    className="text-center text-sm"
                    style={{ fontFamily: "'VT323', monospace" }}
                  >
                    ▼ Tear here (you can't, this is a website) ▼
                  </p>
                  <div className="flex justify-center gap-2 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i}
                        className="w-16 h-8 bg-[#FFFF99] border border-[#8B4513] flex items-center justify-center text-[8px]"
                        style={{ fontFamily: "'Courier New', monospace" }}
                      >
                        FREE TOUR*
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            
            {/* Under Construction Banner */}
            <div className="under-construction">
              <span 
                className="text-2xl animate-blink-fast"
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                🚧 UNDER CONSTRUCTION SINCE 2019 🚧
              </span>
              <p 
                className="text-sm mt-2"
                style={{ fontFamily: "'Comic Neue', cursive" }}
              >
                This website is perpetually under construction. It will never be finished. 
                Much like your regrets.
              </p>
            </div>
          </main>
        </div>
        
        <FooterNav />
        <FloatingWidget />
      </div>
    </PopupManager>
  );
}
