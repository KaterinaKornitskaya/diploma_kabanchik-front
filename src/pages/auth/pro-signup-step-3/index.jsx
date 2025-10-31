import React from "react";
import Step3Form from "../../../features/pro-signup/step3/ui/Step3Form";
import "./styles.css";

export default function ProSignUpStep3Page() {
  return (
    <div className="page-white">
      <section className="psu container">
        <h1 className="psu-title">Підтвердження контактів</h1>
        <div className="psu-single">
          <div className="psu-card">
            <Step3Form />
          </div>
        </div>
      </section>
    </div>
  );
}
