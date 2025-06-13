'use client';

import React, { useState } from 'react';
import { Button } from '@/components/shared/Button';

interface EmailSignupProps {
  className?: string;
}

export function EmailSignup({ className = '' }: EmailSignupProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/emails-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          source: 'construction-landing'
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
        // Still store in localStorage as backup/cache
        const existingEmails = JSON.parse(localStorage.getItem('vmarket-v2-emails') || '[]');
        if (!existingEmails.find((e: any) => e.email === email)) {
          existingEmails.push({
            email,
            timestamp: new Date().toISOString(),
          });
          localStorage.setItem('vmarket-v2-emails', JSON.stringify(existingEmails));
        }
      } else {
        setError(result.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={`text-center ${className}`}>
        <div 
          className="rounded-lg p-4 mb-4"
          style={{
            background: '#95E1D3',
            border: '3px solid #2D3436',
            boxShadow: '4px 4px 0px #2D3436',
            transform: 'rotate(-1deg)'
          }}
        >
          <p 
            style={{
              color: '#2D3436',
              fontFamily: "'Fredoka One', cursive",
              fontSize: '1.1rem'
            }}
          >
            AWESOME! We'll hit you up when v2 drops!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Drop your email for epic updates!"
          className="flex-1 px-4 py-3 rounded-lg focus:outline-none"
          style={{
            background: '#FFF3B0',
            border: '3px solid #2D3436',
            color: '#2D3436',
            fontFamily: "'Fredoka', cursive",
            fontSize: '1rem',
            boxShadow: '4px 4px 0px #2D3436'
          }}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !email}
          className="px-6 py-3 rounded-lg font-bold transition-all duration-200 disabled:cursor-not-allowed"
          style={{
            background: isSubmitting || !email ? '#95E1D3' : '#FF6B35',
            border: '3px solid #2D3436',
            color: '#FFF3B0',
            fontFamily: "'Fredoka One', cursive",
            fontSize: '1.1rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: '4px 4px 0px #2D3436',
            transform: 'rotate(-1deg)'
          }}
        >
          {isSubmitting ? 'Sending...' : 'JOIN WAITLIST'}
        </button>
      </form>
      
      {error && (
        <p style={{ 
          color: '#F38BA8', 
          fontFamily: "'Fredoka', cursive",
          textShadow: '1px 1px 0px #2D3436'
        }} className="text-sm mt-2 text-center">{error}</p>
      )}
    </div>
  );
} 