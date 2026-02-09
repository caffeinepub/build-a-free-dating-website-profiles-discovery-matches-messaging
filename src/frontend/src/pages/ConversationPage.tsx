import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetConversation, useSendMessage, useMarkConversationAsRead, useGetMatches } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send } from 'lucide-react';
import { Principal } from '@dfinity/principal';

export default function ConversationPage() {
  const { userId } = useParams({ from: '/authed/conversation/$userId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: messages = [], isLoading } = useGetConversation(userId);
  const { data: matchesData } = useGetMatches();
  const sendMessage = useSendMessage();
  const markAsRead = useMarkConversationAsRead();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherUser = matchesData?.matches.find((m) => m.principal.toString() === userId);
  const myPrincipal = identity?.getPrincipal().toString();

  useEffect(() => {
    if (userId) {
      markAsRead.mutate(Principal.fromText(userId));
    }
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await sendMessage.mutateAsync({
      recipient: Principal.fromText(userId),
      content: newMessage,
    });
    setNewMessage('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Card className="h-[calc(100vh-12rem)] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/messages' })}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <CardTitle>
              {otherUser ? `${otherUser.displayName}, ${Number(otherUser.age)}` : 'Conversation'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <p>No messages yet. Say hello! 👋</p>
            </div>
          ) : (
            messages.map((message, idx) => {
              const isMe = message.sender.toString() === myPrincipal;
              return (
                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isMe
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p>{message.content}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        <div className="border-t p-4">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit" disabled={!newMessage.trim() || sendMessage.isPending}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
