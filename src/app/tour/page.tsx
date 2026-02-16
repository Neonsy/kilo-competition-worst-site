'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TopNav, SideNav, FooterNav, FloatingWidget } from '@/components/Navigation';
import { PopupManager } from '@/components/Popups';
import { HellButton, ProgressButton } from '@/components/HellButton';
import { ProgressBar } from '@/components/ProgressBar';
import { HostileInput, HostileSlider, HostileDropdown, HostileCheckbox } from '@/components/HostileForm';
import { tourQuestions, totalQuestions, TourQuestion } from '@/data/questions';
import { getRandomLoadingMessage, getRandomValidationMessage } from '@/data/validations';
import { getRandomDisclaimer } from '@/data/disclaimers';
import { getRandomExhibits, calculateRegretScore } from '@/data/exhibits';
import { getBadgeByScore } from '@/data/badges';

interface TourAnswers {
  [key: string]: string | number | boolean;
}

function TourContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<TourAnswers>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [backClicks, setBackClicks] = useState(0);
  const [started, setStarted] = useState(false);
  const [disclaimer, setDisclaimer] = useState(getRandomDisclaimer());

  const currentQuestion = tourQuestions.find(q => q.questionNumber === currentStep);

  // Handle "back" button that sometimes goes forward
  const handleBack = useCallback(() => {
    setBackClicks(prev => prev + 1);
    
    if (backClicks % 3 === 2) {
      // Every 3rd click actually goes back
      if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
      }
    } else if (backClicks % 5 === 4) {
      // Every 5th click goes forward (surprise!)
      if (currentStep < totalQuestions) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      alert('Back button is currently unavailable. Please try again.');
    }
  }, [backClicks, currentStep]);

  // Handle answer change
  const handleAnswer = (questionId: string, value: string | number | boolean) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setError(null);
  };

  // Validate current step
  const validateStep = (): boolean => {
    if (!currentQuestion) return true;
    
    const answer = answers[currentQuestion.id];
    
    // Random validation failure
    if (Math.random() > 0.9) {
      setError(getRandomValidationMessage());
      return false;
    }
    
    // Check required fields
    if (currentQuestion.validation?.required) {
      if (answer === undefined || answer === '' || answer === null) {
        setError('This field is required. We\'re very disappointed in you.');
        return false;
      }
    }
    
    // Special validation for name field
    if (currentQuestion.id === 'useless-data' && typeof answer === 'string') {
      if (answer.toLowerCase().includes('john') || answer.toLowerCase().includes('jane')) {
        setError('Your name is too normal. Please enter a more interesting name.');
        return false;
      }
    }
    
    return true;
  };

  // Handle next step
  const handleNext = async () => {
    if (!validateStep()) return;
    
    setIsLoading(true);
    setLoadingMessage(getRandomLoadingMessage());
    
    // Fake loading time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    setIsLoading(false);
    
    if (currentStep >= totalQuestions) {
      // Complete the tour
      completeTour();
    } else {
      setCurrentStep(currentStep + 1);
      setDisclaimer(getRandomDisclaimer());
    }
  };

  // Complete tour and navigate to certificate
  const completeTour = () => {
    const exhibitIds = getRandomExhibits(4).map(e => e.id);
    const score = calculateRegretScore(exhibitIds);
    const badge = getBadgeByScore(score);
    
    // Store results in sessionStorage for certificate page
    const results = {
      answers,
      score,
      badge,
      exhibitIds,
      calculationBreakdown: {
        base: Math.floor(Math.random() * 2000) + 1000,
        doorMultiplier: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
        buttonAnxiety: Math.floor(Math.random() * -500) - 100,
        shoeSizeFactor: Math.floor(Math.random() * 500),
        chaosBonus: Math.floor(Math.random() * 1000),
      },
    };
    
    sessionStorage.setItem('tourResults', JSON.stringify(results));
    router.push('/certificate');
  };

  // Start screen
  if (!started) {
    return (
      <PopupManager>
        <div className="min-h-screen flex flex-col">
          <TopNav />
          <div className="flex flex-1">
            <SideNav />
            <main className="flex-1 overflow-x-hidden">
              <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div 
                  className="max-w-lg w-full p-8 bg-[#F5F5DC] border-8 border-double border-[#8B4513] shadow-chaos"
                  style={{ fontFamily: "'Comic Neue', cursive" }}
                >
                  <div className="text-center">
                    <span className="text-6xl animate-bounce-chaotic inline-block">🎫</span>
                    
                    <h1 
                      className="text-3xl mt-4 mb-2 animate-rainbow"
                      style={{ fontFamily: "'Bangers', cursive" }}
                    >
                      EXHIBIT TOUR WIZARD
                    </h1>
                    
                    <p className="text-lg mb-4" style={{ fontFamily: "'Times New Roman', serif" }}>
                      Prepare yourself for an 
                      <span style={{ fontFamily: "'Rock Salt', cursive", color: '#FF0000' }}>
                        {' '}EXPERIENCE{' '}
                      </span>
                      that will generate your personalized regret profile.
                    </p>
                    
                    <div 
                      className="text-left p-4 bg-[#FFFF99] border-2 border-dashed border-[#808080] mb-4"
                      style={{ fontFamily: "'VT323', monospace" }}
                    >
                      <p className="font-bold mb-2">📋 TOUR DETAILS:</p>
                      <ul className="text-sm space-y-1">
                        <li>• Duration: Until you finish or give up</li>
                        <li>• Questions: {totalQuestions} (all mandatory)</li>
                        <li>• Difficulty: Frustrating</li>
                        <li>• Reward: Certificate of Regret</li>
                        <li>• Exit: Not guaranteed</li>
                      </ul>
                    </div>
                    
                    <p className="text-xs text-[#999999] mb-4">
                      {disclaimer}
                    </p>
                    
                    <div className="flex gap-4 justify-center">
                      <HellButton
                        variant="glossy"
                        label="BEGIN TOUR"
                        onClick={() => setStarted(true)}
                        size="large"
                      />
                      <HellButton
                        variant="link"
                        label="Maybe later (coward)"
                        onClick={() => router.push('/')}
                        size="small"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
          <FooterNav />
          <FloatingWidget />
        </div>
      </PopupManager>
    );
  }

  return (
    <PopupManager>
      <div className="min-h-screen flex flex-col">
        <TopNav />
        <div className="flex flex-1">
          <SideNav />
          <main className="flex-1 overflow-x-hidden">
            <div className="p-4 md:p-8 max-w-3xl mx-auto">
              {/* Progress Bar */}
              <ProgressBar currentStep={currentStep} totalSteps={totalQuestions} />
              
              {/* Question Card */}
              {currentQuestion && (
                <QuestionCard
                  question={currentQuestion}
                  answer={answers[currentQuestion.id]}
                  onAnswer={(value) => handleAnswer(currentQuestion.id, value)}
                  error={error}
                  isLoading={isLoading}
                  loadingMessage={loadingMessage}
                  disclaimer={disclaimer}
                />
              )}
              
              {/* Navigation */}
              <div className="flex justify-between items-center mt-6">
                <HellButton
                  variant="win95"
                  label={`← Back (click ${3 - (backClicks % 3)} more times)`}
                  onClick={handleBack}
                  size="small"
                />
                
                <div className="flex gap-2">
                  <HellButton
                    variant="link"
                    label="Skip (not allowed)"
                    onClick={() => alert('Skipping is not permitted. Please answer the question.')}
                    size="small"
                  />
                  
                  <ProgressButton
                    label={currentStep >= totalQuestions ? "Complete Tour →" : "Next →"}
                    onClick={handleNext}
                  />
                </div>
              </div>
              
              {/* Step indicator with wrong numbers */}
              <div 
                className="mt-8 text-center text-xs text-[#999999]"
                style={{ fontFamily: "'VT323', monospace" }}
              >
                <p>
                  Step {currentStep} of {totalQuestions} 
                  (actually step {Math.floor(Math.random() * 20) + 1} of {totalQuestions + Math.floor(Math.random() * 10)})
                </p>
                <p className="mt-1">
                  Time elapsed: {Math.floor(Math.random() * 60)}:{String(Math.floor(Math.random() * 60)).padStart(2, '0')}
                </p>
              </div>
            </div>
          </main>
        </div>
        <FooterNav />
        <FloatingWidget />
      </div>
    </PopupManager>
  );
}

// Export with Suspense wrapper
export default function TourPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5DC]">
        <div className="text-center p-8" style={{ fontFamily: "'Comic Neue', cursive" }}>
          <span className="text-6xl animate-bounce-chaotic inline-block">🎫</span>
          <p className="mt-4 text-xl animate-blink">Loading tour...</p>
          <div className="progress-lie mt-4 w-48 mx-auto">
            <div className="progress-lie-fill" style={{ width: '97%' }} />
            <div className="progress-lie-text">97%</div>
          </div>
        </div>
      </div>
    }>
      <TourContent />
    </Suspense>
  );
}

// Question Card Component
function QuestionCard({
  question,
  answer,
  onAnswer,
  error,
  isLoading,
  loadingMessage,
  disclaimer,
}: {
  question: TourQuestion;
  answer: string | number | boolean | undefined;
  onAnswer: (value: string | number | boolean) => void;
  error: string | null;
  isLoading: boolean;
  loadingMessage: string;
  disclaimer: string;
}) {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const questionStyles = [
    { bg: 'bg-[#E6E6FA]', border: 'border-4 border-double border-[#808080]' },
    { bg: 'bg-[#FFFF99]', border: 'border-4 border-dotted border-[#FF69B4]' },
    { bg: 'bg-[#F5F5DC]', border: 'border-4 border-solid border-[#8B4513]' },
    { bg: 'bg-[#C0C0C0]', border: 'border-4 border-outset' },
  ];
  
  const style = questionStyles[question.questionNumber % questionStyles.length];

  return (
    <div 
      className={`${style.bg} ${style.border} p-6 shadow-ugly relative`}
      style={{
        transform: `rotate(${(Math.random() - 0.5) * 2}deg)`,
      }}
    >
      {/* Question Number Badge */}
      <div 
        className="absolute -top-4 -left-4 w-12 h-12 bg-[#FF69B4] rounded-full flex items-center justify-center text-white font-bold shadow-lg animate-pulse"
        style={{ fontFamily: "'Bangers', cursive" }}
      >
        #{question.questionNumber}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div 
            className="bg-[#FFFF99] p-6 border-4 border-double border-[#8B4513]"
            style={{ fontFamily: "'VT323', monospace" }}
          >
            <p className="text-lg animate-blink">{loadingMessage}</p>
            <div className="progress-lie mt-2 w-48 h-4">
              <div 
                className="progress-lie-fill"
                style={{ width: `${Math.random() * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Title */}
      <h2 
        className="text-2xl md:text-3xl mb-2 text-center"
        style={{ 
          fontFamily: "'Bangers', cursive",
          color: '#8B4513',
          textShadow: '2px 2px 0 #FFFF99',
        }}
      >
        {question.title}
      </h2>

      {/* Subtitle */}
      <p 
        className="text-center mb-6"
        style={{ 
          fontFamily: "'Comic Neue', cursive",
          fontStyle: 'italic',
        }}
      >
        {question.subtitle}
      </p>

      {/* Question Content */}
      <div className="mb-4">
        {renderQuestionContent(question, answer, onAnswer)}
      </div>

      {/* Error Message */}
      {error && (
        <div 
          className="p-3 bg-[#FFE4E1] border-2 border-[#FF0000] text-[#FF0000] animate-shake"
          style={{ fontFamily: "'Comic Neue', cursive" }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Help Text */}
      <div 
        className="mt-4 text-sm text-[#666666] relative"
        style={{ fontFamily: "'VT323', monospace" }}
      >
        <button
          onMouseEnter={() => setTooltipVisible(true)}
          onMouseLeave={() => setTooltipVisible(false)}
          className="text-[#0066CC] underline"
        >
          💡 Need help?
        </button>
        
        {tooltipVisible && (
          <div 
            className="tooltip-evil absolute left-0 top-full mt-2"
            style={{ zIndex: 100 }}
          >
            <p className="font-bold mb-1" style={{ fontFamily: "'Bangers', cursive" }}>
              HELP IS HERE!
            </p>
            <p>{question.helpText}</p>
            <p className="text-[8px] text-[#999999] mt-2">
              (This tooltip may be covering important information)
            </p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      {question.disclaimer && (
        <p 
          className="disclaimer mt-4"
          style={{ fontFamily: "'VT323', monospace" }}
        >
          {question.disclaimer}
        </p>
      )}
    </div>
  );
}

// Render different question types
function renderQuestionContent(
  question: TourQuestion,
  answer: string | number | boolean | undefined,
  onAnswer: (value: string | number | boolean) => void
) {
  switch (question.type) {
    case 'door':
      return (
        <div className="grid grid-cols-3 gap-4">
          {question.options?.map((option, index) => (
            <button
              key={option.id}
              onClick={() => onAnswer(option.value)}
              className={`
                p-6 text-center transition-all
                ${answer === option.value 
                  ? 'bg-[#39FF14] border-4 border-[#8B4513] scale-110' 
                  : 'bg-[#E6E6FA] border-2 border-[#808080]'}
                hover:scale-105
              `}
              style={{
                fontFamily: "'Bangers', cursive",
                fontSize: '24px',
                transform: `rotate(${(index - 1) * 5}deg)`,
              }}
            >
              <div className="text-4xl mb-2">🚪</div>
              <div className="text-sm">
                {option.label.replace('🚪 ', '')}
              </div>
            </button>
          ))}
        </div>
      );

    case 'button':
      return (
        <div className="flex flex-wrap gap-3 justify-center">
          {question.options?.map((option, index) => (
            <button
              key={option.id}
              onClick={() => onAnswer(option.value)}
              className={`
                px-6 py-3 transition-all
                ${answer === option.value ? 'ring-4 ring-[#FF0000]' : ''}
              `}
              style={{
                background: ['#FF0000', '#39FF14', '#00FFFF', '#FFFF00', '#FF69B4'][index % 5],
                color: index === 1 || index === 3 ? '#8B4513' : 'white',
                fontFamily: ['Bangers', 'Comic Neue', 'VT323', 'Press Start 2P', 'Arial Black'][index % 5],
                border: `${index + 2}px ${['solid', 'dashed', 'dotted', 'double'][index % 4]} #000`,
                transform: `rotate(${(Math.random() - 0.5) * 10}deg)`,
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      );

    case 'sound':
      return (
        <div className="space-y-2">
          {question.options?.map((option, index) => (
            <label
              key={option.id}
              className={`
                flex items-center gap-3 p-3 cursor-pointer
                ${index % 2 === 0 ? 'bg-[#F5F5DC]' : 'bg-white'}
                border border-[#808080]
                ${answer === option.value ? 'border-l-4 border-l-[#FF69B4]' : ''}
              `}
              style={{ fontFamily: "'Comic Neue', cursive" }}
            >
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={answer === option.value}
                onChange={() => onAnswer(option.value)}
                className="w-4 h-4"
              />
              <span className="text-xl">
                {['💀', '😰', '🤢', '😫', '📞', '😤'][index % 6]}
              </span>
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      );

    case 'slider':
      return (
        <HostileSlider
          label="How confident are you right now?"
          value={(answer as number) || 97}
          onChange={onAnswer}
        />
      );

    case 'color':
      return (
        <div className="flex flex-wrap gap-4 justify-center">
          {question.options?.map((option) => {
            const colors: Record<string, string> = {
              blue: '#0000FF',
              green: '#00FF00',
              red: '#FF0000',
              yellow: '#FFFF00',
              purple: '#800080',
            };
            const actualColor = colors[option.value] || '#808080';
            
            return (
              <button
                key={option.id}
                onClick={() => onAnswer(option.value)}
                className={`
                  w-16 h-16 rounded-full border-4 transition-all
                  ${answer === option.value ? 'scale-125 ring-4 ring-[#FF69B4]' : ''}
                `}
                style={{
                  backgroundColor: actualColor,
                  borderColor: answer === option.value ? '#FF69B4' : '#808080',
                }}
              >
                <span 
                  className="text-xs"
                  style={{ 
                    fontFamily: "'VT323', monospace",
                    color: actualColor === '#FFFF00' ? '#000' : '#FFF',
                  }}
                >
                  {option.label.split('(')[1]?.replace(')', '') || option.label}
                </span>
              </button>
            );
          })}
        </div>
      );

    case 'radio':
      return (
        <div className="space-y-2">
          {question.options?.map((option, index) => (
            <label
              key={option.id}
              className={`
                flex items-center gap-3 p-3 cursor-pointer
                ${index % 2 === 0 ? 'bg-[#E6E6FA]' : 'bg-[#FFFF99]'}
                border-2 ${index % 3 === 0 ? 'border-dotted' : index % 3 === 1 ? 'border-dashed' : 'border-solid'} border-[#808080]
                ${answer === option.value ? 'bg-[#39FF14]' : ''}
              `}
              style={{ 
                fontFamily: index % 2 === 0 ? "'Comic Neue', cursive" : "'VT323', monospace",
              }}
            >
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={answer === option.value}
                onChange={() => onAnswer(option.value)}
                className="w-5 h-5"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      );

    case 'input':
      return (
        <div className="space-y-4">
          <HostileInput
            name="userName"
            label="Your Name"
            placeholder="Enter a name that isn't too normal..."
            required={question.validation?.required}
            value={(answer as string) || ''}
            onChange={onAnswer}
          />
        </div>
      );

    case 'confirm':
      return (
        <div className="space-y-4">
          {question.options?.map((option, index) => (
            <button
              key={option.id}
              onClick={() => onAnswer(option.value)}
              className={`
                w-full p-4 text-left transition-all
                ${answer === option.value 
                  ? 'bg-[#39FF14] border-4 border-[#8B4513]' 
                  : 'bg-white border-2 border-[#808080]'}
                ${index === 0 ? '' : index === 1 ? 'opacity-50' : index === 2 ? 'text-[#999999]' : 'line-through'}
              `}
              style={{ 
                fontFamily: ['Bangers', 'Comic Neue', 'VT323', 'Times New Roman'][index % 4],
              }}
            >
              <span className="text-xl mr-2">
                {['✓', '✗', '?', '!'][index % 4]}
              </span>
              {option.label}
            </button>
          ))}
          
          <div 
            className="p-4 bg-[#FFFF99] border-2 border-dashed border-[#FF0000]"
            style={{ fontFamily: "'VT323', monospace" }}
          >
            <p className="text-sm">
              ⚠️ FINAL WARNING: By confirming, you acknowledge that your choices 
              have been recorded and will be used to calculate your Regret Score™.
              This action cannot be undone, redone, or pretended it never happened.
            </p>
          </div>
        </div>
      );

    default:
      return <p>Unknown question type</p>;
  }
}

// Helper to access answers in nested function
function answers(fn: (a: TourAnswers) => string): string {
  return '';
}
