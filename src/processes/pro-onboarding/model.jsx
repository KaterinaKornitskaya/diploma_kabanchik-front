// дозволить плавно переходити між Step-1/Step-2, не втрачаючи дані (збереження ще й у localStorage).

import React from "react";

const defaultData = {
  firstName: "", lastName: "", email: "", phone: "", city: "", agree: false,
};

const Ctx = React.createContext(null);

export function ProOnboardingProvider({ children }) {
  const [data, setData] = React.useState(() => {
    try { return { ...defaultData, ...JSON.parse(localStorage.getItem("proSignup") || "{}") }; }
    catch { return defaultData; }
  });

  const update = (patch) => {
    setData(s => {
      const next = { ...s, ...patch };
      try { localStorage.setItem("proSignup", JSON.stringify(next)); } catch {}
      return next;
    });
  };
  const reset = () => {
    localStorage.removeItem("proSignup");
    setData(defaultData);
  };

  const value = React.useMemo(() => ({ data, update, reset }), [data]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProOnboarding() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useProOnboarding must be used within ProOnboardingProvider");
  return ctx;
}
