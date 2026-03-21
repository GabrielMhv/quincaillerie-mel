import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion - Ets La Championne",
  description: "Accédez à votre espace sécurisé Ets La Championne.",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3 text-center lg:text-left mb-10 pb-10 border-b border-slate-200 dark:border-white/5">
        <h1 className="text-[42px] lg:text-[52px] font-black tracking-tighter leading-[1.1] text-slate-900 dark:text-white flex flex-col">
          <span>Bienvenue</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">chez vous.</span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-sm leading-relaxed">
          Accédez à votre console sécurisée pour piloter l&apos;ensemble de nos points de vente.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
