import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { createOrder, getCustomers, Measurements, PaymentMethod } from "@/lib/store";
import { MEASUREMENT_FIELDS } from "@/lib/constants";
import { Camera, X, Loader2, CalendarIcon, Ruler } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}

const fileToCompressedDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 800;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const emptyMeasurements = (): Measurements =>
  Object.fromEntries(MEASUREMENT_FIELDS.map((f) => [f, ""]));

const NewOrderDialog = ({ open, onOpenChange, onCreated }: Props) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [styleName, setStyleName] = useState("");
  const [styleNotes, setStyleNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [measurements, setMeasurements] = useState<Measurements>(emptyMeasurements());
  const [saveProfile, setSaveProfile] = useState(true);
  const [total, setTotal] = useState("");
  const [deposit, setDeposit] = useState("");
  const [depositMethod, setDepositMethod] = useState<PaymentMethod>("cash");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [assignedTo, setAssignedTo] = useState("");
  const [uploading, setUploading] = useState(false);
  const [nameOpen, setNameOpen] = useState(false);

  const customers = useMemo(() => getCustomers(), [open]);
  const suggestions = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (!q) return [];
    return customers.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 5);
  }, [name, customers]);

  const reset = () => {
    setName(""); setPhone(""); setStyleName(""); setStyleNotes("");
    setPhotos([]); setMeasurements(emptyMeasurements()); setSaveProfile(true);
    setTotal(""); setDeposit(""); setDepositMethod("cash");
    setDueDate(undefined); setAssignedTo("");
  };

  const handlePhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const datas = await Promise.all(files.map(fileToCompressedDataUrl));
      setPhotos((p) => [...p, ...datas].slice(0, 6));
    } catch { toast.error("Could not read photo"); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const pickCustomer = (id: string) => {
    const c = customers.find((x) => x.id === id);
    if (!c) return;
    setName(c.name);
    setPhone(c.phone ?? "");
    if (c.measurements) setMeasurements({ ...emptyMeasurements(), ...c.measurements });
    setNameOpen(false);
  };

  const handleSubmit = () => {
    if (!name.trim()) return toast.error("Customer name is required");
    if (!styleName.trim()) return toast.error("Style name is required (e.g. Kaba & Slit)");
    const tot = parseFloat(total);
    if (!tot || tot <= 0) return toast.error("Enter a total amount");
    const dep = parseFloat(deposit) || 0;
    if (dep > tot) return toast.error("Deposit can't be more than total");

    const cleanedMeasurements: Measurements = Object.fromEntries(
      Object.entries(measurements).filter(([, v]) => v.trim() !== "").map(([k, v]) => [k, v.trim()])
    );

    const order = createOrder({
      customerName: name.trim(),
      customerPhone: phone.trim() || undefined,
      styleName: styleName.trim(),
      styleNotes: styleNotes.trim() || undefined,
      photos,
      measurements: cleanedMeasurements,
      saveMeasurementsToProfile: saveProfile,
      totalAmount: tot,
      deposit: dep > 0 ? dep : undefined,
      depositMethod,
      dueDate: dueDate ? dueDate.getTime() : undefined,
      assignedTo: assignedTo.trim() || undefined,
    });
    toast.success(`Order ${order.orderNumber} created`);
    reset();
    onOpenChange(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">New Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 relative">
              <Label className="text-xs">Customer name *</Label>
              <Input
                value={name}
                onChange={(e) => { setName(e.target.value); setNameOpen(true); }}
                onFocus={() => setNameOpen(true)}
                placeholder="e.g. Ama Mensah"
                autoComplete="off"
              />
              {nameOpen && suggestions.length > 0 && (
                <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-popover border rounded-xl shadow-lg overflow-hidden">
                  {suggestions.map((c) => (
                    <button
                      key={c.id} type="button"
                      onClick={() => pickCustomer(c.id)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
                    >
                      <span className="font-medium">{c.name}</span>
                      {c.measurements && Object.keys(c.measurements).length > 0 && (
                        <span className="text-[10px] text-emerald-500 ml-2">· measurements saved</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone (optional)</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0241234567" inputMode="tel" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Style / outfit name *</Label>
              <Input value={styleName} onChange={(e) => setStyleName(e.target.value)} placeholder="e.g. Kaba & Slit" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Due date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-10", !dueDate && "text-muted-foreground")}>
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus className={cn("p-3 pointer-events-auto")} disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5"><Ruler className="w-3.5 h-3.5" /> Measurements (any unit — e.g. "38 in")</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-xl border p-3 bg-muted/30">
              {MEASUREMENT_FIELDS.map((f) => (
                <div key={f} className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">{f}</Label>
                  <Input
                    className="h-8 text-sm"
                    value={measurements[f] ?? ""}
                    onChange={(e) => setMeasurements((m) => ({ ...m, [f]: e.target.value }))}
                    placeholder="—"
                  />
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer pt-1">
              <Checkbox checked={saveProfile} onCheckedChange={(v) => setSaveProfile(!!v)} />
              Save to customer profile (so you never re-measure)
            </label>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Style notes (optional)</Label>
            <Textarea rows={2} value={styleNotes} onChange={(e) => setStyleNotes(e.target.value)} placeholder="Fabric color, neckline, sleeve style, special requests..." />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Design / fabric photos (max 6)</Label>
            <div className="flex flex-wrap gap-2">
              {photos.map((src, i) => (
                <div key={i} className="relative">
                  <img src={src} alt="" className="w-16 h-16 object-cover rounded-lg border" />
                  <button type="button" onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {photos.length < 6 && (
                <label className="w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary hover:text-primary text-muted-foreground">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Total (GHS) *</Label>
              <Input value={total} onChange={(e) => setTotal(e.target.value)} type="number" min={0} step="0.01" placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Deposit (GHS)</Label>
              <Input value={deposit} onChange={(e) => setDeposit(e.target.value)} type="number" min={0} step="0.01" placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Deposit method</Label>
              <div className="grid grid-cols-2 gap-1">
                {(["cash", "momo"] as PaymentMethod[]).map((m) => (
                  <button key={m} type="button" onClick={() => setDepositMethod(m)}
                    className={`h-10 text-xs font-medium rounded-md border ${depositMethod === m ? "border-primary bg-primary/10 text-primary" : "border-input text-muted-foreground"}`}>
                    {m === "momo" ? "MoMo" : "Cash"}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Assigned to</Label>
              <Input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="Tailor name" />
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full rounded-full py-5 mt-1">Create Order</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewOrderDialog;
