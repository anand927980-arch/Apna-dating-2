
"use client";

import { useState } from 'react';
import { Heart, X, Info, MapPin, Zap, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

interface UserProfile {
  id: string;
  name: string;
  age: number;
  district: string;
  bio: string;
  imageUrl: string;
  isPremium?: boolean;
  distance?: number;
  compatibility?: number;
}

export function SwipeCard({ user, onSwipeRight, onSwipeLeft }: { 
  user: UserProfile; 
  onSwipeRight: () => void; 
  onSwipeLeft: () => void;
}) {
  const [isLiked, setIsLiked] = useState<boolean | null>(null);

  return (
    <div className="relative w-full h-full max-w-md aspect-[3/4.5] rounded-[2rem] overflow-hidden shadow-2xl bg-white select-none">
      <Image 
        src={user.imageUrl} 
        alt={user.name}
        fill
        className="object-cover"
        priority
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      {/* AI Compatibility Badge */}
      {user.compatibility && (
        <div className="absolute top-6 left-6 z-10">
          <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 px-3 py-1.5 gap-1.5 font-bold">
            <Sparkles className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            {user.compatibility}% AI Compatibility
          </Badge>
        </div>
      )}

      {/* Like/Nope Overlays */}
      <div className={cn(
        "absolute top-20 left-10 border-4 border-green-500 rounded-lg px-4 py-2 transform -rotate-12 transition-opacity duration-200 z-20",
        isLiked === true ? "opacity-100" : "opacity-0"
      )}>
        <span className="text-green-500 text-4xl font-black uppercase">LIKE</span>
      </div>
      <div className={cn(
        "absolute top-20 right-10 border-4 border-red-500 rounded-lg px-4 py-2 transform rotate-12 transition-opacity duration-200 z-20",
        isLiked === false ? "opacity-100" : "opacity-0"
      )}>
        <span className="text-red-500 text-4xl font-black uppercase">NOPE</span>
      </div>

      {/* User Details */}
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-4xl font-headline font-bold">{user.name}, {user.age}</h3>
          {user.isPremium && <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />}
        </div>
        <div className="flex items-center text-white/90 gap-1.5 mb-4">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {user.district}, Jharkhand {user.distance !== undefined ? `• ${user.distance} km away` : ''}
          </span>
        </div>
        <div className="space-y-2">
          <p className="text-base line-clamp-3 text-white/80 leading-relaxed font-medium italic">
            "{user.bio}"
          </p>
          <div className="flex gap-2 pt-2">
            <Badge variant="secondary" className="bg-white/10 text-white border-none">Travel</Badge>
            <Badge variant="secondary" className="bg-white/10 text-white border-none">Music</Badge>
          </div>
        </div>
      </div>

      {/* Info Button Overlay */}
      <div className="absolute bottom-28 right-6">
        <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 hover:bg-white/30 transition-colors">
          <Info className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}
