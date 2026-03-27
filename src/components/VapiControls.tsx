'use client';

import useVapi from '@/hooks/useVapi';
import { Mic, MicOff } from 'lucide-react';
import Image from 'next/image';
import { IBook } from 'types';
import Transcript from './Transcript';

const VapiControls = ({ book }: { book: IBook }) => {
  const {
    status,
    isActive,
    messages,
    currentMessage,
    currentUserMessage,
    duration,
    start,
    stop,
  } = useVapi(book);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Card */}
      <div className="vapi-header-card">
        <div className="flex items-center gap-6">
          {/* Book Cover with Mic Button */}
          <div className="relative">
            <Image
              src={book.coverURL}
              alt={`${book.title} cover`}
              className="w-30 h-auto rounded-lg shadow-book"
              width={120}
              height={180}
              loading="eager"
              style={{ width: '100%', height: 'auto' }}
            />
            <button
              className={`vapi-mic-btn absolute -bottom-3 -right-3 ${isActive ? 'vapi-mic-btn-active' : 'vapi-mic-btn-inactive'}`}
              onClick={isActive ? stop : start}
              disabled={status === 'connecting' || status === 'starting'}
            >
              {isActive ? (
                <Mic className="size-7 text-[#212a3b]" />
              ) : (
                <MicOff className="size-7 text-[#212a3b]" />
              )}
            </button>
          </div>

          {/* Book Info */}
          <div className="flex-1">
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-text-primary mb-2">
              {book.title}
            </h1>
            <p className="text-text-secondary mb-4">by {book.author}</p>

            {/* Status Badges */}
            <div className="flex gap-2">
              <div className="vapi-status-indicator">
                <div className="vapi-status-dot vapi-status-dot-ready"></div>
                <span className="vapi-status-text">Ready</span>
              </div>
              <div className="vapi-status-indicator">
                <span className="vapi-status-text">
                  Voice: {book.persona || 'Default'}
                </span>
              </div>
              <div className="vapi-status-indicator">
                <span className="vapi-status-text">0:00/15:00</span>
              </div>
            </div>
          </div>

          {/* wave image */}
          <div className="hidden md:block ml-12">
            <Image
              src={'/book-detail.png'}
              alt="book detail illustration"
              width={500}
              height={500}
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        </div>
      </div>
      <div className="vapi-transcript-wrapper">
        <div className="transcript-container">
          <Transcript
            messages={messages}
            currentMessage={currentMessage}
            currentUserMessage={currentUserMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default VapiControls;
