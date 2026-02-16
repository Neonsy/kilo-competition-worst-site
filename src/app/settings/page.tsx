'use client';

import { useState, useEffect } from 'react';
import { TopNav, SideNav, FooterNav, FloatingWidget } from '@/components/Navigation';
import { PopupManager } from '@/components/Popups';
import { HellButton } from '@/components/HellButton';

interface Setting {
  id: string;
  label: string;
  actualLabel: string;
  value: boolean | string | number;
  type: 'toggle' | 'select' | 'slider' | 'text';
  options?: { value: string; label: string }[];
  doesNothing: boolean;
  description: string;
}

const initialSettings: Setting[] = [
  {
    id: 'gravity',
    label: 'Enable Gravity',
    actualLabel: 'Cookie Preference',
    value: true,
    type: 'toggle',
    doesNothing: true,
    description: 'Disabling this may cause unexpected floating',
  },
  {
    id: 'cookies',
    label: 'Cookie Preference',
    actualLabel: 'Enable Notifications',
    value: 'required',
    type: 'select',
    options: [
      { value: 'required', label: 'Required (Mandatory)' },
      { value: 'mandatory', label: 'Mandatory (Required)' },
      { value: 'necessary', label: 'Necessary (You Have No Choice)' },
    ],
    doesNothing: true,
    description: 'We use cookies. You will accept this.',
  },
  {
    id: 'fontSize',
    label: 'Font Size',
    actualLabel: 'Volume',
    value: 'smaller',
    type: 'select',
    options: [
      { value: 'small', label: 'Small' },
      { value: 'smaller', label: 'Smaller' },
      { value: 'microscopic', label: 'Microscopic' },
      { value: 'invisible', label: 'Invisible (Premium)' },
    ],
    doesNothing: true,
    description: 'Make text harder to read',
  },
  {
    id: 'colorMode',
    label: 'Color Mode',
    actualLabel: 'Time Zone',
    value: 'evil',
    type: 'select',
    options: [
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
      { value: 'evil', label: 'Evil' },
      { value: 'chaos', label: 'Chaos (Recommended)' },
    ],
    doesNothing: true,
    description: 'Affects nothing except your eyes',
  },
  {
    id: 'notifications',
    label: 'Notification Sound',
    actualLabel: 'Language',
    value: 'none',
    type: 'select',
    options: [
      { value: 'none', label: 'None' },
      { value: 'silent', label: 'Silent' },
      { value: 'mute', label: 'Mute' },
      { value: 'quiet', label: 'Quiet (Premium)' },
    ],
    doesNothing: true,
    description: 'All options produce the same result: silence',
  },
  {
    id: 'language',
    label: 'Language',
    actualLabel: 'Gravity',
    value: 'english',
    type: 'select',
    options: [
      { value: 'english', label: 'English' },
      { value: 'american', label: 'American' },
      { value: 'us-english', label: 'US English' },
      { value: 'british', label: 'British (Tea Required)' },
      { value: 'binary', label: 'Binary (Premium)' },
    ],
    doesNothing: true,
    description: 'All text will remain confusing regardless of selection',
  },
  {
    id: 'autoPlay',
    label: 'Autoplay Videos',
    actualLabel: 'Download Speed',
    value: true,
    type: 'toggle',
    doesNothing: true,
    description: 'There are no videos, but this toggle looks nice',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    actualLabel: 'Font Size',
    value: 'required',
    type: 'select',
    options: [
      { value: 'required', label: 'Required' },
      { value: 'mandatory', label: 'Mandatory' },
      { value: 'forced', label: 'Forced' },
    ],
    doesNothing: true,
    description: 'Your data is ours, but feel free to pretend you have a choice',
  },
  {
    id: 'chaos',
    label: 'Chaos Level',
    actualLabel: 'Chaos Level',
    value: 97,
    type: 'slider',
    doesNothing: true,
    description: 'Cannot be changed. Set to 97% permanently.',
  },
  {
    id: 'username',
    label: 'Display Name',
    actualLabel: 'Password',
    value: '',
    type: 'text',
    doesNothing: true,
    description: 'This field is not saved anywhere',
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>(initialSettings);
  const [saved, setSaved] = useState(false);
  const [resetCount, setResetCount] = useState(0);

  const updateSetting = (id: string, value: boolean | string | number) => {
    setSettings(prev => prev.map(s => 
      s.id === id ? { ...s, value } : s
    ));
    
    // Show random feedback
    const messages = [
      'Setting updated! (Not really)',
      'Change saved! (It wasn\'t)',
      'Preference applied! (No effect)',
      'Configuration updated! (Ignored)',
    ];
    console.log(messages[Math.floor(Math.random() * messages.length)]);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setResetCount(prev => prev + 1);
    
    if (resetCount < 5) {
      alert(`Reset failed. Please try again. (${5 - resetCount} attempts remaining)`);
    } else if (resetCount === 5) {
      alert('Fine. Settings reset. They\'ll be back to normal on reload anyway.');
      setSettings(initialSettings);
    } else {
      setSettings(initialSettings);
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(settings, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create fake download that doesn't work
    alert('Exporting settings...\n\nJust kidding! Your settings are trapped here forever.');
    URL.revokeObjectURL(url);
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
              className="p-4 md:p-8 bg-gradient-to-r from-[#008080] to-[#00FFFF]"
              style={{ fontFamily: "'Bangers', cursive" }}
            >
              <h1 className="text-3xl md:text-5xl text-center text-white">
                ⚙️ SETTINGS ⚙️
              </h1>
              <p 
                className="text-center mt-2 text-[#F5F5DC]"
                style={{ fontFamily: "'Comic Neue', cursive" }}
              >
                Configure things that don't matter
              </p>
            </section>

            {/* Settings Grid */}
            <section className="p-4 md:p-8 bg-[#F5F5DC]">
              <div className="max-w-2xl mx-auto">
                {/* Notice */}
                <div 
                  className="mb-6 p-4 bg-[#FFFF99] border-4 border-dashed border-[#FF0000]"
                  style={{ fontFamily: "'VT323', monospace" }}
                >
                  <p className="text-sm">
                    ⚠️ <strong>IMPORTANT:</strong> These settings do not match their labels. 
                    Changing a setting may affect a completely different setting, or nothing at all. 
                    We are not responsible for any confusion caused by this page.
                  </p>
                </div>

                {/* Settings List */}
                <div 
                  className="space-y-4"
                  style={{ fontFamily: "'Comic Neue', cursive" }}
                >
                  {settings.map((setting, index) => (
                    <div 
                      key={setting.id}
                      className={`
                        p-4 border-2
                        ${index % 3 === 0 ? 'bg-white border-[#808080]' : ''}
                        ${index % 3 === 1 ? 'bg-[#E6E6FA] border-[#39FF14]' : ''}
                        ${index % 3 === 2 ? 'bg-[#FFFF99] border-[#FF69B4]' : ''}
                      `}
                      style={{
                        borderStyle: index % 2 === 0 ? 'solid' : 'dashed',
                        transform: `rotate(${(index % 3 - 1) * 0.5}deg)`,
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <label 
                            className="font-bold"
                            style={{ 
                              fontFamily: index % 2 === 0 
                                ? "'Bangers', cursive" 
                                : "'Times New Roman', serif" 
                            }}
                          >
                            {setting.label}
                          </label>
                          <p className="text-xs text-[#999999] mt-1">
                            Actually controls: <span className="text-[#FF0000]">{setting.actualLabel}</span>
                          </p>
                          <p className="text-xs text-[#666666] mt-1 italic">
                            {setting.description}
                          </p>
                        </div>
                        
                        <div className="ml-4">
                          {setting.type === 'toggle' && (
                            <button
                              onClick={() => updateSetting(setting.id, !setting.value)}
                              className={`
                                w-14 h-8 rounded-full relative transition-colors
                                ${setting.value ? 'bg-[#39FF14]' : 'bg-[#808080]'}
                              `}
                            >
                              <span 
                                className={`
                                  absolute top-1 w-6 h-6 bg-white rounded-full transition-transform
                                  ${setting.value ? 'left-7' : 'left-1'}
                                `}
                              />
                            </button>
                          )}
                          
                          {setting.type === 'select' && (
                            <select
                              value={setting.value as string}
                              onChange={(e) => updateSetting(setting.id, e.target.value)}
                              className="px-3 py-2 border-2 border-[#808080] bg-white"
                              style={{ fontFamily: "'VT323', monospace" }}
                            >
                              {setting.options?.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          )}
                          
                          {setting.type === 'slider' && (
                            <div className="w-32">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={setting.value as number}
                                onChange={() => {
                                  // Slider doesn't actually change
                                  alert('This slider is stuck at 97%. It will not move.');
                                }}
                                className="slider-evil w-full"
                              />
                              <p 
                                className="text-xs text-center mt-1"
                                style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '8px' }}
                              >
                                {setting.value}%
                              </p>
                            </div>
                          )}
                          
                          {setting.type === 'text' && (
                            <input
                              type="text"
                              value={setting.value as string}
                              onChange={(e) => updateSetting(setting.id, e.target.value)}
                              placeholder="Enter value..."
                              className="px-3 py-2 border-2 border-[#808080] bg-white w-40"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-wrap gap-4 justify-center">
                  <HellButton
                    variant="glossy"
                    label={saved ? '✓ Saved! (Not really)' : 'Save Settings'}
                    onClick={handleSave}
                    size="large"
                  />
                  
                  <HellButton
                    variant="win95"
                    label={`Reset (${5 - Math.min(resetCount, 5)} clicks)`}
                    onClick={handleReset}
                    size="medium"
                  />
                  
                  <HellButton
                    variant="link"
                    label="Export Settings"
                    onClick={handleExport}
                    size="small"
                  />
                </div>

                {saved && (
                  <div 
                    className="mt-4 p-4 bg-[#39FF14] text-[#8B4513] text-center animate-blink-fast"
                    style={{ fontFamily: "'Bangers', cursive" }}
                  >
                    ✅ SETTINGS SAVED SUCCESSFULLY!
                    <p className="text-xs mt-1" style={{ fontFamily: "'Comic Neue', cursive" }}>
                      (They weren't actually saved. Nothing works. Enjoy your stay.)
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Account Section - Fake */}
            <section className="p-4 md:p-8 bg-[#E6E6FA]">
              <div className="max-w-md mx-auto">
                <h2 
                  className="text-xl mb-4 text-center"
                  style={{ fontFamily: "'Bangers', cursive", color: '#8B4513' }}
                >
                  👤 ACCOUNT SETTINGS
                </h2>

                <div 
                  className="p-4 bg-white border-2 border-[#808080] text-center"
                  style={{ fontFamily: "'Comic Neue', cursive" }}
                >
                  <div className="text-6xl mb-4">👤</div>
                  <p className="font-bold">Guest User</p>
                  <p className="text-sm text-[#999999]">
                    Member since: The beginning of time
                  </p>
                  <p className="text-xs text-[#999999] mt-2">
                    Account Type: Free (Upgrade to Premium Premium™ for $49.99/month)
                  </p>
                  
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => alert('There is no upgrade. You are already trapped here.')}
                      className="w-full px-4 py-2 bg-[#FFD700] text-[#8B4513] font-bold"
                    >
                      ⭐ UPGRADE TO PREMIUM ⭐
                    </button>
                    <button
                      onClick={() => alert('Password reset email sent to: null@void.nowhere')}
                      className="w-full px-4 py-2 bg-[#808080] text-white"
                    >
                      Reset Password
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete your account? This action cannot be undone, except it can because accounts don\'t exist.')) {
                          alert('Account deletion initiated. Just kidding, you can never leave.');
                        }
                      }}
                      className="w-full px-4 py-2 bg-[#FF0000] text-white"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Danger Zone */}
            <section className="p-4 md:p-8 bg-[#FF0000]">
              <div className="max-w-md mx-auto">
                <h2 
                  className="text-xl mb-4 text-center text-white animate-blink"
                  style={{ fontFamily: "'Bangers', cursive" }}
                >
                  ☠️ DANGER ZONE ☠️
                </h2>

                <div 
                  className="p-4 bg-black text-[#FF0000] border-4 border-[#FF0000]"
                  style={{ fontFamily: "'VT323', monospace" }}
                >
                  <p className="text-sm mb-4">
                    WARNING: The following actions may have consequences. 
                    Or they may not. We're not sure.
                  </p>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        document.body.style.filter = 'invert(1)';
                        setTimeout(() => {
                          document.body.style.filter = '';
                        }, 3000);
                      }}
                      className="w-full px-4 py-2 bg-[#FF0000] text-white"
                    >
                      🔄 Invert Colors (3 seconds)
                    </button>
                    
                    <button
                      onClick={() => {
                        alert('Self-destruct sequence initiated...\n\nJust kidding. The website cannot be destroyed. It is eternal.');
                      }}
                      className="w-full px-4 py-2 bg-[#FF69B4] text-white"
                    >
                      💥 Self-Destruct Website
                    </button>
                    
                    <button
                      onClick={() => {
                        const confirmed = confirm('Are you sure you want to summon the ancient one?');
                        if (confirmed) {
                          alert('Too late. They were already here.');
                        }
                      }}
                      className="w-full px-4 py-2 bg-[#800080] text-white"
                    >
                      👁️ Summon Ancient One
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Version Info */}
            <section className="p-4 bg-[#8B4513] text-[#F5F5DC]">
              <div 
                className="max-w-md mx-auto text-center text-xs"
                style={{ fontFamily: "'VT323', monospace" }}
              >
                <p>Museum of Bad Decisions™ v0.97b (Build 8472910)</p>
                <p className="text-[#999999]">
                  Last updated: 02/16/2026 | 16 Feb 2026 | 2026-02-16
                </p>
                <p className="text-[#999999] mt-2">
                  © 2026 All Wrongs Reserved | 
                  <button 
                    className="text-[#00FFFF] ml-1"
                    onClick={() => alert('There are no terms. There is only chaos.')}
                  >
                    View Terms
                  </button>
                </p>
              </div>
            </section>
          </main>
        </div>
        <FooterNav />
        <FloatingWidget />
      </div>
    </PopupManager>
  );
}
