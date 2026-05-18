
> export default async function StatsPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }) {
    const searchParams = await props.searchParams;
    const boutiqueSwitcherId = searchParams.boutiqueId as string | undefined;
  
    const supabase = await createClient();
  
    const {
      data: { user },
    } = await supabase.auth.getUser();
  
    if (!user) return null;
  
    const { data: profile } = await supabase
      .from("users")
      .select("role, boutique_id")
      .eq("id", user.id)
      .single();
  
    const role = profile?.role;
  
    if (role !== "admin" && role !== "manager") {
      return (
        <div className="flex h-[60vh] flex-col items-center justify-center p-12 text-center bg-card/50 backdrop-blur-xl 
rounded-[4rem] border border-dashed border-primary/20">
          <Zap className="h-16 w-16 text-muted-foreground/20 mb-6" />
          <h2 className="text-3xl font-black tracking-tighter">
            AccÃƒÂ¨s Restreint
          </h2>
          <p className="text-muted-foreground max-w-sm font-medium mt-2 leading-relaxed italic">
            Cette matrice de performance est rÃƒÂ©servÃƒÂ©e aux ÃƒÂ©chelons de direction.
          </p>
        </div>
      );
    }
  
    const isGlobalScope = role === "admin" && !boutiqueSwitcherId;
    const filteredBoutiqueId = !isGlobalScope
      ? role === "admin"
        ? boutiqueSwitcherId
        : profile?.boutique_id
      : null;
  
    // 1. Fetch Orders with Employee Data
    let ordersQuery = supabase.from("orders").select(`
      *,
      employee:users!orders_employee_id_fkey(name, boutique_id),
      boutique:boutiques(name)
    `);
  
    if (filteredBoutiqueId) {
      ordersQuery = ordersQuery.eq("boutique_id", filteredBoutiqueId);
    }
  
    const { data: orders } = await ordersQuery;
    const validOrders = orders || [];
  
    // 2. Fetch Employee Referrals
    const referralsQuery = supabase.from("employee_referrals").select(`
      *,
      employee:users!employee_referrals_employee_id_fkey(name, boutique_id)
    `);
  
    const { data: referrals } = await referralsQuery;
    const validReferrals = referrals || [];
  
    // 3. Process Employee Stats
    const employeeStats: Record<
      string,
      {
        id: string;
        name: string;
        salesCount: number;
        revenue: number;
        referralsCount: number;
        boutique_id: string;
        boutiqueName: string;
      }
    > = {};
  
    // Process Sales
    validOrders.forEach((order: any) => {
      if (!order.employee_id) return;
      const empId = order.employee_id;
      if (!employeeStats[empId]) {
        employeeStats[empId] = {
          id: empId,
          name: order.employee?.name || "Inconnu",
          salesCount: 0,
          revenue: 0,
          referralsCount: 0,
          boutique_id: order.employee?.boutique_id || "",
          boutiqueName: order.boutique?.name || "Boutique",
        };
      }
      employeeStats[empId].salesCount += 1;
      employeeStats[empId].revenue += order.total || 0;
    });
  
    // Process Referrals
    validReferrals.forEach((ref: any) => {
      const empId = ref.employee_id;
      if (employeeStats[empId]) {
        employeeStats[empId].referralsCount += 1;
      }
    });
  
    const topPerformers = Object.values(employeeStats).sort(
      (a, b) => b.revenue - a.revenue
    );
  
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                <Trophy className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Classement Performance
              </h1>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Suivi en temps rÃƒÂ©el de la productivitÃƒÂ© des collaborateurs.
            </p>
          </div>
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {topPerformers.slice(0, 3).map((emp, index) => (
            <Card key={emp.id} className={cn(
              "relative p-8 rounded-[2.5rem] border-none shadow-premium overflow-hidden group transition-all hover:-translate-y-2",
              index === 0 ? "bg-indigo-600 text-white lg:scale-105 z-10" : "bg-white dark:bg-slate-900"
            )}>
              <div className="flex justify-between items-start mb-6">
                <div className={cn(
                  "h-14 w-14 rounded-2xl flex items-center justify-center",
                  index === 0 ? "bg-white/20" : "bg-indigo-500/10 text-indigo-600"
                )}>
                  {index === 0 ? <Medal className="h-8 w-8" /> : (index === 1 ? <Trophy className="h-6 w-6" /> : <Star 
className="h-6 w-6" />)}
                </div>
                <Badge className={cn(
                  "rounded-full px-4 py-1.5 font-black uppercase text-[10px] tracking-widest",
                  index === 0 ? "bg-white text-indigo-600" : "bg-indigo-500 text-white"
                )}>
                  # {index + 1} RANG
                </Badge>
              </div>
  
              <div className="space-y-1 mb-8">
                <h3 className="text-2xl font-black tracking-tight">{emp.name}</h3>
                <p className={cn(
                  "text-sm font-bold opacity-70",
                  index === 0 ? "text-white" : "text-slate-500"
                )}>
                  {emp.boutiqueName}
                </p>
              </div>
  
              <div className="grid grid-cols-2 gap-4">
                <div className={cn("p-4 rounded-3xl", index === 0 ? "bg-white/10" : "bg-slate-50 dark:bg-slate-800")}>
                  <p className="text-[10px] font-black uppercase opacity-60 mb-1">Ventes</p>
                  <p className="text-xl font-black uppercase">{emp.salesCount}</p>
                </div>
                <div className={cn("p-4 rounded-3xl", index === 0 ? "bg-white/10" : "bg-slate-50 dark:bg-slate-800")}>
                  <p className="text-[10px] font-black uppercase opacity-60 mb-1">C.A</p>
                  <p className="text-xl font-black uppercase">{formatCurrency(emp.revenue)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
  
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-premium border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-8">
            <Users className="h-6 w-6 text-indigo-500" />
            <h2 className="text-2xl font-black tracking-tight">Tableau de Bord Complet</h2>
          </div>
          
          <div className="space-y-4">
            {topPerformers.map((emp, index) => (
              <div key={emp.id} className="group flex items-center gap-6 p-6 rounded-[2rem] hover:bg-slate-50 
dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black 
text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-lg text-slate-900 dark:text-white truncate">{emp.name}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{emp.boutiqueName}</p>
                </div>
  
                <div className="flex gap-8 items-center">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Ventes rÃƒÂ©alisÃƒÂ©es</p>
                    <p className="font-black text-slate-900 dark:text-white">{emp.salesCount}</p>
                  </div>
                  <div className="text-right min-w-[120px]">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Chiffre d'Affaire</p>
                    <p className="text-lg font-black text-indigo-600">{formatCurrency(emp.revenue)}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center 
text-slate-300 group-hover:text-indigo-500 group-hover:bg-white border border-transparent group-hover:border-slate-100 
transition-all">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
}
