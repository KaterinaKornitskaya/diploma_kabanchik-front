import React from "react";
import { useNavigate } from "react-router-dom";
import { useProOnboarding } from "../../../../processes/pro-onboarding/model";
import { authApi } from "../../../../entities/auth";

import Button from "../../../../shared/ui/Button/Button"; 
import "./Step2Form.css";

function formatPhone(p) {
  const d = String(p || "").replace(/\D/g, "");
  // просте форматування під UA: +38 (XXX) XXX-XX-XX
  if (d.startsWith("380") && d.length >= 12) {
    return `+${d.slice(0,2)}(${d.slice(2,5)})${d.slice(5,8)}-${d.slice(8,10)}-${d.slice(10,12)}`;
  }
  if (d.length >= 10) {
    return `+38(${d.slice(0,3)})${d.slice(3,6)}-${d.slice(6,8)}-${d.slice(8,10)}`;
  }
  return p || "";
}

export default function Step2Form() {
  const navigate = useNavigate();
  const { data, update } = useProOnboarding();
  const [code, setCode] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [resendLeft, setResendLeft] = React.useState(0);

  // тікани таймера на повторну відправку
  React.useEffect(() => {
    if (resendLeft <= 0) return;
    const t = setInterval(() => setResendLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendLeft]);

  const onResend = async () => {
    if (resendLeft > 0) return;
    try {
      setLoading(true);
      setError("");
      await authApi.sendOtp(data.phone);
      setResendLeft(60); // 60с кулдаун
    } catch (e) {
      setError("Не вдалося надіслати код. Спробуйте ще раз.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    setError("");
    if (!/^\d{4,6}$/.test(code)) {
      setError("Введіть код з 4–6 цифр");
      return;
    }
    try {
      setLoading(true);
      const res = await authApi.verifyOtp({ phone: data.phone, code });
      if (!res.ok) { setError("Невірний код підтвердження"); return; }
      update({ phoneVerified: true });       // позначимо як підтверджений
      navigate("/auth/pro-signup/step-3");   // далі на крок 3 (додамо потім)
    } catch (e) {
      console.error(e);
      setError("Сталася помилка. Спробуйте пізніше.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="ps2-form" onSubmit={onSubmit} noValidate>
      <div className="ps2-phone">{formatPhone(data.phone)}</div>
      <div className="ps2-hint">Введіть код підтвердження із SMS або Viber</div>

      <input
        className="ps2-code"
        inputMode="numeric"
        pattern="\d{4,6}"
        maxLength={6}
        placeholder="••••"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        onBlur={() => setTouched(true)}
      />
      { (touched && error) ? <div className="ps2-error">{error}</div> : null }

      <Button
        type="submit"
        fullWidth
        disabled={loading || !/^\d{4,6}$/.test(code)}
        variant="orange"   // або "primary" — як у тебе налаштовано для жовтої
      >
        {loading ? "Завантаження…" : "Підтвердити"}
      </Button>

      <div className="ps2-resend">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onResend}
          disabled={loading || resendLeft > 0}
        >
          Надіслати код ще раз {resendLeft > 0 ? `(${resendLeft}с)` : ""}
        </Button>
      </div>
    </form>
  );
}
