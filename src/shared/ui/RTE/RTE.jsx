import React from "react";

export default function RTE({ value = "", onChange, placeholder = "Опис послуги…" }) {
  const ref = React.useRef(null);

  // синхронизация внешнего value -> DOM
  React.useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || "")) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (cmd) => document.execCommand(cmd, false, null);

  const handleInput = () => {
    if (!onChange) return;
    onChange(ref.current?.innerHTML || "");
  };

  return (
    <div className="rte">
      <div className="rte-toolbar">
        <button type="button" onClick={() => exec("bold")}><b>B</b></button>
        <button type="button" onClick={() => exec("italic")}><i>I</i></button>
        <button type="button" onClick={() => exec("underline")}><u>U</u></button>
        <button type="button" onClick={() => exec("insertUnorderedList")}>• Список</button>
        <button type="button" onClick={() => exec("insertOrderedList")}>1. Список</button>
      </div>
      <div
        className="rte-editor"
        contentEditable
        ref={ref}
        onInput={handleInput}
        data-placeholder={placeholder}
      />
    </div>
  );
}
