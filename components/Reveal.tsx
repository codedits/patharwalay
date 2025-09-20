"use client";

import React, { useEffect, useRef, useCallback } from "react";

type RevealProps = {
  children: React.ReactElement;
  delay?: number; // milliseconds
  rootMargin?: string; // e.g., "0px 0px -10% 0px"
  once?: boolean; // unobserve after first reveal
};

// Shared observer instance to reduce main thread work
let sharedObserver: IntersectionObserver | null = null;
const observedElements = new WeakMap<Element, () => void>();

function getSharedObserver(rootMargin: string) {
  if (!sharedObserver || typeof IntersectionObserver === "undefined") {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const callback = observedElements.get(entry.target);
            if (callback) {
              callback();
              observedElements.delete(entry.target);
              sharedObserver?.unobserve(entry.target);
            }
          }
        });
      },
      { root: null, rootMargin, threshold: 0.1 }
    );
  }
  return sharedObserver;
}

export default function Reveal({ children, delay = 0, rootMargin = "0px 0px -15% 0px", once = true }: RevealProps) {
  const nodeRef = useRef<HTMLDivElement | null>(null);

  const revealCallback = useCallback(() => {
    const node = nodeRef.current;
    if (node) {
      // Use requestAnimationFrame to batch DOM updates
      requestAnimationFrame(() => {
        node.classList.add("is-visible");
      });
    }
  }, []);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const observer = getSharedObserver(rootMargin);
    observedElements.set(node, revealCallback);
    observer.observe(node);

    return () => {
      observedElements.delete(node);
      observer.unobserve(node);
    };
  }, [rootMargin, revealCallback]);

  const setRef = (el: HTMLDivElement | null) => {
    nodeRef.current = el;
  };

  const wrapperStyle: React.CSSProperties = { 
    animationDelay: `${delay}ms`,
    // Prevent layout thrashing during animation
    willChange: 'transform, opacity'
  };

  return (
    <div ref={setRef} className="reveal-item" style={wrapperStyle}>
      {children}
    </div>
  );
}
