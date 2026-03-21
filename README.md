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

- **Framework** : [Next.js 15+](https://nextjs.org/) (App Router)
- **Base de données & Auth** : [Supabase](https://supabase.com/) (PostgreSQL & Realtime)
- **Styling** : Tailwind CSS & Shadcn/UI
- **Icons** : Lucide React
- **Gestion d'images** : Cloudinary Integration
- **Processing** : Canvas API pour la conversion WebP client-side

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