import { analytics } from '../services/analyticsService';

export const trackEvent = (eventName, eventData = {}) => {
  analytics.track(eventName, eventData);
};

export const getSessionEvents = () => {
  // Now handled by analyticsService internals
  return [];
};

export const clearSessionEvents = () => {
  // Now handled by analyticsService internals
};
