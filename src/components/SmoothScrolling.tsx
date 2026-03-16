"use client";

import { ReactLenis } from "@studio-freight/react-lenis";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SmoothScrolling({ children }: { children: any }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true, wheelMultiplier: 1.0, touchMultiplier: 1.5 }}>
      {children}
    </ReactLenis>
  );
}
