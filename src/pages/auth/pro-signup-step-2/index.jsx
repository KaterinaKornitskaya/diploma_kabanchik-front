import React from "react";
import ProBenefits from "../../../widgets/pro-benefits";
import Step2Form from "../../../features/pro-signup/step2/ui/Step2Form";
import "./styles.css";

export default function ProSignUpStep2Page() {
  return (
    <div className="page-white">
      <section className="psu container">
        <h1 className="psu-title">Реєстрація фахівця</h1>

        <div className="psu-grid">
          <div className="psu-left"><ProBenefits /></div>
          <div className="psu-right">
            <div className="psu-card">
              <Step2Form />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
