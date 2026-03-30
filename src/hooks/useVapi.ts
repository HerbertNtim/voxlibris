import { startVoiceSession } from '@/lib/actions/session.actions';
import { ASSISTANT_ID, DEFAULT_VOICE, VOICE_SETTINGS } from '@/lib/constants';
import { getVoice } from '@/lib/utils';
import { useAuth } from '@clerk/nextjs';
import Vapi from '@vapi-ai/web';
import { set } from 'mongoose';
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
  const startTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const isStoppingRef = useRef<boolean>(false);

  const bookRef = useLatestRef(book);
  const durationRef = useLatestRef(duration);
  const voice = book.persona || DEFAULT_VOICE;

  const isActive =
    status === 'listening' ||
    status === 'thinking' ||
    status === 'speaking' ||
    status === 'starting';

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
      const response = await startVoiceSession(userId, book._id);

      if (!response.success) {
        setLimitError(
          response.error || 'Failed to start voice session. Please try again.',
        );
        setStatus('idle');
        return;
      }

      sessionIdRef.current = response.sessionId || null;

      const firstMessage = `You are now reading "${bookRef.current.title}" by ${bookRef.current.author}. The voice you will be listening to is ${voice}. Say "stop" at any time to end the session.`;

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
