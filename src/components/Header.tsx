"use client";

import { useEffect, useState } from "react";

export default function Header({ subtitle }: { subtitle?: string }) {
  const [logoAvailable, setLogoAvailable] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setLogoAvailable(true);
    img.onerror = () => setLogoAvailable(false);
    img.src = "/logo.png";
  }, []);

  return (
    <header className="bg-navy text-white shadow-md">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        {logoAvailable ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/logo.png"
            alt="La Obra UC"
            className="h-10 w-10 object-contain"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange text-sm font-bold text-white">
            LO
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-lg font-bold leading-tight">La Obra UC</p>
          {subtitle && (
            <p className="truncate text-xs text-white/80">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  );
}
