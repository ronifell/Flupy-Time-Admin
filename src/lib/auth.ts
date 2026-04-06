const TOKEN_KEY = "flupy_time_admin_token";
const EMPLOYEE_KEY = "flupy_time_admin_employee";

export type AdminEmployee = {
  id: string;
  employeeCode: string;
  fullName: string;
  role: string;
  companyId: string;
  companyName?: string;
  officeName?: string;
  /** Present after login or profile load when available */
  email?: string | null;
};

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredEmployee(): AdminEmployee | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(EMPLOYEE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminEmployee;
  } catch {
    return null;
  }
}

export function persistSession(token: string, employee: AdminEmployee) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EMPLOYEE_KEY, JSON.stringify(employee));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMPLOYEE_KEY);
}
