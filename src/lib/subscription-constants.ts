export const PLANS = {
  FREE: 'free',
  STANDARD: 'standard',
  PRO: 'pro',
} as const;

export type PlanType = (typeof PLANS)[keyof typeof PLANS];

export interface PlanLimits {
  maxBooks: number;
  maxSessionsPerMonth: number;
  maxDurationPerSession: number;
  hasSessionHistory: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  [PLANS.FREE]: {
    maxBooks: 1,
    maxSessionsPerMonth: 5,
    maxDurationPerSession: 30, // in minutes
    hasSessionHistory: false,
  },
  [PLANS.STANDARD]: {
    maxBooks: 10,
    maxSessionsPerMonth: 100,
    maxDurationPerSession: 15, // in minutes
    hasSessionHistory: true,
  },
  [PLANS.PRO]: {
    maxBooks: 100,
    maxSessionsPerMonth: Infinity,
    maxDurationPerSession: 60, // in minutes
    hasSessionHistory: true,
  },
};

export const getCurrentBillingPeriodStart = (): Date => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
};
