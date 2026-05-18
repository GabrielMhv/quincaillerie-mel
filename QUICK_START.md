# 📌 GUIDE DE DÉMARRAGE RAPIDE - Prochaines Actions

**Objectif**: Rendre le projet 100% stable et fonctionnel en 4-5 semaines

---

## 🚦 PRIORITÉS IMMÉDIATES (Cette Semaine)

### 🔴 CRITIQUE - Commencer MAINTENANT

#### Tâche 1: Ajouter les Server Actions Manquantes

**Durée**: 2 jours | **Responsable**: Backend Dev

```typescript
// src/app/actions/boutiques.ts - À créer
"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const BoutiqueSchema = z.object({
  name: z.string().min(2).max(100),
  address: z.string().min(5),
  phone: z.string().regex(/^[0-9+\-\s()]+$/, "Invalid phone format"),
});

export async function createBoutique(input: z.infer<typeof BoutiqueSchema>) {
  try {
    const validated = BoutiqueSchema.parse(input);
    const supabase = await createClient();

    // Check admin permission
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user?.id)
      .single();

    if (profile?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const { data, error } = await supabase
      .from("boutiques")
      .insert([validated])
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/dashboard/stores");
    return { success: true, data };
  } catch (error) {
    return { error: error.message };
  }
}

// Même pattern pour updateBoutique, deleteBoutique
```

**Checklist**:

- [ ] Fichier créé avec 3 Server Actions
- [ ] Validation Zod sur tous
- [ ] Permission checks (admin only)
- [ ] Tests passent
- [ ] Code review approuvé

---

#### Tâche 2: Ajouter Indexes DB pour Performance

**Durée**: 1 jour | **Responsable**: Database Dev

Exécuter dans Supabase SQL Editor:

```sql
-- Phase 1: Essential indexes
CREATE INDEX IF NOT EXISTS idx_orders_status
  ON public.orders(status);

CREATE INDEX IF NOT EXISTS idx_orders_boutique
  ON public.orders(boutique_id);

CREATE INDEX IF NOT EXISTS idx_orders_created_at
  ON public.orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stocks_quantity
  ON public.stocks(quantity);

CREATE INDEX IF NOT EXISTS idx_order_items_product_id
  ON public.order_items(product_id);

-- Verify indexes created
SELECT * FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%';
```

**Checklist**:

- [ ] Tous les indexes créés
- [ ] Query performance checked (< 500ms)
- [ ] Monitoring setup

---

#### Tâche 3: Réviser Politiques RLS - URGENT

**Durée**: 1 jour | **Responsable**: Backend/Security

**Pourquoi URGENT?** Les données pourraient être accessibles par les mauvais utilisateurs.

Tester chaque scenario dans Supabase:

```sql
-- Test 1: Manager boutique A voit-il boutique B?
-- Résultat attendu: NON
SELECT * FROM stocks
WHERE boutique_id = 'boutique-b-uuid'
LIMIT 1;
-- avec user.role = 'manager' ET user.boutique_id = 'boutique-a-uuid'

-- Test 2: Admin voit-il toutes les boutiques?
-- Résultat attendu: OUI
SELECT * FROM orders
WHERE boutique_id IN ('boutique-a-uuid', 'boutique-b-uuid');
-- avec user.role = 'admin'

-- Test 3: Employee ne voit que sa boutique?
-- Résultat attendu: NON pour autres boutiques
SELECT * FROM orders WHERE boutique_id = 'other-boutique';
-- avec user.role = 'employee' ET user.boutique_id = 'employee-boutique'
```

**RLS Policies à Vérifier** (dans Supabase):

```sql
-- Vérifier que chaque table a les bonnes politiques
-- Exemple pour la table 'stocks':
-- Policy 1: Admins voient tout
-- Policy 2: Managers voient que LEUR boutique
-- Policy 3: Employees voient que LEUR boutique (read-only)
-- Policy 4: Public ne voit rien (except products)
```

**Checklist**:

- [ ] Audit RLS policies complète
- [ ] Tous les scenarios testés
- [ ] Document: RLS Matrix (qui voit quoi)
- [ ] Aucune fuite de données trouvée

---

### 🟠 IMPORTANT - Cette Semaine (Jour 3-4)

#### Tâche 4: Implémenter Skeleton Screens

**Durée**: 1.5 jours | **Responsable**: Frontend

```tsx
// components/dashboard/dashboard-skeleton.tsx
export function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"
          />
        ))}
    </div>
  );
}

// src/app/dashboard/page.tsx
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
```

**Checklist**:

- [ ] Skeleton créé pour Dashboard
- [ ] Skeleton créé pour Orders
- [ ] Skeleton créé pour Products
- [ ] Pas de layout shift
- [ ] Lighthouse score amélioré

---

## 🏗️ PHASE 1 COMPLÈTE (Semaines 1-2)

Une fois les priorités immédiates terminées:

```bash
1. Finaliser tous Server Actions avec validation Zod
   ├─ Boutiques CRUD ✓ (ci-dessus)
   ├─ Profile (password change, update info)
   ├─ Stock transfers (initiate, approve, reject)
   └─ Tests: >80% coverage

2. Database Optimization
   ├─ Indexes ajoutés ✓ (ci-dessus)
   ├─ RLS policies auditées ✓ (ci-dessus)
   ├─ Query performance monitored
   └─ Données de test supprimées

3. UX/Performance
   ├─ Skeletons ajoutés ✓ (ci-dessus)
   ├─ Optimistic UI sur stocks
   ├─ Image optimization (WebP)
   └─ Lighthouse ≥ 85
```

---

## 📊 PHASE 2 (Semaines 2-3)

Une fois Phase 1 OK:

### Gestion d'Équipe (3 jours)

- [ ] Page `/dashboard/team` avec listing complet
- [ ] CRUD actions sécurisées
- [ ] Performance table affichée
- [ ] Tests complètement

### Annuaire Clients (2 jours)

- [ ] Page `/dashboard/clients`
- [ ] Historique commandes
- [ ] Filtres et recherche
- [ ] Export CSV

### Transferts de Stocks (3 jours)

- [ ] UI workflow complet
- [ ] Approvals/rejections
- [ ] Triggers SQL pour stock update
- [ ] Notifications

### Analytics (2 jours)

- [ ] Stats page: Top 10 produits/clients/employés
- [ ] Analytics page: Trends et comparaisons
- [ ] Recharts visualizations
- [ ] Export reports

---

## 🚀 PHASE 3 (Semaines 4-6)

Une fois Phase 2 OK:

### Paiements MoMo (Semaine 4)

1. **Jour 1-2**: DB schema + RLS + Edge Functions
2. **Jour 3-4**: CinetPay API integration
3. **Jour 5**: Tests

### Intégration Checkout (Semaine 5)

1. **Jour 1**: Form modification (payment method)
2. **Jour 2**: Server Actions
3. **Jour 3**: `/payment-pending` page
4. **Jour 4**: Polling + error handling
5. **Jour 5**: Integration tests

### Testing & Deployment (Semaine 6)

1. **Jour 1-2**: Comprehensive tests
2. **Jour 3**: Security audit
3. **Jour 4-5**: Deployment + monitoring

---

## 📋 CHECKLIST QUOTIDIENNE

**Chaque jour, vérifier**:

```
□ Tous les tests passent (npm run lint)
□ TypeScript sans errors (npm run build)
□ Staging environment up-to-date
□ Code review approvals avant merge
□ Deployed changes monitored
□ Team standup completed
□ Issues/blockers documented
```

---

## 🔗 LIENS UTILES

| Resource           | Link                                     |
| ------------------ | ---------------------------------------- |
| Roadmap Complète   | `ROADMAP.md`                             |
| Project Summary    | `project_summary.md`                     |
| Cahier des Charges | `documentation/cahier_des_charges...md`  |
| Production Plan    | `documentation/PRODUCTION_READY_PLAN.md` |
| Supabase Console   | https://supabase.com/dashboard/projects  |
| Vercel Dashboard   | https://vercel.com/dashboard             |

---

## ❓ QUESTIONS FRÉQUENTES

**Q: Par où commencer?**  
A: Par la Tâche 1 (Server Actions). Elle déplie les tâches suivantes.

**Q: Combien de temps pour Production?**  
A: 4-6 semaines à temps complet (3 devs). Voir GANTT dans ROADMAP.md

**Q: Comment tester localement?**  
A: `npm run dev` lance le serveur. Supabase local: `supabase start`

**Q: Qui fait quoi?**  
A: Voir "ALLOCATION RESSOURCES" dans ROADMAP.md

---

**Status**: 🟡 À commencer  
**Last Updated**: May 15, 2026  
**Next Check-in**: May 16, 2026
