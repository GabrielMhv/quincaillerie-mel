# 📋 Plan de Production-Ready - Quincaillerie Multi-Boutiques

## 🛡️ 1. Sécurisation & Architecture (Server Actions + Zod)

- [x] Migrer la création/modification de **Produits** vers des Server Actions.
- [x] Ajouter la validation **Zod** pour les produits.
- [x] Migrer la gestion des **Catégories** vers les Server Actions + Zod.
- [ ] Créer les Server Actions pour la gestion des **Boutiques** (CRUD).
- [ ] Créer les Server Actions pour la gestion du **Profil Utilisateur** (Changement mdp, update infos).
- [ ] Migrer les **Transferts de Stocks** vers des Server Actions sécurisées.
- [ ] Implémenter la validation Zod sur tous les formulaires restants.

## 🚀 2. Performance & UX (Loading & Optimisation)

- [x] Créer les composants de base **Skeleton UI**.
- [ ] Intégrer les Skeletons via `<Suspense>` dans `app/dashboard/page.tsx` (Dashboard).
- [ ] Intégrer les Skeletons dans `app/dashboard/orders/page.tsx`.
- [ ] Intégrer les Skeletons dans `app/dashboard/products/page.tsx`.
- [ ] Optimisation finale des images (WebP automatique via les Server Actions d'upload).
- [ ] Ajouter des états **Optimistic UI** pour les changements de stock manuels.

## 🎨 3. Harmonisation Design & UI/UX

- [ ] Standardisation des espacements et arrondis (`rounded-2xl` par défaut pour les cartes).
- [ ] Application du **Branding Dynamique** (couleurs d'accentuation par boutique).
- [ ] Amélioration des contrastes en **Mode Sombre** sur les graphiques.
- [ ] Harmonisation de la typographie (réduction de l'usage abusif de `font-black`).
- [ ] Effets de survol (hover) et transitions fluides sur les tableaux et boutons.

## 🗄️ 4. Base de Données & Supabase

- [x] Trigger PostgreSQL pour l'historique des stocks (`stock_logs`).
- [x] Trigger PostgreSQL pour la restauration du stock lors d'une annulation de commande.
- [ ] Réviser toutes les **Politiques RLS** pour les Managers vs Admins.
- [ ] Ajouter les indexes B-TREE manquants pour optimiser les filtres (status, date, boutique_id).
- [ ] Nettoyage des données de test et préparation du script de migration final.
