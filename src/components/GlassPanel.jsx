import "./GlassPanel.css";

// Material "cristal" de la dirección de arte (documento 04, sección 6):
// backdrop-blur, borde translúcido, sin relleno sólido. Se usa sobre
// imagen o vídeo, nunca sobre fondo ya neutro.
export function GlassPanel({ children, className = "", ...props }) {
  return (
    <div className={`glass-panel ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
