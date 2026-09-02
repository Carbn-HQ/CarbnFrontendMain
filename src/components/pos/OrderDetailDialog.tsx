import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Order, advanceOrderStatus, addPayment, deletePayment,
  balanceOf, paidAmount, isOverdue, PaymentMethod,
} from "@/lib/store";
import { STATUS_FLOW, STATUS_META, fmtMoney } from "@/lib/constants";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowRight, MessageCircle, Phone, Printer, CheckCircle2, Plus, Trash2, AlertTriangle, CalendarClock, Ruler } from "lucide-react";
import { toast } from "sonner";

interface Props {
  order: Order | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onChange: () => void;
}

const OrderDetailDialog = ({ order, open, onOpenChange, onChange }: Props) => {
  const [qrUrl, setQrUrl] = useState("");
  const [payAmt, setPayAmt] = useState("");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("cash");
  const [payNote, setPayNote] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!order) return;
    QRCode.toDataURL(order.orderNumber, { width: 220, margin: 1 }).then(setQrUrl).catch(() => setQrUrl(""));
  }, [order?.orderNumber]);

  if (!order) return null;
  const meta = STATUS_META[order.status];
  const idx = STATUS_FLOW.indexOf(order.status);
  const nextStatus = STATUS_FLOW[idx + 1];
  const paid = paidAmount(order);
  const balance = balanceOf(order);
  const overdue = isOverdue(order);

  const handleAdvance = () => {
    if (!nextStatus) return;
    advanceOrderStatus(order.id, nextStatus);
    toast.success(`Moved to ${STATUS_META[nextStatus].label}`);
    onChange();
  };

  const handleNotify = () => {
    if (!order.customerPhone) return toast.error("No phone number for this customer");
    const msg = order.status === "completed"
      ? `Hi ${order.customerName}! Your outfit (${order.styleName}, ${order.orderNumber}) is ready for pickup.`
      : `Hi ${order.customerName}! Update on your order ${order.orderNumber} (${order.styleName}): now ${meta.label}.`;
    const num = order.customerPhone.replace(/\D/g, "");
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleAddPayment = () => {
    const amt = parseFloat(payAmt);
    if (!amt || amt <= 0) return toast.error("Enter an amount");
    if (amt > balance) return toast.error(`Payment exceeds balance (${fmtMoney(balance)})`);
    addPayment(order.id, { amount: amt, method: payMethod, note: payNote.trim() || undefined });
    setPayAmt(""); setPayNote("");
    toast.success(`Recorded ${fmtMoney(amt)}`);
    onChange();
  };

  const handlePrint = () => {
    const html = printRef.current?.innerHTML;
    if (!html) return;
    const w = window.open("", "_blank", "width=400,height=600");
    if (!w) return;
    w.document.write(`<html><head><title>${order.orderNumber}</title>
      <style>body{font-family:system-ui;padding:16px;color:#000}h1{font-size:18px;margin:0 0 4px}
      .row{display:flex;justify-content:space-between;font-size:12px;margin:2px 0}
      img{display:block;margin:8px auto}table{width:100%;font-size:12px;border-collapse:collapse;margin-top:8px}
      td{padding:4px 0;border-bottom:1px dashed #ccc}.center{text-align:center}</style></head>
      <body>${html}</body></html>`);
    w.document.close(); w.focus();
    setTimeout(() => w.print(), 200);
  };

  const measurementEntries = Object.entries(order.measurements).filter(([, v]) => v);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center justify-between gap-3">
            <span>{order.orderNumber}</span>
            <Badge variant="outline" className={`${meta.bg} ${meta.color} border-0 font-semibold`}>{meta.label}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="space-y-4">
          <div className="flex items-start justify-between gap-3 border-b pb-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Customer</p>
              <p className="font-semibold truncate">{order.customerName}</p>
              {order.customerPhone && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{order.customerPhone}</p>}
              <p className="text-sm mt-2 font-medium">{order.styleName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Created {format(new Date(order.createdAt), "dd MMM yyyy")}</p>
              {order.dueDate && (
                <p className={`text-xs mt-0.5 flex items-center gap-1 ${overdue ? "text-destructive font-semibold" : "text-amber-600"}`}>
                  <CalendarClock className="w-3 h-3" />
                  Due {format(new Date(order.dueDate), "dd MMM yyyy")} · {formatDistanceToNow(order.dueDate, { addSuffix: true })}
                  {overdue && <AlertTriangle className="w-3 h-3 ml-0.5" />}
                </p>
              )}
              {order.assignedTo && <p className="text-xs text-muted-foreground mt-0.5">Tailor: <span className="font-medium text-foreground">{order.assignedTo}</span></p>}
            </div>
            {qrUrl && <img src={qrUrl} alt={order.orderNumber} className="w-24 h-24 rounded-lg bg-white p-1" />}
          </div>

          {measurementEntries.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1"><Ruler className="w-3 h-3" /> Measurements</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-xl border p-3 bg-muted/30">
                {measurementEntries.map(([k, v]) => (
                  <div key={k}>
                    <p className="text-[10px] text-muted-foreground">{k}</p>
                    <p className="text-sm font-semibold">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {order.styleNotes && (
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Style notes</p>
              <p className="text-sm rounded-xl bg-muted/50 p-3">{order.styleNotes}</p>
            </div>
          )}

          {order.photos.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Design photos</p>
              <div className="grid grid-cols-3 gap-2">
                {order.photos.map((src, i) => (
                  <a key={i} href={src} target="_blank" rel="noreferrer">
                    <img src={src} alt={`photo ${i + 1}`} className="w-full aspect-square object-cover rounded-lg border" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-3">
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">Total</p>
                <p className="font-display font-bold">{fmtMoney(order.totalAmount)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">Paid</p>
                <p className="font-display font-bold text-emerald-500">{fmtMoney(paid)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">Balance</p>
                <p className={`font-display font-bold ${balance > 0 ? "text-orange-500" : "text-muted-foreground"}`}>{fmtMoney(balance)}</p>
              </div>
            </div>

            {order.payments.length > 0 && (
              <div className="rounded-xl border divide-y mb-3">
                {order.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-3 py-2 text-xs">
                    <div className="min-w-0">
                      <p className="font-medium">{fmtMoney(p.amount)} <span className="text-muted-foreground font-normal">· {p.method === "momo" ? "MoMo" : "Cash"}</span></p>
                      <p className="text-[10px] text-muted-foreground">{format(new Date(p.at), "dd MMM, hh:mm a")}{p.note ? ` · ${p.note}` : ""}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { deletePayment(order.id, p.id); onChange(); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {balance > 0 && (
              <div className="flex flex-wrap gap-2 items-end">
                <div className="flex-1 min-w-[100px]">
                  <Input value={payAmt} onChange={(e) => setPayAmt(e.target.value)} type="number" placeholder="Amount" className="h-9" />
                </div>
                <div className="flex gap-1">
                  {(["cash", "momo"] as PaymentMethod[]).map((m) => (
                    <button key={m} type="button" onClick={() => setPayMethod(m)}
                      className={`h-9 px-3 text-xs font-medium rounded-md border ${payMethod === m ? "border-primary bg-primary/10 text-primary" : "border-input text-muted-foreground"}`}>
                      {m === "momo" ? "MoMo" : "Cash"}
                    </button>
                  ))}
                </div>
                <Input value={payNote} onChange={(e) => setPayNote(e.target.value)} placeholder="Note (optional)" className="h-9 flex-1 min-w-[120px]" />
                <Button onClick={handleAddPayment} size="sm" className="rounded-full gap-1 h-9">
                  <Plus className="w-3.5 h-3.5" /> Pay
                </Button>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Status history</p>
            <div className="space-y-1.5">
              {order.statusHistory.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className={`font-medium ${STATUS_META[s.status].color}`}>● {STATUS_META[s.status].label}</span>
                  <span className="text-muted-foreground">{format(new Date(s.at), "dd MMM, hh:mm a")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t mt-2">
          {nextStatus && (
            <Button onClick={handleAdvance} className="flex-1 gap-1.5 rounded-full">
              <ArrowRight className="w-4 h-4" /> Move to {STATUS_META[nextStatus].label}
            </Button>
          )}
          {order.customerPhone && (
            <Button onClick={handleNotify} variant="outline" className="gap-1.5 rounded-full border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600">
              <MessageCircle className="w-4 h-4" /> Notify
            </Button>
          )}
          {balance === 0 && order.totalAmount > 0 && (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-0 self-center gap-1"><CheckCircle2 className="w-3 h-3" /> Fully paid</Badge>
          )}
          <Button onClick={handlePrint} variant="outline" size="icon" className="rounded-full shrink-0">
            <Printer className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailDialog;
