
"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Send, Sparkles, MoreVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { generateConversationStarters } from '@/ai/flows/ai-conversation-starter';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection, useDoc, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

export default function ChatPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const [messageText, setMessageText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Match Details
  const matchRef = useMemo(() => id ? doc(db, 'matches', id) : null, [db, id]);
  const { data: match } = useDoc<any>(matchRef);

  // Messages Query
  const messagesQuery = useMemo(() => {
    if (!id) return null;
    return query(collection(db, 'matches', id, 'messages'), orderBy('timestamp', 'asc'));
  }, [db, id]);

  const { data: messages, loading: messagesLoading } = useCollection<any>(messagesQuery);

  // Target User Details (The other person in the match)
  const targetUserId = match?.users?.find((u: string) => u !== user?.uid);
  const targetUserRef = useMemo(() => targetUserId ? doc(db, 'users', targetUserId) : null, [db, targetUserId]);
  const { data: targetUser } = useDoc<any>(targetUserRef);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!messageText.trim() || !user || !id) return;
    
    const messageData = {
      text: messageText,
      senderId: user.uid,
      timestamp: serverTimestamp()
    };

    // Add message to subcollection
    addDoc(collection(db, 'matches', id, 'messages'), messageData).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `matches/${id}/messages`, operation: 'write' }));
    });

    // Update match summary
    updateDoc(doc(db, 'matches', id), {
      lastMessage: messageText,
      lastMessageTime: serverTimestamp()
    });

    setMessageText('');
  };

  const handleAiStarter = async () => {
    if (!targetUser || !user) return;
    setIsGenerating(true);
    try {
      const result = await generateConversationStarters({
        userProfile: { name: user.displayName || "Me", bio: "Jharkhand local", district: "Ranchi" },
        matchProfile: { name: targetUser.name, bio: targetUser.bio, district: targetUser.district }
      });
      if (result.starters && result.starters.length > 0) {
        setMessageText(result.starters[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (messagesLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="h-16 flex items-center px-4 border-b bg-white z-10 shadow-sm">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <Avatar className="w-10 h-10 mr-3 border-2 border-primary/10">
          <AvatarImage src={targetUser?.imageUrl} className="object-cover" />
          <AvatarFallback>{targetUser?.name?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold truncate">{targetUser?.name || 'Partner'}</h2>
          <div className="flex items-center text-[10px] text-green-500 font-bold uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1 animate-pulse" />
            Online
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-5 h-5 text-muted-foreground" />
        </Button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 tinder-gradient-bg">
        {messages?.map((msg) => (
          <div 
            key={msg.id} 
            className={cn(
              "flex flex-col max-w-[80%]",
              msg.senderId === user?.uid ? "ml-auto items-end" : "items-start"
            )}
          >
            <div className={cn(
              "px-4 py-2 rounded-2xl text-sm shadow-sm",
              msg.senderId === user?.uid 
                ? "bg-primary text-white rounded-tr-none" 
                : "bg-white text-foreground rounded-tl-none border"
            )}>
              {msg.text}
            </div>
            <span className="text-[9px] text-muted-foreground mt-1 px-1 font-bold">
              {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
            </span>
          </div>
        ))}
      </div>

      <footer className="p-4 border-t bg-white space-y-3">
        {messageText === '' && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary gap-1 text-xs mx-auto flex h-8 rounded-full bg-primary/5 hover:bg-primary/10 font-bold"
            onClick={handleAiStarter}
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            ASK AI FOR STARTER
          </Button>
        )}
        <div className="flex gap-2">
          <Input 
            className="flex-1 h-12 rounded-full px-5 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button 
            className="w-12 h-12 rounded-full tinder-gradient p-0 shadow-lg shadow-primary/20"
            onClick={handleSend}
            disabled={!messageText.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
