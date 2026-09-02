import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getRevenue, getOrders, getOrdersByStatus, getOutstandingBalances,
  getFrequentCustomers, getInactiveCustomers, getTopCustomer,
  getUpcomingDeadlines, getOverdueOrders, balanceOf, CustomerStats,
} from "@/lib/store";
import { STATUS_FLOW, STATUS_META, fmtMoney } from "@/lib/constants";
import { DollarSign, CalendarDays, TrendingUp, Crown, Package, Clock, Repeat, UserX, AlertTriangle, CalendarClock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import CustomerListDialog from "./CustomerListDialog";

type ModalKey = null | "frequent" | "inactive" | "top";

const DashboardScreen = () => {
  const [, setTick] = useState(0);
  const [modal, setModal] = useState<ModalKey>(null);

  useEffect(() => {
    const refresh = () => setTick((t) => t + 1);
    window.addEventListener("storage", refresh);
    const interval = setInterval(refresh, 3000);
    return () => { window.removeEventListener("storage", refresh); clearInterval(interval); };
  }, []);

  const rev = getRevenue();
  const top = getTopCustomer();
  const orders = getOrders();
  const byStatus = getOrdersByStatus();
  const outstanding = getOutstandingBalances();
  const frequent = getFrequentCustomers();
  const inactive = getInactiveCustomers();
  const upcoming = getUpcomingDeadlines(7).slice(0, 5);
  const overdue = getOverdueOrders();

  const stats = [
    { label: "Today (paid)", value: fmtMoney(rev.today), sub: `${rev.todayCount} new order${rev.todayCount === 1 ? "" : "s"}`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
    { label: "This Week", value: fmtMoney(rev.week), icon: CalendarDays, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "This Month", value: fmtMoney(rev.month), icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Top Customer", value: top ? top.name : "—", sub: top ? `${top.visitCount} order${top.visitCount === 1 ? "" : "s"}` : "No orders yet", icon: Crown, color: "text-yellow-500", bg: "bg-yellow-500/10", onClick: () => top && setModal("top") },
  ];

  const topList: CustomerStats[] = top ? [top, ...frequent.filter((c) => c.id !== top.id)].slice(0, 5) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Summary</h1>
        <p className="text-muted-foreground text-sm mt-1">Your tailoring shop at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s) => (
          <Card key={s.label} className={`overflow-hidden border-0 shadow-md ${s.onClick ? "cursor-pointer hover:shadow-lg transition-shadow" : ""}`} onClick={s.onClick}>
            <CardContent className="p-4 md:p-5">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${s.bg} mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              <p className="text-xl md:text-2xl font-bold font-display mt-0.5 truncate">{s.value}</p>
              {s.sub && <p className="text-xs text-muted-foreground mt-1 truncate">{s.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base md:text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" /> Order Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {STATUS_FLOW.map((s) => {
              const meta = STATUS_META[s];
              const count = byStatus[s].length;
              return (
                <div key={s} className={`rounded-xl p-3 ring-1 ${meta.bg} ${meta.ring}`}>
                  <p className={`text-xs font-semibold ${meta.color}`}>{meta.label}</p>
                  <p className="font-display text-2xl font-bold mt-1">{count}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-amber-500" /> Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No deadlines in the next 7 days.</p>
            ) : (
              <div className="divide-y">
                {upcoming.map((o) => (
                  <div key={o.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        <span className="font-mono text-xs text-muted-foreground mr-2">{o.orderNumber}</span>
                        {o.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{o.styleName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-amber-600">{format(new Date(o.dueDate!), "dd MMM")}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(o.dueDate!, { addSuffix: true })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-md ${overdue.length > 0 ? "ring-2 ring-destructive/30" : ""}`}>
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${overdue.length > 0 ? "text-destructive" : "text-muted-foreground"}`} /> Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overdue.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nothing overdue — great work!</p>
            ) : (
              <div className="divide-y">
                {overdue.slice(0, 5).map((o) => (
                  <div key={o.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        <span className="font-mono text-xs text-muted-foreground mr-2">{o.orderNumber}</span>
                        {o.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{o.styleName}</p>
                    </div>
                    <p className="text-xs font-semibold text-destructive shrink-0">{formatDistanceToNow(o.dueDate!, { addSuffix: true })}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setModal("frequent")}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0"><Repeat className="w-5 h-5 text-emerald-500" /></div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Frequent customers</p>
              <p className="text-xl font-bold font-display">{frequent.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setModal("inactive")}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0"><UserX className="w-5 h-5 text-amber-500" /></div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Inactive (30+ days)</p>
              <p className="text-xl font-bold font-display">{inactive.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0"><Clock className="w-5 h-5 text-orange-500" /></div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Outstanding balances</p>
              <p className="text-xl font-bold font-display">{outstanding.count}</p>
              <p className="text-xs text-muted-foreground truncate">Total: {fmtMoney(outstanding.total)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0"><Package className="w-5 h-5 text-blue-500" /></div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Total orders</p>
              <p className="text-xl font-bold font-display">{orders.length}</p>
              <p className="text-xs text-muted-foreground truncate">{rev.totalPaid > 0 ? `${fmtMoney(rev.totalPaid)} paid` : "—"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base md:text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">No orders yet.</p>
          ) : (
            <div className="divide-y">
              {[...orders].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5).map((o) => {
                const meta = STATUS_META[o.status];
                const bal = balanceOf(o);
                return (
                  <div key={o.id} className="flex items-center justify-between py-3 gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        <span className="font-display font-bold mr-2">{o.orderNumber}</span>
                        {o.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{o.styleName} · {format(new Date(o.createdAt), "dd MMM, hh:mm a")}{bal > 0 ? ` · bal ${fmtMoney(bal)}` : ""}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${meta.bg} ${meta.color}`}>{meta.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <CustomerListDialog open={modal === "frequent"} onOpenChange={(v) => !v && setModal(null)} title="Frequent Customers" description="Customers with 3+ orders" customers={frequent} emptyMessage="No frequent customers yet." />
      <CustomerListDialog open={modal === "inactive"} onOpenChange={(v) => !v && setModal(null)} title="Inactive Customers" description="No orders in the last 30 days" customers={inactive} emptyMessage="No inactive customers — great work!" />
      <CustomerListDialog open={modal === "top"} onOpenChange={(v) => !v && setModal(null)} title="Top Customers" description="Your best customers by orders" customers={topList} />
    </div>
  );
};

export default DashboardScreen;
