import React from "react";
import ProBenefits from "../../../widgets/pro-benefits";
import FaqSimple from "../../../widgets/faq-simple";
import Step1Form from "../../../features/pro-signup/step1/ui/Step1Form";
import "./styles.css";

export default function ProSignUpStep1Page() {
  return (
    <div className="page-white">
        <section className="psu container">
            <h1 className="psu-title">Реєстрація фахівця</h1>        
            <div className="psu-grid">                
                <div className="psu-left">
                    <p>Після реєстрації ви можете отримувати замовлення та заробляти на сервісі Busy Bee.</p>
                    <p></p>
                    <p></p>
                    <p></p>
                    <ProBenefits />
                </div>
                <div className="psu-right">
                <div className="psu-card">
                    <Step1Form />
                </div>
                </div>
            </div>
            <FaqSimple />
        </section>
    </div>
  );
}
