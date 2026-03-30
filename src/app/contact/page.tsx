"use client";

import { useState } from "react";
import PublicLayout from "@/components/layout/public-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Mail, MapPin, Phone, Send, Sparkles, Zap, MessageSquare, CheckCircle2, Globe, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        status: 'unread'
      };

      const { error } = await supabase.from('messages').insert([data]);

      if (error) throw error;

      setSubmitted(true);
      toast.success("Message envoyé avec succès !");
    } catch (error: any) {
      console.error('Error submitting message:', error);
      toast.error(`Échec de l'envoi : ${error.message || "Erreur inconnue"}`);
    } finally {
      setLoading(false);
    }
  }

  const contactInfo = [
    {
      title: "Ligne directe",
      value: "+(228) 22 51 04 04",
      description: "Service client réactif de 8h à 19h",
      icon: Phone,
      delay: "delay-100"
    },
    {
      title: "Support digital",
      value: "contact@lachampionne.com",
      description: "Expertise technique sous 24h",
      icon: Mail,
      delay: "delay-200"
    },
    {
      title: "Lomé • Ségbé",
      value: "Direction Générale",
      description: "Notre centre logistique principal",
      icon: MapPin,
      delay: "delay-300"
    }
  ];

  return (
    <PublicLayout>
      <div className="relative min-h-screen pb-32 overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Advanced Decorative Elements */}
        <div className="hidden lg:block absolute top-0 right-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -z-10 animate-pulse pointer-events-none" />
        <div className="hidden lg:block absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] -z-10 pointer-events-none opacity-50" />
        <div className="absolute inset-0 bg-premium-grid opacity-[0.03] dark:opacity-[0.07] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 pt-12 md:pt-20 lg:pt-32 space-y-20 md:space-y-32 relative z-10">
          {/* Hero Section */}
          <div className="max-w-5xl mx-auto text-center space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-5 py-1.5 md:py-2 rounded-full bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-xl text-primary text-[9px] md:text-[11px] font-black tracking-widest leading-none shadow-sm">
              <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4" /> Rejoindre l&apos;excellence
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter leading-[1] md:leading-[0.9] text-slate-900 dark:text-white">
              Une vision, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-500 to-primary bg-[length:200%_auto] animate-gradient">une réalité.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed px-4">
              Ets La Championne Ségbé & Sanguera : Votre partenaire stratégique pour l&apos;outillage professionnel et les projets d&apos;envergure au Togo.
            </p>
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 lg:gap-16 items-start relative px-4 lg:px-0">
             {/* Dynamic Glow Behind Form */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none opacity-50 hidden md:block" />

            {/* Side Labels / Info */}
            <div className="lg:col-span-4 space-y-6 md:space-y-8 lg:sticky lg:top-32">
              <div className="space-y-3 md:space-y-4 mb-8 md:mb-12 text-center lg:text-left">
                 <h2 className="text-[9px] md:text-[10px] font-black tracking-widest text-primary opacity-60">Canaux de communication</h2>
                 <p className="text-2xl md:text-3xl font-black tracking-tighter">Toujours à vos côtés.</p>
              </div>

              {contactInfo.map((item, i) => (
                <div key={i} className={cn(
                  "group relative p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/20 dark:border-white/5 bg-white/30 dark:bg-white/5 backdrop-blur-3xl hover:bg-white/50 dark:hover:bg-white/10 transition-all duration-700 hover:shadow-2xl hover:shadow-primary/5",
                  "animate-in fade-in slide-in-from-left-8 duration-700",
                  item.delay
                )}>
                  <div className="flex items-center gap-4 md:gap-6 relative z-10">
                    <div className="flex h-12 w-12 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-2xl md:rounded-3xl bg-white dark:bg-slate-900 shadow-xl text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <item.icon className="h-5 w-5 md:h-7 md:w-7" />
                    </div>
                    <div>
                      <h3 className="text-[9px] md:text-[10px] font-black tracking-widest text-muted-foreground mb-1 md:mb-2">{item.title}</h3>
                      <p className="text-lg md:text-xl font-black tracking-tighter leading-none mb-1 text-slate-800 dark:text-white">{item.value}</p>
                      <p className="text-[10px] md:text-[12px] font-bold text-muted-foreground opacity-60 italic">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-6 md:pt-8 grid grid-cols-2 gap-4">
                 <div className="p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex flex-col items-center text-center gap-2 md:gap-3">
                    <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-indigo-400" />
                    <span className="text-[8px] md:text-[9px] font-black tracking-widest opacity-40">Données sécurisées</span>
                 </div>
                 <div className="p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 flex flex-col items-center text-center gap-2 md:gap-3">
                    <Globe className="h-5 w-5 md:h-6 md:w-6 text-emerald-400" />
                    <span className="text-[8px] md:text-[9px] font-black tracking-widest opacity-40">Expertise Togo</span>
                 </div>
              </div>
            </div>

            {/* Advanced Form Container */}
            <div className="lg:col-span-8 animate-in fade-in slide-in-from-right-12 duration-1000 delay-300 w-full mt-8 lg:mt-0">
              <div className="relative group p-1 md:p-1.5 rounded-[2rem] md:rounded-[4.5rem] bg-gradient-to-br from-white/20 to-transparent dark:from-white/10 border border-white/30 dark:border-white/10 shadow-3xl">
                <div className="p-6 sm:p-10 lg:p-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[1.5rem] md:rounded-[4rem] relative overflow-hidden ring-1 ring-white/50 dark:ring-white/5">
                  {/* Internal floating light */}
                  <div className="absolute -bottom-40 -left-40 h-80 w-80 bg-primary/10 rounded-full blur-[100px]" />
                  
                  {submitted ? (
                     <div className="text-center space-y-12 animate-in zoom-in-95 duration-700 max-w-md mx-auto py-12 relative z-10">
                        <div className="h-32 w-32 rounded-full bg-primary/10 border-8 border-primary/5 flex items-center justify-center mx-auto ring-1 ring-primary/20 animate-bounce">
                           <CheckCircle2 className="h-14 w-14 text-primary" />
                        </div>
                        <div className="space-y-6">
                           <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">C&apos;est parfait !</h2>
                           <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                              Votre message a traversé le réseau avec succès. L&apos;un de nos managers reviendra vers vous incessamment.
                           </p>
                        </div>
                        <Button 
                          onClick={() => setSubmitted(false)}
                          className="rounded-full px-6 md:px-12 h-14 md:h-16 bg-white dark:bg-slate-800 border border-primary/20 text-primary hover:bg-primary hover:text-white font-black tracking-tighter text-sm md:text-lg shadow-xl shadow-primary/5 transition-all w-full sm:w-auto"
                        >
                          Rédiger un autre message
                        </Button>
                     </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="w-full space-y-12 relative z-10">
                      <div className="grid gap-6 md:gap-10 sm:grid-cols-2">
                        <div className="group/field space-y-2 md:space-y-4">
                          <Label htmlFor="first_name" className="text-[10px] md:text-[11px] font-black tracking-[0.2em] text-primary ml-1 md:ml-2 flex items-center gap-2">
                            01 <span className="h-px w-6 md:w-8 bg-primary/30" /> Prénom
                          </Label>
                          <Input name="first_name" id="first_name" required placeholder="Jean-Marc" className="h-14 md:h-16 rounded-[1.25rem] md:rounded-[1.5rem] bg-white dark:bg-slate-800/50 border-white/40 dark:border-white/5 focus-visible:ring-primary focus-visible:bg-white dark:focus-visible:bg-slate-800 transition-all px-6 md:px-8 text-base md:text-lg font-bold tracking-tight shadow-sm" />
                        </div>
                        <div className="group/field space-y-2 md:space-y-4">
                          <Label htmlFor="last_name" className="text-[10px] md:text-[11px] font-black tracking-[0.2em] text-primary ml-1 md:ml-2 flex items-center gap-2">
                            02 <span className="h-px w-6 md:w-8 bg-primary/30" /> Nom de famille
                          </Label>
                          <Input name="last_name" id="last_name" required placeholder="Agbeko" className="h-14 md:h-16 rounded-[1.25rem] md:rounded-[1.5rem] bg-white dark:bg-slate-800/50 border-white/40 dark:border-white/5 focus-visible:ring-primary focus-visible:bg-white dark:focus-visible:bg-slate-800 transition-all px-6 md:px-8 text-base md:text-lg font-bold tracking-tight shadow-sm" />
                        </div>
                      </div>
                      
                      <div className="group/field space-y-2 md:space-y-4">
                        <Label htmlFor="email" className="text-[10px] md:text-[11px] font-black tracking-[0.2em] text-primary ml-1 md:ml-2 flex items-center gap-2">
                          03 <span className="h-px w-6 md:w-8 bg-primary/30" /> Email professionnel
                        </Label>
                        <Input name="email" id="email" type="email" required placeholder="direction@projet-btp.tg" className="h-14 md:h-16 rounded-[1.25rem] md:rounded-[1.5rem] bg-white dark:bg-slate-800/50 border-white/40 dark:border-white/5 focus-visible:ring-primary focus-visible:bg-white dark:focus-visible:bg-slate-800 transition-all px-6 md:px-8 text-base md:text-lg font-bold tracking-tight shadow-sm" />
                      </div>

                      <div className="group/field space-y-2 md:space-y-4">
                        <Label htmlFor="subject" className="text-[10px] md:text-[11px] font-black tracking-[0.2em] text-primary ml-1 md:ml-2 flex items-center gap-2">
                          04 <span className="h-px w-6 md:w-8 bg-primary/30" /> Objet de votre demande
                        </Label>
                        <Input name="subject" id="subject" required placeholder="Ex: Devis Gros Œuvre / Projet Ségbé" className="h-14 md:h-16 rounded-[1.25rem] md:rounded-[1.5rem] bg-white dark:bg-slate-800/50 border-white/40 dark:border-white/5 focus-visible:ring-primary focus-visible:bg-white dark:focus-visible:bg-slate-800 transition-all px-6 md:px-8 text-base md:text-lg font-bold tracking-tight shadow-sm" />
                      </div>

                      <div className="group/field space-y-2 md:space-y-4">
                        <Label htmlFor="message" className="text-[10px] md:text-[11px] font-black tracking-[0.2em] text-primary ml-1 md:ml-2 flex items-center gap-2">
                          05 <span className="h-px w-6 md:w-8 bg-primary/30" /> Votre vision détaillée
                        </Label>
                        <Textarea 
                          name="message"
                          id="message" 
                          required
                          placeholder="Détaillez vos besoins techniques..." 
                          className="bg-white dark:bg-slate-800/50 border-white/40 dark:border-white/5 min-h-[160px] md:min-h-[220px] rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 focus-visible:ring-primary focus-visible:bg-white dark:focus-visible:bg-slate-800 transition-all text-base md:text-lg font-bold tracking-tight shadow-sm resize-none"
                        />
                      </div>

                      <div className="pt-4 md:pt-6">
                        <Button type="submit" disabled={loading} size="lg" className="w-full h-16 md:h-20 text-base md:text-xl font-black tracking-tighter gap-3 md:gap-4 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:-translate-y-2 active:scale-[0.98] group bg-primary relative overflow-hidden">
                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                           {loading ? "Alignement des flux..." : "Transmettre ma demande"} 
                           {!loading && <Send className="h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:translate-x-3 group-hover:-translate-y-2" />}
                        </Button>
                      </div>

                      <div className="hidden lg:flex items-center justify-center gap-6 pt-6 opacity-30 group-hover:opacity-60 transition-opacity">
                         <div className="h-px w-12 bg-slate-400" />
                         <span className="text-[9px] font-black tracking-[0.5em] text-slate-500">Service certifié excellence</span>
                         <div className="h-px w-12 bg-slate-400" />
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* New Experimental Map Section */}
          <div className="pt-20 md:pt-32 px-4 lg:px-0">
            <div className="relative rounded-[2.5rem] md:rounded-[6rem] p-1 md:p-2 bg-gradient-to-br from-primary/20 to-transparent border border-white/20 shadow-2xl overflow-hidden group">
               <div className="absolute inset-0 bg-slate-900 z-0" />
               <div className="absolute inset-0 bg-premium-grid opacity-30 z-10 pointer-events-none" />
               
               {/* Styling the content area as a "Map Reveal" */}
               <div className="relative z-20 w-full h-[450px] md:h-[600px] flex items-center justify-center overflow-hidden rounded-[2rem] md:rounded-[5.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border border-white/10">
                  <div className="absolute inset-0 overflow-hidden">
                     <div className="absolute top-1/4 left-1/4 w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-primary/20 rounded-full blur-[60px] md:blur-[100px] animate-pulse" />
                     <div className="absolute bottom-1/4 right-1/4 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-emerald-400/10 rounded-full blur-[60px] md:blur-[100px] animate-pulse delay-700" />
                  </div>

                  <div className="text-center space-y-6 md:space-y-10 max-w-2xl px-6 md:px-12 relative z-30">
                     <div className="relative inline-block">
                        <div className="p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] bg-primary/10 backdrop-blur-3xl border border-primary/20 shadow-neon">
                           <MapPin className="h-12 w-12 md:h-20 md:w-20 text-primary animate-bounce" />
                        </div>
                        <div className="absolute -top-4 -right-4 h-8 w-8 md:h-10 md:w-10 bg-emerald-400 rounded-full animate-ping opacity-20" />
                     </div>
                     <div className="space-y-3 md:space-y-4">
                        <h3 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white leading-none">Nos Points de vente</h3>
                        <p className="text-base md:text-lg lg:text-xl text-white/50 font-medium leading-relaxed">
                           Ségbé • Sanguera • Lomé <br className="hidden md:block" />
                           Venez découvrir notre showroom et bénéficier d&apos;un accompagnement technique sur-mesure.
                        </p>
                     </div>
                     <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 mt-4 md:mt-0 w-full sm:w-auto">
                        <Button className="w-full sm:w-auto rounded-full px-8 md:px-12 h-14 md:h-16 bg-white text-slate-900 hover:bg-primary hover:text-white font-black tracking-tighter text-base md:text-lg shadow-xl transition-all active:scale-95">
                           Ouvrir dans Maps
                        </Button>
                        <Button variant="outline" className="w-full sm:w-auto rounded-full px-8 md:px-10 h-14 md:h-16 border-white/20 text-white hover:bg-white/10 font-bold tracking-tight text-base md:text-lg backdrop-blur-md">
                           Nos horaires
                        </Button>
                     </div>
                  </div>

                  {/* Tech Floating HUD Elements */}
                  <div className="absolute top-12 left-12 glass p-6 rounded-3xl border-white/10 text-white/40 space-y-2 hidden xl:block">
                     <div className="flex items-center gap-3 text-[10px] font-black tracking-widest">
                        <Zap className="h-3 w-3 text-primary" /> État du réseau
                     </div>
                     <div className="text-xs font-mono">Boutique Ségbé: active</div>
                     <div className="text-xs font-mono">Boutique Sanguera: active</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
