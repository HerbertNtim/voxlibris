export const getCurrentBillingPeriodStart = (): Date => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
};
