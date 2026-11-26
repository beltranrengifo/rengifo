import type { Locale } from '../lib/i18n';

/**
 * The privacy policy of Mochuelo, a local-network baby monitor, linked from
 * Google Play and the App Store. The source of truth is
 * `docs/politica-privacidad.md` in the Mochuelo repository: keep the two in
 * step. Unlike the rest of the site, each language has its own slug, so the
 * Spanish page can live at the address the stores already know.
 */

export interface PrivacyItem {
  /** The bold lead-in, when the point has one. */
  term?: string;
  text: string;
}

export interface PrivacySection {
  heading: string;
  body?: string;
  items?: PrivacyItem[];
}

export interface PrivacyPolicy {
  title: string;
  description: string;
  updatedLabel: string;
  intro: string;
  sections: PrivacySection[];
}

/** When this version took effect (ISO date). */
export const mochueloPrivacyDate = '2026-11-26';

/** Each locale's address, trailing slash as Astro emits it. */
export const mochueloPrivacyPaths: Record<Locale, string> = {
  es: '/mochuelo/privacidad/',
  en: '/mochuelo/privacy/',
};

export const mochueloPrivacy: Record<Locale, PrivacyPolicy> = {
  es: {
    title: 'Política de privacidad de Mochuelo',
    description:
      'Política de privacidad de Mochuelo, el vigilabebés que conecta dos móviles de la misma red WiFi.',
    updatedLabel: 'Última revisión',
    intro:
      'Mochuelo es un vigilabebés que conecta dos móviles de la misma red WiFi: uno hace de cámara y el otro de visor.',
    sections: [
      {
        heading: 'Qué datos maneja la app y dónde quedan',
        items: [
          {
            term: 'Imagen y sonido.',
            text: 'El móvil cámara capta la imagen y el sonido de la habitación y los envía, cifrados, directamente al móvil visor emparejado por la red local. No pasan por ningún servidor, no salen de tu red y no se graban ni se guardan en ningún sitio.',
          },
          {
            term: 'Cámara y micrófono.',
            text: 'Solo los usa el móvil que hace de cámara, mientras emite. El visor nunca usa la cámara ni el micrófono.',
          },
          {
            term: 'Emparejamiento.',
            text: 'Al emparejar, los dos móviles comparten un secreto que se guarda solo en el almacenamiento seguro de cada móvil. Sirve para que solo tu visor pueda conectar con tu cámara.',
          },
          {
            term: 'Datos guardados en el móvil.',
            text: 'El nombre de la cámara, su última dirección en la red local, el rol elegido y la hora de la última emisión se guardan solo en el propio móvil y nunca se envían a nadie.',
          },
          {
            term: 'Notificaciones.',
            text: 'Son locales: las genera el propio móvil. No se usa ningún servicio de notificaciones remotas.',
          },
        ],
      },
      {
        heading: 'Qué no hace Mochuelo',
        items: [
          { text: 'No tiene cuentas ni registro.' },
          { text: 'No recoge, vende ni comparte datos personales.' },
          { text: 'No usa analítica, publicidad ni rastreo.' },
          { text: 'No se conecta a ningún servidor nuestro ni de terceros.' },
        ],
      },
      {
        heading: 'Borrar los datos',
        body: 'Desinstalar la app borra todo lo que guarda. «Olvidar cámara» u «Olvidar visor» borran el emparejamiento.',
      },
      {
        heading: 'Menores',
        body: 'Mochuelo es una app para madres, padres y cuidadores. No está dirigida a niños.',
      },
      {
        heading: 'Contacto',
        // TODO: the contact address is still to be decided.
        body: '[correo de contacto]',
      },
    ],
  },
  en: {
    title: 'Mochuelo privacy policy',
    description:
      'Privacy policy of Mochuelo, the baby monitor that connects two phones on the same WiFi network.',
    updatedLabel: 'Last updated',
    intro:
      'Mochuelo is a baby monitor that connects two phones on the same WiFi network: one acts as the camera and the other as the viewer.',
    sections: [
      {
        heading: 'What data the app handles and where it stays',
        items: [
          {
            term: 'Video and sound.',
            text: "The camera phone captures the room's video and sound and sends them, encrypted, straight to the paired viewer phone over your local network. They never go through any server, never leave your network, and are never recorded or stored.",
          },
          {
            term: 'Camera and microphone.',
            text: 'Only the phone acting as the camera uses them, while it streams. The viewer never uses the camera or the microphone.',
          },
          {
            term: 'Pairing.',
            text: "When pairing, the two phones share a secret that is stored only in each phone's secure storage. It ensures that only your viewer can connect to your camera.",
          },
          {
            term: 'Data stored on the phone.',
            text: "The camera's name, its last local network address, the chosen role and the time of the last stream are stored only on the phone and never sent to anyone.",
          },
          {
            term: 'Notifications.',
            text: 'They are local, created by the phone itself. No remote notification service is used.',
          },
        ],
      },
      {
        heading: 'What Mochuelo does not do',
        items: [
          { text: 'No accounts or sign-up.' },
          { text: 'It does not collect, sell or share personal data.' },
          { text: 'No analytics, advertising or tracking.' },
          { text: "It does not connect to any server, ours or anyone else's." },
        ],
      },
      {
        heading: 'Deleting data',
        body: 'Uninstalling the app deletes everything it stores. "Forget camera" or "Forget viewer" delete the pairing.',
      },
      {
        heading: 'Children',
        body: 'Mochuelo is an app for parents and caregivers. It is not directed at children.',
      },
      {
        heading: 'Contact',
        // TODO: the contact address is still to be decided.
        body: '[contact email]',
      },
    ],
  },
};
