// lib/transitionEvents.ts
export const triggerPageTransition = (callback?: () => void) => {
  const event = new CustomEvent('pageTransition', { detail: { callback } });
  window.dispatchEvent(event);
};