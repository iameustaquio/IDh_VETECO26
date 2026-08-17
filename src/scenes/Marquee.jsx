import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import scene2Image from "../assets/home/scene2-carpinteria.jpg";
import scene2Terraza from "../assets/home/scene2-terraza.jpg";
import scene2Montana from "../assets/home/scene2-montana-lago.jpg";
import scene2Torre from "../assets/home/scene2-torre-dubai.jpg";
import scene2Salon from "../assets/home/scene2-salon-dubai.jpg";
import "./Marquee.css";

gsap.registerPlugin(ScrollTrigger);

// Conector entre la escena 2 (proyectos) y la 3 (manillas) — no fijado
// (no pin, a diferencia de las cinco escenas): dos filas con las mismas 5
// fotos de proyecto reales, en orden distinto cada una, que se desplazan
// en horizontal en sentidos opuestos según el scroll (técnica "marquee"
// de motionsites.ai). Con solo 5 fotos no hay suficientes para llenar dos
// filas sin repetir contenido entre ellas — se acepta la repetición
// (ambas filas muestran las mismas 5, solo que barajadas) en vez de
// partirlas en grupos aún más pequeños, que se notarían más vacíos.
const ROW_A = [scene2Image, scene2Terraza, scene2Montana, scene2Torre, scene2Salon];
const ROW_B = [scene2Torre, scene2Salon, scene2Image, scene2Montana, scene2Terraza];

// Cada fila se triplica para que, con el desplazamiento acotado que le
// aplica el scroll de esta sección (unos cientos de px, nunca el ancho
// completo de la fila), nunca se vea el final de la tira ni un hueco en
// ninguno de los dos bordes.
const TILES_A = [...ROW_A, ...ROW_A, ...ROW_A];
const TILES_B = [...ROW_B, ...ROW_B, ...ROW_B];

const ROW_SHIFT_PX = 260;

export function Marquee({ sectionRef }) {
  const rowARef = useRef(null);
  const rowBRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        rowARef.current,
        { x: 0 },
        {
          x: -ROW_SHIFT_PX,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.4,
          },
        },
      );

      gsap.fromTo(
        rowBRef.current,
        { x: 0 },
        {
          x: ROW_SHIFT_PX,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.4,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [sectionRef]);

  return (
    <section className="marquee" ref={sectionRef} aria-hidden="true">
      <div className="marquee__row" ref={rowARef}>
        {TILES_A.map((src, i) => (
          <img key={i} className="marquee__tile" src={src} alt="" loading="lazy" draggable={false} />
        ))}
      </div>
      <div className="marquee__row" ref={rowBRef}>
        {TILES_B.map((src, i) => (
          <img key={i} className="marquee__tile" src={src} alt="" loading="lazy" draggable={false} />
        ))}
      </div>
    </section>
  );
}
