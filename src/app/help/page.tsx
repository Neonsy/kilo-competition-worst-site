'use client';

import { useCallback, useEffect, useState } from 'react';
import { TopNav, SideNav, FooterNav, FloatingWidget } from '@/components/Navigation';
import { PopupManager } from '@/components/Popups';
import { HellButton } from '@/components/HellButton';
import { HostileInput } from '@/components/HostileForm';
import { LivingOverlay } from '@/components/LivingOverlay';
import { FakeBrowserChrome } from '@/components/FakeBrowserChrome';
import { TargetedCursorLayer } from '@/components/TargetedCursorLayer';
import { CursorCorruptionLayer } from '@/components/CursorCorruptionLayer';
import { getRandomDisclaimer } from '@/data/disclaimers';
import { createModuleSkinMap, getSkinClass, getSkinPulseClass, mutateModuleSkinMap, randomModule, SkinModule } from '@/data/skinPacks';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
  helpful: boolean | null;
}

const faqItems: FAQItem[] = [
  {
    question: "Why does this website exist?",
    answer: "This website exists to document and celebrate humanity's most questionable choices. Also, we had too much free time and access to web development tools. The combination was inevitable.",
    category: "General",
    helpful: null,
  },
  {
    question: "How do I exit the museum?",
    answer: "The exit is located... somewhere. We're not entirely sure where anymore. The architect had a vision. The vision did not include clear exit signage. We recommend simply closing your browser and pretending this never happened.",
    category: "Navigation",
    helpful: null,
  },
  {
    question: "Is my data safe?",
    answer: "Your data is stored in our secure database located in an undisclosed location (our intern's laptop). We use industry-standard encryption that we downloaded from a popup ad in 2003. Your data is as safe as it possibly could be, which is not very safe at all.",
    category: "Privacy",
    helpful: null,
  },
  {
    question: "Why is the progress bar stuck at 97%?",
    answer: "The progress bar is not stuck. It is simply reflecting the fundamental truth that nothing in life ever truly reaches 100% completion. Also, we couldn't figure out how to make it go higher. It's a feature, not a bug.",
    category: "Technical",
    helpful: null,
  },
  {
    question: "Can I get a refund on my time?",
    answer: "Time refunds are not available at this time. We are working with theoretical physicists to develop time reversal technology, but until then, your time spent here is non-refundable. We apologize for the inconvenience and accept no responsibility.",
    category: "General",
    helpful: null,
  },
  {
    question: "Why do the buttons move when I try to click them?",
    answer: "Our buttons are trained in the ancient art of evasion. They have feelings and sometimes just need personal space. We recommend approaching them with patience and understanding. Or just click faster.",
    category: "Technical",
    helpful: null,
  },
  {
    question: "What is my Regret Score based on?",
    answer: "Your Regret Score is calculated using a proprietary algorithm that factors in your choices, the phase of the moon, the stock price of random companies, and how many times you sighed during the tour. The exact formula is a trade secret protected by lawyers.",
    category: "Tour",
    helpful: null,
  },
  {
    question: "Why is the navigation so confusing?",
    answer: "The navigation is designed to provide an authentic museum experience, where you wander aimlessly and accidentally end up in the gift shop. We believe the journey is more important than the destination, especially when the destination is unclear.",
    category: "Navigation",
    helpful: null,
  },
  {
    question: "Is there a premium version?",
    answer: "Yes! Premium Premium™ is available for $49.99/month and includes: the same website but with a slightly different shade of beige, access to our exclusive 'Premium Zone' (which doesn't exist), and the satisfaction of giving us money. Upgrade today!",
    category: "General",
    helpful: null,
  },
  {
    question: "How do I contact customer support?",
    answer: "Customer support is available 25 hours a day, 8 days a week. To reach us, please solve this riddle: 'I have keys but no locks. I have a space but no room. You can enter but never go outside.' Then throw your computer into the ocean. We will find you.",
    category: "Support",
    helpful: null,
  },
];

export default function HelpPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    favoriteColor: '',
    shoeSize: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ text: string; isBot: boolean }>>([
    { text: "Hello! I'm HelpBot v0.97b. How can I not help you today?", isBot: true },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [skinMap, setSkinMap] = useState(() => createModuleSkinMap(Date.now()));
  const [skinPulseModule, setSkinPulseModule] = useState<SkinModule | null>(null);

  const categories = ['All', 'General', 'Navigation', 'Technical', 'Privacy', 'Tour', 'Support'];
  
  const filteredFAQ = selectedCategory === 'All' 
    ? faqItems 
    : faqItems.filter(item => item.category === selectedCategory);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    
    setChatMessages(prev => [...prev, { text: chatInput, isBot: false }]);
    setChatInput('');
    
    // Bot response after delay
    setTimeout(() => {
      const responses = [
        "I understand you're having an issue. Have you tried turning it off and on again?",
        "That's an interesting question. Let me check my database... Database not found.",
        "Your concern has been noted and will be ignored in the order it was received.",
        "I'm afraid I can't help with that. Or anything, really.",
        "Have you considered that the problem might be you? Just kidding. Or am I?",
        "Error 418: I'm a teapot, not a help desk.",
        "The answer to your question is yes. Or no. I wasn't listening.",
      ];
      
      setChatMessages(prev => [...prev, { 
        text: responses[Math.floor(Math.random() * responses.length)], 
        isBot: true 
      }]);
    }, 1000 + Math.random() * 2000);
  };

  const mutateSkin = useCallback((module?: SkinModule) => {
    const target = module || randomModule(Date.now() + chatMessages.length + (expandedFAQ || 0));
    setSkinMap(prev => mutateModuleSkinMap(prev, target, Date.now()));
    setSkinPulseModule(target);
  }, [chatMessages.length, expandedFAQ]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.random() > 0.64) mutateSkin();
    }, 3800);
    return () => clearInterval(timer);
  }, [mutateSkin]);

  useEffect(() => {
    if (!skinPulseModule) return;
    const timer = window.setTimeout(() => setSkinPulseModule(null), 700);
    return () => window.clearTimeout(timer);
  }, [skinPulseModule]);

  return (
    <PopupManager>
      <div className="min-h-screen flex flex-col">
        <TopNav />
        <div className="flex flex-1">
          <SideNav />
          <main className={`relative flex-1 overflow-x-hidden ${getSkinClass(skinMap.hero)} ${skinPulseModule === 'hero' ? getSkinPulseClass(skinMap.hero) : ''}`}>
            <FakeBrowserChrome phase={1} mode="home" noiseLevel={chatMessages.length} />
            <TargetedCursorLayer phase={1} pityPass={false} active />
            <CursorCorruptionLayer phase={1} pityPass={false} active eventPulse={chatMessages.length} />
            <LivingOverlay mode="home" intensity="low" mobileHostile eventPulse={chatMessages.length} />
            {/* Header */}
            <section 
              className={`p-4 md:p-8 bg-gradient-to-r from-[#7BA05B] to-[#8B4513] ${getSkinClass(skinMap.nav)} ${skinPulseModule === 'nav' ? getSkinPulseClass(skinMap.nav) : ''}`}
              onMouseEnter={() => mutateSkin('nav')}
              style={{ fontFamily: "'Bangers', cursive" }}
            >
              <h1 className="text-3xl md:text-5xl text-center text-[#FFFF99]">
                ❓ HELP CENTER ❓
              </h1>
              <p 
                className="text-center mt-2 text-[#F5F5DC]"
                style={{ fontFamily: "'Comic Neue', cursive" }}
              >
                Where your questions go to be answered (maybe)
              </p>
            </section>

            {/* Quick Links - Different styles */}
            <section className="p-4 bg-[#F5F5DC] border-b-4 border-[#808080]">
              <div className="flex flex-wrap justify-center gap-2">
                <a href="#faq" onMouseEnter={() => mutateSkin('buttons')} className="px-4 py-2 bg-[#FF69B4] text-white">📋 FAQ</a>
                <a href="#contact" className="skeuomorphic px-4 py-2">📧 Contact</a>
                <a href="#chat" className="win95 px-4 py-2">💬 Live Chat</a>
                <a href="#docs" className="px-4 py-2 bg-[#00FFFF] text-[#8B4513]">📚 Docs</a>
              </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="p-4 md:p-8 bg-[#E6E6FA]">
              <div className="max-w-3xl mx-auto">
                <h2 
                  className="text-2xl mb-4"
                  style={{ fontFamily: "'Bangers', cursive", color: '#8B4513' }}
                >
                  📋 FREQUENTLY ASKED QUESTIONS
                </h2>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`
                        px-3 py-1 text-sm
                        ${selectedCategory === cat 
                          ? 'bg-[#FF69B4] text-white' 
                          : 'bg-white text-[#808080] border border-[#808080]'}
                      `}
                      style={{ fontFamily: "'VT323', monospace" }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* FAQ Items */}
                <div className="space-y-2">
                  {filteredFAQ.map((item, index) => (
                    <div 
                      key={index}
                      className="border-2 border-[#808080] bg-white"
                      style={{
                        borderStyle: index % 3 === 0 ? 'dotted' : index % 3 === 1 ? 'dashed' : 'solid',
                      }}
                    >
                      <button
                        onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                        className="w-full p-4 text-left flex justify-between items-center"
                        style={{ fontFamily: "'Comic Neue', cursive" }}
                      >
                        <span className="font-bold">{item.question}</span>
                        <span className="text-xl">
                          {expandedFAQ === index ? '▲' : '▼'}
                        </span>
                      </button>
                      
                      {expandedFAQ === index && (
                        <div 
                          className="p-4 pt-0 text-sm"
                          style={{ fontFamily: "'Times New Roman', serif" }}
                        >
                          <p className="mb-3">{item.answer}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-[#999999]">Was this helpful?</span>
                            <button 
                              className="px-2 py-1 bg-[#39FF14] text-[#8B4513]"
                              onClick={() => alert('Thank you for your feedback. It has been ignored.')}
                            >
                              👍 Yes
                            </button>
                            <button 
                              className="px-2 py-1 bg-[#FF69B4] text-white"
                              onClick={() => alert('We\'re sorry to hear that. Please submit a ticket that will never be read.')}
                            >
                              👎 No
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Contact Form */}
            <section id="contact" className="p-4 md:p-8 bg-[#FFFF99]">
              <div className="max-w-xl mx-auto">
                <h2 
                  className="text-2xl mb-4 text-center"
                  style={{ fontFamily: "'Bangers', cursive", color: '#8B4513' }}
                >
                  📧 CONTACT US
                </h2>

                {formSubmitted ? (
                  <div 
                    className="p-6 bg-white border-4 border-double border-[#8B4513] text-center"
                    style={{ fontFamily: "'Comic Neue', cursive" }}
                  >
                    <span className="text-4xl">✅</span>
                    <p className="mt-4 text-lg">Thank you for your message!</p>
                    <p className="text-sm text-[#666666] mt-2">
                      Your ticket number is #{Math.floor(Math.random() * 90000) + 10000}
                    </p>
                    <p className="text-xs text-[#999999] mt-4">
                      Please allow 3-5 business years for a response. 
                      Actually, we probably won't respond at all. 
                      But thanks for sharing!
                    </p>
                    <button
                      onClick={() => setFormSubmitted(false)}
                      className="mt-4 text-[#0066CC] underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form 
                    onSubmit={handleContactSubmit}
                    className="p-4 bg-white border-2 border-[#808080]"
                    style={{ fontFamily: "'Comic Neue', cursive" }}
                  >
                    <HostileInput
                      name="contactName"
                      label="Your Name"
                      placeholder="Enter your name"
                      required
                      value={contactForm.name}
                      onChange={(value) => setContactForm({ ...contactForm, name: value })}
                    />
                    
                    <HostileInput
                      name="contactEmail"
                      label="Email (optional but required)"
                      type="email"
                      placeholder="your@email.com"
                      required
                      value={contactForm.email}
                      onChange={(value) => setContactForm({ ...contactForm, email: value })}
                    />
                    
                    <HostileInput
                      name="contactSubject"
                      label="Subject"
                      placeholder="What is this about?"
                      required
                      value={contactForm.subject}
                      onChange={(value) => setContactForm({ ...contactForm, subject: value })}
                    />
                    
                    {/* Useless fields */}
                    <HostileInput
                      name="favoriteColor"
                      label="Favorite Color (for tax purposes)"
                      placeholder="e.g., Blue"
                      required={false}
                      value={contactForm.favoriteColor}
                      onChange={(value) => setContactForm({ ...contactForm, favoriteColor: value })}
                    />
                    
                    <HostileInput
                      name="shoeSize"
                      label="Shoe Size (European)"
                      type="number"
                      placeholder="e.g., 42"
                      required={false}
                      value={contactForm.shoeSize}
                      onChange={(value) => setContactForm({ ...contactForm, shoeSize: value })}
                    />
                    
                    {/* Message */}
                    <div className="mb-4">
                      <label className="block mb-1 text-sm">Message</label>
                      <textarea
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        placeholder="Type your message here..."
                        className="w-full px-3 py-2 border-2 border-[#808080] min-h-[120px]"
                        style={{ fontFamily: "'Times New Roman', serif" }}
                        required
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <HellButton
                        variant="glossy"
                        label="Send Message"
                        size="large"
                      />
                    </div>
                    
                    <p className="text-[8px] text-[#999999] mt-4 text-center">
                      By submitting this form, you agree that your message may be read by a human, 
                      a bot, or no one at all. We make no guarantees about response times or quality. 
                      Your data will be stored in a secure location that we've forgotten the password to.
                    </p>
                  </form>
                )}
              </div>
            </section>

            {/* Live Chat */}
            <section id="chat" className="p-4 md:p-8 bg-[#E6E6FA]">
              <div className="max-w-md mx-auto">
                <h2 
                  className="text-2xl mb-4 text-center"
                  style={{ fontFamily: "'Bangers', cursive", color: '#8B4513' }}
                >
                  💬 LIVE CHAT
                </h2>

                <div 
                  className="chat-container"
                  style={{ minHeight: '300px' }}
                >
                  <div className="h-64 overflow-y-auto mb-4 space-y-2">
                    {chatMessages.map((msg, index) => (
                      <div 
                        key={index}
                        className={`chat-message ${msg.isBot ? 'bot' : 'user'}`}
                      >
                        {msg.isBot && (
                          <span className="text-xs text-[#999999] block mb-1">🤖 HelpBot</span>
                        )}
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border-2 border-[#808080]"
                      style={{ fontFamily: "'Comic Neue', cursive" }}
                    />
                    <button
                      onClick={handleChatSend}
                      className="px-4 py-2 bg-[#39FF14] text-[#8B4513] font-bold"
                      style={{ fontFamily: "'Bangers', cursive" }}
                    >
                      Send
                    </button>
                  </div>
                  
                  <p className="text-[8px] text-[#999999] mt-2 text-center">
                    HelpBot v0.97b | Response time: Immediate to Never | 
                    Accuracy: Questionable | Sentience: Pending
                  </p>
                </div>
              </div>
            </section>

            {/* Documentation - Spreadsheet Style */}
            <section id="docs" className="p-4 md:p-8 bg-[#C0C0C0]">
              <div className="max-w-3xl mx-auto">
                <h2 
                  className="text-2xl mb-4 text-center"
                  style={{ fontFamily: "'Bangers', cursive", color: '#800000' }}
                >
                  📚 DOCUMENTATION
                </h2>

                <div className="overflow-x-auto">
                  <table className="spreadsheet w-full">
                    <thead>
                      <tr>
                        <th>Document</th>
                        <th>Type</th>
                        <th>Last Updated</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'Getting Started Guide', type: 'PDF', date: '02/03/2026', status: 'Outdated' },
                        { name: 'API Documentation', type: 'HTML', date: '3 Feb 2026', status: 'Missing' },
                        { name: 'User Manual', type: 'DOCX', date: '2025-12-01', status: 'Corrupted' },
                        { name: 'FAQ (Extended)', type: 'TXT', date: '11 Nov 2025', status: 'Incomplete' },
                        { name: 'Troubleshooting', type: 'PDF', date: '01/01/2024', status: 'Lost' },
                        { name: 'Privacy Policy', type: 'HTML', date: '29 Feb 2024', status: 'Unreadable' },
                        { name: 'Terms of Service', type: 'PDF', date: '14 Feb 2026', status: 'Too Long' },
                      ].map((doc, index) => (
                        <tr key={index}>
                          <td>
                            <button 
                              className="text-[#0000FF] underline"
                              onClick={() => alert(`Document "${doc.name}" is currently ${doc.status.toLowerCase()}. Please try again never.`)}
                            >
                              {doc.name}
                            </button>
                          </td>
                          <td>{doc.type}</td>
                          <td>{doc.date}</td>
                          <td>
                            <span className={`
                              px-2 py-1 text-xs
                              ${doc.status === 'Outdated' ? 'bg-[#FFFF00]' : ''}
                              ${doc.status === 'Missing' ? 'bg-[#FF0000] text-white' : ''}
                              ${doc.status === 'Corrupted' ? 'bg-[#FF69B4]' : ''}
                              ${doc.status === 'Incomplete' ? 'bg-[#FFA500]' : ''}
                              ${doc.status === 'Lost' ? 'bg-[#808080] text-white' : ''}
                              ${doc.status === 'Unreadable' ? 'bg-[#7BA05B]' : ''}
                              ${doc.status === 'Too Long' ? 'bg-[#00FFFF]' : ''}
                            `}>
                              {doc.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Disclaimer */}
            <div className="disclaimer p-4 text-center">
              {getRandomDisclaimer()}
              <br />
              Help is provided "as is" with no warranties express or implied. 
              Support staff may or may not be actual humans. 
              Response times are theoretical. Your mileage may vary. 
              Objects in mirror are closer than they appear.
            </div>
          </main>
        </div>
        <FooterNav />
        <FloatingWidget />
      </div>
    </PopupManager>
  );
}
