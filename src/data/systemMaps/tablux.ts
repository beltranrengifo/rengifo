import type { SystemMap } from './types';

/**
 * Tablux, part by part: the wall and the house's devices, the app on my own
 * VPS, and the services around it. Positions are in a 1000 × 760 map; on a
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
  intro: {
    en: 'Below, every part of Tablux, at home and on my own VPS. Choose one to see what it is and what it talks to, or follow a path through it.',
    es: 'Aquí debajo, todas las piezas de Tablux, en casa y en mi propio VPS. Elige una para ver qué es y con qué habla, o sigue alguno de los recorridos.',
  },
  size: { w: 1000, h: 760 },

  zones: [
    {
      id: 'home',
      label: { en: 'At home', es: 'En casa' },
      box: { x: 10, y: 20, w: 490, h: 732 },
    },
    {
      id: 'wall',
      label: { en: 'On the wall', es: 'En la pared' },
      box: { x: 222, y: 70, w: 248, h: 500 },
      parent: 'home',
      host: 'wall',
    },
    {
      id: 'tunnel',
      label: {
        en: 'Between home and the VPS',
        es: 'Entre casa y el VPS',
      },
      box: { x: 508, y: 370, w: 44, h: 50 },
      tunnel: true,
    },
    {
      id: 'cloud',
      label: { en: 'On my VPS', es: 'En mi VPS' },
      box: { x: 598, y: 20, w: 196, h: 548 },
      host: 'server',
    },
    {
      id: 'training',
      label: { en: 'Training', es: 'Entrenamiento' },
      box: { x: 598, y: 604, w: 196, h: 148 },
      outside: true,
    },
    {
      id: 'services',
      label: { en: 'Outside services', es: 'Servicios externos' },
      box: { x: 808, y: 20, w: 184, h: 732 },
      outside: true,
    },
  ],

  nodes: [
    // ── On the wall ─────────────────────────────────────────────
    {
      id: 'wall',
      zone: 'wall',
      label: { en: 'The wall', es: 'La pared' },
      sub: { en: 'Recycled POS · RK3288', es: 'TPV reciclado · RK3288' },
      glyph: 'screen',
      drawing: 'wall',
      body: {
        en: 'A HiPOS point-of-sale screen that was headed for the bin, now hung on the wall: a 15.6-inch panel on a Rockchip RK3288 with 2 GB of memory. It runs a Linux of my own, and it is also the house’s ears, its speaker and its bridge to every device.',
        es: 'Un TPV HiPOS que iba a la basura y ahora cuelga de la pared: pantalla de 15,6 pulgadas y placa Rockchip RK3288 con 2 GB de memoria. Lleva un Linux propio, y además es el oído de la casa, su altavoz y el puente hacia todos los aparatos.',
      },
      tags: ['RK3288', '2 GB', 'Linux 6.18', 'U-Boot', 'Armbian', 'Phosh'],
    },
    {
      id: 'linux',
      zone: 'wall',
      label: { en: 'Linux 6.18', es: 'Linux 6.18' },
      sub: { en: 'Armbian · Phosh', es: 'Armbian · Phosh' },
      glyph: 'stack',
      layer: true,
      body: {
        en: 'My own Linux for a board with no public documentation. First, a full backup of the factory Android. Then a device tree written from the vendor’s own, U-Boot built with the memory init this board needs, and Linux 6.18 compiled with the display drivers it lacked, on Armbian. Phosh on top makes it a system for fingers. Everything on the wall runs on it.',
        es: 'Un Linux propio para una placa sin documentación pública. Primero, una copia completa del Android de fábrica. Después, un device tree escrito a partir del original del fabricante, un U-Boot compilado con la inicialización de memoria que pide esta placa y Linux 6.18 compilado con los drivers de pantalla que le faltaban, sobre Armbian. Encima, Phosh lo convierte en un sistema pensado para los dedos. Todo lo que hay en la pared corre sobre él.',
      },
      tags: ['Linux 6.18', 'Armbian', 'Phosh', 'U-Boot', 'Device tree'],
      at: { x: 346, y: 500 },
    },
    {
      id: 'kiosk',
      zone: 'wall',
      label: { en: 'Kiosk browser', es: 'Navegador' },
      sub: { en: 'Chromium', es: 'Chromium · quiosco' },
      glyph: 'window',
      body: {
        en: 'Chromium opens the app full screen as soon as the wall starts, with nothing around it. It is the same PWA every other screen runs; the wall only adds what needs a body: a speaker, a microphone and the bridge. At night it rests with the clock and any running timer, and «Buenas noches» can send it to rest. Without internet, the app’s own offline cache keeps the clock, the agenda and the menu on screen.',
        es: 'Chromium abre la aplicación a pantalla completa en cuanto arranca la pared, sin nada alrededor. Es la misma PWA que usan las demás pantallas; la pared solo pone lo que necesita un cuerpo: altavoz, micrófono y puente. De noche descansa con el reloj y los temporizadores en marcha, y «Buenas noches» puede mandarla a descansar. Sin internet, la caché de la propia aplicación mantiene en pantalla el reloj, la agenda y el menú.',
      },
      tags: ['Chromium', 'PWA', 'Phosh'],
      at: { x: 346, y: 232 },
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
      at: { x: 346, y: 145 },
    },
    {
      id: 'speaker',
      zone: 'wall',
      label: { en: 'Speaker', es: 'Altavoz' },
      sub: { en: 'Music · voice', es: 'Música · voz' },
      glyph: 'speaker',
      drawing: 'speaker',
      body: {
        en: 'The wall’s own speaker. Spotify’s official receiver for devices without a screen runs on the wall, so it is a Spotify Connect speaker like any other and music reaches it from any phone. It is also where the assistant speaks; if the internet drops, an offline Piper voice on the wall takes over.',
        es: 'El altavoz de la propia pared. En ella corre el receptor oficial de Spotify para aparatos sin pantalla, así que es un altavoz de Spotify Connect como cualquier otro y se le manda música desde cualquier móvil. También es por donde habla el asistente; si se cae internet, toma el relevo una voz de Piper que vive en la pared.',
      },
      tags: [
        'Spotify Connect',
        { en: 'Offline Piper', es: 'Piper sin conexión' },
      ],
      at: { x: 346, y: 319 },
    },
    {
      id: 'bridge',
      zone: 'wall',
      label: { en: 'Home bridge', es: 'Puente doméstico' },
      sub: { en: 'Node · Hono', es: 'Node · Hono' },
      glyph: 'bridge',
      body: {
        en: 'A small Node service on the wall, and the only part of Tablux that has to be at home. It talks to every device over the local network with local keys, never through the makers’ clouds. It runs the routines the app hands it — at a set time, by the sun, which it works out itself, or with two or three claps — so they keep working without internet, and it keeps their log. It also looks after the wall’s backlight.',
        es: 'Un pequeño servicio en Node que corre en la pared, y la única parte de Tablux que tiene que estar en casa. Habla con cada aparato por la red local, con claves locales y sin pasar por la nube de ningún fabricante. Lanza las rutinas que le pasa la aplicación —a una hora, con el sol, que calcula él mismo, o con dos o tres palmadas—, así que siguen funcionando sin internet, y guarda su registro. También se ocupa del brillo de la pantalla.',
      },
      tags: [
        'Node',
        'Hono',
        { en: 'Local network', es: 'Red local' },
        { en: 'Routines', es: 'Rutinas' },
        { en: 'Works offline', es: 'Funciona sin red' },
      ],
      at: { x: 346, y: 406 },
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
      at: { x: 116, y: 145 },
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
      at: { x: 116, y: 260 },
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
      at: { x: 116, y: 375 },
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
      at: { x: 116, y: 490 },
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
      at: { x: 116, y: 605 },
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
      at: { x: 318, y: 628 },
    },
    {
      id: 'phones',
      zone: 'home',
      label: { en: 'Phones', es: 'Móviles' },
      sub: { en: 'Personal', es: 'Personales' },
      glyph: 'phone',
      drawing: 'phone',
      body: {
        en: 'Our phones run the app installed as a PWA. They are personal, so they never rest or ask who is there, and a Web Push tells them when a timer they set has finished. Changes asked for out loud are merged from the «Cambios» card on a phone, and only from there.',
        es: 'Nuestros móviles llevan la aplicación instalada como PWA. Son personales: no descansan ni preguntan quién los usa, y les llega un aviso cuando acaba un temporizador que pusieron ellos. Los cambios pedidos en voz alta se fusionan desde la tarjeta «Cambios» de un móvil, y solo desde ahí.',
      },
      tags: ['PWA', 'Web Push'],
      at: { x: 438, y: 708 },
    },

    // ── Between home and the VPS ────────────────────────────────
    {
      id: 'tailscale',
      zone: 'tunnel',
      label: { en: 'Tailscale', es: 'Tailscale' },
      sub: { en: 'VPN', es: 'VPN' },
      glyph: 'tunnel',
      body: {
        en: 'A private network between the wall, the VPS and my laptop. The cloud reaches the wall’s bridge only through it, so nothing at home is open to the internet. The VPS’s own admin — SSH and the Coolify panel — is only reachable through it too.',
        es: 'Una red privada entre la pared, el VPS y mi portátil. La nube solo llega al puente de la pared a través de ella, así que en casa no hay nada abierto a internet. La administración del propio VPS —el SSH y el panel de Coolify— también queda detrás de ella.',
      },
      tags: [
        'Tailscale',
        'VPN',
        { en: 'No open ports', es: 'Sin puertos abiertos' },
        'SSH',
      ],
      at: { x: 530, y: 395 },
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
        en: 'My own VPS, run with Coolify — the same one that hosts my other apps. Everything Tablux needs in the cloud lives here, apart from the outside services. It reaches the wall only over Tailscale, and its own admin is behind Tailscale too.',
        es: 'Un VPS propio, gestionado con Coolify, el mismo donde viven mis otras aplicaciones. Aquí está todo lo que Tablux necesita en la nube, salvo los servicios externos. Llega a la pared solo por Tailscale, y su propia administración también queda detrás de Tailscale.',
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
        en: 'One Next.js app serves the PWA and its API to every screen: the assistant, lights and blinds, agenda, menus, the shopping list, timers and stopwatches. Recipes come in typed, dictated or from any website. Each screen asks every two seconds whether anything changed — plain polling, so a 2014 tablet keeps up — and every screen is checked at ten sizes, day and night, before a change to the interface ships.',
        es: 'Una sola aplicación en Next.js sirve la PWA y su API a todas las pantallas: el asistente, luces y persianas, agenda, menús, lista de la compra, temporizadores y cronómetros. Las recetas entran escritas, dictadas o desde cualquier web. Cada pantalla pregunta cada dos segundos si algo ha cambiado —una consulta sencilla, para que una tablet de 2014 no se quede atrás—, y antes de publicar un cambio en la interfaz todas las pantallas se revisan en diez tamaños, de día y de noche.',
      },
      tags: ['Next.js 16', 'React 19', 'PWA', 'Web Push'],
      at: { x: 696, y: 110 },
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
      at: { x: 696, y: 200 },
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
      at: { x: 696, y: 290 },
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
      at: { x: 696, y: 380 },
    },

    {
      id: 'monitor',
      zone: 'cloud',
      label: { en: 'Monitoring', es: 'Monitorización' },
      sub: { en: 'Uptime Kuma', es: 'Uptime Kuma' },
      glyph: 'pulse',
      body: {
        en: 'Uptime Kuma and the server’s own metrics, on the same VPS. The app’s server screen reads them: CPU, memory, disk, the last backup and whether each of my sites is up.',
        es: 'Uptime Kuma y las métricas del propio servidor, en el mismo VPS. La pantalla del servidor de la aplicación las lee: CPU, memoria, disco, la última copia de seguridad y si cada una de mis webs está en pie.',
      },
      tags: [
        'Uptime Kuma',
        { en: 'Server metrics', es: 'Métricas del servidor' },
      ],
      at: { x: 696, y: 470 },
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
      at: { x: 696, y: 680 },
    },

    // ── Outside services ────────────────────────────────────────
    {
      id: 'claude',
      zone: 'services',
      label: { en: 'Claude Haiku', es: 'Claude Haiku' },
      sub: { en: 'Answers and acts', es: 'Responde y actúa' },
      glyph: 'bubble',
      body: {
        en: 'Reads what was said and answers with the same tools the app has, so one sentence can dim a light, plan the week’s menu or start a timer. Asked how the app works, it reads the app’s own guide instead of making it up.',
        es: 'Entiende lo que se le dice y responde con las mismas herramientas que tiene la aplicación: con una frase se baja una luz, se planea el menú de la semana o se pone un temporizador. Si le preguntan cómo funciona la aplicación, consulta su propia guía en vez de inventárselo.',
      },
      tags: [
        { en: 'Tool use', es: 'Herramientas' },
        { en: 'Photos in chat', es: 'Fotos en el chat' },
      ],
      at: { x: 900, y: 95 },
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
      at: { x: 900, y: 172 },
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
      at: { x: 900, y: 249 },
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
      at: { x: 900, y: 326 },
    },
    {
      id: 'weather',
      zone: 'services',
      caseStudy: 'gorraplanistas',
      label: { en: 'Weather station', es: 'Mi estación' },
      sub: { en: 'My own', es: 'Meteorológica' },
      glyph: 'weather',
      body: {
        en: 'A weather station of my own, with its own database, and an Open-Meteo forecast that the station corrects.',
        es: 'Una estación meteorológica mía, con su propia base de datos, y una previsión de Open-Meteo que la propia estación corrige.',
      },
      tags: [
        { en: 'Own station', es: 'Estación propia' },
        { en: 'Forecast', es: 'Previsión' },
      ],
      at: { x: 900, y: 403 },
    },
    {
      id: 'push',
      zone: 'services',
      label: { en: 'Push services', es: 'Servicios push' },
      sub: { en: 'Web Push', es: 'Web Push' },
      glyph: 'bell',
      body: {
        en: 'The browsers’ own push services. They carry a Web Push to a phone when a timer set on it has finished, even with the app in the background. Only that phone gets it; the wall rings its own.',
        es: 'Los servicios de push de los propios navegadores. Llevan un aviso Web Push al móvil cuando acaba un temporizador que se puso en él, aunque la aplicación esté en segundo plano. Solo lo recibe ese móvil; la pared hace sonar los suyos.',
      },
      tags: [
        'Web Push',
        'VAPID',
        { en: 'Installed PWA on iOS', es: 'PWA instalada en iOS' },
      ],
      at: { x: 900, y: 480 },
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
      at: { x: 900, y: 557 },
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
      at: { x: 900, y: 634 },
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
      at: { x: 900, y: 711 },
    },
  ],

  edges: [
    // Everything on the wall runs on its own Linux
    ...(['kiosk', 'listener', 'speaker', 'bridge'] as const).map((part) => ({
      from: 'linux',
      to: part,
      kind: 'local' as const,
      label: { en: 'runs on it', es: 'corre sobre él' },
    })),
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
      to: 'tailscale',
      kind: 'tailscale',
      label: { en: 'private network', es: 'red privada' },
    },
    {
      from: 'tailscale',
      to: 'bridge',
      kind: 'tailscale',
      label: { en: 'no open ports', es: 'sin puertos abiertos' },
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
    {
      from: 'app',
      to: 'monitor',
      kind: 'local',
      label: { en: 'server and sites', es: 'servidor y webs' },
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
      to: 'push',
      kind: 'https',
      label: { en: 'a timer ended', es: 'acabó un temporizador' },
    },
    {
      from: 'push',
      to: 'phones',
      kind: 'https',
      label: { en: 'Web Push', es: 'Web Push' },
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
      id: 'tap',
      title: { en: 'Switch on a light', es: 'Enciende una luz' },
      steps: [
        {
          nodes: ['phones', 'app'],
          caption: {
            en: 'A tap on a light, on a phone, goes to the app on my VPS.',
            es: 'Un toque en una luz, desde el móvil, llega a la aplicación en mi VPS.',
          },
        },
        {
          nodes: ['app', 'tailscale', 'bridge'],
          caption: {
            en: 'The VPS cannot reach into the house on its own: Tailscale carries the order to the wall’s bridge.',
            es: 'El VPS no puede entrar en casa por su cuenta: Tailscale lleva la orden al puente de la pared.',
          },
        },
        {
          nodes: ['bridge', 'bulbs'],
          caption: {
            en: 'Only the bridge, at home, speaks to the bulb, over the local network.',
            es: 'Solo el puente, que está en casa, habla con la bombilla, por la red local.',
          },
        },
        {
          nodes: ['kiosk', 'tablets', 'phones', 'app'],
          caption: {
            en: 'Every other screen asks every two seconds, so they all catch up.',
            es: 'Las demás pantallas preguntan cada dos segundos, así que todas se ponen al día.',
          },
        },
      ],
    },
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
          nodes: ['app', 'tailscale', 'bridge'],
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
          nodes: ['listener', 'kiosk', 'app', 'tailscale', 'bridge'],
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

  offline: {
    note: {
      en: 'Without internet the VPS and every outside service are out of reach, and the wall keeps the house going: the bridge runs the routines at their time, by the sun or with claps; plugs, bulbs, blinds and the projector answer over the local network; the screen keeps the app’s last copy and speaks with its own Piper voice.',
      es: 'Sin internet, el VPS y los servicios externos quedan fuera de alcance, y la pared sigue llevando la casa: el puente lanza las rutinas a su hora, con el sol o con palmadas; enchufes, bombillas, persianas y proyector responden por la red local; la pantalla conserva la última copia de la aplicación y habla con su propia voz de Piper.',
    },
    keep: [
      'wall',
      'linux',
      'kiosk',
      'listener',
      'speaker',
      'bridge',
      'plugs',
      'bulbs',
      'blinds',
      'projector',
    ],
    lose: ['tunnel', 'cloud', 'training', 'services'],
  },

  // The app's wires run as trunks: one by the outside services, one down
  // the VPS's left side to Tailscale and to the screens at home.
  bundles: [
    { from: 'app', zone: 'services' },
    { from: 'app', zone: 'tunnel', trunk: 'cloud' },
    { from: 'app', zone: 'wall', trunk: 'cloud' },
    { from: 'app', zone: 'home', trunk: 'cloud' },
  ],
};
