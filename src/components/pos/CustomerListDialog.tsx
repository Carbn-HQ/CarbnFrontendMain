import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CustomerStats } from "@/lib/store";
import { fmtMoney } from "@/lib/constants";
import { User, Phone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  customers: CustomerStats[];
  emptyMessage?: string;
}

const CustomerListDialog = ({ open, onOpenChange, title, description, customers, emptyMessage }: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md rounded-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="font-display">{title}</DialogTitle>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </DialogHeader>
      <div className="space-y-2 mt-2">
        {customers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">{emptyMessage ?? "No customers."}</p>
        ) : customers.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl border">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{c.name}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                <span>{c.visitCount} visit{c.visitCount === 1 ? "" : "s"}</span>
                <span className="text-emerald-500 font-medium">{fmtMoney(c.totalSpent)}</span>
                {c.lastVisit && <span>Last: {formatDistanceToNow(c.lastVisit, { addSuffix: true })}</span>}
              </div>
              {c.phone && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Phone className="w-3 h-3" /> {c.phone}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </DialogContent>
  </Dialog>
);

export default CustomerListDialog;
