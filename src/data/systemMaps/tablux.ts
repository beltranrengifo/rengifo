import type { SystemMap } from './types';

/**
 * Tablux, part by part: the wall and the house's devices, the app on my own
 * VPS, and the services around it. Positions are in a 1000 × 600 map; on a
 * phone the zones stack and the nodes flow in this order instead.
 *
 * Private by design: no names, hosts, addresses, networks or wake phrase.
 */
export const tablux: SystemMap = {
  id: 'tablux',
  label: {
    en: 'Map of Tablux, part by part',
    es: 'Mapa de Tablux, pieza a pieza',
  },
  size: { w: 1000, h: 600 },

  zones: [
    {
      id: 'home',
      label: { en: 'At home', es: 'En casa' },
      box: { x: 10, y: 14, w: 530, h: 572 },
    },
    {
      id: 'wall',
      label: { en: 'On the wall', es: 'En la pared' },
      box: { x: 222, y: 62, w: 306, h: 330 },
      parent: 'home',
      host: 'wall',
    },
    {
      id: 'cloud',
      label: { en: 'On my VPS', es: 'En mi VPS' },
      box: { x: 566, y: 14, w: 206, h: 400 },
      host: 'server',
    },
    {
      id: 'training',
      label: { en: 'Training', es: 'Entrenamiento' },
      box: { x: 566, y: 446, w: 206, h: 140 },
    },
    {
      id: 'services',
      label: { en: 'Outside services', es: 'Servicios externos' },
      box: { x: 796, y: 14, w: 194, h: 572 },
    },
  ],

  nodes: [
    // ── On the wall ─────────────────────────────────────────────
    {
      id: 'wall',
      zone: 'wall',
      label: { en: 'The wall', es: 'La pared' },
      sub: { en: 'HiPOS · RK3288', es: 'HiPOS · RK3288' },
      glyph: 'screen',
      drawing: 'wall',
      body: {
        en: 'A HiPOS point-of-sale screen that was headed for the bin, now hung on the wall. A 15.6-inch panel on a Rockchip RK3288 with 2 GB of memory, running a Linux made for it: my own device tree, my own U-Boot and Linux 6.18 on Armbian, with Phosh on top for fingers. It is also the house’s ears, its speaker and its bridge to every device.',
        es: 'Un TPV HiPOS que iba a la basura y ahora cuelga de la pared. Pantalla de 15,6 pulgadas y placa Rockchip RK3288 con 2 GB de memoria, con un Linux hecho a su medida: device tree y U-Boot propios, Linux 6.18 sobre Armbian y Phosh encima para usarlo con los dedos. Además es el oído de la casa, su altavoz y el puente hacia todos los aparatos.',
      },
      tags: ['RK3288', '2 GB', 'Linux 6.18', 'U-Boot', 'Armbian', 'Phosh'],
    },
    {
      id: 'kiosk',
      zone: 'wall',
      label: { en: 'Kiosk browser', es: 'Navegador' },
      sub: { en: 'Chromium', es: 'Chromium · quiosco' },
      glyph: 'window',
      body: {
        en: 'Chromium opens the app full screen as soon as the wall starts, with nothing around it. It is the same PWA every other screen runs; the wall only adds what needs a body: a speaker, a microphone and the bridge.',
        es: 'Chromium abre la aplicación a pantalla completa en cuanto arranca la pared, sin nada alrededor. Es la misma PWA que usan las demás pantallas; la pared solo pone lo que necesita un cuerpo: altavoz, micrófono y puente.',
      },
      tags: ['Chromium', 'PWA', 'Phosh'],
      at: { x: 377, y: 135 },
    },
    {
      id: 'listener',
      zone: 'wall',
      label: { en: 'Listening', es: 'Escucha' },
      sub: { en: 'On the device', es: 'En el aparato' },
      glyph: 'mic',
      drawing: 'mic',
      body: {
        en: 'A wake-word model of my own, trained on Runpod. On the wall it listens through a small USB microphone, in a process of its own; on the tablets, through their microphone, in a WASM engine inside the browser. The same detector hears two or three claps. All of it happens on the device itself.',
        es: 'Un modelo de palabra de activación propio, entrenado en Runpod. En la pared escucha por un pequeño micrófono USB, en un proceso aparte; en las tablets, por su micrófono, con un motor en WASM dentro del navegador. El mismo detector reconoce dos o tres palmadas. Todo pasa en el propio aparato.',
      },
      tags: [
        { en: 'Own model', es: 'Modelo propio' },
        'Runpod',
        'WASM',
        { en: 'USB microphone', es: 'Micrófono USB' },
      ],
      at: { x: 298, y: 228 },
    },
    {
      id: 'speaker',
      zone: 'wall',
      label: { en: 'Speaker', es: 'Altavoz' },
      sub: { en: 'Music · voice', es: 'Música · voz' },
      glyph: 'speaker',
      drawing: 'speaker',
      body: {
        en: 'The wall’s own speaker. It is a Spotify Connect device like any other, so music reaches it from any phone, and it is where the assistant speaks. If the internet drops, an offline Piper voice on the wall takes over.',
        es: 'El altavoz de la propia pared. Es un dispositivo de Spotify Connect como cualquier otro, así que se le manda música desde cualquier móvil, y es por donde habla el asistente. Si se cae internet, toma el relevo una voz de Piper que vive en la pared.',
      },
      tags: [
        'Spotify Connect',
        { en: 'Offline Piper', es: 'Piper sin conexión' },
      ],
      at: { x: 456, y: 228 },
    },
    {
      id: 'bridge',
      zone: 'wall',
      label: { en: 'Home bridge', es: 'Puente doméstico' },
      sub: { en: 'Node · Hono', es: 'Node · Hono' },
      glyph: 'bridge',
      body: {
        en: 'A small Node service on the wall, and the only part of Tablux that has to be at home. It talks to every device over the local network with local keys, never through the makers’ clouds, and runs the routines — at a set time, by the sun or with two or three claps — so they keep working without internet.',
        es: 'Un pequeño servicio en Node que corre en la pared, y la única parte de Tablux que tiene que estar en casa. Habla con cada aparato por la red local, con claves locales y sin pasar por la nube de ningún fabricante. También lanza las rutinas —a una hora, con el sol o con dos o tres palmadas—, así que siguen funcionando sin internet.',
      },
      tags: [
        'Node',
        'Hono',
        { en: 'Local network', es: 'Red local' },
        { en: 'Routines', es: 'Rutinas' },
        { en: 'Works offline', es: 'Funciona sin red' },
      ],
      at: { x: 377, y: 322 },
    },

    // ── Around the house ────────────────────────────────────────
    {
      id: 'plugs',
      zone: 'home',
      label: { en: 'Plugs', es: 'Enchufes' },
      sub: { en: 'Tuya · Smart Life', es: 'Tuya · Smart Life' },
      glyph: 'plug',
      drawing: 'plug',
      body: {
        en: 'Wi-Fi plugs for lamps and appliances. The bridge speaks their protocol on the local network, with each plug’s own key. «Encender durante» leaves one on for a while, and it switches itself off.',
        es: 'Enchufes wifi para lámparas y aparatos. El puente habla su protocolo por la red local, con la clave de cada uno. «Encender durante» deja uno encendido un rato, y luego se apaga solo.',
      },
      tags: ['Tuya', 'Smart Life', { en: 'Local keys', es: 'Claves locales' }],
      at: { x: 112, y: 100 },
    },
    {
      id: 'bulbs',
      zone: 'home',
      label: { en: 'Bulbs', es: 'Bombillas' },
      sub: { en: 'Smart Life · Shelly', es: 'Smart Life · Shelly' },
      glyph: 'bulb',
      drawing: 'bulb',
      body: {
        en: 'Colour bulbs from two makers, dimmed and recoloured from any screen, by voice or by a routine. The bridge reaches each one on the local network in its maker’s own protocol.',
        es: 'Bombillas de color de dos marcas, que se regulan y cambian de color desde cualquier pantalla, con la voz o con una rutina. El puente llega a cada una por la red local, con el protocolo de su fabricante.',
      },
      tags: ['Smart Life', 'Shelly', { en: 'Colour', es: 'Color' }],
      at: { x: 112, y: 196 },
    },
    {
      id: 'blinds',
      zone: 'home',
      label: { en: 'Blinds and lights', es: 'Persianas y luces' },
      sub: { en: 'Shelly', es: 'Shelly' },
      glyph: 'blind',
      drawing: 'blind',
      body: {
        en: 'Shelly relays tucked behind the wall switches drive the blinds’ motors and the ceiling lights, through their local API. Each blind can go up and down by the sun or at a set time.',
        es: 'Relés Shelly escondidos tras los interruptores mueven los motores de las persianas y encienden las luces del techo, a través de su API local. Cada persiana puede subir y bajar con el sol o a una hora fija.',
      },
      tags: [
        'Shelly',
        { en: 'Local RPC', es: 'RPC local' },
        { en: 'By the sun', es: 'Con el sol' },
      ],
      at: { x: 112, y: 292 },
    },
    {
      id: 'projector',
      zone: 'home',
      label: { en: 'Projector', es: 'Proyector' },
      sub: { en: 'Android TV', es: 'Android TV' },
      glyph: 'projector',
      drawing: 'projector',
      body: {
        en: 'The living-room projector, an Android TV. The bridge speaks its remote-control protocol itself, with no library, to switch it off, set the volume or open an app, and sends it Spotify over Cast.',
        es: 'El proyector del salón, un Android TV. El puente habla él mismo su protocolo de mando a distancia, sin librerías, para apagarlo, subir o bajar el volumen o abrir una aplicación, y le manda Spotify por Cast.',
      },
      tags: [
        'Android TV',
        'Cast',
        { en: 'Own protocol code', es: 'Protocolo propio' },
      ],
      at: { x: 112, y: 388 },
    },
    {
      id: 'cast',
      zone: 'home',
      label: { en: 'Cast speakers', es: 'Altavoces Cast' },
      sub: { en: 'Spotify Connect', es: 'Spotify Connect' },
      glyph: 'cast',
      drawing: 'cast',
      body: {
        en: 'The house’s Cast speakers. The bridge finds them on the network and wakes them into Spotify Connect itself, so the music can move to any room without opening the Spotify app.',
        es: 'Los altavoces Cast de casa. El puente los encuentra en la red y los despierta él mismo como dispositivos de Spotify Connect, así que la música pasa a cualquier habitación sin abrir la aplicación de Spotify.',
      },
      tags: ['Cast', 'Spotify Connect', 'mDNS'],
      at: { x: 112, y: 484 },
    },
    {
      id: 'tablets',
      zone: 'home',
      label: { en: 'Tablets', es: 'Tablets' },
      sub: { en: 'Shared screens', es: 'Pantallas compartidas' },
      glyph: 'tablet',
      drawing: 'tablet',
      body: {
        en: 'Old tablets around the house run the same PWA. They are shared, so at night they rest with the clock and any running timer, ask who is using them, and can listen for the wake word in the browser.',
        es: 'Tablets viejas repartidas por casa con la misma PWA. Como son de todos, de noche descansan con el reloj y los temporizadores en marcha, preguntan quién las usa y pueden estar atentas a la palabra de activación desde el navegador.',
      },
      tags: ['PWA', { en: 'Night rest', es: 'Descanso nocturno' }, 'WASM'],
      at: { x: 300, y: 470 },
    },
    {
      id: 'phones',
      zone: 'home',
      label: { en: 'Phones', es: 'Móviles' },
      sub: { en: 'Personal', es: 'Personales' },
      glyph: 'phone',
      drawing: 'phone',
      body: {
        en: 'Our phones run the app installed as a PWA. They are personal, so they never rest or ask who is there, and a Web Push tells them when a timer they set has finished. Changes asked for out loud are merged from here, and only from here.',
        es: 'Nuestros móviles llevan la aplicación instalada como PWA. Son personales: no descansan ni preguntan quién los usa, y les llega un aviso cuando acaba un temporizador que pusieron ellos. Los cambios pedidos en voz alta se fusionan desde aquí, y solo desde aquí.',
      },
      tags: ['PWA', 'Web Push'],
      at: { x: 452, y: 540 },
    },

    // ── On my VPS ───────────────────────────────────────────────
    {
      id: 'server',
      zone: 'cloud',
      label: { en: 'My VPS', es: 'Mi VPS' },
      sub: { en: 'Coolify', es: 'Coolify' },
      glyph: 'server',
      drawing: 'server',
      body: {
        en: 'My own VPS, run with Coolify — the same one that hosts my other apps. Everything Tablux needs in the cloud lives here, apart from the outside services. It reaches the wall only over Tailscale: nothing at home is open to the internet.',
        es: 'Un VPS propio, gestionado con Coolify, el mismo donde viven mis otras aplicaciones. Aquí está todo lo que Tablux necesita en la nube, salvo los servicios externos. Llega a la pared solo por Tailscale: en casa no hay nada abierto a internet.',
      },
      tags: ['VPS', 'Coolify', 'Docker', 'Tailscale'],
    },
    {
      id: 'app',
      zone: 'cloud',
      label: { en: 'Tablux app', es: 'Aplicación' },
      sub: { en: 'Next.js · PWA', es: 'Next.js · PWA' },
      glyph: 'window',
      body: {
        en: 'One Next.js app serves the PWA and its API to every screen. It runs the assistant, keeps the household’s data and shows any change on every screen within about two seconds, whether it came from a tap, a voice or a routine.',
        es: 'Una sola aplicación en Next.js sirve la PWA y su API a todas las pantallas. Lleva el asistente, guarda los datos de la casa y hace que cualquier cambio aparezca en todas las pantallas en unos dos segundos, venga de un toque, de la voz o de una rutina.',
      },
      tags: ['Next.js 16', 'React 19', 'PWA', 'Web Push'],
      at: { x: 669, y: 100 },
    },
    {
      id: 'supabase',
      zone: 'cloud',
      label: { en: 'Supabase', es: 'Supabase' },
      sub: { en: 'Self-hosted', es: 'Propio' },
      glyph: 'db',
      body: {
        en: 'A Supabase of my own on the same VPS: Postgres for the household’s data, and Google sign-in limited to an allow-list.',
        es: 'Un Supabase propio en el mismo VPS: Postgres para los datos de la casa y acceso con Google solo para una lista cerrada de cuentas.',
      },
      tags: [
        'Postgres',
        { en: 'Google sign-in', es: 'Acceso con Google' },
        { en: 'Allow-list', es: 'Lista de acceso' },
      ],
      at: { x: 669, y: 180 },
    },
    {
      id: 'voice',
      zone: 'cloud',
      label: { en: 'Voice service', es: 'Servicio de voz' },
      sub: { en: 'Piper', es: 'Piper' },
      glyph: 'wave',
      body: {
        en: 'Turns the assistant’s answers into speech, with a Piper voice of its own that I trained with Voicebox and Runpod. Every screen speaks with it.',
        es: 'Convierte en voz las respuestas del asistente, con una voz de Piper propia que entrené con Voicebox y Runpod. Es la voz de todas las pantallas.',
      },
      tags: ['Piper', { en: 'Own voice', es: 'Voz propia' }, 'Voicebox'],
      at: { x: 669, y: 260 },
    },
    {
      id: 'mcp',
      zone: 'cloud',
      label: { en: 'MCP server', es: 'Servidor MCP' },
      sub: { en: 'Tools', es: 'Herramientas' },
      glyph: 'tools',
      body: {
        en: 'The assistant’s tools — lights, blinds, routines, menus, agenda, timers, music — open to any assistant that speaks MCP, behind a personal key.',
        es: 'Las herramientas del asistente —luces, persianas, rutinas, menús, agenda, temporizadores, música— al alcance de cualquier asistente que hable MCP, con una clave personal.',
      },
      tags: ['MCP', { en: 'Personal keys', es: 'Claves personales' }],
      at: { x: 669, y: 344 },
    },

    // ── Training ────────────────────────────────────────────────
    {
      id: 'runpod',
      zone: 'training',
      label: { en: 'Runpod', es: 'Runpod' },
      sub: { en: 'Rented GPUs', es: 'GPU alquiladas' },
      glyph: 'chip',
      body: {
        en: 'Rented GPUs for the training runs: the wake-word model came out of here and, with Voicebox, the assistant’s voice. Nothing in daily use runs here.',
        es: 'GPU alquiladas para entrenar: de aquí salieron el modelo de la palabra de activación y, con Voicebox, la voz del asistente. Nada del día a día pasa por aquí.',
      },
      tags: [
        'Runpod',
        'Voicebox',
        { en: 'Wake word', es: 'Palabra de activación' },
        'Piper',
      ],
      at: { x: 669, y: 524 },
    },

    // ── Outside services ────────────────────────────────────────
    {
      id: 'claude',
      zone: 'services',
      label: { en: 'Claude Haiku', es: 'Claude Haiku' },
      sub: { en: 'Answers and acts', es: 'Responde y actúa' },
      glyph: 'bubble',
      body: {
        en: 'Reads what was said and answers with the same tools the app has, so one sentence can dim a light, plan the week’s menu or start a timer.',
        es: 'Entiende lo que se le dice y responde con las mismas herramientas que tiene la aplicación: con una frase se baja una luz, se planea el menú de la semana o se pone un temporizador.',
      },
      tags: [
        { en: 'Tool use', es: 'Herramientas' },
        { en: 'Photos in chat', es: 'Fotos en el chat' },
      ],
      at: { x: 893, y: 66 },
    },
    {
      id: 'whisper',
      zone: 'services',
      label: { en: 'Whisper on Groq', es: 'Whisper en Groq' },
      sub: { en: 'Speech to text', es: 'Voz a texto' },
      glyph: 'text',
      body: {
        en: 'Turns what was said into text, fast enough for a conversation.',
        es: 'Pasa a texto lo que se ha dicho, lo bastante rápido como para conversar.',
      },
      tags: ['Whisper', 'Groq'],
      at: { x: 893, y: 134 },
    },
    {
      id: 'calendar',
      zone: 'services',
      label: { en: 'Google Calendar', es: 'Google Calendar' },
      sub: { en: 'Family agenda', es: 'Agenda familiar' },
      glyph: 'calendar',
      body: {
        en: 'The family agenda: each person’s calendar plus a shared one for the house, read and written by the app.',
        es: 'La agenda familiar: el calendario de cada uno y uno compartido de la casa, que la aplicación lee y escribe.',
      },
      tags: ['Google Calendar'],
      at: { x: 893, y: 202 },
    },
    {
      id: 'spotify',
      zone: 'services',
      label: { en: 'Spotify', es: 'Spotify' },
      sub: { en: 'Web API', es: 'Web API' },
      glyph: 'note',
      body: {
        en: 'Search and play from any screen, on the wall’s speaker or on any other speaker in the house.',
        es: 'Buscar y poner música desde cualquier pantalla, en el altavoz de la pared o en cualquier otro de casa.',
      },
      tags: ['Spotify Web API', 'Spotify Connect'],
      at: { x: 893, y: 270 },
    },
    {
      id: 'weather',
      zone: 'services',
      label: { en: 'Weather station', es: 'Mi estación' },
      sub: { en: 'My own', es: 'Meteorológica' },
      glyph: 'weather',
      body: {
        en: 'A weather station of my own, with its own database, plus a forecast for the days ahead.',
        es: 'Una estación meteorológica mía, con su propia base de datos, y una previsión para los próximos días.',
      },
      tags: [
        { en: 'Own station', es: 'Estación propia' },
        { en: 'Forecast', es: 'Previsión' },
      ],
      at: { x: 893, y: 338 },
    },
    {
      id: 'github',
      zone: 'services',
      label: { en: 'GitHub', es: 'GitHub' },
      sub: { en: 'Issues · PRs', es: 'Issues · PR' },
      glyph: 'branch',
      body: {
        en: 'Where Tablux’s code lives. A change asked for out loud arrives here as an issue, opened by the app’s own GitHub App.',
        es: 'Donde vive el código de Tablux. Un cambio pedido en voz alta llega aquí como un issue, que abre la propia GitHub App de la aplicación.',
      },
      tags: ['GitHub App', 'Issues'],
      at: { x: 893, y: 406 },
    },
    {
      id: 'claudecode',
      zone: 'services',
      label: { en: 'Claude Code', es: 'Claude Code' },
      sub: { en: 'GitHub Actions', es: 'GitHub Actions' },
      glyph: 'terminal',
      body: {
        en: 'Picks up each issue in GitHub Actions, writes the change and opens the pull request. Nothing merges without a tap on a phone.',
        es: 'Recoge cada issue en GitHub Actions, escribe el cambio y abre la pull request. Nada se fusiona sin un toque en el móvil.',
      },
      tags: ['GitHub Actions', 'Pull requests'],
      at: { x: 893, y: 474 },
    },
    {
      id: 'mcpclient',
      zone: 'services',
      label: { en: 'Any MCP client', es: 'Clientes MCP' },
      sub: { en: 'Personal key', es: 'Clave personal' },
      glyph: 'key',
      body: {
        en: 'Any assistant that speaks MCP can run the house through Tablux’s tools, with a personal key.',
        es: 'Cualquier asistente que hable MCP puede llevar la casa con las herramientas de Tablux y una clave personal.',
      },
      tags: ['MCP'],
      at: { x: 893, y: 542 },
    },
  ],

  edges: [
    // On the wall
    {
      from: 'listener',
      to: 'kiosk',
      kind: 'local',
      label: { en: 'wakes the app', es: 'despierta la aplicación' },
    },
    {
      from: 'kiosk',
      to: 'bridge',
      kind: 'local',
      label: {
        en: 'same device, offline too',
        es: 'mismo aparato, también sin red',
      },
    },
    {
      from: 'kiosk',
      to: 'speaker',
      kind: 'audio',
      label: {
        en: 'the assistant’s replies',
        es: 'las respuestas del asistente',
      },
    },
    {
      from: 'bridge',
      to: 'speaker',
      kind: 'audio',
      label: { en: 'offline voice', es: 'voz sin conexión' },
    },
    // The house's devices
    {
      from: 'bridge',
      to: 'plugs',
      kind: 'lan',
      label: { en: 'local keys', es: 'claves locales' },
    },
    {
      from: 'bridge',
      to: 'bulbs',
      kind: 'lan',
      label: { en: 'local network', es: 'red local' },
    },
    {
      from: 'bridge',
      to: 'blinds',
      kind: 'lan',
      label: { en: 'local RPC', es: 'RPC local' },
    },
    {
      from: 'bridge',
      to: 'projector',
      kind: 'lan',
      label: { en: 'its remote protocol', es: 'su protocolo de mando' },
    },
    {
      from: 'bridge',
      to: 'cast',
      kind: 'lan',
      label: { en: 'Cast · Spotify Connect', es: 'Cast · Spotify Connect' },
    },
    // Every screen to the app
    {
      from: 'kiosk',
      to: 'app',
      kind: 'https',
      label: { en: 'the PWA', es: 'la PWA' },
    },
    {
      from: 'tablets',
      to: 'app',
      kind: 'https',
      label: { en: 'the PWA', es: 'la PWA' },
    },
    {
      from: 'phones',
      to: 'app',
      kind: 'https',
      label: { en: 'the PWA · Web Push', es: 'la PWA · avisos push' },
    },
    // The only way into the house
    {
      from: 'app',
      to: 'bridge',
      kind: 'tailscale',
      label: {
        en: 'Tailscale, no open ports',
        es: 'Tailscale, sin puertos abiertos',
      },
    },
    // On the VPS
    {
      from: 'app',
      to: 'supabase',
      kind: 'local',
      label: { en: 'data and sign-in', es: 'datos y acceso' },
    },
    {
      from: 'app',
      to: 'voice',
      kind: 'local',
      label: { en: 'text to speech', es: 'texto a voz' },
    },
    {
      from: 'mcp',
      to: 'app',
      kind: 'local',
      label: { en: 'the app’s tools', es: 'las herramientas de la aplicación' },
    },
    // Outside services
    {
      from: 'app',
      to: 'claude',
      kind: 'https',
      label: { en: 'answers with tools', es: 'responde con herramientas' },
    },
    {
      from: 'app',
      to: 'whisper',
      kind: 'https',
      label: { en: 'speech to text', es: 'voz a texto' },
    },
    {
      from: 'app',
      to: 'calendar',
      kind: 'https',
      label: { en: 'family agenda', es: 'agenda familiar' },
    },
    {
      from: 'app',
      to: 'spotify',
      kind: 'https',
      label: { en: 'music', es: 'música' },
    },
    {
      from: 'app',
      to: 'weather',
      kind: 'https',
      label: { en: 'weather', es: 'el tiempo' },
    },
    {
      from: 'app',
      to: 'github',
      kind: 'https',
      label: { en: 'opens an issue', es: 'abre un issue' },
    },
    {
      from: 'github',
      to: 'claudecode',
      kind: 'https',
      label: { en: 'runs in Actions', es: 'corre en Actions' },
    },
    {
      from: 'mcpclient',
      to: 'mcp',
      kind: 'https',
      label: { en: 'personal key', es: 'clave personal' },
    },
    // Trained once
    {
      from: 'runpod',
      to: 'listener',
      kind: 'training',
      label: { en: 'the wake-word model', es: 'el modelo de activación' },
    },
    {
      from: 'runpod',
      to: 'voice',
      kind: 'training',
      label: { en: 'the voice, with Voicebox', es: 'la voz, con Voicebox' },
    },
  ],

  walkthroughs: [
    {
      id: 'wake',
      title: { en: 'Say the wake word', es: 'Di la palabra de activación' },
      steps: [
        {
          nodes: ['listener'],
          caption: {
            en: 'The screen hears the wake word itself, with a model of my own.',
            es: 'La pantalla oye ella misma la palabra de activación, con un modelo mío.',
          },
        },
        {
          nodes: ['listener', 'kiosk', 'app'],
          caption: {
            en: 'It claims the turn on the server, so only one screen answers.',
            es: 'Pide el turno al servidor, para que conteste una sola pantalla.',
          },
        },
        {
          nodes: ['app', 'whisper'],
          caption: {
            en: 'Whisper on Groq turns the voice into text.',
            es: 'Whisper en Groq pasa la voz a texto.',
          },
        },
        {
          nodes: ['app', 'claude'],
          caption: {
            en: 'Claude Haiku answers, with the same tools as the app.',
            es: 'Claude Haiku responde, con las mismas herramientas que la aplicación.',
          },
        },
        {
          nodes: ['app', 'bridge'],
          caption: {
            en: 'The order reaches the wall’s bridge over Tailscale.',
            es: 'La orden llega al puente de la pared por Tailscale.',
          },
        },
        {
          nodes: ['bridge', 'plugs', 'bulbs', 'blinds', 'projector', 'cast'],
          caption: {
            en: 'The bridge acts on the devices over the local network.',
            es: 'El puente actúa sobre los aparatos por la red local.',
          },
        },
        {
          nodes: ['app', 'voice', 'kiosk', 'speaker'],
          caption: {
            en: 'And it replies out loud, in a voice of its own.',
            es: 'Y contesta en voz alta, con una voz propia.',
          },
        },
      ],
    },
    {
      id: 'claps',
      title: {
        en: 'A routine with two claps',
        es: 'Una rutina con dos palmadas',
      },
      steps: [
        {
          nodes: ['listener'],
          caption: {
            en: 'Two claps, heard on the device itself.',
            es: 'Dos palmadas, que oye el propio aparato.',
          },
        },
        {
          nodes: ['listener', 'kiosk', 'app', 'bridge'],
          caption: {
            en: 'One screen takes the turn and the routine goes to the wall’s bridge — straight from the wall when the internet is down.',
            es: 'Una pantalla se queda el turno y la rutina pasa al puente de la pared; si no hay internet, directamente desde la propia pared.',
          },
        },
        {
          nodes: ['bridge', 'plugs', 'bulbs', 'blinds'],
          caption: {
            en: 'The bridge runs it on the local network: plugs, bulbs, blinds.',
            es: 'El puente la ejecuta en la red local: enchufes, bombillas, persianas.',
          },
        },
      ],
    },
    {
      id: 'change',
      title: {
        en: 'Ask for a change out loud',
        es: 'Pide un cambio en voz alta',
      },
      steps: [
        {
          nodes: ['kiosk', 'tablets', 'phones', 'app'],
          caption: {
            en: '«Abre una PR que…»: a change asked for out loud, from any screen.',
            es: '«Abre una PR que…»: un cambio pedido en voz alta, desde cualquier pantalla.',
          },
        },
        {
          nodes: ['app', 'github'],
          caption: {
            en: 'Tablux turns it into an issue on GitHub.',
            es: 'Tablux lo convierte en un issue de GitHub.',
          },
        },
        {
          nodes: ['github', 'claudecode'],
          caption: {
            en: 'Claude Code picks it up in GitHub Actions and opens the pull request.',
            es: 'Claude Code lo recoge en GitHub Actions y abre la pull request.',
          },
        },
        {
          nodes: ['phones', 'app', 'github'],
          caption: {
            en: 'Nothing merges without a tap on a phone.',
            es: 'Nada se fusiona sin un toque en el móvil.',
          },
        },
      ],
    },
  ],
};
