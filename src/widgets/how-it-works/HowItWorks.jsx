// HowItWorks - три шага с картинками и стрелками
import "./HowItWorks.css";
import BusyBee2 from "../../shared/assets/BusyBee2.png";
import BusyBee3 from "../../shared/assets/BusyBee3.png";
import BusyBee4 from "../../shared/assets/BusyBee4.png";
import arrowRight from "../../shared/assets/arrowRight.svg";

export default function HowItWorks() {
  return (
    <section className="howItWorksSect">
      <h2>Як працює BusyBee.space</h2>
      <div className="grid5x3">
        <div className="cell"><img src={BusyBee2} alt="" width={170} height={150} loading="lazy" /></div>
        <div className="cell"><img src={arrowRight} alt="" loading="lazy" /></div>
        <div className="cell"><img src={BusyBee3} alt="" width={170} height={150} loading="lazy" /></div>
        <div className="cell"><img src={arrowRight} alt="" loading="lazy" /></div>
        <div className="cell"><img src={BusyBee4} alt="" width={170} height={150} loading="lazy" /></div>

        <div className="cell"><p className="fontBold">Створіть замовлення</p></div>
        <div className="cell" />
        <div className="cell"><p className="fontBold">Виберіть фахівця</p></div>
        <div className="cell" />
        <div className="cell"><p className="fontBold">Закрийте замовлення</p></div>

        <div className="cell"><p className="fontReg">Опишіть, що і коли потрібно зробити</p></div>
        <div className="cell" />
        <div className="cell"><p className="fontReg">Виберіть компетентного фахівця для виконання роботи</p></div>
        <div className="cell" />
        <div className="cell"><p className="fontReg">Залиште відгук та оцінку за виконану роботу</p></div>
      </div>

    </section>
  );
}
