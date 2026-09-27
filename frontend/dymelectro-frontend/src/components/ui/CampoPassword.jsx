import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './CampoPassword.css';

/** Campo de contraseña con icono para mostrar/ocultar el texto escrito. */
export default function CampoPassword({
  id,
  label,
  value,
  onChange,
  autoComplete = 'current-password',
  minLength,
  required = true,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="campo">
      <label htmlFor={id}>{label}</label>
      <div className="campo-password">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          required={required}
          minLength={minLength}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="campo-password__boton"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>
    </div>
  );
}