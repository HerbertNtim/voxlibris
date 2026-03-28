'use server';

import { connectToDatabase } from '@/database/mongoose';
import { StartSessionResult } from 'types';
import { getCurrentBillingPeriodStart } from '../subscription-constants';
import VoiceSession from '@/database/models/voice-session.model';

export const startVoiceSession = async (
  clerkId: string,
  bookId: string,
): Promise<StartSessionResult> => {
  try {
    await connectToDatabase();

    const session = await VoiceSession.create({
      clerkId,
      bookId,
      startedAt: new Date(),
      billingPeriodStart: getCurrentBillingPeriodStart(),
      durationSeconds: 0,
    });

    return {
      success: true,
      sessionId: session._id.toString(),
    };
  } catch (e) {
    console.error('Error starting voice session: ', e);
    return {
      success: false,
      error: 'Failed to start voice session. Please try again.',
    };
  }
};
