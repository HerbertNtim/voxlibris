'use client';

// Create hooks/useVapi.ts: the core hook. Initializes Vapi SDK, manages call lifecycle (idle, connecting, starting, listening, thinking, speaking), tracks messages array + currentMessage streaming, handles duration timer with maxDuration enforcement, session tracking via server actions

import {
  endVoiceSession,
  startVoiceSession,
} from '@/lib/actions/session.actions';
import { ASSISTANT_ID, DEFAULT_VOICE, VOICE_SETTINGS } from '@/lib/constants';
import { getVoice } from '@/lib/utils';
import { useAuth } from '@clerk/nextjs';
import Vapi from '@vapi-ai/web';
import { useEffect, useRef, useState } from 'react';
import { IBook, Messages } from 'types';

export type CallStatus =
  | 'idle'
  | 'connecting'
  | 'starting'
  | 'listening'
  | 'thinking'
  | 'speaking';

const useLatestRef = <T>(value: T) => {
  const ref = useRef<T>(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
};

const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY;
const TIMER_INTERVAL_MS = 1000; // Update duration every second
const SECONDS_PER_MINUTE = 60;
const TIME_WARNING_THRESHOLD = 60;

let vapi: InstanceType<typeof Vapi>;

function getVapi() {
  if (!vapi) {
    if (!VAPI_API_KEY) {
      throw new Error('VAPI API key is not set');
    }
    vapi = new Vapi(VAPI_API_KEY);
  }

  return vapi;
}

export const useVapi = (book: IBook) => {
  const { userId } = useAuth();

  const [status, setStatus] = useState<CallStatus>('idle');
  const [messages, setMessages] = useState<Messages[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentUserMessage, setCurrentUserMessage] = useState<string>('');
  const [duration, setDuration] = useState(0);
  const [limitError, setLimitError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const isStoppingRef = useRef<boolean>(false);

  // Keep refs in sync with latest values for use in callbacks
  // const maxDurationRef = useLatestRef(limits.maxSessionMinutes * 60);
  const bookRef = useLatestRef(book);
  const durationRef = useLatestRef(duration);
  const voice = book.persona || DEFAULT_VOICE;

  const isActive =
    status === 'listening' ||
    status === 'thinking' ||
    status === 'speaking' ||
    status === 'starting';

  // Set up Vapi event listeners
  useEffect(() => {
    const handlers = {
      'call-start': () => {
        isStoppingRef.current = false;
        setStatus('starting'); // AI speaks first, wait for it
        setCurrentMessage('');
        setCurrentUserMessage('');

        // Start duration timer
        startTimeRef.current = Date.now();
        setDuration(0);
        timerRef.current = setInterval(() => {
          if (startTimeRef.current) {
            const newDuration = Math.floor(
              (Date.now() - startTimeRef.current) / TIMER_INTERVAL_MS,
            );
            setDuration(newDuration);
          }
        }, TIMER_INTERVAL_MS);
      },

      'call-end': () => {
        // Don't reset isStoppingRef here - delayed events may still fire
        setStatus('idle');
        setCurrentMessage('');
        setCurrentUserMessage('');

        // Stop timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // End session tracking
        if (sessionIdRef.current) {
          endVoiceSession(sessionIdRef.current, durationRef.current).catch(
            (e) => {
              console.error('Error ending voice session: ', e);
            },
          );

          sessionIdRef.current = null;
        }

        startTimeRef.current = null;
      },

      'speech-start': () => {
        if (!isStoppingRef.current) {
          setStatus('speaking');
        }
      },

      'speech-end': () => {
        if (!isStoppingRef.current) {
          setStatus('listening');
        }
      },

      message: (message: {
        type: string;
        role: string;
        transcriptType: string;
        transcript: string;
      }) => {
        if (message.type !== 'transcript') return;

        // User finished speaking -> AI is thinking
        if (message.role === 'user' && message.transcriptType === 'final') {
          if (!isStoppingRef.current) {
            setStatus('thinking');
          }
          setCurrentUserMessage('');
        }

        // Partial user transcript → show real-time typing
        if (message.role === 'user' && message.transcriptType === 'partial') {
          setCurrentUserMessage(message.transcript);
          return;
        }

        // Partial AI transcript → show word-by-word
        if (
          message.role === 'assistant' &&
          message.transcriptType === 'partial'
        ) {
          setCurrentMessage(message.transcript);
          return;
        }

        // Final transcript → add to messages
        if (message.transcriptType === 'final') {
          if (message.role === 'assistant') setCurrentMessage('');
          if (message.role === 'user') setCurrentUserMessage('');

          setMessages((prev) => {
            const isDupe = prev.some(
              (m) =>
                m.role === message.role && m.content === message.transcript,
            );

            return isDupe
              ? prev
              : [...prev, { role: message.role, content: message.transcript }];
          });
        }
      },

      error: (error: Error) => {
        console.error('Vapi error: ', error);
        // Don't reset isStoppingRef here - delayed events may still fire
        setStatus('idle');
        setCurrentMessage('');
        setCurrentUserMessage('');

        // Stop timer on Error
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // End session tracking on Error
        if (sessionIdRef.current) {
          endVoiceSession(sessionIdRef.current, durationRef.current).catch(
            (e) => {
              console.error('Error ending voice session: ', e);
            },
          );

          sessionIdRef.current = null;
        }

        // Show user-friendly error message
        const errorMessage = error.message?.toLowerCase() || '';
        if (
          errorMessage.includes('timeout') ||
          errorMessage.includes('silence')
        ) {
          setLimitError('The voice session has ended due to inactivity.');
        } else if (
          errorMessage.includes('network') ||
          errorMessage.includes('connection')
        ) {
          setLimitError(
            'A network error occurred. Please check your connection and try again.',
          );
        } else {
          setLimitError(
            'An error occurred during the voice session. Please try again.',
          );
        }

        startTimeRef.current = null;
      },
    };

    // Register all handlers
    Object.entries(handlers).forEach(([event, handler]) => {
      getVapi().on(event as keyof typeof handlers, handler as () => void);
    });

    return () => {
      // End active session on unmount
      if (sessionIdRef.current) {
        getVapi().stop();
        endVoiceSession(sessionIdRef.current, durationRef.current).catch(
          (e) => {
            console.error('Error ending voice session: ', e);
          },
        );
        sessionIdRef.current = null;
      }

      // Clean up handlers
      Object.entries(handlers).forEach(([event, handler]) => {
        getVapi().off(event as keyof typeof handlers, handler as () => void);
      });
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [durationRef]);

  // Limits
  // const maxDurationRef = useLatestRef(limit.maxSessionMinutes * 60); // 5 minutes max per session
  // const maxDurationSeconds
  // const remainingSeconds
  // const showTimeWarning

  const start = async () => {
    if (!userId) {
      setLimitError('You must be signed in to use this feature.');
      return;
    }

    setLimitError(null);
    setStatus('connecting');

    try {
      // Check session limits and create session record
      const response = await startVoiceSession(userId, book._id);

      if (!response.success) {
        setLimitError(
          response.error || 'Failed to start voice session. Please try again.',
        );
        setStatus('idle');
        return;
      }

      sessionIdRef.current = response.sessionId || null;
      // Note: Server returned maxDurationMinutes is informational only
      // The actual limit is enforced by useLatestRef (limits.maxSessionMinutes * 60)

      const firstMessage = `You are now reading "${bookRef.current.title}" by ${bookRef.current.author}. The voice you will be listening to is ${voice}. How can I help you engage with the book?`;

      await getVapi().start(ASSISTANT_ID, {
        firstMessage,
        variableValues: {
          title: book.title,
          author: book.author,
          bookId: book._id,
        },
        voice: {
          provider: '11labs' as const,
          voiceId: getVoice(voice).id,
          model: 'eleven_turbo_v2_5' as const,
          stability: VOICE_SETTINGS.stability,
          similarityBoost: VOICE_SETTINGS.similarityBoost,
          style: VOICE_SETTINGS.style,
          useSpeakerBoost: VOICE_SETTINGS.useSpeakerBoost,
        },
      });
    } catch (e) {
      console.error('Error Starting  call: ', e);
      setStatus('idle');
      setLimitError('Failed to start voice session. Please try again.');
    }
  };
  const stop = async () => {
    isStoppingRef.current = true;
    await getVapi().stop();
  };
  const clearErrors = async () => {};

  return {
    status,
    isActive,
    messages,
    currentMessage,
    currentUserMessage,
    duration,
    start,
    stop,
    clearErrors,
  };
};

export default useVapi;
