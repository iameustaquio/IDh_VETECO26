import "./Button.css";

// Área táctil mínima 72×72px, respuesta <200ms (documento 05, sección 3).
export function Button({ variant = "primary", children, ...props }) {
  return (
    <button type="button" className={`button button--${variant}`} {...props}>
      {children}
    </button>
  );
}
