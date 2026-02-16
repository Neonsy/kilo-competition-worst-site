'use client';

import { useState } from 'react';
import { Badge } from '@/data/badges';
import { Exhibit } from '@/data/exhibits';

interface CertificateProps {
  name: string;
  score: number;
  badge: Badge;
  exhibits: Exhibit[];
  calculationBreakdown: {
    base: number;
    doorMultiplier: number;
    buttonAnxiety: number;
    shoeSizeFactor: number;
    chaosBonus: number;
  };
}

export function Certificate({ name, score, badge, exhibits, calculationBreakdown }: CertificateProps) {
  const [showDownload, setShowDownload] = useState(false);
  const [downloadAttempts, setDownloadAttempts] = useState(0);

  const handleDownload = () => {
    setDownloadAttempts(prev => prev + 1);
    
    if (downloadAttempts < 3) {
      alert(`Download failed. Please try again. (Attempt ${downloadAttempts + 1}/∞)`);
      return;
    }
    
    if (downloadAttempts === 3) {
      alert('Just kidding! The download button is actually a popup button.');
      setShowDownload(true);
      return;
    }
    
    setShowDownload(true);
  };

  const handleShare = (platform: string) => {
    const text = `I just completed The Museum of Bad Decisions tour and got a Regret Score of ${score}! My badge: "${badge.title}" 🏆 #MuseumOfBadDecisions #RegretCertified`;
    
    switch (platform) {
      case 'twitter':
        alert(`Twitter is temporarily a different website. Please try again never.`);
        break;
      case 'facebook':
        alert(`Your mom would be disappointed. Share anyway? (Just kidding, this button doesn't work)`);
        break;
      case 'linkedin':
        alert(`This will definitely help your career. Posting to LinkedIn... (no it won't)`);
        break;
      case 'email':
        // Actually try to open email
        window.location.href = `mailto:?subject=My Regret Certificate&body=${encodeURIComponent(text)}`;
        break;
      default:
        alert('Sharing is caring. But this button cares about nothing.');
    }
  };

  const today = new Date();
  const dateFormats = [
    today.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
    today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    today.toISOString().split('T')[0],
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Certificate */}
      <div 
        className="certificate"
        style={{ fontFamily: "'Times New Roman', serif" }}
      >
        <h1 
          className="certificate-title"
          style={{ fontFamily: "'Bangers', cursive" }}
        >
          🏛️ CERTIFICATE OF REGRET 🏛️
        </h1>
        
        <p className="text-lg mt-4" style={{ fontFamily: "'Comic Neue', cursive" }}>
          This is to certify that
        </p>
        
        <p 
          className="text-3xl my-4 font-bold animate-rainbow"
          style={{ fontFamily: "'Rock Salt', cursive" }}
        >
          {name || 'Anonymous Regretter'}
        </p>
        
        <p className="text-lg" style={{ fontFamily: "'Comic Neue', cursive" }}>
          has successfully completed the
        </p>
        
        <p 
          className="text-xl my-2"
          style={{ fontFamily: "'Bangers', cursive" }}
        >
          MUSEUM OF BAD DECISIONS™ INTERACTIVE TOUR
        </p>
        
        <p className="text-sm text-[#666666]" style={{ fontFamily: "'VT323', monospace" }}>
          and has earned the following distinction:
        </p>
        
        {/* Badge */}
        <div className="my-6 flex flex-col items-center">
          <div className="certificate-seal">
            <div className="text-2xl">{badge.emoji}</div>
            <div className="text-[8px] mt-1">{badge.title}</div>
          </div>
          <p 
            className="mt-2 text-sm italic"
            style={{ fontFamily: "'Gloria Hallelujah', cursive" }}
          >
            "{badge.description}"
          </p>
        </div>
        
        {/* Score */}
        <div 
          className="my-6 p-4 bg-[#FFFF99] border-4 border-double border-[#8B4513]"
          style={{ fontFamily: "'Press Start 2P', cursive" }}
        >
          <p className="text-xs text-center mb-2">REGRET SCORE</p>
          <p className="text-2xl text-center animate-pulse-color">
            {score.toLocaleString()}
          </p>
          <p className="text-[8px] text-center mt-2 text-[#999999]">
            out of 10,000 (probably)
          </p>
        </div>
        
        {/* Score Calculation */}
        <div 
          className="text-left text-xs p-3 bg-[#F5F5DC] border border-[#808080] mt-4"
          style={{ fontFamily: "'VT323', monospace" }}
        >
          <p className="font-bold mb-2 underline">SCORE CALCULATION:</p>
          <p>Base Score: {calculationBreakdown.base}</p>
          <p>+ Door Choice Multiplier: ×{calculationBreakdown.doorMultiplier}</p>
          <p>- Button Anxiety Factor: {calculationBreakdown.buttonAnxiety}</p>
          <p>× Shoe Size Constant: {calculationBreakdown.shoeSizeFactor}</p>
          <p>+ Chaos Bonus: {calculationBreakdown.chaosBonus}</p>
          <p className="mt-2 font-bold border-t border-[#808080] pt-1">
            = YOUR SCORE: {score}
          </p>
        </div>
        
        {/* Recommended Exhibits */}
        <div className="mt-6 text-left">
          <p 
            className="text-sm font-bold mb-2"
            style={{ fontFamily: "'Bangers', cursive" }}
          >
            YOUR PERSONALIZED REGRET ROUTE:
          </p>
          <ul className="text-sm" style={{ fontFamily: "'Comic Neue', cursive" }}>
            {exhibits.map((exhibit, index) => (
              <li 
                key={exhibit.id}
                className={`py-1 ${index % 2 === 0 ? 'bg-[#E6E6FA]' : 'bg-transparent'}`}
              >
                {index + 1}. {exhibit.title} {exhibit.premium && '⭐'}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Dates in different formats */}
        <div className="mt-6 text-xs text-[#999999]">
          <p>Date: {dateFormats[0]} | {dateFormats[1]} | {dateFormats[2]}</p>
          <p>Certificate ID: {Math.random().toString(36).substring(2, 15).toUpperCase()}</p>
        </div>
        
        {/* Signature */}
        <div className="mt-6 flex justify-between items-end">
          <div className="text-center">
            <div 
              className="text-2xl italic"
              style={{ fontFamily: "'Rock Salt', cursive" }}
            >
              Dr. Regret McBadchoice
            </div>
            <div className="text-xs border-t border-[#8B4513] pt-1">
              Curator of Poor Decisions
            </div>
          </div>
          <div className="text-4xl">🏛️</div>
        </div>
      </div>
      
      {/* Download/Share buttons */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center">
        <button
          onClick={handleDownload}
          className="px-6 py-3 bg-[#39FF14] text-[#8B4513] font-bold border-4 border-outset hover:bg-[#FF69B4] hover:text-white transition-colors"
          style={{ fontFamily: "'Bangers', cursive" }}
        >
          📥 Download Certificate
        </button>
        
        <button
          onClick={() => alert('Printing is deprecated. Please use a camera to take a photo of your screen.')}
          className="px-6 py-3 bg-[#808080] text-white border-2 border-[#606060]"
          style={{ fontFamily: "'VT323', monospace" }}
        >
          🖨️ Print (broken)
        </button>
      </div>
      
      {/* Share buttons */}
      <div className="mt-4 text-center">
        <p 
          className="text-sm mb-2"
          style={{ fontFamily: "'Comic Neue', cursive" }}
        >
          Share your regret:
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => handleShare('twitter')}
            className="px-4 py-2 bg-[#1DA1F2] text-white rounded"
          >
            𝕏
          </button>
          <button
            onClick={() => handleShare('facebook')}
            className="px-4 py-2 bg-[#4267B2] text-white rounded"
          >
            f
          </button>
          <button
            onClick={() => handleShare('linkedin')}
            className="px-4 py-2 bg-[#0077B5] text-white rounded"
          >
            in
          </button>
          <button
            onClick={() => handleShare('email')}
            className="px-4 py-2 bg-[#808080] text-white rounded"
          >
            ✉️
          </button>
          <button
            onClick={() => handleShare('myspace')}
            className="px-4 py-2 bg-[#003399] text-white rounded animate-blink-fast"
          >
            MySpace
          </button>
        </div>
      </div>
      
      {/* Download popup */}
      {showDownload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div 
            className="bg-[#F5F5DC] border-4 border-outset border-[#808080] p-6 max-w-md"
            style={{ fontFamily: "'Comic Neue', cursive" }}
          >
            <h3 
              className="text-xl font-bold mb-4"
              style={{ fontFamily: "'Bangers', cursive" }}
            >
              Download Initiated!
            </h3>
            <p className="mb-4">
              Your certificate is being downloaded to:
            </p>
            <code 
              className="block bg-black text-[#39FF14] p-2 text-xs mb-4"
              style={{ fontFamily: "'VT323', monospace" }}
            >
              C:\\Users\\You\\Downloads\\definitely_real_certificate_{Date.now()}.exe
            </code>
            <p className="text-xs text-[#999999] mb-4">
              Just kidding. This is a fake download. Your certificate exists only in your heart.
            </p>
            <button
              onClick={() => setShowDownload(false)}
              className="px-4 py-2 bg-[#FF69B4] text-white"
            >
              Close (I understand this is fake)
            </button>
          </div>
        </div>
      )}
      
      {/* Disclaimer */}
      <div className="disclaimer mt-6 text-center">
        <p>
          This certificate has no monetary value, no legal standing, and exists purely for entertainment purposes.
          By displaying this certificate, you agree to tell people about the Museum of Bad Decisions.
          The Museum is not responsible for any life decisions made after viewing this certificate.
          Badge rarity is determined by an algorithm that doesn't understand rarity.
          Your regret score is calculated using proprietary chaos mathematics.
        </p>
      </div>
    </div>
  );
}

export default Certificate;
