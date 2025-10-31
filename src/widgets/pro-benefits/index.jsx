import React from "react";
import "./pro-benefits.css";
import iconAuthStep1_1 from "../../shared/assets/iconAuthStep1_1.png";
import iconAuthStep1_2 from "../../shared/assets/iconAuthStep1_2.png";
import iconAuthStep1_3 from "../../shared/assets/iconAuthStep1_3.png";

export default function ProBenefits() {
  return (
    <div className="pb">
      <div className="pb-item">
        {/* <span className="pb-ico">💼</span> */}
        <span className="pb-ico">
            <img src={iconAuthStep1_1} alt="icon"/>
        </span>
        
        <div>
          <div className="pb-title">Більше ніж 600 категорій послуг для роботи</div>
          <div className="pb-text">Ви зможете працювати як за своєю спеціальністю, так і в нових напрямках.</div>
        </div>
      </div>
      <div className="pb-item">
        <span className="pb-ico">
            <img src={iconAuthStep1_2} alt="icon"/>
        </span> 
        <div>
          <div className="pb-title">Працюйте в зручну для вас годину</div>
          <div className="pb-text">Складiть свій особистий графік роботи та заробляйте тоді, коли вам зручно.</div>
        </div>
      </div>
      <div className="pb-item">
        {/* <span className="pb-ico">👛</span> */}
        <span className="pb-ico">
            <img src={iconAuthStep1_3} alt="icon"/>
        </span>
        <div>
          <div className="pb-title">Заробляйте гідно</div>
          <div className="pb-text">Сервіс може бути джерелом як додатковим, так і основним зарабiтком.</div>
        </div>
      </div>
    </div>
  );
}
