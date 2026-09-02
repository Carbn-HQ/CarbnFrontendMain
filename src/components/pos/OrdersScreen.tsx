import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  getOrders, deleteOrder, Order, advanceOrderStatus,
  balanceOf, isOverdue, isDueSoon,
} from "@/lib/store";
import { STATUS_FLOW, STATUS_META, fmtMoney } from "@/lib/constants";
import { formatDistanceToNow, format } from "date-fns";
import { Plus, Search, Trash2, Package, ArrowRight, Eye, Clock, AlertTriangle, CalendarClock, Scissors } from "lucide-react";
import NewOrderDialog from "./NewOrderDialog";
import OrderDetailDialog from "./OrderDetailDialog";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import { toast } from "sonner";

const OrdersScreen = () => {
  const [version, setVersion] = useState(0);
  const [newOpen, setNewOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState<Order | null>(null);
  const [tab, setTab] = useState("active");

  const refresh = () => setVersion((v) => v + 1);
  useEffect(() => {
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const all = useMemo(() => getOrders().sort((a, b) => {
    // Overdue first, then due-soon, then by created
    const aw = isOverdue(a) ? 0 : isDueSoon(a) ? 1 : 2;
    const bw = isOverdue(b) ? 0 : isDueSoon(b) ? 1 : 2;
    if (aw !== bw) return aw - bw;
    return b.createdAt - a.createdAt;
  }), [version]);

  const filtered = useMemo(() => {
    const base = tab === "active" ? all.filter((o) => o.status !== "completed")
      : tab === "completed" ? all.filter((o) => o.status === "completed")
      : tab === "overdue" ? all.filter(isOverdue)
      : all;
    if (!search.trim()) return base;
    const q = search.toLowerCase();
    return base.filter((o) =>
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.styleName.toLowerCase().includes(q) ||
      (o.customerPhone ?? "").includes(q)
    );
  }, [all, tab, search]);

  const counts = {
    active: all.filter((o) => o.status !== "completed").length,
    overdue: all.filter(isOverdue).length,
    completed: all.filter((o) => o.status === "completed").length,
    all: all.length,
  };

  const handleAdvance = (o: Order) => {
    const idx = STATUS_FLOW.indexOf(o.status);
    const next = STATUS_FLOW[idx + 1];
    if (!next) return;
    advanceOrderStatus(o.id, next);
    toast.success(`${o.orderNumber} → ${STATUS_META[next].label}`);
    refresh();
  };

  const renderCard = (o: Order) => {
    const meta = STATUS_META[o.status];
    const next = STATUS_FLOW[STATUS_FLOW.indexOf(o.status) + 1];
    const overdue = isOverdue(o);
    const dueSoon = isDueSoon(o);
    const balance = balanceOf(o);
    return (
      <Card key={o.id} className={`border-0 shadow-sm hover:shadow-md transition-shadow ${overdue ? "ring-2 ring-destructive/40" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setActive(o)} role="button">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span className="font-display font-bold text-sm">{o.orderNumber}</span>
                <Badge variant="outline" className={`${meta.bg} ${meta.color} border-0 text-[10px] py-0 px-1.5 h-5`}>{meta.label}</Badge>
                {overdue && <Badge variant="outline" className="bg-destructive/10 text-destructive border-0 text-[10px] py-0 px-1.5 h-5"><AlertTriangle className="w-2.5 h-2.5 mr-0.5" />Overdue</Badge>}
                {!overdue && dueSoon && <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-0 text-[10px] py-0 px-1.5 h-5"><Clock className="w-2.5 h-2.5 mr-0.5" />Due soon</Badge>}
                {balance > 0 && <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-0 text-[10px] py-0 px-1.5 h-5">Bal {fmtMoney(balance)}</Badge>}
              </div>
              <p className="font-semibold text-sm truncate">{o.customerName} <span className="text-muted-foreground font-normal">· {o.styleName}</span></p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                {o.dueDate ? (
                  <span className={`flex items-center gap-1 ${overdue ? "text-destructive font-medium" : ""}`}>
                    <CalendarClock className="w-3 h-3" />
                    Due {format(new Date(o.dueDate), "dd MMM")}
                  </span>
                ) : (
                  <span>No deadline</span>
                )}
                <span>Created {formatDistanceToNow(o.createdAt, { addSuffix: true })}</span>
                {o.assignedTo && <span>· {o.assignedTo}</span>}
              </div>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              {next && (
                <Button size="sm" className="rounded-full h-8 px-3 gap-1 text-xs" onClick={() => handleAdvance(o)}>
                  {STATUS_META[next].label} <ArrowRight className="w-3 h-3" />
                </Button>
              )}
              <div className="flex gap-1">
                <Button size="icon" variant="outline" className="h-8 w-8 rounded-lg" onClick={() => setActive(o)}>
                  <Eye className="w-3.5 h-3.5" />
                </Button>
                <Button size="icon" variant="outline" className="h-8 w-8 rounded-lg border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => setDeleting(o)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">{counts.active} active · {counts.overdue} overdue · {counts.completed} completed</p>
        </div>
        <Button onClick={() => setNewOpen(true)} className="rounded-full gap-2 shadow-md">
          <Plus className="w-4 h-4" /> New Order
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search order #, customer, style..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full grid grid-cols-4 h-auto">
          <TabsTrigger value="active" className="text-xs sm:text-sm px-1 truncate">Active ({counts.active})</TabsTrigger>
          <TabsTrigger value="overdue" className="text-xs sm:text-sm px-1 truncate data-[state=active]:text-destructive">Overdue ({counts.overdue})</TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm px-1 truncate">Done ({counts.completed})</TabsTrigger>
          <TabsTrigger value="all" className="text-xs sm:text-sm px-1 truncate">All ({counts.all})</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="space-y-2 mt-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Scissors className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No orders here yet.</p>
              <Button onClick={() => setNewOpen(true)} className="rounded-full gap-2 mt-4">
                <Plus className="w-4 h-4" /> Create first order
              </Button>
            </div>
          ) : filtered.map(renderCard)}
        </TabsContent>
      </Tabs>

      <NewOrderDialog open={newOpen} onOpenChange={setNewOpen} onCreated={refresh} />
      <OrderDetailDialog
        order={active}
        open={!!active}
        onOpenChange={(v) => !v && setActive(null)}
        onChange={() => { refresh(); setActive(active ? getOrders().find((o) => o.id === active.id) ?? null : null); }}
      />
      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title={`Delete order ${deleting?.orderNumber}?`}
        description="This will permanently remove the order, its measurements snapshot, and design photos. The customer record is kept."
        onConfirm={() => {
          if (!deleting) return;
          deleteOrder(deleting.id);
          toast.success(`Deleted ${deleting.orderNumber}`);
          setDeleting(null);
          refresh();
        }}
      />
    </div>
  );
};

export default OrdersScreen;
