import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  getCustomerStats, getFrequentCustomers, getInactiveCustomers,
  updateCustomer, deleteCustomer, getCustomerStyleHistory,
  CustomerStats, Measurements,
} from "@/lib/store";
import { MEASUREMENT_FIELDS, fmtMoney } from "@/lib/constants";
import { Search, MessageCircle, Trash2, User, Phone, Send, Users, Ruler, Image as ImageIcon, Save } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

type Audience = "all" | "frequent" | "inactive";
type Channel = "whatsapp" | "sms";

const CustomersScreen = () => {
  const [version, setVersion] = useState(0);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<CustomerStats | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editMeasurements, setEditMeasurements] = useState<Measurements>({});
  const [viewingHistory, setViewingHistory] = useState<CustomerStats | null>(null);
  const [remindOpen, setRemindOpen] = useState(false);
  const [audiences, setAudiences] = useState<Audience[]>(["inactive"]);
  const [channels, setChannels] = useState<Channel[]>(["whatsapp"]);
  const [bulkMessage, setBulkMessage] = useState("Hi {name}! 👋 We have new styles this season — come in and let's create something for you.");
  const [deleting, setDeleting] = useState<CustomerStats | null>(null);

  const refresh = () => setVersion((v) => v + 1);
  useEffect(() => { refresh(); }, []);

  const all = useMemo(() => getCustomerStats().sort((a, b) => (b.lastVisit ?? 0) - (a.lastVisit ?? 0)), [version]);
  const frequent = useMemo(() => getFrequentCustomers(), [version]);
  const inactive = useMemo(() => getInactiveCustomers(), [version]);

  const filterFn = (list: CustomerStats[]) =>
    !search ? list : list.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const sendWhatsApp = (c: CustomerStats) => {
    if (!c.phone) return toast.error("Add a phone number first");
    const msg = `Hi ${c.name}! 👋 We miss you — come by the shop and let's stitch something new.`;
    const num = c.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const openEdit = (c: CustomerStats) => {
    setEditing(c);
    setEditName(c.name);
    setEditPhone(c.phone ?? "");
    setEditNotes(c.notes ?? "");
    setEditMeasurements({ ...(c.measurements ?? {}) });
  };

  const saveEdit = () => {
    if (!editing) return;
    if (!editName.trim()) return toast.error("Name is required");
    const cleaned: Measurements = Object.fromEntries(
      Object.entries(editMeasurements).filter(([, v]) => v && v.trim()).map(([k, v]) => [k, v.trim()])
    );
    updateCustomer(editing.id, {
      name: editName.trim(),
      phone: editPhone.trim() || undefined,
      notes: editNotes.trim() || undefined,
      measurements: cleaned,
    });
    toast.success("Customer updated");
    setEditing(null);
    refresh();
  };

  const renderRow = (c: CustomerStats) => (
    <Card key={c.id} className="border-0 shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEdit(c)}>
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-sm truncate">{c.name}</p>
            {c.measurements && Object.keys(c.measurements).length > 0 && (
              <Ruler className="w-3 h-3 text-emerald-500 shrink-0" aria-label="Has measurements" />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-muted-foreground">
            <span>{c.visitCount} order{c.visitCount === 1 ? "" : "s"}</span>
            <span className="text-emerald-500 font-medium">Paid: {fmtMoney(c.totalSpent)}</span>
            {c.outstanding > 0 && <span className="text-orange-500 font-medium">Owes: {fmtMoney(c.outstanding)}</span>}
            {c.lastVisit && <span>Last: {formatDistanceToNow(c.lastVisit, { addSuffix: true })}</span>}
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Phone className="w-3 h-3" />{c.phone || "No phone"}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button size="icon" variant="outline" className="h-9 w-9 rounded-lg" onClick={() => setViewingHistory(c)} title="Style archive">
            <ImageIcon className="w-4 h-4" />
          </Button>
          <Button size="sm" className="rounded-full gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white h-9 px-2 sm:px-3" onClick={() => sendWhatsApp(c)} disabled={!c.phone} title="Send WhatsApp reminder">
            <MessageCircle className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Remind</span>
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => setDeleting(c)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const toggleAudience = (a: Audience) =>
    setAudiences((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  const toggleChannel = (c: Channel) =>
    setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const combinedAudience = (): CustomerStats[] => {
    const map = new Map<string, CustomerStats>();
    audiences.forEach((a) => {
      const src = a === "frequent" ? frequent : a === "inactive" ? inactive : all;
      src.forEach((c) => map.set(c.id, c));
    });
    return Array.from(map.values());
  };

  const sendBulk = () => {
    if (channels.length === 0) return toast.error("Pick at least one channel.");
    if (audiences.length === 0) return toast.error("Pick at least one group.");
    const targets = combinedAudience().filter((c) => c.phone);
    if (targets.length === 0) return toast.error("No customers with phone numbers in the selected groups.");
    let opened = 0;
    targets.forEach((c, i) => {
      const personalized = bulkMessage.replace(/\{name\}/gi, c.name);
      const num = (c.phone ?? "").replace(/\D/g, "");
      channels.forEach((ch, j) => {
        const url = ch === "whatsapp"
          ? `https://wa.me/${num}?text=${encodeURIComponent(personalized)}`
          : `sms:${c.phone}?body=${encodeURIComponent(personalized)}`;
        setTimeout(() => window.open(url, "_blank"), (i * channels.length + j) * 250);
        opened++;
      });
    });
    toast.success(`Opening ${opened} message${opened === 1 ? "" : "s"}...`);
    setRemindOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground text-sm mt-1">{all.length} total · {frequent.length} frequent · {inactive.length} inactive</p>
        </div>
        <Button onClick={() => setRemindOpen(true)} className="rounded-full gap-2 shadow-md">
          <Send className="w-4 h-4" /> Remind
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="all">All ({all.length})</TabsTrigger>
          <TabsTrigger value="frequent">Frequent ({frequent.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({inactive.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-2 mt-4">
          {filterFn(all).length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">No customers yet. Create an order to add one.</p>
          ) : filterFn(all).map(renderRow)}
        </TabsContent>
        <TabsContent value="frequent" className="space-y-2 mt-4">
          {filterFn(frequent).length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">No frequent customers yet (3+ orders).</p>
          ) : filterFn(frequent).map(renderRow)}
        </TabsContent>
        <TabsContent value="inactive" className="space-y-2 mt-4">
          {filterFn(inactive).length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">No inactive customers — great work! 🎉</p>
          ) : filterFn(inactive).map(renderRow)}
        </TabsContent>
      </Tabs>

      {/* Edit customer + measurements */}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Edit Customer
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium">Name</p>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium">Phone</p>
                  <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="0241234567" />
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium">Notes</p>
                <Textarea rows={2} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Preferences, allergies to fabrics, etc." />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium flex items-center gap-1.5"><Ruler className="w-3.5 h-3.5" /> Measurements (any unit)</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-xl border p-3 bg-muted/30">
                  {MEASUREMENT_FIELDS.map((f) => (
                    <div key={f} className="space-y-1">
                      <p className="text-[10px] text-muted-foreground">{f}</p>
                      <Input className="h-8 text-sm" value={editMeasurements[f] ?? ""}
                        onChange={(e) => setEditMeasurements((m) => ({ ...m, [f]: e.target.value }))}
                        placeholder="—"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={saveEdit} className="w-full rounded-full gap-2"><Save className="w-4 h-4" /> Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Style archive */}
      <Dialog open={!!viewingHistory} onOpenChange={(v) => !v && setViewingHistory(null)}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" /> {viewingHistory?.name}'s Style Archive
            </DialogTitle>
          </DialogHeader>
          {viewingHistory && (() => {
            const orders = getCustomerStyleHistory(viewingHistory.id);
            if (orders.length === 0) {
              return <p className="text-sm text-muted-foreground text-center py-8">No design photos saved yet for this customer.</p>;
            }
            return (
              <div className="space-y-4 mt-2">
                {orders.map((o) => (
                  <div key={o.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{o.styleName}</p>
                      <p className="text-[10px] text-muted-foreground">{format(new Date(o.createdAt), "dd MMM yyyy")} · {o.orderNumber}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {o.photos.map((src, i) => (
                        <a key={i} href={src} target="_blank" rel="noreferrer">
                          <img src={src} alt={o.styleName} className="w-full aspect-square object-cover rounded-lg border" />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={remindOpen} onOpenChange={setRemindOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" /> Send Reminder
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-1">
            <div className="space-y-1.5">
              <p className="text-xs font-medium">Send to <span className="text-muted-foreground font-normal">(pick one or more)</span></p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: "all", label: `All (${all.length})` },
                  { id: "frequent", label: `Frequent (${frequent.length})` },
                  { id: "inactive", label: `Inactive (${inactive.length})` },
                ] as { id: Audience; label: string }[]).map((opt) => {
                  const on = audiences.includes(opt.id);
                  return (
                    <button key={opt.id} type="button" onClick={() => toggleAudience(opt.id)}
                      className={`py-2 px-2 rounded-xl border-2 text-xs font-medium transition-all ${on ? "border-primary bg-primary/10 text-primary" : "border-input text-muted-foreground"}`}>
                      <Users className="w-3.5 h-3.5 inline mr-1" />{opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium">Channel <span className="text-muted-foreground font-normal">(pick one or both)</span></p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => toggleChannel("whatsapp")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${channels.includes("whatsapp") ? "border-emerald-500 bg-emerald-500/10 text-emerald-600" : "border-input text-muted-foreground"}`}>
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </button>
                <button type="button" onClick={() => toggleChannel("sms")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${channels.includes("sms") ? "border-primary bg-primary/10 text-primary" : "border-input text-muted-foreground"}`}>
                  <Phone className="w-4 h-4" /> SMS
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium">Message</p>
              <Textarea rows={4} value={bulkMessage} onChange={(e) => setBulkMessage(e.target.value)} placeholder="Use {name} to personalize." />
              <p className="text-[10px] text-muted-foreground">Tip: <span className="font-mono">{"{name}"}</span> inserts each customer's name.</p>
            </div>

            <Button onClick={sendBulk} className="w-full rounded-full py-5 gap-2">
              <Send className="w-4 h-4" /> Send to {combinedAudience().filter((c) => c.phone).length} customer{combinedAudience().filter((c) => c.phone).length === 1 ? "" : "s"}
              {channels.length > 1 && " (×2 channels)"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title={`Delete ${deleting?.name}?`}
        description="The customer's saved measurements and contact info will be removed. Their past orders stay in your records."
        onConfirm={() => {
          if (!deleting) return;
          deleteCustomer(deleting.id);
          toast.success(`Deleted ${deleting.name}`);
          setDeleting(null);
          refresh();
        }}
      />
    </div>
  );
};

export default CustomersScreen;
