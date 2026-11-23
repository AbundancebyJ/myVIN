"use client";

import { useEffect } from "react";

/** Expand every <details> before printing so the PDF includes each recall's risk and fix. */
function expandAll() {
  document.querySelectorAll("details:not([open])").forEach((d) => {
    d.setAttribute("open", "");
    d.setAttribute("data-print-opened", "");
  });
}
function restore() {
  document.querySelectorAll("details[data-print-opened]").forEach((d) => {
    d.removeAttribute("open");
    d.removeAttribute("data-print-opened");
  });
}

export function PrintButton({ label = "Print / Save as PDF" }: { label?: string }) {
  useEffect(() => {
    // Also covers Ctrl/Cmd+P and the browser menu, not just this button.
    window.addEventListener("beforeprint", expandAll);
    window.addEventListener("afterprint", restore);
    return () => {
      window.removeEventListener("beforeprint", expandAll);
      window.removeEventListener("afterprint", restore);
    };
  }, []);
  return (
    <button
      type="button"
      className="btn btn-secondary no-print"
      onClick={() => {
        expandAll();
        window.print();
      }}
    >
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
      </svg>
      {label}
    </button>
  );
}
