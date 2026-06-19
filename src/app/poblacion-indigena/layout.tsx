'use client';
import { useEffect } from 'react';

export default function PoblacionIndigenaLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const body = document.body;
    const prevBg = body.style.backgroundImage;
    const prevSize = body.style.backgroundSize;
    const prevPos = body.style.backgroundPosition;
    const prevAttach = body.style.backgroundAttachment;
    const prevRepeat = body.style.backgroundRepeat;
    const prevColor = body.style.backgroundColor;

    body.style.backgroundImage = `linear-gradient(rgba(61,14,24,0.45), rgba(61,14,24,0.45)), url('/fondo-indigena.jpg')`;
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';
    body.style.backgroundAttachment = 'fixed';
    body.style.backgroundRepeat = 'no-repeat';
    body.style.backgroundColor = '#3D0E18';

    return () => {
      body.style.backgroundImage = prevBg;
      body.style.backgroundSize = prevSize;
      body.style.backgroundPosition = prevPos;
      body.style.backgroundAttachment = prevAttach;
      body.style.backgroundRepeat = prevRepeat;
      body.style.backgroundColor = prevColor;
    };
  }, []);

  return <>{children}</>;
}
