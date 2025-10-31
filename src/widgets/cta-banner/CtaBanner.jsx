// CTA баннер + кнопка
import "./CtaBanner.css";
import { Button } from "../../shared/ui/Button";

export default function CtaBanner() {
  return (
    <section className="bannerSect">
      <section className="bannerSectInside">
        <h1 className="text-white">Маєш особливі потреби?</h1>
        <h3 className="text-white">Разом нас не зупинити. Ми з Україною!</h3>
        <Button href="/signup" className="myCta">Замовити зараз</Button>
      </section>
    </section>
  );
}
