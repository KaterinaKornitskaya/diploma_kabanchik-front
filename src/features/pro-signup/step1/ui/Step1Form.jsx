// src/features/pro-signup/step1/ui/Step1Form.jsx
import React from "react";
import Input from "../../../../shared/ui/Input/Input";
import Checkbox from "../../../../shared/ui/Checkbox/Checkbox";
import Button from "../../../../shared/ui/Button/Button";
import { required, email as vEmail, phone as vPhone } from "../../../../shared/lib/validators";
import { useProOnboarding } from "../../../../processes/pro-onboarding/model";
import { saveProSignupStep1, login } from "../../../../entities/auth/api";
import { useNavigate } from "react-router-dom";
import "./Step1Form.css";

export default function Step1Form() {
  const navigate = useNavigate();
  const { data, update } = useProOnboarding();

  const [form, setForm] = React.useState({
    firstName: data.firstName || "",
    lastName:  data.lastName  || "",
    email:     data.email     || "",
    phone:     data.phone     || "",
    city:      data.city      || "",
    password:  "",
    password2: "",
    agree:     !!data.agree,
  });

  const [touched, setTouched] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState("");
  const [emailTaken, setEmailTaken] = React.useState("");

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };
  const onBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  const hasUppercase = /[A-ZА-ЯІЇЄҐ]/.test(form.password);
  const passwordLenOk = form.password.length >= 6;

  const errs = {
    firstName: required(form.firstName),
    lastName:  required(form.lastName),
    email:     vEmail(form.email),
    phone:     vPhone(form.phone),
    city:      required(form.city),
    password:  !passwordLenOk ? "Пароль мінімум 6 символів"
              : !hasUppercase ? "Пароль має містити хоч одну велику літеру"
              : "",
    password2: form.password && form.password === form.password2 ? "" : "Паролі не збігаються",
    agree:     form.agree ? "" : "Потрібно погодитись з умовами",
  };
  const isValid = Object.values(errs).every((x) => !x);

  function extractBackendMessage(err) {
    try {
      const raw = String(err?.message || "");
      const sep = raw.indexOf(" — ");
      if (sep !== -1) {
        const json = JSON.parse(raw.slice(sep + 3));
        return (
          json?.message ||
          json?.Status?.message ||
          json?.errors?.Email?.[0] ||
          json?.errors?.Password?.[0] ||
          json?.errors?.UserName?.[0] ||
          ""
        );
      }
    } catch {}
    return "";
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!isValid) {
      setTouched({
        firstName: true, lastName: true, email: true, phone: true, city: true,
        password: true, password2: true, agree: true
      });
      return;
    }

    try {
      setLoading(true);
      setServerError(""); setEmailTaken("");

      update({
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        phone:     form.phone,
        city:      form.city,
        agree:     form.agree,
        __step3:   undefined,
      });

      // ❗ відправляємо в PascalCase
      const payload = {
        FirstName:  form.firstName,
        LastName:   form.lastName,
        Email:      form.email,
        Phone:      form.phone,
        Password:   form.password,
      };
      await saveProSignupStep1(payload);

      await login({ email: form.email, password: form.password });
      navigate("/auth/pro-signup/step-3");
    } catch (err) {
      console.error("❌ Step1 error:", err);
      const msg = extractBackendMessage(err);

      if (/already taken|already exists|зайнятий|існує/i.test(msg)) {
        setEmailTaken("Користувач з таким email вже існує");
        setTouched((t) => ({ ...t, email: true }));
      } else if (/uppercase/i.test(msg)) {
        setServerError("Пароль має містити щонайменше одну ВЕЛИКУ літеру");
        setTouched((t) => ({ ...t, password: true }));
      } else if (msg) {
        setServerError(msg);
      } else {
        setServerError("Сталася помилка під час реєстрації. Спробуйте ще раз.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="ps1-form">
      {serverError && <div className="ui-error" style={{ marginBottom: 12 }}>{serverError}</div>}

      <div className="ps1-row">
        <Input label="Ім’я" name="firstName" value={form.firstName} onChange={onChange} onBlur={onBlur} error={touched.firstName && errs.firstName} />
        <Input label="Прізвище" name="lastName" value={form.lastName} onChange={onChange} onBlur={onBlur} error={touched.lastName && errs.lastName} />
      </div>

      <div className="ps1-row">
        <Input label="Електронна пошта" name="email" type="email" value={form.email} onChange={onChange} onBlur={onBlur} error={(touched.email && errs.email) || emailTaken} />
        <Input label="Телефон" name="phone" value={form.phone} onChange={onChange} onBlur={onBlur} error={touched.phone && errs.phone} placeholder="+380…" />
      </div>

      <Input label="Місто" name="city" value={form.city} onChange={onChange} onBlur={onBlur} error={touched.city && errs.city} />

      <div className="ps1-row">
        <Input label="Пароль" name="password" type="password" value={form.password} onChange={onChange} onBlur={onBlur} error={touched.password && errs.password} placeholder="Мін. 6 символів, з великою літерою" />
        <Input label="Підтвердіть пароль" name="password2" type="password" value={form.password2} onChange={onChange} onBlur={onBlur} error={touched.password2 && errs.password2} />
      </div>

      <Checkbox name="agree" checked={form.agree} onChange={onChange} onBlur={onBlur} error={touched.agree && errs.agree}>
        Погоджуюсь з умовами сервісу та політикою конфіденційності
      </Checkbox>

      <Button type="submit" fullWidth disabled={!isValid || loading} variant="primary">
        {loading ? "Завантаження…" : "Зареєструватися"}
      </Button>
    </form>
  );
}
