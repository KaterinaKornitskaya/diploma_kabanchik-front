import React from "react";
import "./ImageUpload.css";

export default function ImageUpload({
  label = "Фото профілю",
  value,            // { file, preview } або null
  onChange,         // (next) => void
  maxSizeMb = 5,
  accept = "image/*"
}) {
  const inputRef = React.useRef(null);

  const pick = () => inputRef.current?.click();

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Оберіть зображення"); return; }
    if (file.size > maxSizeMb * 1024 * 1024) { alert(`Файл > ${maxSizeMb}MB`); return; }
    const preview = URL.createObjectURL(file);
    onChange({ file, preview });
  };

  const onInput = (e) => handleFile(e.target.files?.[0]);

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    handleFile(file);
  };

  return (
    <div className="iu">
      {label && <label className="iu-label">{label}</label>}

      <div
        className="iu-box"
        onClick={pick}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
      >
        {value?.preview ? (
          <img className="iu-preview" src={value.preview} alt="avatar preview" />
        ) : (
          <div className="iu-placeholder">Перетягніть фото або натисніть для вибору</div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={onInput}
      />
      {value?.file && <div className="iu-meta">{value.file.name} • {(value.file.size/1024/1024).toFixed(2)} MB</div>}
    </div>
  );
}
