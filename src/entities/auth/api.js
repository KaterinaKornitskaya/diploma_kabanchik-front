// src/entities/auth/api.js
import { api } from "../../api";
import { uploadAvatar } from "../../entities/user/api";


/** Реєстрація фахівця (Step 1) */
export async function saveProSignupStep1(payload) {
  // payload може прийти як camelCase або вже PascalCase — нормалізуємо
  const firstName = payload.firstName ?? payload.FirstName ?? "";
  const lastName  = payload.lastName  ?? payload.LastName  ?? "";
  const email     = (payload.email ?? payload.Email ?? "").trim();
  const phone     = payload.phone ?? payload.PhoneNumber ?? "";
  const password  = payload.password ?? payload.Password ?? "";

  const body = {
    // ВАЖЛИВО: рівно такі імена полів, як у RegisterUserRequest
    UserName:    email, // логіном робимо email (як було у тебе)
    Email:       email,
    FullName:    [firstName, lastName].filter(Boolean).join(" ").trim(),
    PhoneNumber: String(phone || "").trim(),
    Password:    password,
    RememberMe:  true,
    UserRole:    "specialist",
  };

  // корисно один раз перевірити в консолі
  console.log("➡️ /api/Auth/signup body:", body);

  const res = await api("/api/Auth/signup", { method: "POST", body });
  return res;
}

/** Логін */
export async function login({ email, password }) {
  const res = await api("/api/Auth/login", {
    method: "POST",
    body: { Email: email, Password: password }, // бек чекає PascalCase
  });

  const token = res?.data || res?.token || res?.accessToken;
  if (typeof token === "string" && token.length > 0) {
    localStorage.setItem("token", token);
    console.log("🔐 token saved, len=", token.length);
  } else {
    console.warn("⚠️ token not found in login response:", res);
  }
  return res;
}

/** Поточний користувач */
export async function me() {
  return api("/api/Auth/me", { method: "GET" });
}

/** Реєстрація звичайного користувача (customer) */
export async function signupCustomer({ fullName, email, phoneNumber, password, rememberMe = true }) {
  const body = {
    UserName:    (email || "").trim(),
    Email:       (email || "").trim(),
    FullName:    (fullName || "").trim(),
    PhoneNumber: (phoneNumber || "").trim(),
    Password:    password,
    RememberMe:  rememberMe,
    UserRole:    "customer",
  };
  return api("/api/Auth/signup", { method: "POST", body });
}



// Заглушки для SMS (поки не використовуємо)
export async function sendOtp(phone) {
  console.debug("API.sendOtp", phone);
  await new Promise((r) => setTimeout(r, 500));
  return { ok: true };
}
export async function verifyOtp({ phone, code }) {
  console.debug("API.verifyOtp", phone, code);
  await new Promise((r) => setTimeout(r, 500));
  const ok = /^\d{4,6}$/.test(code);
  return { ok };
}
