// lib/transitionEvents.ts
export type PageTransitionDetail = {
  callback?: () => void;
  targetHref?: string;
  title?: string;
};

export const triggerPageTransition = (
  target: string | (() => void),
  targetHref?: string,
  title?: string
) => {
  if (typeof window === "undefined") return;

  const callback = typeof target === "function" ? target : undefined;
  const href = typeof target === "string" ? target : targetHref;

  const event = new CustomEvent<PageTransitionDetail>("pageTransition", {
    detail: { callback, targetHref: href, title },
  });
  window.dispatchEvent(event);
};
