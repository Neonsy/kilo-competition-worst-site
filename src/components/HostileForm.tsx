'use client';

import { useState, useCallback, useEffect } from 'react';
import { getRandomValidationMessage, getValidationForField } from '@/data/validations';

interface HostileInputProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'number' | 'password';
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  onError?: (error: string) => void;
}

export function HostileInput({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  value,
  onChange,
  onError,
}: HostileInputProps) {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Validate on change (but sometimes fail randomly)
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsTyping(true);
    
    // Sometimes clear a random other field
    if (Math.random() > 0.95) {
      const randomInput = document.querySelector('input:not([name="' + name + '"])') as HTMLInputElement;
      if (randomInput) {
        randomInput.value = '';
        randomInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    
    // Validate after a delay
    setTimeout(() => {
      if (required && !newValue) {
        const msg = getRandomValidationMessage();
        setError(msg);
        onError?.(msg);
      } else if (newValue) {
        const validation = getValidationForField(name, newValue);
        if (!validation.valid) {
          setError(validation.message);
          onError?.(validation.message);
        } else {
          setError(null);
        }
      }
      setIsTyping(false);
    }, 300);
  }, [name, required, onChange, onError]);

  const handleBlur = () => {
    setTouched(true);
    if (required && !value) {
      const msg = `This field is required. We're disappointed in you.`;
      setError(msg);
      onError?.(msg);
    }
  };

  // Random font for label
  const fonts = [
    "'Comic Neue', cursive",
    "'VT323', monospace",
    "'Times New Roman', serif",
  ];
  const labelFont = fonts[Math.floor(Math.random() * fonts.length)];

  return (
    <div className="mb-4">
      <label 
        className="block mb-1 text-sm"
        style={{ 
          fontFamily: labelFont,
          textAlign: Math.random() > 0.5 ? 'right' : 'left',
        }}
      >
        {label}
        {required && (
          <span className="text-[#FF0000] animate-blink ml-1">*</span>
        )}
        {required && (
          <span className="text-[8px] text-[#999999] ml-2">(optional but required)</span>
        )}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder || label}
        onPaste={(e) => {
          if (name === 'email') {
            e.preventDefault();
            setError('Pasting is not allowed in email fields. Type it like you mean it.');
            onError?.('Pasting is not allowed in email fields.');
          }
        }}
        className={`
          w-full px-3 py-2 border-2 
          ${error ? 'border-[#FF0000] bg-[#FFE4E1]' : 'border-[#808080] bg-white'}
          ${touched && !error ? 'border-[#39FF14]' : ''}
          focus:outline-none focus:ring-2 focus:ring-[#FF69B4]
          transition-colors
        `}
        style={{
          fontFamily: "'Courier New', monospace",
          cursor: isTyping ? 'wait' : 'text',
          textTransform: name === 'email' ? 'uppercase' : 'none',
        }}
        autoComplete={Math.random() > 0.5 ? 'on' : 'off'}
        spellCheck={Math.random() > 0.5}
      />
      {error && (
        <p 
          className="mt-1 text-xs text-[#FF0000] animate-shake"
          style={{ fontFamily: "'Comic Neue', cursive" }}
        >
          ⚠️ {error}
        </p>
      )}
      {touched && !error && value && (
        <p 
          className="mt-1 text-xs text-[#39FF14]"
          style={{ fontFamily: "'VT323', monospace" }}
        >
          ✓ Accepted (for now)
        </p>
      )}
    </div>
  );
}

// Slider that jumps around
interface HostileSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function HostileSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
}: HostileSliderProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = parseInt(e.target.value);
    
    // Sometimes jump to a random value
    if (Math.random() > 0.9) {
      newValue = Math.floor(Math.random() * (max - min)) + min;
    }
    
    setDisplayValue(newValue);
    onChange(newValue);
  };

  // Start at 97%
  useEffect(() => {
    if (value === 0) {
      setDisplayValue(97);
      onChange(97);
    }
  }, []);

  return (
    <div className="mb-4">
      <label 
        className="block mb-2 text-sm"
        style={{ fontFamily: "'Bangers', cursive" }}
      >
        {label}
      </label>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          value={displayValue}
          data-drag-friction
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          className="slider-evil flex-1"
        />
        <span 
          className="text-lg font-bold animate-pulse"
          style={{ 
            fontFamily: "'Press Start 2P', cursive",
            fontSize: '10px',
            color: displayValue > 50 ? '#39FF14' : '#FF0000',
          }}
        >
          {displayValue}%
        </span>
      </div>
      {isDragging && (
        <p 
          className="text-xs text-[#999999] mt-1"
          style={{ fontFamily: "'Comic Neue', cursive" }}
        >
          {displayValue < 50 ? 'You can do better than that.' : 
           displayValue < 80 ? 'Getting there... maybe.' : 
           'Almost! (Not really)'}
        </p>
      )}
    </div>
  );
}

// Dropdown with too many options
interface HostileDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function HostileDropdown({
  label,
  value,
  onChange,
  options,
}: HostileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Add duplicate options
  const chaoticOptions = [
    ...options,
    ...options.slice(0, 5).map(opt => ({ ...opt, label: opt.label + ' (copy)' })),
    { value: '', label: '──────────' },
    { value: 'secret', label: 'Secret Option' },
    { value: 'none', label: 'None of the above (selecting this does nothing)' },
  ];

  return (
    <div className="mb-4 relative">
      <label 
        className="block mb-1 text-sm"
        style={{ 
          fontFamily: "'Times New Roman', serif",
          textDecoration: 'underline',
        }}
      >
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-white border-2 border-[#808080] flex justify-between items-center"
        style={{ fontFamily: "'VT323', monospace" }}
      >
        <span>
          {chaoticOptions.find(o => o.value === value)?.label || 'Select...'}
        </span>
        <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      
      {isOpen && (
        <div 
          className="absolute z-50 w-full bg-white border-2 border-t-0 border-[#808080] max-h-60 overflow-y-auto dropdown-hell"
          style={{ fontFamily: "'VT323', monospace" }}
        >
          {chaoticOptions.map((option, index) => (
            <button
              key={`${option.value}-${index}`}
              type="button"
              onClick={() => {
                if (option.value === 'secret') {
                  alert('You found the secret option! Your reward: nothing special happens.');
                }
                onChange(option.value);
                setIsOpen(false);
              }}
              disabled={option.value === ''}
              className={`
                w-full px-3 py-1 text-left hover:bg-[#FFFF99]
                ${option.value === value ? 'bg-[#E6E6FA]' : ''}
                ${option.value === '' ? 'cursor-default hover:bg-white text-[#808080]' : ''}
                ${index % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F5]'}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Checkbox that fights back
interface HostileCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
}

export function HostileCheckbox({
  label,
  checked,
  onChange,
  required = false,
}: HostileCheckboxProps) {
  const [clickCount, setClickCount] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount < 3) {
      // First two clicks don't work
      setMessage(`Click ${3 - newCount} more time(s) to check this box.`);
      return;
    }

    if (Math.random() > 0.7) {
      // Sometimes uncheck itself
      setMessage('The checkbox has decided to uncheck itself. Try again.');
      onChange(false);
      setClickCount(0);
      return;
    }

    onChange(!checked);
    setMessage(null);
    setClickCount(0);
  };

  return (
    <div className="mb-4">
      <label 
        className="flex items-center gap-2 cursor-pointer"
        style={{ fontFamily: "'Comic Neue', cursive" }}
      >
        <div 
          onClick={handleClick}
          className={`
            w-6 h-6 border-2 flex items-center justify-center
            ${checked ? 'bg-[#39FF14] border-[#8B4513]' : 'bg-white border-[#808080]'}
            ${required && !checked ? 'animate-shake' : ''}
          `}
        >
          {checked && (
            <span style={{ fontFamily: "'Arial Black', sans-serif" }}>✓</span>
          )}
        </div>
        <span className={required && !checked ? 'text-[#FF0000]' : ''}>
          {label}
          {required && <span className="text-[#FF0000] ml-1">*</span>}
        </span>
      </label>
      {message && (
        <p 
          className="ml-8 text-xs text-[#FF69B4] mt-1"
          style={{ fontFamily: "'VT323', monospace" }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

// Complete hostile form
interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'password' | 'slider' | 'dropdown' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

interface HostileFormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, unknown>) => void;
  submitLabel?: string;
}

export function HostileForm({ fields, onSubmit, submitLabel = 'Submit' }: HostileFormProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Check for required fields
    const newErrors: Record<string, string> = {};
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = getRandomValidationMessage();
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Fake loading
    setTimeout(() => {
      onSubmit(formData);
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="p-4 bg-[#F5F5DC] border-4 border-double border-[#8B4513]"
      style={{ fontFamily: "'Comic Neue', cursive" }}
    >
      {fields.map((field, index) => (
        <div 
          key={field.name}
          style={{ 
            transform: `rotate(${(index % 3 - 1) * 0.5}deg)`,
            marginBottom: '1rem',
          }}
        >
          {field.type === 'text' || field.type === 'email' || field.type === 'number' || field.type === 'password' ? (
            <HostileInput
              name={field.name}
              label={field.label}
              type={field.type}
              placeholder={field.placeholder}
              required={field.required}
              value={(formData[field.name] as string) || ''}
              onChange={(value) => setFormData({ ...formData, [field.name]: value })}
              onError={(error) => setErrors({ ...errors, [field.name]: error })}
            />
          ) : field.type === 'slider' ? (
            <HostileSlider
              label={field.label}
              value={(formData[field.name] as number) || 0}
              onChange={(value) => setFormData({ ...formData, [field.name]: value })}
            />
          ) : field.type === 'dropdown' ? (
            <HostileDropdown
              label={field.label}
              value={(formData[field.name] as string) || ''}
              onChange={(value) => setFormData({ ...formData, [field.name]: value })}
              options={field.options || []}
            />
          ) : field.type === 'checkbox' ? (
            <HostileCheckbox
              label={field.label}
              required={field.required}
              checked={(formData[field.name] as boolean) || false}
              onChange={(checked) => setFormData({ ...formData, [field.name]: checked })}
            />
          ) : null}
        </div>
      ))}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            px-8 py-3 text-white font-bold
            ${isSubmitting ? 'bg-[#808080]' : 'bg-[#FF69B4] hover:bg-[#39FF14]'}
            transition-colors
          `}
          style={{ 
            fontFamily: "'Bangers', cursive",
            fontSize: '18px',
            transform: isSubmitting ? 'translateX(5px)' : 'none',
          }}
        >
          {isSubmitting ? 'Processing...' : submitLabel}
        </button>
      </div>

      {/* Random disclaimer */}
      <p 
        className="disclaimer mt-4"
        style={{ fontFamily: "'VT323', monospace" }}
      >
        By submitting this form, you agree that we may use your data for purposes that haven't been invented yet. 
        Your information will be stored in a secure location that we've forgotten the address of. 
        Unsubscribing is possible but not recommended.
      </p>
    </form>
  );
}

export default HostileForm;
