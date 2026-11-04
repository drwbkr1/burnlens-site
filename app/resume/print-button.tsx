"use client";

import { useEffect, useRef } from "react";

export function PrintButton({ className }: { className: string }) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    // Attach before enabling. React's static disabled prop would suppress a
    // synthetic onClick even after the DOM property is changed imperatively.
    const print = () => window.print();
    button.addEventListener("click", print);
    button.disabled = false;
    return () => {
      button.disabled = true;
      button.removeEventListener("click", print);
    };
  }, []);

  return (
    <>
      <button ref={buttonRef} className={className} type="button" disabled>
        Print from browser
      </button>
      <noscript data-print-fallback style={{ gridColumn: "1 / -1" }}>
        <p>To print this résumé, use your browser’s Print command (Ctrl+P or Command+P).</p>
      </noscript>
    </>
  );
}
