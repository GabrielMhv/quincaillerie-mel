import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Mail, Inbox, Clock3, MessageSquareText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import MarkReadButton from "@/components/dashboard/mark-read-button";

type MessageRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  subject: string | null;
  message: string | null;
  status: string | null;
  created_at: string;
};

export default async function MessagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (messages || []) as MessageRow[];
  const unreadCount = rows.filter(
    (message) => message.status !== "read",
  ).length;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black tracking-widest text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <Inbox className="h-3.5 w-3.5 text-primary" />
            Centre de messages
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Messages entrants
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-2xl">
            Consultez les demandes envoyées depuis la page de contact et suivez
            leur traitement.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <MessageSquareText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  Total messages
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {rows.length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  Non lus
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {unreadCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-[2.5rem] border border-dashed border-slate-200 bg-white/80 p-12 text-center dark:border-white/10 dark:bg-white/5">
          <Mail className="mx-auto h-12 w-12 text-slate-300" />
          <h2 className="mt-4 text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Aucun message pour le moment
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Les prochains messages envoyés depuis la page de contact
            apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {rows.map((message) => {
            const status = message.status === "read" ? "Lu" : "Non lu";

            return (
              <article
                key={message.id}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                        {message.first_name || "Prénom"}{" "}
                        {message.last_name || "Nom"}
                      </h2>
                      <Badge
                        variant={
                          message.status === "read"
                            ? "secondary"
                            : "destructive"
                        }
                        className="rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase"
                      >
                        {status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                      <span>{message.email || "Email non renseigné"}</span>
                      <span>
                        {format(
                          new Date(message.created_at),
                          "dd MMM yyyy · HH:mm",
                          {
                            locale: fr,
                          },
                        )}
                      </span>
                    </div>
                    <p className="text-base font-bold text-slate-900 dark:text-white">
                      {message.subject || "Sans objet"}
                    </p>
                    <p className="max-w-4xl text-sm leading-7 text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                      {message.message || "Aucun contenu."}
                    </p>
                  </div>

                  {message.email ? (
                    <a
                      href={`mailto:${message.email}`}
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-xs font-black tracking-widest text-slate-700 transition-colors hover:border-primary hover:text-primary dark:border-white/10 dark:text-slate-200"
                    >
                      Répondre
                    </a>
                  ) : null}
                  <div className="mt-4 lg:mt-0">
                    <MarkReadButton id={message.id} status={message.status} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
