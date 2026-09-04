"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LiveCounter({
  supermarketId,
  supermarketName,
}: {
  supermarketId: string;
  supermarketName: string;
}) {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function loadTotal() {
      const { data } = await supabase
        .from("items")
        .select("quantity")
        .eq("supermarket_id", supermarketId);
      if (!active) return;
      const sum = (data ?? []).reduce((acc, row) => acc + (row.quantity ?? 0), 0);
      setTotal(sum);
    }

    loadTotal();

    const channel = supabase
      .channel(`live-counter-${supermarketId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "items",
          filter: `supermarket_id=eq.${supermarketId}`,
        },
        () => loadTotal()
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [supermarketId]);

  return (
    <div className="rounded-xl bg-navy p-4 text-center text-white shadow-sm">
      <p className="text-3xl font-bold text-orange">{total ?? "…"}</p>
      <p className="text-xs text-white/80">
        ítems registrados en {supermarketName}
      </p>
    </div>
  );
}
