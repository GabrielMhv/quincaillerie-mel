
>         <ClientsContent />
        </Suspense>
      </div>
    );
  }
  
> async function ClientsContent() {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
  
    const { data: orders } = await supabase
      .from("orders")
      .select("client_name, phone, address, total, created_at")
      .neq("source", "passage_boutique")
      .order("created_at", { ascending: false });
  
    const clientsMap: Record<
      string,
      {
        name: string;
        phone: string;
        address: string;
        totalSpent: number;
        orderCount: number;
        lastOrder: string;
      }
    > = {};
  
    orders?.forEach((o) => {
      const key = (o.phone || o.client_name || "Anonyme").trim().toLowerCase();
      if (!clientsMap[key]) {
        clientsMap[key] = {
          name: o.client_name || "Anonyme",
          phone: o.phone || "N/A",
          address: o.address || "Non spÃƒÂ©cifiÃƒÂ©e",
          totalSpent: 0,
          orderCount: 0,
          lastOrder: o.created_at,
        };
      }
      clientsMap[key].totalSpent += Number(o.total);
      clientsMap[key].orderCount += 1;
    });
  
    const clients = Object.values(clientsMap).sort((a, b) => b.totalSpent - a.totalSpent);
  
    return <ClientsTable clients={clients} />;
  }
}
