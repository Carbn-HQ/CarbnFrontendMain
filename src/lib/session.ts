const ACCESS_TOKEN_KEY = "carbn_access_token";
const REFRESH_TOKEN_KEY = "carbn_refresh_token";
const MEMBER_KEY = "carbn_member";
const INVITE_TOKEN_KEY = "carbn_invite_token";

export interface Member {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  username?: string | null;
  full_name?: string | null;
  status: string;
}

export const saveSession = ({
  accessToken,
  refreshToken,
  member,
}: {
  accessToken: string;
  refreshToken?: string;
  member?: Member;
}) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  if (member) {
    localStorage.setItem(MEMBER_KEY, JSON.stringify(member));
  }
};

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const getStoredMember = (): Member | null => {
  const raw = localStorage.getItem(MEMBER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Member;
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(MEMBER_KEY);
  localStorage.removeItem(INVITE_TOKEN_KEY);
};

export const saveInviteToken = (token: string) => {
  sessionStorage.setItem(INVITE_TOKEN_KEY, token);
};

export const getInviteToken = () => sessionStorage.getItem(INVITE_TOKEN_KEY);
