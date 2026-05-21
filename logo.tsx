
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  vertical?: boolean;
}

export function Logo({ className, size = 40, showText = false, vertical = false }: LogoProps) {
  const [error, setError] = useState(false);

  return (
    <div className={cn(
      "flex items-center gap-3", 
      vertical ? "flex-col text-center" : "flex-row",
      className
    )}>
      <div 
        className="relative flex items-center justify-center rounded-2xl overflow-hidden bg-white shadow-md border-2 border-primary/5"
        style={{ width: size, height: size }}
      >
        {!error ? (
          <Image
            src="/logo.png"
            alt="Apna Partner Logo"
            fill
            className="object-cover"
            onError={() => setError(true)}
            priority
          />
        ) : (
          <div className="w-full h-full tinder-gradient flex items-center justify-center text-white">
            <Flame size={size * 0.6} className="fill-current" />
          </div>
        )}
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="font-headline font-bold text-primary tracking-tight leading-none" style={{ fontSize: size * 0.45 }}>
            Apna Partner
          </span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1 italic">
            Jharkhand Ka Apna
          </span>
        </div>
      )}
    </div>
  );
}
