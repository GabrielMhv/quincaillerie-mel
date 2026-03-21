# CAHIER DES CHARGES TECHNIQUE ET FONCTIONNEL

## Plateforme Web de Gestion de Quincaillerie – Multi‑Boutiques

---

# 1. OBJECTIF DU PROJET

Développer une plateforme web permettant :

- aux clients de consulter les produits et passer des commandes en ligne
- aux employés de gérer les ventes en magasin (caisse)
- aux responsables de boutique de suivre l’activité de leur magasin
- au gérant principal de superviser les deux boutiques depuis un tableau de bord central

La plateforme doit permettre une **gestion centralisée des produits, des stocks, des ventes et des performances des employés**.

---

# 2. STACK TECHNOLOGIQUE

## Frontend

- **Framework : Next.js 14 (App Router)**
- **Langage : TypeScript**
- **UI : Tailwind CSS**
- **Gestion d’état : Zustand ou React Context**
- **Tableaux de données : TanStack Table**
- **Graphiques statistiques : Recharts ou Chart.js**
- **PDF des reçus : jsPDF ou react-pdf**

## Backend

Backend basé sur **Supabase (Backend as a Service)**.

Services utilisés :

- **Base de données : PostgreSQL (Supabase)**
- **Authentification : Supabase Auth**
- **API : REST automatique Supabase**
- **Fonctions serveur : Supabase Edge Functions**
- **Sécurité : Row Level Security (RLS)**

## Stockage des images

- **Cloudinary**

Utilisé pour :

- images produits
- optimisation automatique
- CDN rapide

Les URLs des images sont stockées dans la base **Supabase**.

## Hébergement

- Frontend : **Vercel**
- Backend : **Supabase Cloud**

---

# 3. TYPES D’UTILISATEURS

Le système comporte **4 types d’utilisateurs**.

| Rôle                     | Description                                 |
| ------------------------ | ------------------------------------------- |
| Client                   | Consulte les produits et passe une commande |
| Employé                  | Gère la caisse et les commandes             |
| Responsable boutique     | Supervise une boutique spécifique           |
| Administrateur principal | Gère les deux boutiques                     |

Gestion des rôles via :

- Supabase Auth
- Row Level Security

---

# 4. STRUCTURE DES INTERFACES

La plateforme contient **4 interfaces principales**.

1. Site client
2. Dashboard administrateur principal
3. Dashboard boutique
4. Dashboard employé

---

# 5. MODULE CLIENT (SITE PUBLIC)

Le client peut utiliser le site **sans créer de compte**.

## Fonctionnalités

- voir les produits
- rechercher un produit
- filtrer par catégorie
- ajouter au panier
- passer une commande
- télécharger un reçu

---

## Formulaire de commande

Lorsqu’un client passe une commande il doit remplir :

- Nom

- Téléphone

- Adresse

Question obligatoire :

**"Comment avez‑vous connu la boutique ?"**

Options :

- Réseaux sociaux
- Ami
- Publicité
- Passage devant la boutique
- Employé de l’entreprise

Si **Employé de l’entreprise** est choisi :

un champ apparaît :

- Nom de l’employé

---

## Gestion des recommandations d’employés

Si un client indique un employé :

Le système doit :

1. enregistrer l'information
2. associer le client à l’employé
3. envoyer une **notification au dashboard admin principal**

Cela permet de calculer :

- nombre de clients rapportés par employé

---

# 6. DASHBOARD ADMINISTRATEUR PRINCIPAL

Le gérant peut **superviser les deux boutiques simultanément**.

## Statistiques globales

Le dashboard affiche :

- chiffre d’affaires total
- chiffre d’affaires par boutique
- nombre total de commandes
- produits les plus vendus
- stock faible

---

## Statistiques des employés

L’administrateur peut voir :

- ventes réalisées par chaque employé
- chiffre d’affaires généré
- nombre de clients rapportés
- classement des employés

Filtres :

- par boutique
- par période

---

## Gestion des produits

L’admin peut :

- ajouter produit
- modifier produit
- supprimer produit

Lors de l'ajout :

le gérant peut choisir :

- boutique A
- boutique B
- les deux boutiques

Si le produit est pour les deux :

il définit :

- quantité boutique A
- quantité boutique B

Images uploadées vers **Cloudinary**.

---

## Gestion des utilisateurs

Création :

- responsables boutique
- employés

Chaque utilisateur possède :

- rôle
- boutique assignée

---

# 7. DASHBOARD BOUTIQUE

Accessible uniquement par le responsable.

Fonctionnalités :

- voir ventes de la boutique
- voir stock
- voir alertes stock
- voir historique commandes

Accès limité par **RLS Supabase**.

---

# 8. DASHBOARD EMPLOYÉ

Utilisé pour la **gestion de la caisse**.

## Interface de caisse

Fonctions :

- rechercher produit
- ajouter au panier
- modifier quantité
- finaliser vente

Lors d’une vente :

- création commande
- décrémentation stock

---

## Commandes

Employé peut :

- voir commandes
- créer commande magasin
- générer reçu

---

## Reçus

Contiennent :

- numéro commande
- produits
- quantités
- total
- date

Export :

- PDF
- impression

---

# 9. STRUCTURE DE LA BASE DE DONNÉES (SUPABASE)

Tables principales :

### users

- id
- name
- role
- boutique\_id

### boutiques

- id
- name

### categories

- id
- name

### products

- id
- name
- price
- category\_id
- image\_url

### stocks

- id
- product\_id
- boutique\_id
- quantity

### orders

- id
- client\_name
- phone
- total
- employee\_id
- boutique\_id

### order\_items

- id
- order\_id
- product\_id
- quantity
- price

### employee\_referrals

- id
- employee\_id
- client\_name
- order\_id

---

# 10. AUTOMATISATIONS

Automatisations gérées via PostgreSQL :

- décrémentation stock après vente
- calcul statistiques employés
- génération notifications admin

Implémentation via :

- SQL triggers
- fonctions Supabase

---

# 11. SÉCURITÉ

- HTTPS obligatoire
- Supabase Auth
- Row Level Security
- validation données côté serveur

---

# 12. PLAN DE DÉVELOPPEMENT RECOMMANDÉ

Ordre conseillé :

1. création base Supabase
2. création tables
3. configuration RLS
4. setup Next.js
5. module produits
6. module commandes
7. module caisse
8. dashboards
9. statistiques

---

# 13. LIVRABLE FINAL

Le projet final doit contenir :

- code Next.js
- configuration Supabase
- intégration Cloudinary
- base de données opérationnelle

---

Document prêt pour démarrage du développement.

