import api from "../lib/api";
import type { Member } from "../lib/session";

export const checkWaitlistEmail = async (email: string) => {
  const response = await api.get("/waitlist/check-email", {
    params: { email },
  });
  return response.data as {
    success: boolean;
    registered: boolean;
    message?: string;
  };
};

export const joinWaitlist = async (email: string) => {
  const response = await api.post("/waitlist", { email });
  return response.data;
};

export const setWaitlistUsername = async (
  leadId: string,
  payload: { username: string; last_name?: string }
) => {
  const response = await api.put(`/waitlist/${leadId}/username`, payload);
  return response.data;
};

export const loginMember = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data as {
    success: boolean;
    message: string;
    data: {
      member: Member;
      session: {
        access_token: string;
        refresh_token: string;
      };
    };
  };
};

export const getActivationProfile = async (token: string) => {
  const response = await api.get("/auth/activation-profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const saveActivationProfile = async (
  token: string,
  payload: { full_name: string; username: string }
) => {
  const response = await api.patch("/auth/activation-profile", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const setMemberPassword = async (
  token: string,
  payload: {
    password: string;
    confirm_password: string;
    full_name?: string;
    username?: string;
  }
) => {
  const response = await api.post("/auth/set-password", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getCurrentMember = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const updateMemberProfile = async (payload: {
  full_name: string;
  username: string;
}) => {
  const response = await api.patch("/auth/me", payload);
  return response.data;
};

export const sendChatQuestion = async (question: string, files: File[] = []) => {
  const form = new FormData();
  if (question.trim()) {
    form.append("question", question.trim());
  }
  files.forEach((file) => form.append("files", file));

  const response = await api.post("/chat", form, { timeout: 120000 });
  return response.data as {
    success: boolean;
    data: {
      question: string;
      answer: string;
      scores?: MetricsPayload["scores"];
      metrics?: MetricsPayload;
    };
  };
};

export const getChatHistory = async () => {
  const response = await api.get("/chat/history");
  return response.data as {
    success: boolean;
    data: { id: string; role: "user" | "assistant"; content: string; created_at: string }[];
  };
};

export interface MetricsPayload {
  scores: {
    capacity_score: number;
    total_score?: number;
    movement?: number;
    strength?: number;
    recovery?: number;
    nutrition?: number;
    consistency?: number;
    confidence?: number;
    energy_score: number;
    recovery_score: number;
    sleep_hours: number;
    weekly_workouts: number;
    weekly_workout_goal: number;
    workout_progress: number;
    steps_today: number;
    resting_hr: number;
    weight_kg: number;
    streak_days: number;
    last_checkin_at: string | null;
    updated_at: string;
  };
  activity: { id: string; title: string; kind: string; created_at: string }[];
}

export const getMetrics = async () => {
  const response = await api.get("/metrics");
  return response.data as { success: boolean; data: MetricsPayload };
};

export const submitCheckin = async (payload: {
  sleep_hours?: number;
  energy_score?: number;
  workout_completed?: boolean;
}) => {
  const response = await api.post("/metrics/checkin", payload);
  return response.data as { success: boolean; message: string; data: MetricsPayload };
};
