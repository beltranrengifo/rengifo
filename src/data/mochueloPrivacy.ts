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
export const mochueloPrivacyDate = '2026-11-27';

/** Each locale's address, trailing slash as Astro emits it. */
export const mochueloPrivacyPaths: Record<Locale, string> = {
  es: '/mochuelo/privacidad/',
  en: '/mochuelo/privacy/',
};

export const mochueloPrivacy: Record<Locale, PrivacyPolicy> = {
  es: {
    title: 'Política de privacidad de Mochuelo',
    description:
      'Política de privacidad de Mochuelo, el vigilabebés que conecta dos móviles por tu red WiFi o, fuera de casa, por la VPN que tú elijas.',
    updatedLabel: 'Última revisión',
    intro:
      'Mochuelo es un vigilabebés que conecta dos móviles: uno hace de cámara y el otro de visor. En casa usan la misma red WiFi; fuera de casa, solo un túnel privado que tú eliges y controlas.',
    sections: [
      {
        heading: 'Qué datos maneja la app y dónde quedan',
        items: [
          {
            term: 'Imagen y sonido.',
            text: 'El móvil cámara capta la imagen y el sonido de la habitación y los envía, cifrados, directamente al móvil visor emparejado. Solo van de la cámara al visor, nunca al revés. En casa viajan por tu red local. No pasan por ningún servidor nuestro y no se graban: lo único que se guarda es la foto que tú pidas.',
          },
          {
            term: 'Ver desde fuera de casa (opcional).',
            text: 'Si quieres ver la cámara fuera de casa, Mochuelo puede usar un túnel privado entre tus dos móviles que configuras tú: Tailscale, WireGuard u otra VPN. Ese servicio lo eliges y lo contratas tú. Si usas Tailscale, esa empresa pone en contacto a tus móviles y, cuando no pueden hablar directamente, reenvía el tráfico, pero el vídeo y el sonido viajan cifrados de un móvil al otro y no puede verlos. Su servicio sí ve datos de tus dispositivos, según su propia política de privacidad; Mochuelo no le envía nada. Mochuelo no abre puertos en tu router a internet, no usa servidores STUN ni TURN y no tiene servidores propios.',
          },
          {
            term: 'Cámara y micrófono.',
            text: 'Solo los usa el móvil que hace de cámara, mientras emite. El visor nunca usa la cámara ni el micrófono.',
          },
          {
            term: 'Fotos.',
            text: 'Si pulsas el botón de foto en el visor, la imagen que estás viendo se guarda solo en la galería de ese móvil. Mochuelo solo pide permiso para añadir fotos a la galería y no sube ninguna a ningún sitio.',
          },
          {
            term: 'Emparejamiento.',
            text: 'Al emparejar, los dos móviles comparten un secreto que se guarda solo en el almacenamiento seguro de cada móvil. Sirve para que solo tu visor pueda conectar con tu cámara.',
          },
          {
            term: 'Datos guardados en el móvil.',
            text: 'El nombre de la cámara, su última dirección en la red local, su dirección dentro de tu túnel privado si lo usas, el rol elegido y la hora de la última emisión se guardan solo en el propio móvil y nunca se envían a nadie.',
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
          {
            text: 'No se conecta a ningún servidor nuestro. Fuera de casa, solo a través de la VPN que tú hayas elegido y configurado.',
          },
        ],
      },
      {
        heading: 'Borrar los datos',
        body: 'Desinstalar la app borra todo lo que guarda. «Olvidar cámara» u «Olvidar visor» borran el emparejamiento. Las fotos que hayas hecho están en la galería del visor y se borran desde allí.',
      },
      {
        heading: 'Menores',
        body: 'Mochuelo es una app para madres, padres y cuidadores. No está dirigida a niños.',
      },
      {
        heading: 'Contacto',
        body: 'Para cualquier pregunta sobre esta política, escribe a beltran@rengifo.es.',
      },
    ],
  },
  en: {
    title: 'Mochuelo privacy policy',
    description:
      'Privacy policy of Mochuelo, the baby monitor that connects two phones over your WiFi network or, away from home, over the VPN you choose.',
    updatedLabel: 'Last updated',
    intro:
      'Mochuelo is a baby monitor that connects two phones: one acts as the camera and the other as the viewer. At home they use the same WiFi network; away from home, only a private tunnel that you choose and control.',
    sections: [
      {
        heading: 'What data the app handles and where it stays',
        items: [
          {
            term: 'Video and sound.',
            text: "The camera phone captures the room's video and sound and sends them, encrypted, straight to the paired viewer phone. They only go from the camera to the viewer, never the other way. At home they travel over your local network. They never go through any server of ours and are never recorded: the only thing saved is a photo you ask for.",
          },
          {
            term: 'Watching from outside home (optional).',
            text: 'If you want to watch the camera away from home, Mochuelo can use a private tunnel between your two phones that you set up yourself: Tailscale, WireGuard or another VPN. You choose and sign up for that service. If you use Tailscale, that company introduces your phones to each other and, when they cannot talk directly, relays the traffic, but video and sound travel encrypted from one phone to the other and it cannot see them. Its service does see information about your devices, under its own privacy policy; Mochuelo sends it nothing. Mochuelo opens no ports on your router to the internet, uses no STUN or TURN servers and has no servers of its own.',
          },
          {
            term: 'Camera and microphone.',
            text: 'Only the phone acting as the camera uses them, while it streams. The viewer never uses the camera or the microphone.',
          },
          {
            term: 'Photos.',
            text: "If you tap the photo button on the viewer, the picture you are watching is saved only to that phone's gallery. Mochuelo only asks for permission to add photos to the gallery and uploads none of them anywhere.",
          },
          {
            term: 'Pairing.',
            text: "When pairing, the two phones share a secret that is stored only in each phone's secure storage. It ensures that only your viewer can connect to your camera.",
          },
          {
            term: 'Data stored on the phone.',
            text: "The camera's name, its last local network address, its address inside your private tunnel if you use one, the chosen role and the time of the last stream are stored only on the phone and never sent to anyone.",
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
          {
            text: 'It does not connect to any server of ours. Away from home, only through the VPN you chose and set up.',
          },
        ],
      },
      {
        heading: 'Deleting data',
        body: 'Uninstalling the app deletes everything it stores. "Forget camera" or "Forget viewer" delete the pairing. Photos you took are in the viewer\'s gallery and are deleted from there.',
      },
      {
        heading: 'Children',
        body: 'Mochuelo is an app for parents and caregivers. It is not directed at children.',
      },
      {
        heading: 'Contact',
        body: 'For any question about this policy, write to beltran@rengifo.es.',
      },
    ],
  },
};
