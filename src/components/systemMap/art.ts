import type { DrawingId, GlyphId, Text } from '../../data/systemMaps/types';

/*
 * The system map's line work, drawn by hand for this site: thin strokes in
 * the ink colour, a touch of accent (class "a"), a fainter line for what is
 * only context (class "f"). No logos, no vendor marks. Colours come from the
 * stylesheet, so every theme gets them right.
 */

/** Small icons for the map, on a 24 × 24 grid. */
export const glyphs: Record<GlyphId, string> = {
  screen:
    '<rect x="2.5" y="5" width="19" height="12" rx="1.5"/><rect x="5" y="7.5" width="6" height="4" rx=".5" class="a"/><path d="M13 8h6M13 10.5h4M5 14h14"/><path d="M8 5V3M16 5V3"/>',
  window:
    '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8.5h18"/><circle cx="6" cy="6.25" r=".6"/><circle cx="8.2" cy="6.25" r=".6"/><rect x="6" y="11" width="5" height="6" rx=".6" class="a"/><path d="M13.5 11.5h4.5M13.5 14h3"/>',
  mic: '<rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6"/><path d="M3.5 7.5q-1.3 2.5 0 5M20.5 7.5q1.3 2.5 0 5" class="a"/>',
  speaker:
    '<rect x="5" y="2.5" width="14" height="19" rx="2"/><circle cx="12" cy="14.5" r="3.6"/><circle cx="12" cy="14.5" r="1.1" class="a"/><circle cx="12" cy="6.8" r="1.4"/>',
  bridge:
    '<path d="M2.5 16.5h19"/><path d="M4 16.5Q12 4.5 20 16.5" class="a"/><path d="M8 16.5v-5.2M12 16.5V9.3M16 16.5v-5.2M4 16.5v4M20 16.5v4"/>',
  plug: '<rect x="5.5" y="6.5" width="13" height="13" rx="3.5"/><circle cx="9.7" cy="13" r="1"/><circle cx="14.3" cy="13" r="1"/><path d="M10 6.5V3.5M14 6.5V3.5"/><circle cx="12" cy="9" r=".7" class="a"/>',
  bulb: '<path d="M9 16.5c0-2-3-3.2-3-7a6 6 0 0 1 12 0c0 3.8-3 5-3 7z"/><path d="M9.3 18.6h5.4M10 20.8h4"/><path d="M10.5 16.5v-4l1.5 1.4 1.5-1.4v4" class="a"/>',
  blind:
    '<rect x="3.5" y="3" width="17" height="3" rx=".8"/><path d="M5 6v15M19 6v15M5 21h14" class="f"/><path d="M5 8.5h14M5 11h14M5 13.5h14"/><path d="M12 13.5v2" class="a"/><circle cx="12" cy="16.3" r=".8" class="a"/>',
  projector:
    '<rect x="2.5" y="8" width="19" height="9" rx="2.2"/><circle cx="8" cy="12.5" r="2.8"/><circle cx="8" cy="12.5" r="1.1" class="a"/><path d="M13.5 10.8h5M13.5 12.5h5M13.5 14.2h5M5.5 17v2M18.5 17v2"/>',
  cast: '<path d="M7 5.5v13a5 2 0 0 0 10 0v-13"/><ellipse cx="12" cy="5.5" rx="5" ry="2"/><circle cx="10.4" cy="5.5" r=".45" class="a"/><circle cx="12" cy="5.8" r=".45" class="a"/><circle cx="13.6" cy="5.5" r=".45" class="a"/><path d="M9 11h6M9 13.5h6M9 16h6" class="f"/>',
  tablet:
    '<rect x="3" y="4" width="18" height="15" rx="2"/><rect x="5" y="6" width="14" height="11" rx=".6"/><path d="M8.5 10.5a2.3 2.3 0 1 0 2.8 2.8 2 2 0 0 1-2.8-2.8z" class="a"/><path d="M13 11.2h4M13 13.6h3"/>',
  phone:
    '<rect x="6.5" y="2" width="11" height="20" rx="2.6"/><path d="M10.5 4.6h3"/><rect x="8.5" y="7" width="7" height="3.4" rx="1" class="a"/><path d="M8.8 13h6.4M8.8 15.5h4.4"/>',
  server:
    '<rect x="2.5" y="5" width="19" height="6" rx="1"/><rect x="2.5" y="13" width="19" height="6" rx="1"/><path d="M5 8h5M5 16h5"/><circle cx="17.5" cy="8" r=".8" class="a"/><circle cx="17.5" cy="16" r=".8" class="a"/>',
  db: '<ellipse cx="12" cy="5.5" rx="7" ry="2.6"/><path d="M5 5.5v13c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-13"/><path d="M5 12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6" class="a"/>',
  wave: '<path d="M3 12h1.5M6.5 9v6M10 5v14M13.5 8v8M17 10v4M20.5 11.3v1.4"/><path d="M10 5v14" class="a"/>',
  tools:
    '<path d="M12 2.8l8 4.6v9.2l-8 4.6-8-4.6V7.4z"/><circle cx="12" cy="12" r="2.6" class="a"/><path d="M12 2.8v6.6M4 7.4l5.7 3.3M20 7.4l-5.7 3.3" class="f"/>',
  bubble:
    '<path d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v8.5a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 3.5V17H4a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 4 5.5z"/><path d="M7 10h10M7 13h6" class="a"/>',
  text: '<path d="M2.5 7.5q1.5-3 3 0t3 0" class="a"/><path d="M11 6.5h2.5M15 6.5l2.5 0M11 11.5h10M11 15h10M3 19h18M3 11.5h5M3 15h5"/>',
  calendar:
    '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><rect x="13" y="13" width="4" height="3.5" rx=".6" class="a"/><path d="M7 13.5h3M7 16.5h3"/>',
  note: '<path d="M9 18V5.5l11-2.5v12.5"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="15.5" r="2.5"/><path d="M9 9l11-2.5" class="a"/>',
  weather:
    '<circle cx="9" cy="8.5" r="3.2" class="a"/><path d="M9 2.5v1.3M3 8.5h1.3M4.8 4.3l.9.9M13.2 4.3l-.9.9" class="a"/><path d="M8 20.5h9.5a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.4 1.3A2.9 2.9 0 0 0 8 20.5z"/>',
  branch:
    '<circle cx="7" cy="5" r="2"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="8" r="2" class="a"/><path d="M7 7v10"/><path d="M17 10c0 4-10 3-10 7" class="a"/>',
  terminal:
    '<rect x="2.5" y="4" width="19" height="16" rx="2"/><path d="M6.5 9.5l3 2.5-3 2.5" class="a"/><path d="M11.5 15h6"/>',
  key: '<circle cx="8" cy="12" r="4"/><circle cx="8" cy="12" r="1.2" class="a"/><path d="M12 12h9.5M18.5 12v3M21.5 12v2"/>',
  tunnel:
    '<path d="M2 20.5h20"/><path d="M4 20.5V13a8 8 0 0 1 16 0v7.5"/><path d="M8.5 20.5V14a3.5 3.5 0 0 1 7 0v6.5" class="a"/><path d="M12 6.5v-2" class="f"/>',
  bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/><path d="M19.5 5.5q1.8 1.8 1.8 4.5M4.5 5.5Q2.7 7.3 2.7 10" class="a"/>',
  pulse:
    '<rect x="2.5" y="4" width="19" height="16" rx="2"/><path d="M5.5 13h3l2-5 3 9 2-4h3" class="a"/>',
  chip: '<rect x="6" y="6" width="12" height="12" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx=".6" class="a"/><path d="M9 2.5V6M12 2.5V6M15 2.5V6M9 18v3.5M12 18v3.5M15 18v3.5M2.5 9H6M2.5 12H6M2.5 15H6M18 9h3.5M18 12h3.5M18 15h3.5"/>',
};

export interface Drawing {
  alt: Text;
  /** Inner markup for a 200 × 140 viewBox. */
  svg: string;
}

/** Line drawings of the physical things, for the panel. */
export const drawings: Record<DrawingId, Drawing> = {
  wall: {
    alt: {
      en: 'Line drawing of the wall screen: a landscape panel hung on the wall with a small USB microphone at its side, and a round inset showing the RK3288 board behind it.',
      es: 'Dibujo a línea de la pantalla de la pared: un panel apaisado colgado en la pared, con un pequeño micrófono USB al lado y un detalle circular de la placa RK3288 que lleva detrás.',
    },
    svg: `
      <defs><clipPath id="smap-inset"><circle cx="160" cy="100" r="30"/></clipPath></defs>
      <path class="f" d="M6 128h188M14 128v4M186 128v4"/>
      <rect class="f" x="24" y="22" width="118" height="70" rx="4"/>
      <circle cx="60" cy="10" r="1.6"/><circle cx="104" cy="10" r="1.6"/>
      <path class="f" d="M60 12v6M104 12v6"/>
      <rect x="20" y="18" width="118" height="70" rx="4"/>
      <rect x="26" y="24" width="106" height="58" rx="1.2"/>
      <rect class="a" x="32" y="30" width="30" height="13" rx="1.5"/>
      <path class="f" d="M32 48h30M32 52h22"/>
      <rect class="f" x="68" y="30" width="58" height="22" rx="1.5"/>
      <rect class="f" x="32" y="58" width="28" height="18" rx="1.5"/>
      <rect class="f" x="65" y="58" width="28" height="18" rx="1.5"/>
      <rect class="f" x="98" y="58" width="28" height="18" rx="1.5"/>
      <path d="M20 66h-5"/>
      <rect x="9" y="56" width="6" height="15" rx="3"/>
      <path class="a" d="M5.5 58.5q-2 5 0 10M2 56.5q-3.4 7 0 14"/>
      <path class="a" stroke-dasharray="2 3" d="M96 84 L131 93"/>
      <circle class="a" cx="96" cy="84" r="2"/>
      <circle cx="160" cy="100" r="30" fill="var(--smap-paper)"/>
      <g clip-path="url(#smap-inset)"><g transform="translate(2 2)">
        <rect x="128" y="74" width="62" height="48" rx="1"/>
        <circle class="f" cx="133" cy="79" r="1.5"/><circle class="f" cx="185" cy="117" r="1.5"/>
        <rect x="150" y="86" width="18" height="18" rx="1"/>
        <path class="f" d="M153 86v-3M157 86v-3M161 86v-3M165 86v-3M153 104v3M157 104v3M161 104v3M165 104v3M150 89h-3M150 93h-3M150 97h-3M150 101h-3M168 89h3M168 93h3M168 97h3M168 101h3"/>
        <rect class="a" x="135" y="86" width="8" height="11" rx=".6"/>
        <rect class="a" x="135" y="100" width="8" height="11" rx=".6"/>
        <path class="f" d="M143 91h4M143 105h4M171 95h10v10M176 82h8"/>
        <text x="159" y="117" text-anchor="middle">RK3288</text>
      </g></g>
      <circle class="a" cx="160" cy="100" r="30"/>
    `,
  },
  tablet: {
    alt: {
      en: 'Line drawing of a tablet on a stand, resting at night with a moon and the clock on screen.',
      es: 'Dibujo a línea de una tablet en su soporte, descansando de noche con una luna y el reloj en pantalla.',
    },
    svg: `
      <path class="f" d="M24 124h152"/>
      <path d="M66 108l-10 16M134 108l10 16"/>
      <rect x="38" y="16" width="124" height="92" rx="8"/>
      <rect x="46" y="24" width="108" height="76" rx="2"/>
      <circle cx="100" cy="20" r="1"/>
      <path class="a" d="M72 46a11 11 0 1 0 13 13 9 9 0 0 1-13-13z"/>
      <rect x="96" y="50" width="42" height="15" rx="2"/>
      <path class="f" d="M96 72h28M96 78h18"/>
    `,
  },
  phone: {
    alt: {
      en: 'Line drawing of a phone with a notification at the top of its screen.',
      es: 'Dibujo a línea de un móvil con un aviso en la parte de arriba de la pantalla.',
    },
    svg: `
      <ellipse class="f" cx="100" cy="126" rx="38" ry="4"/>
      <rect x="76" y="10" width="48" height="104" rx="9"/>
      <rect x="80" y="16" width="40" height="92" rx="5"/>
      <path d="M94 13h12"/>
      <rect class="a" x="84" y="22" width="32" height="13" rx="3"/>
      <circle class="a" cx="90" cy="28.5" r="2.4"/>
      <path class="a" d="M95 26.5h17M95 30.5h11"/>
      <path class="f" d="M86 46h28M86 52h20M86 64h28M86 70h22M86 82h28M86 88h16"/>
      <path d="M95 103h10"/>
    `,
  },
  mic: {
    alt: {
      en: 'Line drawing of a small USB microphone on a stand, with its cable and plug, listening.',
      es: 'Dibujo a línea de un pequeño micrófono USB en su pie, con el cable y la clavija, escuchando.',
    },
    svg: `
      <ellipse cx="96" cy="118" rx="28" ry="5"/>
      <path d="M96 113V96"/>
      <path d="M80 62v18a16 16 0 0 0 32 0V62"/>
      <rect x="84" y="18" width="24" height="60" rx="12"/>
      <path class="f" d="M88 32h16M87 38h18M87 44h18M87 50h18M88 56h16"/>
      <path d="M84 64h24"/>
      <path class="a" d="M70 36q-5 12 0 24M60 30q-9 18 0 36M122 36q5 12 0 24M132 30q9 18 0 36"/>
      <path d="M121 118c14 0 18 6 32 6h8"/>
      <rect x="161" y="120" width="14" height="8" rx="1.5"/>
      <rect class="f" x="175" y="121.5" width="7" height="5"/>
    `,
  },
  speaker: {
    alt: {
      en: 'Line drawing of a speaker driver in its frame, with sound waves coming out.',
      es: 'Dibujo a línea de un altavoz en su marco, con ondas de sonido saliendo.',
    },
    svg: `
      <rect x="44" y="22" width="96" height="96" rx="12"/>
      <circle cx="54" cy="32" r="2"/><circle cx="130" cy="32" r="2"/><circle cx="54" cy="108" r="2"/><circle cx="130" cy="108" r="2"/>
      <circle cx="92" cy="70" r="40"/>
      <circle cx="92" cy="70" r="33"/>
      <circle class="f" cx="92" cy="70" r="24"/>
      <circle class="a" cx="92" cy="70" r="11"/>
      <path class="a" d="M152 52q9 18 0 36M162 44q14 26 0 52M172 36q19 34 0 68"/>
    `,
  },
  plug: {
    alt: {
      en: 'Line drawing of a smart plug in a wall socket, with its button and two holes.',
      es: 'Dibujo a línea de un enchufe inteligente en la toma de la pared, con su botón y dos orificios.',
    },
    svg: `
      <rect class="f" x="52" y="14" width="96" height="112" rx="10"/>
      <rect x="64" y="26" width="72" height="88" rx="22"/>
      <circle cx="100" cy="76" r="23"/>
      <circle cx="91" cy="76" r="3.2"/><circle cx="109" cy="76" r="3.2"/>
      <path d="M100 53v5M100 94v5"/>
      <circle class="a" cx="100" cy="38" r="4.5"/>
      <circle class="a" cx="100" cy="38" r="1"/>
    `,
  },
  blind: {
    alt: {
      en: 'Line drawing of a window with its roller blind half down and the motor in the box, wired to a relay hidden behind a wall switch.',
      es: 'Dibujo a línea de una ventana con la persiana a media altura y el motor en el cajón, conectado a un relé escondido detrás de un interruptor.',
    },
    svg: `
      <rect x="14" y="8" width="108" height="14" rx="2"/>
      <rect class="a" x="22" y="11.5" width="30" height="7" rx="3.5"/>
      <rect x="20" y="22" width="96" height="104"/>
      <path d="M20 30h96M20 37h96M20 44h96M20 51h96M20 58h96M20 65h96"/>
      <path class="f" d="M68 65v61M20 96h96"/>
      <rect x="150" y="40" width="40" height="40" rx="4"/>
      <rect x="160" y="48" width="20" height="24" rx="2"/>
      <path d="M160 60h20"/>
      <rect class="a" stroke-dasharray="3 2.5" x="156" y="90" width="28" height="20" rx="2"/>
      <circle class="a" cx="163" cy="104" r="1.4"/><circle class="a" cx="170" cy="104" r="1.4"/><circle class="a" cx="177" cy="104" r="1.4"/>
      <path class="a" stroke-dasharray="3 3" d="M156 100C138 100 138 15 122 15"/>
    `,
  },
  bulb: {
    alt: {
      en: 'Line drawing of a light bulb with its filament lit.',
      es: 'Dibujo a línea de una bombilla con el filamento encendido.',
    },
    svg: `
      <path d="M85 94c0-11-19-18-19-42a34 34 0 0 1 68 0c0 24-19 31-19 42z"/>
      <rect x="85" y="96" width="30" height="6" rx="2"/>
      <path d="M87 107h26M89 113h22"/>
      <path d="M93 117q7 7 14 0"/>
      <path class="a" d="M93 94V70M107 94V70M93 70q3.5-9 7 0t7 0"/>
      <path class="a" d="M100 4v7M58 18l5 5M142 18l-5 5M44 52h8M156 52h-8M56 88l5-4M144 88l-5-4"/>
    `,
  },
  projector: {
    alt: {
      en: 'Line drawing of a projector throwing a cone of light.',
      es: 'Dibujo a línea de un proyector lanzando un cono de luz.',
    },
    svg: `
      <path class="a" stroke-dasharray="3 4" d="M66 62L8 34M66 90L8 116"/>
      <path class="f" d="M8 34v82"/>
      <rect x="56" y="52" width="122" height="48" rx="10"/>
      <circle cx="84" cy="76" r="16"/>
      <circle class="a" cx="84" cy="76" r="8"/>
      <path d="M118 66h44M118 72h44M118 78h44M118 84h44"/>
      <circle cx="166" cy="60" r="2"/>
      <path d="M70 100v6M164 100v6"/>
      <path class="f" d="M40 108h160"/>
    `,
  },
  cast: {
    alt: {
      en: 'Line drawing of a small round speaker covered in fabric, with its lights on top.',
      es: 'Dibujo a línea de un altavoz pequeño y redondo forrado de tela, con sus luces arriba.',
    },
    svg: `
      <ellipse class="f" cx="100" cy="124" rx="40" ry="5"/>
      <path d="M70 30v82c0 5 13.4 9 30 9s30-4 30-9V30"/>
      <ellipse cx="100" cy="30" rx="30" ry="9"/>
      <circle class="a" cx="88" cy="30" r="1.6"/><circle class="a" cx="96" cy="31" r="1.6"/><circle class="a" cx="104" cy="31" r="1.6"/><circle class="a" cx="112" cy="30" r="1.6"/>
      <path class="f" d="M70 48c0 5 13.4 9 30 9s30-4 30-9M70 66c0 5 13.4 9 30 9s30-4 30-9M70 84c0 5 13.4 9 30 9s30-4 30-9M70 102c0 5 13.4 9 30 9s30-4 30-9"/>
      <path class="a" d="M142 50q7 14 0 28M150 44q11 20 0 40"/>
    `,
  },
  server: {
    alt: {
      en: 'Line drawing of a rack server: two units between the rack posts, with drive bays and status lights.',
      es: 'Dibujo a línea de un servidor en rack: dos unidades entre los postes, con bahías de discos y luces de estado.',
    },
    svg: `
      <path d="M18 12v118M182 12v118"/>
      <path class="f" d="M18 20h6M18 30h6M18 110h6M18 120h6M182 20h-6M182 30h-6M182 110h-6M182 120h-6"/>
      <rect class="f" stroke-dasharray="3 3" x="24" y="18" width="152" height="18" rx="2"/>
      <rect x="24" y="44" width="152" height="22" rx="2"/>
      <path d="M34 55h40"/>
      <path class="f" d="M110 50v10M116 50v10M122 50v10M128 50v10M134 50v10M140 50v10"/>
      <circle class="a" cx="158" cy="55" r="1.8"/><circle cx="166" cy="55" r="1.8"/>
      <rect x="24" y="74" width="152" height="22" rx="2"/>
      <rect x="32" y="79" width="16" height="12" rx="1"/><rect x="52" y="79" width="16" height="12" rx="1"/><rect x="72" y="79" width="16" height="12" rx="1"/><rect x="92" y="79" width="16" height="12" rx="1"/>
      <circle class="a" cx="158" cy="85" r="1.8"/><circle class="a" cx="166" cy="85" r="1.8"/>
      <rect x="14" y="76" width="10" height="18" rx="1"/><rect x="176" y="76" width="10" height="18" rx="1"/>
      <circle cx="19" cy="85" r="1.6"/><circle cx="181" cy="85" r="1.6"/>
      <rect class="f" stroke-dasharray="3 3" x="24" y="104" width="152" height="18" rx="2"/>
    `,
  },
};
