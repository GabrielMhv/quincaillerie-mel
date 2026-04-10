# 🏆 Ets La Championne - Système de Gestion Pro

Bienvenue dans le dépôt officiel de **Ets La Championne**, une solution de gestion de quincaillerie de classe mondiale conçue pour l'excellence opérationnelle et la performance multi-boutiques.

![Quincaillerie Logo](public/favicon.ico) *<!-- Suggestion: Remplacez par votre logo premium -->*

## 🚀 Vision du Projet

Ce système n'est pas qu'un simple outil de gestion ; c'est le centre de contrôle d'une entreprise moderne. Alliant design premium et technologies de pointe, il permet une gestion fluide des stocks, des ventes et des transferts entre plusieurs points de vente.

## ✨ Fonctionnalités Clés

- **📦 Gestion de Stock Multi-Boutiques** : Suivi en temps réel des inventaires par emplacement, avec alertes de stock faible.
- **🛒 Gestion des Commandes** : Processus de vente optimisé avec interface moderne et intuitive.
- **🔄 Système de Transfert** : Logique de transfert de stock entre boutiques avec confirmation sécurisée.
- **🔔 Centre de Notifications** : Alertes en temps réel (Push & Historique) pour les ventes, les stocks et les requêtes critiques.
- **🖼️ Optimisation Visuelle** : Conversion automatique des images en **WebP** pour une performance maximale.
- **⚡ Performance Médias** : Rendu instantané de l'identité de marque grâce au SSR (Server-Side Rendering).
- **🎨 Design World-Class** : Interface premium, responsive, avec un focus sur l'expérience utilisateur (UX).

## 🛠️ Stack Technique

- **Framework** : [Next.js 16.1.6](https://nextjs.org/) (App Router & Turbopack)
- **Base de données & Auth** : [Supabase](https://supabase.com/) (PostgreSQL SSR & RLS)
- **Proxification** : Nouveau système `src/proxy.ts` pour Next.js 16+
- **Styling** : Tailwind CSS & Shadcn/UI (Design Premium)
- **Icons** : Lucide React
- **Gestion d'images** : Cloudinary Integration & Supabase Storage (WebP/AVIF Ready)
- **Performance** : Optimisation INP via `useTransition` et caching Supabase par requête via `React.cache()`

## 📦 État du Projet & Roadmap

### ✅ Réalisé (v1.0 Ready)
- **Site Client Complet** : Catalogue, panier local (Zustand), formulaires de commande avec source d'entrée client.
- **Multi-Boutiques (RLS)** : Ségrégation stricte des données entre Boutique A et Boutique B.
- **Interface POS (Caisse)** : Panel dédié pour les employés avec recherche instantanée.
- **Dashboard Admin** : Statistiques poussées via Recharts et gestion complète du catalogue.
- **Système de Recommandations** : Triggers SQL automatiques pour le suivi des apports clients par les employés.

### ⏳ À Venir (Roadmap)
- **💳 Paiements Mobiles (MoMo)** : Intégration MTN MoMo et Orange Money (USSD & API).
- **📊 Business Intelligence** : Analyses prédictives sur les stocks basés sur l'historique de ventes.
- **📦 Multi-Entrepôts** : Gestion de stocks pivots hors magasins physiques.

Retrouvez le [récapitulatif complet du projet](project_summary.md) pour plus de détails techniques.

## ⚙️ Installation & Configuration

### 1. Cloner le projet
```bash
git clone https://github.com/GabrielMhv/quincaillerie-mel.git
cd quincaillerie
```

### 2. Variables d'environnement
Créez un fichier `.env.local` à la racine :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=votre_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=votre_preset
```

### 3. Installation des dépendances
```bash
npm install
```

### 4. Lancer le serveur de développement
```bash
npm run dev
```

## 📈 Guide de Contribution

Les contributions sont les bienvenues pour maintenir ce système au sommet de la performance.
1. Forkez le projet.
2. Créez votre branche (`git checkout -b feature/nouvelle-feature`).
3. Commit avec des messages clairs.
4. Push sur votre branche.
5. Ouvrez une Pull Request.

---
*Développé avec ❤️ pour Ets La Championne.*