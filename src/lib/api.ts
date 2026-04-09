import func2url from '../../backend/func2url.json';

const AUTH_URL = func2url.auth;
const SCHEDULE_URL = func2url.schedule;
const CHATS_URL = func2url.chats;

function getToken(): string {
  return localStorage.getItem('edu_token') || '';
}

async function post(url: string, body: Record<string, unknown>) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Id': getToken(),
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function get(url: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(qs ? `${url}?${qs}` : url, {
    headers: { 'X-Session-Id': getToken() },
  });
  return res.json();
}

// AUTH
export const api = {
  login: (login: string, password: string) =>
    post(AUTH_URL, { action: 'login', login, password }),

  me: () => post(AUTH_URL, { action: 'me' }),

  getUsers: () => post(AUTH_URL, { action: 'users' }),

  createUser: (data: { login: string; password: string; full_name: string; role: string; group_id?: number | null }) =>
    post(AUTH_URL, { action: 'users_create', ...data }),

  getGroups: () => post(AUTH_URL, { action: 'groups' }),

  createGroup: (name: string, year: number) =>
    post(AUTH_URL, { action: 'groups_create', name, year }),

  // SCHEDULE
  getSchedule: (params: { group_id?: number; teacher_id?: number; day_of_week?: number } = {}) =>
    post(SCHEDULE_URL, { action: 'list', ...params }),

  addLesson: (data: { teacher_id?: number; group_id: number; subject: string; lesson_type: string; room: string; day_of_week: number; time_start: string }) =>
    post(SCHEDULE_URL, { action: 'add', ...data }),

  // CHATS
  getChats: () => post(CHATS_URL, { action: 'list' }),

  getMessages: (chat_id: number) =>
    post(CHATS_URL, { action: 'messages', chat_id }),

  sendMessage: (chat_id: number, text: string) =>
    post(CHATS_URL, { action: 'send', chat_id, text }),

  createChat: (name: string, member_ids: number[]) =>
    post(CHATS_URL, { action: 'create', name, member_ids }),

  getChatMembers: (chat_id: number) =>
    post(CHATS_URL, { action: 'members', chat_id }),
};
