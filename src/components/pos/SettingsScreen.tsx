import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getUserProfile, saveUserProfile, UserProfile } from "@/lib/store";
import { User, Lock, CheckCircle2, AlertCircle, CreditCard, Crown, History, ArrowUpCircle } from "lucide-react";

const BILLING_HISTORY = [
  { id: "1", date: "2026-03-01T10:30:00", plan: "Smart Tailor Pro", amount: "GHS 100.00", status: "Paid" },
  { id: "2", date: "2026-02-01T10:30:00", plan: "Smart Tailor Pro", amount: "GHS 100.00", status: "Paid" },
  { id: "3", date: "2026-01-01T10:30:00", plan: "Smart Tailor Pro", amount: "GHS 100.00", status: "Paid" },
  { id: "4", date: "2025-12-01T10:30:00", plan: "Free Trial", amount: "GHS 0.00", status: "Trial" },
];

const SettingsScreen = () => {
  const [profile, setProfile] = useState<UserProfile>({
    businessName: "", ownerName: "", phone: "", email: "", location: "", password: ""
  });
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwFeedback, setPwFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [billingOpen, setBillingOpen] = useState(false);

  useEffect(() => {
    const saved = getUserProfile();
    if (saved) setProfile(saved);
  }, []);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveUserProfile(profile);
    setFeedback({ type: "success", msg: "Profile updated successfully!" });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = getUserProfile();
    if (saved && saved.password !== currentPassword) {
      setPwFeedback({ type: "error", msg: "Current password is incorrect" });
      return;
    }
    if (newPassword.length < 6) {
      setPwFeedback({ type: "error", msg: "New password must be at least 6 characters" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwFeedback({ type: "error", msg: "Passwords do not match" });
      return;
    }
    const updated = { ...profile, password: newPassword };
    setProfile(updated);
    saveUserProfile(updated);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPwFeedback({ type: "success", msg: "Password changed successfully!" });
    setTimeout(() => setPwFeedback(null), 3000);
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
      " at " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and subscription</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="profile" className="text-xs sm:text-sm gap-1">
            <User className="w-4 h-4 hidden sm:inline" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs sm:text-sm gap-1">
            <Lock className="w-4 h-4 hidden sm:inline" /> Security
          </TabsTrigger>
          <TabsTrigger value="subscription" className="text-xs sm:text-sm gap-1">
            <CreditCard className="w-4 h-4 hidden sm:inline" /> Subscription
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Business Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              {feedback && (
                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm mb-4 ${feedback.type === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}`}>
                  {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {feedback.msg}
                </div>
              )}
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Business Name</Label>
                  <Input value={profile.businessName} onChange={(e) => setProfile({ ...profile, businessName: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Owner's Name</Label>
                  <Input value={profile.ownerName} onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Phone Number</Label>
                    <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email (optional)</Label>
                    <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Business Location</Label>
                  <Input value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} required />
                </div>
                <Button type="submit" className="rounded-full shadow-md">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" /> Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pwFeedback && (
                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm mb-4 ${pwFeedback.type === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}`}>
                  {pwFeedback.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {pwFeedback.msg}
                </div>
              )}
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Current Password</Label>
                  <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required placeholder="Enter current password" />
                </div>
                <div className="space-y-1.5">
                  <Label>New Password</Label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="Enter new password" />
                </div>
                <div className="space-y-1.5">
                  <Label>Confirm New Password</Label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Confirm new password" />
                </div>
                <Button type="submit" className="rounded-full shadow-md">Change Password</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <div className="space-y-4">
            {/* Current Plan */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" /> Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">Smart Tailor Pro</h3>
                      <Badge className="bg-primary/20 text-primary text-xs">Active</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">GHS 100/month · less than GHS 4/day</p>
                    <p className="text-muted-foreground text-xs mt-0.5">Next billing: 1 May 2026</p>
                  </div>
                  <Crown className="w-10 h-10 text-primary/30" />
                </div>

                <div className="text-sm text-muted-foreground space-y-1.5">
                  <p className="font-medium text-foreground">Plan includes:</p>
                  <ul className="space-y-1 ml-1">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Unlimited customers & entries</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Earnings tracking (day/week/month)</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Frequent & inactive customer insights</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> One-tap WhatsApp reminders</li>
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="rounded-full text-destructive border-destructive/30 hover:bg-destructive/10">
                    Cancel Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Billing History Button */}
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <Button
                  variant="outline"
                  className="w-full rounded-full gap-2"
                  onClick={() => setBillingOpen(true)}
                >
                  <History className="w-4 h-4" /> View Billing History
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Billing History Dialog */}
      <Dialog open={billingOpen} onOpenChange={setBillingOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" /> Billing History
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {BILLING_HISTORY.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                <div>
                  <p className="font-medium text-sm">{item.plan}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(item.date)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">{item.amount}</p>
                  <Badge variant={item.status === "Paid" ? "default" : "secondary"} className="text-[10px]">
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsScreen;
