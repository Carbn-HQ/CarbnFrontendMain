import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageCircle,
  Settings,
  LifeBuoy,
  LogOut,
  Menu,
  X,
  Activity,
  TrendingUp,
  Send,
  ArrowRight,
  Moon,
  Heart,
  Footprints,
  Dumbbell,
  Paperclip,
  Mic,
  Square,
  FileText,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  getChatHistory,
  getCurrentMember,
  getMetrics,
  sendChatQuestion,
  submitCheckin,
  updateMemberProfile,
  type MetricsPayload,
} from "@/lib/carbnApi";
import { clearSession, getAccessToken, getStoredMember, saveSession } from "@/lib/session";

type View = "home" | "chat" | "account" | "support";

const Wordmark = () => (
  <span className="font-display text-xl font-bold tracking-tight text-charcoal">
    carbn<span className="text-primary">.</span>
  </span>
);

const nav: { id: View; label: string; icon: React.ElementType }[] = [
  { id: "home", label: "Dashboard", icon: LayoutDashboard },
  { id: "chat", label: "Chat with Daniel", icon: MessageCircle },
  { id: "account", label: "Account settings", icon: Settings },
  { id: "support", label: "Contact support", icon: LifeBuoy },
];

const formatWhen = (iso: string | null) => {
  if (!iso) return "Just now";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

const HomeView = ({
  firstName,
  metrics,
  onOpenChat,
  onCheckin,
  checkingIn,
}: {
  firstName: string;
  metrics: MetricsPayload | null;
  onOpenChat: () => void;
  onCheckin: (workout: boolean) => void;
  checkingIn: boolean;
}) => {
  const scores = metrics?.scores;
  const capacity = scores?.capacity_score ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Welcome back</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
          Hello, {firstName}.
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft md:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Current Capacity Score
              </p>
              <p className="mt-3 font-display text-6xl font-semibold text-charcoal">
                {capacity}
                <span className="ml-1 text-2xl text-muted-foreground">/100</span>
              </p>
              <p className="mt-2 text-sm text-primary">
                {scores?.streak_days ? `${scores.streak_days}-day streak` : "Steady — on track this week"}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${capacity}%` }} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Total {scores?.total_score ?? 0}/60 · Last update: {formatWhen(scores?.updated_at || null)}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ["Movement", scores?.movement],
              ["Strength", scores?.strength],
              ["Recovery", scores?.recovery],
              ["Nutrition", scores?.nutrition],
              ["Consistency", scores?.consistency],
              ["Confidence", scores?.confidence],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
                  <span>{label}</span>
                  <span>{value ?? 0}/10</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${((Number(value) || 0) / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onOpenChat}
          className="group flex flex-col justify-between rounded-3xl bg-charcoal p-6 text-left text-on-charcoal shadow-card transition-transform hover:-translate-y-1"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <MessageCircle className="h-5 w-5" />
            </div>
            <p className="mt-6 font-display text-2xl font-semibold leading-tight">Chat with Daniel</p>
            <p className="mt-2 text-sm text-white/70">Your AI performance coach — ready when you are.</p>
          </div>
          <span className="mt-6 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-accent">
            Open chat <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Energy", value: `${scores?.energy_score ?? 0}`, suffix: "/100", icon: Heart },
          { label: "Recovery", value: `${scores?.recovery_score ?? 0}`, suffix: "/100", icon: TrendingUp },
          { label: "Sleep", value: `${scores?.sleep_hours ?? 0}`, suffix: " hrs", icon: Moon },
          { label: "Steps", value: `${(scores?.steps_today ?? 0).toLocaleString()}`, suffix: "", icon: Footprints },
        ].map(({ label, value, suffix, icon: Icon }) => (
          <div key={label} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 font-display text-3xl font-semibold text-charcoal">
              {value}
              <span className="text-base text-muted-foreground">{suffix}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-charcoal">Training</h2>
            <Dumbbell className="h-4 w-4 text-primary" />
          </div>
          <p className="font-display text-4xl font-semibold text-charcoal">
            {scores?.weekly_workouts ?? 0}
            <span className="text-lg text-muted-foreground"> / {scores?.weekly_workout_goal ?? 4}</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Workouts this week</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${scores?.workout_progress ?? 0}%` }}
            />
          </div>
          <div className="mt-5 flex gap-2">
            <button
              disabled={checkingIn}
              onClick={() => onCheckin(false)}
              className="flex-1 rounded-full border border-border px-4 py-2 text-xs font-extrabold uppercase tracking-wider disabled:opacity-60"
            >
              Log check-in
            </button>
            <button
              disabled={checkingIn}
              onClick={() => onCheckin(true)}
              className="flex-1 rounded-full bg-primary px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-primary-foreground disabled:opacity-60"
            >
              Log workout
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-charcoal">Recent activity</h2>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Latest
            </span>
          </div>
          <ul className="divide-y divide-border">
            {(metrics?.activity || []).slice(0, 5).map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-charcoal">{item.title}</p>
                </div>
                <span className="text-xs text-muted-foreground">{formatWhen(item.created_at)}</span>
              </li>
            ))}
            {!metrics?.activity?.length && (
              <li className="py-6 text-sm text-muted-foreground">No activity yet. Log a check-in to start.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

type ChatAttachment = { id: string; file: File; kind: "image" | "pdf" | "audio"; preview?: string };

const attachmentKind = (file: File): ChatAttachment["kind"] | null => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf") return "pdf";
  if (file.type.startsWith("audio/")) return "audio";
  return null;
};

const ChatView = ({
  firstName,
  onMetricsUpdate,
}: {
  firstName: string;
  onMetricsUpdate: (metrics: MetricsPayload) => void;
}) => {
  const [messages, setMessages] = useState<{ from: "user" | "daniel"; text: string }[]>([
    { from: "daniel", text: `Hey ${firstName} — how did today go? Sleep, energy, anything on your mind?` },
  ]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<ChatAttachment[]>([]);
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getChatHistory()
      .then((response) => {
        const history = response.data || [];
        if (!history.length) return;
        setMessages(
          history.map((item) => ({
            from: item.role === "user" ? "user" : "daniel",
            text: item.content,
          }))
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filesRef = useRef<ChatAttachment[]>([]);
  filesRef.current = files;

  useEffect(() => {
    return () => {
      filesRef.current.forEach((item) => {
        if (item.preview) URL.revokeObjectURL(item.preview);
      });
    };
  }, []);

  const addFiles = (incoming: FileList | File[]) => {
    const next: ChatAttachment[] = [];
    Array.from(incoming).forEach((file) => {
      const kind = attachmentKind(file);
      if (!kind) {
        toast({ title: "Unsupported file", description: "Use an image, PDF, or voice note.", variant: "destructive" });
        return;
      }
      next.push({
        id: `${file.name}-${file.size}-${Date.now()}`,
        file,
        kind,
        preview: kind === "image" ? URL.createObjectURL(file) : undefined,
      });
    });
    setFiles((current) => [...current, ...next].slice(0, 3));
  };

  const removeFile = (id: string) => {
    setFiles((current) => {
      const target = current.find((item) => item.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return current.filter((item) => item.id !== id);
    });
  };

  const toggleVoice = async () => {
    if (recording && recorderRef.current) {
      recorderRef.current.stop();
      setRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type });
        addFiles([file]);
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      toast({
        title: "Microphone blocked",
        description: "Allow microphone access to send a voice note.",
        variant: "destructive",
      });
    }
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if ((!text && !files.length) || sending) return;
    const outgoing = files.map((item) => item.file);
    const labels = files.map((item) =>
      item.kind === "audio" ? `Voice note (${item.file.name})` : item.kind === "pdf" ? `PDF (${item.file.name})` : `Image (${item.file.name})`
    );
    setMessages((m) => [
      ...m,
      { from: "user", text: [text, ...labels].filter(Boolean).join("\n") },
    ]);
    setInput("");
    files.forEach((item) => {
      if (item.preview) URL.revokeObjectURL(item.preview);
    });
    setFiles([]);
    setSending(true);
    try {
      const response = await sendChatQuestion(text, outgoing);
      setMessages((m) => [...m, { from: "daniel", text: response.data.answer }]);
      if (response.data.metrics) {
        onMetricsUpdate(response.data.metrics);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { from: "daniel", text: "I couldn't reach the coach just now. Try again in a moment." },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4">
        <h1 className="font-display text-2xl font-semibold text-charcoal">Chat with Daniel</h1>
        <p className="text-sm text-muted-foreground">
          Text, voice, photos or PDFs — Daniel updates your capacity score from what you share.
        </p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto rounded-3xl border border-border bg-card p-5">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.from === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-charcoal"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {sending && <p className="text-xs text-muted-foreground">Daniel is typing…</p>}
        <div ref={endRef} />
      </div>
      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {files.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-charcoal"
            >
              {item.kind === "image" && item.preview ? (
                <img src={item.preview} alt="" className="h-6 w-6 rounded-full object-cover" />
              ) : item.kind === "pdf" ? (
                <FileText className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Mic className="h-3.5 w-3.5 text-primary" />
              )}
              <span className="max-w-[140px] truncate">{item.file.name}</span>
              <button type="button" onClick={() => removeFile(item.id)} aria-label="Remove attachment">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={send} className="mt-3 flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf,audio/*"
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-charcoal"
          aria-label="Attach file"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => void toggleVoice()}
          className={`inline-flex h-11 w-11 items-center justify-center rounded-full border ${
            recording
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-charcoal"
          }`}
          aria-label={recording ? "Stop recording" : "Record voice note"}
        >
          {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={recording ? "Recording…" : "Message Daniel, or attach a file…"}
          className="flex-1 rounded-full border border-border bg-card px-5 py-3 text-sm text-charcoal outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={sending || (!input.trim() && !files.length)}
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-primary-foreground transition-colors hover:bg-[hsl(var(--primary-hover))] disabled:opacity-60"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

const AccountView = ({
  fullName,
  username,
  email,
  onProfileSaved,
}: {
  fullName: string;
  username: string;
  email: string;
  onProfileSaved: (profile: { firstName: string; fullName: string; username: string }) => void;
}) => {
  const [name, setName] = useState(fullName);
  const [handle, setHandle] = useState(username);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(fullName);
    setHandle(username);
  }, [fullName, username]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || handle.trim().length < 2) {
      toast({
        title: "Check your details",
        description: "Enter your full name and a username of at least 2 characters.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await updateMemberProfile({
        full_name: name.trim(),
        username: handle.trim(),
      });
      const saved = response.data;
      const member = getStoredMember();
      if (member && saved) {
        saveSession({
          accessToken: getAccessToken() || "",
          member: {
            ...member,
            first_name: saved.first_name,
            last_name: saved.last_name,
            username: saved.username,
            full_name: saved.full_name,
          },
        });
      }
      onProfileSaved({
        firstName: saved?.first_name || name.trim().split(" ")[0],
        fullName: saved?.full_name || name.trim(),
        username: saved?.username || handle.trim(),
      });
      toast({ title: "Saved", description: "Your name and username have been updated." });
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Could not save your profile.";
      toast({ title: "Could not save", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-charcoal">Account settings</h1>
        <p className="text-sm text-muted-foreground">Update your profile details.</p>
      </div>
      <form onSubmit={save} className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Full name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            required
            className="mt-1.5 w-full rounded-full border border-border bg-background px-5 py-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Username
          </label>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="Username"
            required
            minLength={2}
            maxLength={40}
            className="mt-1.5 w-full rounded-full border border-border bg-background px-5 py-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Email
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="mt-1.5 w-full rounded-full border border-border bg-background px-5 py-3 text-sm outline-none opacity-70"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-primary px-6 py-3 text-sm font-extrabold uppercase tracking-wider text-primary-foreground hover:bg-[hsl(var(--primary-hover))] disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
};

const SupportView = () => (
  <div className="max-w-xl space-y-6">
    <div>
      <h1 className="font-display text-2xl font-semibold text-charcoal">Contact support</h1>
      <p className="text-sm text-muted-foreground">We reply within one business day.</p>
    </div>
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <p className="text-sm text-muted-foreground">Email</p>
      <a href="mailto:support@carbn.app" className="mt-1 block font-display text-xl font-semibold text-charcoal hover:text-primary">
        support@carbn.app
      </a>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [metrics, setMetrics] = useState<MetricsPayload | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const storedMember = getStoredMember();
  const storedFullName =
    storedMember?.full_name ||
    [storedMember?.first_name, storedMember?.last_name].filter(Boolean).join(" ");
  const [firstName, setFirstName] = useState(storedMember?.first_name || "there");
  const [fullName, setFullName] = useState(storedFullName);
  const [username, setUsername] = useState(storedMember?.username || "");
  const [email, setEmail] = useState(storedMember?.email || "");

  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/login");
      return;
    }
    getCurrentMember()
      .then((response) => {
        const profile = response.data;
        if (profile?.first_name) {
          setFirstName(profile.first_name);
        }
        if (profile?.full_name || profile?.first_name) {
          setFullName(
            profile.full_name ||
              [profile.first_name, profile.last_name].filter(Boolean).join(" ")
          );
        }
        if (profile?.username) {
          setUsername(profile.username);
        }
        if (profile?.email) {
          setEmail(profile.email);
        }
        const current = getStoredMember();
        if (current && profile) {
          saveSession({
            accessToken: getAccessToken() || "",
            member: {
              ...current,
              first_name: profile.first_name,
              last_name: profile.last_name,
              username: profile.username,
              full_name: profile.full_name,
              email: profile.email,
            },
          });
        }
      })
      .catch(() => {});

    getMetrics()
      .then((response) => setMetrics(response.data))
      .catch(() => {
        toast({
          title: "Could not load progress",
          description: "Try refreshing. Check-in and chat will still update your score.",
          variant: "destructive",
        });
      });
  }, [navigate]);

  const logout = () => {
    clearSession();
    navigate("/");
  };

  const go = (v: View) => {
    setView(v);
    setSidebarOpen(false);
  };

  const onCheckin = async (workout: boolean) => {
    setCheckingIn(true);
    try {
      const response = await submitCheckin({
        workout_completed: workout,
        energy_score: metrics?.scores.energy_score,
        sleep_hours: metrics?.scores.sleep_hours,
      });
      setMetrics(response.data);
      toast({
        title: workout ? "Workout logged" : "Check-in saved",
        description: response.data?.scores
          ? `Capacity is now ${response.data.scores.capacity_score}/100`
          : undefined,
      });
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Could not save your check-in.";
      toast({ title: "Could not save check-in", description: message, variant: "destructive" });
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-charcoal md:flex">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-border bg-card transition-transform md:sticky md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Wordmark />
          <button onClick={() => setSidebarOpen(false)} className="text-muted-foreground md:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = view === n.id;
            return (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-charcoal"
                }`}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-charcoal"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col md:ml-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-charcoal" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <Wordmark />
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 p-6 md:p-10">
          {view === "home" && (
            <HomeView
              firstName={firstName}
              metrics={metrics}
              onOpenChat={() => go("chat")}
              onCheckin={onCheckin}
              checkingIn={checkingIn}
            />
          )}
          {view === "chat" && <ChatView firstName={firstName} onMetricsUpdate={setMetrics} />}
          {view === "account" && (
            <AccountView
              fullName={fullName}
              username={username}
              email={email}
              onProfileSaved={({ firstName: nextFirst, fullName: nextFull, username: nextUser }) => {
                setFirstName(nextFirst);
                setFullName(nextFull);
                setUsername(nextUser);
              }}
            />
          )}
          {view === "support" && <SupportView />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
