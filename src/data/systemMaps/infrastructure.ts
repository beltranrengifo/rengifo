import type { SystemMap } from './types';

/**
 * The server behind my apps' backends, part by part: what reaches it from
 * the internet, what runs on it, where its copies go and how it gets back
 * home. Positions are in a 1000 × 600 map; on a phone the zones stack and
 * the nodes flow in this order instead.
 *
 * Generic by design: the apps are never named or counted (the instances and
 * the frontends are drawn as blank squares), there is no money, no provider
 * by name, and no addresses, hosts, ports or ids.
 */
export const infrastructure: SystemMap = {
  id: 'infrastructure',
  label: {
    en: 'Map of the infrastructure behind my apps, part by part',
    es: 'Mapa de la infraestructura de mis aplicaciones, pieza a pieza',
  },
  intro: {
    en: 'Where the backends of my apps live, and where their copies go. Choose any part to see what it is and what it talks to, or follow a path through it.',
    es: 'Dónde viven los backends de mis aplicaciones y adónde van sus copias. Elige una pieza para ver qué es y con qué habla, o sigue alguno de estos recorridos.',
  },
  size: { w: 1000, h: 600 },

  zones: [
    {
      id: 'internet',
      label: { en: 'On the internet', es: 'En internet' },
      box: { x: 10, y: 14, w: 214, h: 572 },
    },
    {
      id: 'tunnel',
      label: { en: 'A private network', es: 'Una red privada' },
      box: { x: 219, y: 494, w: 48, h: 52 },
      tunnel: true,
    },
    {
      id: 'vps',
      label: { en: 'On my VPS', es: 'En mi VPS' },
      box: { x: 262, y: 14, w: 452, h: 572 },
      host: 'vps',
    },
    {
      id: 'copies',
      label: { en: 'Copies and alerts', es: 'Copias y avisos' },
      box: { x: 738, y: 14, w: 252, h: 336 },
      outside: true,
    },
    {
      id: 'home',
      label: { en: 'At home', es: 'En casa' },
      box: { x: 738, y: 376, w: 252, h: 210 },
    },
  ],

  nodes: [
    // ── On the internet ─────────────────────────────────────────
    {
      id: 'browsers',
      zone: 'internet',
      label: { en: 'Browsers', es: 'Navegadores' },
      sub: { en: 'Anyone using an app', es: 'Cualquier usuario' },
      glyph: 'globe',
      body: {
        en: 'Whoever opens one of my apps, from anywhere. They only ever reach the apps: everything else on the server is closed to them.',
        es: 'Cualquiera que abra una de mis aplicaciones, desde donde sea. Solo llega a las aplicaciones: el resto del servidor está cerrado.',
      },
      tags: ['HTTPS'],
      at: { x: 117, y: 92 },
    },
    {
      id: 'frontends',
      zone: 'internet',
      label: { en: 'Frontends', es: 'Frontends' },
      sub: { en: 'On Vercel', es: 'En Vercel' },
      glyph: 'window',
      many: true,
      body: {
        en: 'Each app’s frontend stays on Vercel, on purpose: a CDN, previews and instant rollbacks that a server of my own would not beat. Only the backends moved, and the frontends point at their own Supabase on the VPS.',
        es: 'El frontend de cada aplicación sigue en Vercel a propósito: una CDN, previews y vuelta atrás al instante que un servidor propio no mejoraría. Solo se mudaron los backends, y cada frontend apunta a su propio Supabase en el VPS.',
      },
      tags: [
        'Vercel',
        { en: 'One per app', es: 'Uno por aplicación' },
        'supabase-js',
      ],
      at: { x: 117, y: 200 },
    },
    {
      id: 'esp32',
      zone: 'internet',
      label: { en: 'ESP32 devices', es: 'Dispositivos ESP32' },
      sub: { en: 'Sensors', es: 'Sensores' },
      glyph: 'antenna',
      drawing: 'esp32',
      body: {
        en: 'Small boards out in the world that send their readings straight to their app’s Supabase, over HTTPS. When the backend moved, they switched over the air, with a firmware update.',
        es: 'Placas pequeñas, ahí fuera, que mandan sus lecturas directamente al Supabase de su aplicación, por HTTPS. Cuando se mudó el backend, se pasaron a distancia, con una actualización de firmware.',
      },
      tags: ['ESP32', 'OTA', 'HTTPS'],
      at: { x: 117, y: 330 },
    },
    {
      id: 'laptop',
      zone: 'internet',
      label: { en: 'My laptop', es: 'Mi portátil' },
      sub: { en: 'On Tailscale', es: 'En Tailscale' },
      glyph: 'laptop',
      drawing: 'laptop',
      body: {
        en: 'Where I run it all from. It reaches the server only through Tailscale: SSH and the panels, and nothing else.',
        es: 'Desde aquí lo administro todo. Al servidor solo llega por Tailscale: el SSH y los paneles, y nada más.',
      },
      tags: ['Tailscale', 'SSH'],
      at: { x: 100, y: 520 },
    },

    // ── A private network ───────────────────────────────────────
    {
      id: 'tailscale',
      zone: 'tunnel',
      label: { en: 'Tailscale', es: 'Tailscale' },
      sub: { en: 'VPN', es: 'VPN' },
      glyph: 'tunnel',
      body: {
        en: 'A private network between my own devices and the server. SSH and the panels answer only here, so all the internet sees is the apps. Tailscale SSH lets me in by identity, with no keys to copy around.',
        es: 'Una red privada entre mis aparatos y el servidor. El SSH y los paneles solo responden aquí, así que desde internet solo se ven las aplicaciones. Con Tailscale SSH entro por identidad, sin ir copiando claves.',
      },
      tags: [
        'Tailscale',
        'Tailscale SSH',
        {
          en: 'Admin closed to the internet',
          es: 'Administración cerrada a internet',
        },
      ],
      at: { x: 243, y: 520 },
    },

    // ── On my VPS ───────────────────────────────────────────────
    {
      id: 'vps',
      zone: 'vps',
      label: { en: 'My VPS', es: 'Mi VPS' },
      sub: { en: 'ARM · Coolify', es: 'ARM · Coolify' },
      glyph: 'server',
      drawing: 'server',
      body: {
        en: 'One ARM VPS for every backend. A machine of my own instead of a managed project per app: cheaper by design, and a new app is one more instance on it, with plenty of room left to grow. The provider keeps snapshots of the whole server.',
        es: 'Un solo VPS ARM para todos los backends. Una máquina propia en lugar de un proyecto gestionado por aplicación: más barato de entrada, y una aplicación nueva es una instancia más, con sitio de sobra para crecer. El proveedor guarda copias del servidor entero.',
      },
      tags: ['VPS', 'ARM', 'Docker', 'Coolify'],
    },
    {
      id: 'traefik',
      zone: 'vps',
      label: { en: 'Traefik', es: 'Traefik' },
      sub: { en: 'HTTPS', es: 'HTTPS' },
      glyph: 'route',
      body: {
        en: 'The server’s only door to the internet. It serves every app over HTTPS, with certificates that renew themselves, and hands each request to the app it is for.',
        es: 'La única puerta del servidor a internet. Sirve cada aplicación por HTTPS, con certificados que se renuevan solos, y pasa cada petición a la aplicación que le toca.',
      },
      tags: ['Traefik', 'Let’s Encrypt', 'TLS'],
      at: { x: 380, y: 150 },
    },
    {
      id: 'supabase',
      zone: 'vps',
      label: { en: 'Supabase', es: 'Supabase' },
      sub: { en: 'One per app', es: 'Uno por aplicación' },
      glyph: 'db',
      many: true,
      body: {
        en: 'Every app gets a Supabase of its own, self-hosted from one trimmed template. Each instance runs only the services its app uses, and one app’s users and tokens are never valid in another. A new app is one more instance on the same machine, and its code doesn’t change: only the URL and the keys.',
        es: 'Cada aplicación tiene su propio Supabase, autoalojado a partir de una plantilla recortada. Cada instancia levanta solo los servicios que usa su aplicación, y los usuarios y tokens de una nunca valen en otra. Una aplicación nueva es una instancia más en la misma máquina, y su código no cambia: solo la URL y las claves.',
      },
      tags: [
        'Postgres 17',
        'Auth',
        'Storage',
        { en: 'Trimmed template', es: 'Plantilla recortada' },
      ],
      at: { x: 600, y: 110 },
    },
    {
      id: 'app',
      zone: 'vps',
      label: { en: 'App container', es: 'Contenedor' },
      sub: { en: 'Built from its repo', es: 'Desde su repositorio' },
      glyph: 'box',
      body: {
        en: 'One app’s own backend, moved here from its old host. Coolify builds it from its GitHub repo on every push and runs it as a container, next to its Supabase.',
        es: 'El backend de una de las aplicaciones, que se mudó aquí desde su antiguo alojamiento. Coolify lo construye desde su repositorio de GitHub con cada push y lo levanta como contenedor, junto a su Supabase.',
      },
      tags: [
        'Docker',
        'GitHub',
        { en: 'Deploys on push', es: 'Despliegue con cada push' },
      ],
      at: { x: 600, y: 220 },
    },
    {
      id: 'embeddings',
      zone: 'vps',
      label: { en: 'Embeddings', es: 'Embeddings' },
      sub: { en: 'ONNX Runtime', es: 'ONNX Runtime' },
      glyph: 'vector',
      body: {
        en: 'Turns text into vectors for one of the apps. When the hosted inference it relied on stopped answering, the same model moved here: identical vectors, behind a token.',
        es: 'Convierte texto en vectores para una de las aplicaciones. Cuando dejó de responder la inferencia alojada de la que dependía, el mismo modelo se vino aquí: vectores idénticos, detrás de un token.',
      },
      tags: [
        'Python',
        'ONNX Runtime',
        { en: 'Same model', es: 'El mismo modelo' },
      ],
      at: { x: 600, y: 320 },
    },
    {
      id: 'coolify',
      zone: 'vps',
      label: { en: 'Coolify', es: 'Coolify' },
      sub: { en: 'Deploys and copies', es: 'Despliega y copia' },
      glyph: 'panel',
      body: {
        en: 'The panel the whole server runs on: it deploys every service, dumps every database each night and tells my phone when something fails. It updates itself, and it is never open to the internet, only over Tailscale.',
        es: 'El panel sobre el que funciona todo el servidor: despliega cada servicio, vuelca cada base de datos todas las noches y me avisa al móvil si algo falla. Se actualiza solo, y nunca está abierto a internet: solo por Tailscale.',
      },
      tags: [
        'Coolify',
        'Docker',
        { en: 'Auto-updates', es: 'Actualizaciones automáticas' },
        '2FA',
      ],
      at: { x: 380, y: 390 },
    },
    {
      id: 'kuma',
      zone: 'vps',
      label: { en: 'Uptime Kuma', es: 'Uptime Kuma' },
      sub: { en: 'Monitoring', es: 'Monitorización' },
      glyph: 'pulse',
      body: {
        en: 'Checks every site and every Supabase from the server itself, and alerts my phone when one goes down. The copy at home checks in with it every day; if it goes quiet, that is an alert too. Its panel, like the rest, only over Tailscale.',
        es: 'Comprueba cada web y cada Supabase desde el propio servidor, y me avisa al móvil si alguno se cae. La copia de casa se reporta cada día; si deja de hacerlo, también salta un aviso. Su panel, como el resto, solo por Tailscale.',
      },
      tags: ['Uptime Kuma', { en: 'Push monitor', es: 'Monitor push' }],
      at: { x: 600, y: 470 },
    },

    // ── Copies and alerts ───────────────────────────────────────
    {
      id: 'b2',
      zone: 'copies',
      label: { en: 'Backblaze B2', es: 'Backblaze B2' },
      sub: { en: 'Every night', es: 'Cada noche' },
      glyph: 'bucket',
      body: {
        en: 'Off the server, every night: a dump of each app’s Postgres and its Storage files, kept for 30 days. Restores tested.',
        es: 'Fuera del servidor, cada noche: un volcado del Postgres de cada aplicación y sus archivos de Storage, guardados 30 días. Las restauraciones, probadas.',
      },
      tags: [
        'Backblaze B2',
        'pg_dump',
        'rclone',
        { en: '30 days', es: '30 días' },
      ],
      at: { x: 864, y: 90 },
    },
    {
      id: 'snapshots',
      zone: 'copies',
      label: { en: 'Server snapshots', es: 'Copias del servidor' },
      sub: { en: 'By the VPS provider', es: 'Del proveedor del VPS' },
      glyph: 'snapshot',
      body: {
        en: 'The VPS provider’s own backups of the whole server: a second layer that doesn’t depend on anything running on it.',
        es: 'Las copias del servidor entero que hace el propio proveedor del VPS: una segunda capa que no depende de nada de lo que corre en él.',
      },
      tags: [{ en: 'Whole server', es: 'Servidor entero' }],
      at: { x: 864, y: 190 },
    },
    {
      id: 'phone',
      zone: 'copies',
      label: { en: 'My phone', es: 'Mi móvil' },
      sub: { en: 'Alerts', es: 'Avisos' },
      glyph: 'phone',
      drawing: 'phone',
      body: {
        en: 'Where the alerts land: a site or an instance down, a failed deploy, and the copy at home, with a quiet OK or a failure that rings.',
        es: 'Donde llegan los avisos: una web o una instancia caída, un despliegue que falla, y la copia de casa, con un OK silencioso o un fallo que suena.',
      },
      tags: ['ntfy', 'Telegram'],
      at: { x: 864, y: 290 },
    },

    // ── At home ─────────────────────────────────────────────────
    {
      id: 'pi',
      zone: 'home',
      label: { en: 'Raspberry Pi', es: 'Raspberry Pi' },
      sub: { en: 'Pulls the copies', es: 'Se trae las copias' },
      glyph: 'board',
      drawing: 'pi',
      body: {
        en: 'Every morning it pulls everything in B2 with a read-only key: it reaches out, and nothing on the server can reach it. It also keeps a mirror of every one of my GitHub repos. Then it hands it all to restic, on the NAS, and reports how it went.',
        es: 'Cada mañana se baja todo lo que hay en B2 con una clave de solo lectura: es ella la que va a buscarlo, y nada del servidor puede llegar hasta ella. También guarda un espejo de cada uno de mis repositorios de GitHub. Después se lo pasa todo a restic, en el NAS, y avisa de cómo ha ido.',
      },
      tags: [
        'Raspberry Pi',
        'rclone',
        'restic',
        { en: 'Read-only key', es: 'Clave de solo lectura' },
        { en: 'GitHub mirrors', es: 'Espejos de GitHub' },
      ],
      at: { x: 864, y: 440 },
    },
    {
      id: 'nas',
      zone: 'home',
      label: { en: 'NAS', es: 'NAS' },
      sub: { en: 'Encrypted copy', es: 'Copia cifrada' },
      glyph: 'nas',
      drawing: 'nas',
      body: {
        en: 'The third copy, encrypted and versioned with restic, out of reach of anyone who gets into the server. Full restores tested, of the databases and of every repo.',
        es: 'La tercera copia, cifrada y con versiones gracias a restic, fuera del alcance de quien entre en el servidor. Restauraciones completas probadas, de las bases de datos y de cada repositorio.',
      },
      tags: [
        'restic',
        { en: 'Encrypted', es: 'Cifrada' },
        { en: 'Versioned', es: 'Con versiones' },
      ],
      at: { x: 864, y: 530 },
    },
  ],

  edges: [
    // From the internet, only the apps
    {
      from: 'browsers',
      to: 'frontends',
      kind: 'https',
      label: { en: 'the app', es: 'la aplicación' },
    },
    {
      from: 'browsers',
      to: 'traefik',
      kind: 'https',
      label: {
        en: 'an app served from here',
        es: 'una aplicación servida desde aquí',
      },
    },
    {
      from: 'frontends',
      to: 'traefik',
      kind: 'https',
      label: { en: 'data and sign-in', es: 'datos y acceso' },
    },
    {
      from: 'esp32',
      to: 'traefik',
      kind: 'https',
      label: { en: 'readings', es: 'lecturas' },
    },
    // Inside the server
    {
      from: 'traefik',
      to: 'supabase',
      kind: 'local',
      label: { en: 'each app to its own', es: 'cada aplicación al suyo' },
    },
    {
      from: 'traefik',
      to: 'app',
      kind: 'local',
      label: { en: 'its requests', es: 'sus peticiones' },
    },
    {
      from: 'traefik',
      to: 'embeddings',
      kind: 'local',
      label: { en: 'with a token', es: 'con un token' },
    },
    {
      from: 'coolify',
      to: 'supabase',
      kind: 'local',
      label: { en: 'runs and dumps each one', es: 'levanta y vuelca cada uno' },
    },
    {
      from: 'coolify',
      to: 'app',
      kind: 'local',
      label: {
        en: 'builds it on every push',
        es: 'lo construye con cada push',
      },
    },
    {
      from: 'coolify',
      to: 'embeddings',
      kind: 'local',
      label: { en: 'runs it', es: 'lo levanta' },
    },
    // The only way in for me
    {
      from: 'laptop',
      to: 'tailscale',
      kind: 'tailscale',
      label: { en: 'SSH · the panels', es: 'SSH · los paneles' },
    },
    {
      from: 'tailscale',
      to: 'coolify',
      kind: 'tailscale',
      label: { en: 'the panel', es: 'el panel' },
    },
    {
      from: 'tailscale',
      to: 'kuma',
      kind: 'tailscale',
      label: { en: 'its panel', es: 'su panel' },
    },
    // Copies, all the way home
    {
      from: 'supabase',
      to: 'b2',
      kind: 'backup',
      label: { en: 'every night', es: 'cada noche' },
    },
    {
      from: 'b2',
      to: 'pi',
      kind: 'backup',
      label: { en: 'read-only key', es: 'clave de solo lectura' },
    },
    {
      from: 'pi',
      to: 'nas',
      kind: 'backup',
      label: { en: 'encrypted, with restic', es: 'cifrada, con restic' },
    },
    // Alerts
    {
      from: 'pi',
      to: 'kuma',
      kind: 'tailscale',
      label: { en: 'checks in every day', es: 'se reporta cada día' },
    },
    {
      from: 'kuma',
      to: 'phone',
      kind: 'https',
      label: { en: 'alerts', es: 'avisos' },
    },
    {
      from: 'pi',
      to: 'phone',
      kind: 'https',
      label: { en: 'OK, or a failure', es: 'OK, o un fallo' },
    },
  ],

  walkthroughs: [
    {
      id: 'request',
      title: {
        en: 'A request from an app',
        es: 'Una petición de una aplicación',
      },
      steps: [
        {
          nodes: ['browsers', 'frontends'],
          caption: {
            en: 'Someone opens one of my apps: the page comes from Vercel.',
            es: 'Alguien abre una de mis aplicaciones: la página llega desde Vercel.',
          },
        },
        {
          nodes: ['frontends', 'traefik'],
          caption: {
            en: 'Its calls for data go to the VPS, where Traefik takes them over HTTPS.',
            es: 'Sus llamadas a los datos van al VPS, y Traefik las recibe por HTTPS.',
          },
        },
        {
          nodes: ['traefik', 'supabase'],
          caption: {
            en: 'Each one reaches only that app’s own Supabase: its users, its data, its files.',
            es: 'Cada una llega solo al Supabase de esa aplicación: sus usuarios, sus datos, sus archivos.',
          },
        },
      ],
    },
    {
      id: 'nightly',
      title: {
        en: 'The nightly copy, all the way home',
        es: 'La copia de cada noche, hasta casa',
      },
      steps: [
        {
          nodes: ['coolify', 'supabase'],
          caption: {
            en: 'Every night, Coolify dumps each app’s Postgres.',
            es: 'Cada noche, Coolify vuelca el Postgres de cada aplicación.',
          },
        },
        {
          nodes: ['supabase', 'b2'],
          caption: {
            en: 'The dumps and the Storage files leave the server for Backblaze B2.',
            es: 'Los volcados y los archivos de Storage salen del servidor hacia Backblaze B2.',
          },
        },
        {
          nodes: ['b2', 'pi'],
          caption: {
            en: 'In the morning, the Pi at home pulls it all with a read-only key.',
            es: 'Por la mañana, la Pi de casa se lo baja todo con una clave de solo lectura.',
          },
        },
        {
          nodes: ['pi', 'nas'],
          caption: {
            en: 'Encrypted with restic, on the NAS: out of reach of anyone who gets into the server.',
            es: 'Cifrado con restic, en el NAS: fuera del alcance de quien entre en el servidor.',
          },
        },
        {
          nodes: ['pi', 'kuma', 'phone'],
          caption: {
            en: 'And it reports back: a quiet OK, or an alert that rings.',
            es: 'Y da parte: un OK silencioso, o un aviso que suena.',
          },
        },
      ],
    },
    {
      id: 'admin',
      title: { en: 'Administering it', es: 'Administrarlo' },
      steps: [
        {
          nodes: ['laptop', 'tailscale'],
          caption: {
            en: 'From my laptop, the way in is Tailscale, a private network.',
            es: 'Desde mi portátil, se entra por Tailscale, una red privada.',
          },
        },
        {
          nodes: ['tailscale', 'coolify', 'kuma'],
          caption: {
            en: 'SSH and the panels only answer there.',
            es: 'El SSH y los paneles solo responden ahí.',
          },
        },
        {
          nodes: ['browsers', 'traefik'],
          caption: {
            en: 'From the internet, only the apps answer. Nothing else is open.',
            es: 'Desde internet solo responden las aplicaciones. No hay nada más abierto.',
          },
        },
      ],
    },
    {
      id: 'newapp',
      title: { en: 'A new app', es: 'Una aplicación nueva' },
      steps: [
        {
          nodes: ['coolify', 'supabase'],
          grows: ['supabase'],
          caption: {
            en: 'A new app is one more Supabase, from the trimmed template, on the same machine.',
            es: 'Una aplicación nueva es un Supabase más, a partir de la plantilla recortada, en la misma máquina.',
          },
        },
        {
          nodes: ['traefik', 'supabase'],
          caption: {
            en: 'Traefik gives it an address of its own, with HTTPS from the first day.',
            es: 'Traefik le da su propia dirección, con HTTPS desde el primer día.',
          },
        },
        {
          nodes: ['supabase', 'b2'],
          caption: {
            en: 'Its nightly copies are set up along with it.',
            es: 'Sus copias de cada noche quedan programadas desde el principio.',
          },
        },
        {
          nodes: ['frontends', 'traefik', 'supabase'],
          grows: ['frontends'],
          caption: {
            en: 'Its frontend goes on Vercel and points here. Nothing else changes.',
            es: 'Su frontend va a Vercel y apunta aquí. No cambia nada más.',
          },
        },
      ],
    },
  ],

  offline: {
    label: { en: 'If the server dies', es: 'Si se cae el servidor' },
    glyph: 'server',
    note: {
      en: 'If the server dies, the apps stop with it, but their data survives: last night’s copies are in Backblaze B2, the provider keeps snapshots of the whole server, and the NAS at home has its own encrypted copy.',
      es: 'Si se cae el servidor, las aplicaciones se paran con él, pero sus datos siguen a salvo: las copias de anoche están en Backblaze B2, el proveedor guarda copias del servidor entero y el NAS de casa tiene la suya, cifrada.',
    },
    keep: ['b2', 'snapshots', 'pi', 'nas'],
    lose: ['vps', 'tunnel'],
  },
};
