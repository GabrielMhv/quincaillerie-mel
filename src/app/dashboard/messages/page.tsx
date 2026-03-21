"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mail, Calendar, User, Trash2, ArrowRightLeft, Sparkles, Inbox, Shield } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ContactMessage {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  created_at: string;
}

export default function MessagesDashboard() {
  const { user } = useAuth();
  const supabase = createClient();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchMessages();
    }
  }, [user]);

  async function fetchMessages() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error("Échec lors de la récupération des messages");
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status: 'read' })
        .eq('id', id);

      if (error) throw error;
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'read' } : m));
      if (selectedMessage?.id === id) {
        setSelectedMessage(prev => prev ? { ...prev, status: 'read' } : null);
      }
    } catch (error) {
       toast.error("Erreur lors de la mise à jour");
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm("Supprimer définitivement ce message ?")) return;
    try {
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if (error) throw error;
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
      toast.success("Message supprimé");
    } catch (error) {
      toast.error("Échec de la suppression");
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center p-12 text-center bg-card/50 backdrop-blur-xl rounded-[4rem] border border-dashed border-primary/20 animate-in fade-in duration-1000">
        <div className="h-20 w-20 rounded-[2.5rem] bg-rose-500/10 flex items-center justify-center text-rose-600 mb-6">
           <Shield className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-black tracking-tighter">Accès Restreint</h2>
        <p className="text-muted-foreground max-w-sm font-medium mt-2 leading-relaxed italic">
          Seul l&apos;administrateur principal est habilité à consulter la correspondance client.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter leading-tight">
             Centre de <span className="text-gradient leading-relaxed">Messages</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium italic">
            Gérez les interactions et les demandes de contact client
          </p>
        </div>
        
        <div className="px-6 py-3 rounded-2xl bg-card border border-border/50 shadow-sm flex items-center gap-4">
           <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Inbox className="h-5 w-5" />
           </div>
           <div>
              <p className="text-[10px] font-black text-muted-foreground/60 tracking-widest lowercase">Flux Entrant</p>
              <p className="text-sm font-bold">{messages.length} Messages</p>
           </div>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-12 items-start h-[calc(100vh-350px)] min-h-[600px]">
        {/* Messages List Area */}
        <div className="lg:col-span-5 h-full rounded-[3.5rem] border border-border/50 bg-card/40 backdrop-blur-xl shadow-premium overflow-hidden flex flex-col">
          <div className="p-8 border-b border-border/50 bg-muted/30 flex items-center gap-3">
             <MessageSquare className="h-4 w-4 text-muted-foreground/60" />
             <h3 className="text-sm font-black tracking-tight text-muted-foreground/60">Boîte de Réception</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            {loading ? (
               [1,2,3,4].map(i => (
                 <div key={i} className="h-28 w-full animate-pulse bg-muted rounded-[2rem]" />
               ))
            ) : messages.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
                  <Inbox className="h-16 w-16" />
                  <p className="font-black tracking-widest text-sm text-center">Aucun message pour le moment</p>
               </div>
            ) : (
              messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (msg.status === 'unread') markAsRead(msg.id);
                  }}
                  className={cn(
                    "w-full text-left p-6 rounded-[2rem] border transition-all duration-500 relative group overflow-hidden",
                    selectedMessage?.id === msg.id 
                      ? "bg-primary border-primary shadow-2xl shadow-primary/20 text-white" 
                      : "bg-card/50 border-border/30 hover:bg-primary/[0.03] hover:border-primary/20",
                    msg.status === 'unread' && selectedMessage?.id !== msg.id && "ring-2 ring-primary ring-offset-4 ring-offset-background/50"
                  )}
                >
                   <div className="flex justify-between items-start mb-3">
                      <Badge variant={msg.status === 'unread' ? "default" : "secondary"} className={cn(
                        "rounded-full px-3 py-0.5 text-[9px] font-black tracking-widest",
                        selectedMessage?.id === msg.id ? "bg-white text-primary" : ""
                      )}>
                        {msg.status === 'unread' ? "Nouveau" : "Consulté"}
                      </Badge>
                      <span className={cn(
                        "text-[10px] font-bold opacity-60",
                        selectedMessage?.id === msg.id ? "text-white" : "text-muted-foreground"
                      )}>
                        {format(new Date(msg.created_at), 'dd MMM', { locale: fr })}
                      </span>
                   </div>
                   <p className="font-black text-xl tracking-tighter truncate leading-none mb-1">
                     {msg.first_name} {msg.last_name}
                   </p>
                   <p className={cn(
                     "text-xs font-bold tracking-tight truncate italic",
                     selectedMessage?.id === msg.id ? "text-white/80" : "text-muted-foreground"
                   )}>
                     {msg.subject || "Sans objet spécifié"}
                   </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Content Area */}
        <div className="lg:col-span-7 h-full">
          {selectedMessage ? (
             <div className="h-full rounded-[4rem] border border-border/50 bg-card/80 backdrop-blur-xl shadow-premium overflow-hidden flex flex-col animate-in slide-in-from-right-8 duration-700">
                <div className="p-10 border-b border-border/50 bg-secondary/30 flex justify-between items-center bg-gradient-to-r from-transparent to-primary/5">
                   <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-lg">
                        <User className="h-8 w-8" />
                      </div>
                      <div>
                         <h2 className="text-3xl font-black tracking-tighter leading-none">
                           {selectedMessage.first_name} {selectedMessage.last_name}
                         </h2>
                         <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm font-bold italic">
                           <Mail className="h-4 w-4 opacity-40" />
                           {selectedMessage.email}
                         </div>
                      </div>
                   </div>
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     className="h-14 w-14 rounded-2xl hover:bg-destructive/10 hover:text-destructive transition-all duration-300" 
                     onClick={() => deleteMessage(selectedMessage.id)}
                   >
                      <Trash2 className="h-6 w-6" />
                   </Button>
                </div>

                <div className="p-10 lg:p-14 space-y-10 flex-1 overflow-y-auto custom-scrollbar">
                   <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-primary italic">
                         <Sparkles className="h-4 w-4" /> Objet de la Demande
                      </div>
                      <p className="text-4xl font-black tracking-tighter leading-tight italic">
                        &quot;{selectedMessage.subject || "Information Générale"}&quot;
                      </p>
                   </div>

                   <div className="p-10 rounded-[3rem] bg-muted/40 border border-border/50 relative">
                      <div className="absolute -top-3 left-10 px-4 py-1 rounded-full bg-background border border-border/50 text-[10px] font-black tracking-widest text-muted-foreground/60">
                         Corps du Message
                      </div>
                      <p className="text-xl font-medium leading-relaxed text-foreground/80 whitespace-pre-wrap italic">
                        {selectedMessage.message}
                      </p>
                   </div>
                </div>

                <div className="p-10 border-t border-border/50 bg-muted/30 flex items-center justify-between">
                   <div className="flex items-center gap-3 text-muted-foreground text-xs font-bold italic opacity-60">
                     <Calendar className="h-4 w-4" />
                     Reçu le {format(new Date(selectedMessage.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                   </div>
                   <Button 
                     className="h-14 px-10 rounded-2xl bg-primary text-primary-foreground font-black tracking-tighter text-lg hover:scale-105 transition-all shadow-lg flex gap-3" 
                     onClick={() => window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                   >
                     Envoyer une Réponse <ArrowRightLeft className="h-5 w-5" />
                   </Button>
                </div>
             </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-20 text-center bg-muted/10 rounded-[4rem] border border-dashed border-border/50 group">
               <div className="h-32 w-32 rounded-[2.5rem] bg-muted/50 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-700">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/20" />
               </div>
               <h3 className="text-3xl font-black tracking-tighter opacity-20 italic">Sélectionnez une interaction pour l&apos;afficher</h3>
               <p className="text-sm text-muted-foreground/30 font-medium max-w-xs mt-4">Cliquez sur un message de la liste pour consulter les détails du client.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Store(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 10V7" />
    </svg>
  );
}
