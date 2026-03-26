import { useAuth } from '@clerk/nextjs';
import { useRef, useState } from 'react';
import { IBook, Messages } from 'types';

export type CallStatus =
  | 'idle'
  | 'connecting'
  | 'starting'
  | 'listening'
  | 'thinking'
  | 'speaking';

export const useVapi = (book: IBook) => {
  const { userId } = useAuth();

  const [status, setStatus] = useState<CallStatus>('idle');
  const [message, setMessage] = useState<Messages[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentUserMessage, setCurrentUserMessage] = useState<string>('');
  const [duration, setDuration] = useState(0);
  const [limitError, setLimitError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const isStoppingRef = useRef<boolean>(false);
};
