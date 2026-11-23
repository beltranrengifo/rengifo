import type { SystemMap } from './types';

/**
 * Ensayadero.studio, part by part: what the band touches in the browser, the
 * web app and its Supabase on my VPS, and the Python pipeline that turns a
 * recording into stems, MIDI and a chord chart. Positions are in a
 * 1000 × 1000 map; on a phone the zones stack and the nodes flow in this
 * order instead.
 *
 * The pipeline is a grid: the first choice of each step on top, the model it
 * falls back to right below it, so every fallback wire runs straight down.
 *
 * Private by design: no band, no songs, no people, no hosts, buckets or keys.
 */
export const ensayadero: SystemMap = {
  id: 'ensayadero',
  label: {
    en: 'Map of Ensayadero.studio, part by part',
    es: 'Mapa de Ensayadero.studio, pieza a pieza',
  },
  intro: {
    en: 'Below, what happens between the upload and the mixer: every model, the queue, the fallbacks and where each file ends up. Choose any part to see what it does, or follow a path through it.',
    es: 'Aquí debajo está todo lo que pasa entre la subida y el mezclador: cada modelo, la cola, las alternativas cuando algo falla y dónde acaba cada archivo. Elige una pieza para ver qué hace, o sigue uno de los recorridos.',
  },
  size: { w: 1000, h: 1000 },

  zones: [
    {
      id: 'browser',
      label: { en: 'In the browser', es: 'En el navegador' },
      box: { x: 235, y: 20, w: 755, h: 140 },
    },
    {
      id: 'signin',
      label: { en: 'Sign-in', es: 'Acceso' },
      box: { x: 10, y: 20, w: 200, h: 140 },
      outside: true,
    },
    {
      id: 'vps',
      label: { en: 'On my server', es: 'En mi servidor' },
      box: { x: 10, y: 200, w: 980, h: 780 },
    },
    {
      id: 'web',
      label: { en: 'The web app', es: 'La aplicación web' },
      box: { x: 30, y: 240, w: 480, h: 290 },
      parent: 'vps',
    },
    {
      id: 'supabase',
      label: { en: 'Supabase, self-hosted', es: 'Supabase, autoalojado' },
      box: { x: 540, y: 240, w: 430, h: 290 },
      parent: 'vps',
    },
    {
      id: 'pipeline',
      label: { en: 'The pipeline, in Python', es: 'El pipeline, en Python' },
      box: { x: 30, y: 560, w: 940, h: 400 },
      parent: 'vps',
    },
  ],

  nodes: [
    // ── In the browser ──────────────────────────────────────────
    {
      id: 'library',
      zone: 'browser',
      label: { en: 'Library', es: 'Biblioteca' },
      sub: { en: 'Upload or record', es: 'Subir o grabar' },
      glyph: 'mic',
      body: {
        en: 'Where songs come in: a file from anywhere, or a take straight off the rehearsal-room mic, uploaded the moment you stop. Choose the stems and the quality, and watch it process.',
        es: 'Por aquí entran las canciones: cualquier archivo, o una toma grabada directamente con el micro del local, que se sube en cuanto paras. Eliges los stems y la calidad, y ves cómo avanza el proceso.',
      },
      tags: [
        { en: 'Recorder', es: 'Grabadora' },
        { en: 'Stems and quality', es: 'Stems y calidad' },
        'PWA',
      ],
      at: { x: 360, y: 90 },
    },
    {
      id: 'chart',
      zone: 'browser',
      label: { en: 'Chord chart', es: 'Hoja de acordes' },
      sub: { en: 'Edited by the band', es: 'La edita el grupo' },
      glyph: 'chords',
      body: {
        en: 'Sections, chords and laps, as the models heard them. Anyone in the band can fix a chord, a section or its timing, with a view for guitar and another for bass. Tap a section and the mixer jumps there.',
        es: 'Secciones, acordes y vueltas, tal como los han detectado los modelos. Cualquiera del grupo puede corregir un acorde, una sección o sus tiempos, con una vista para guitarra y otra para bajo. Al pulsar una sección, el mezclador salta a ese punto.',
      },
      tags: [
        { en: 'Guitar and bass views', es: 'Vistas de guitarra y bajo' },
        {
          en: 'Edits survive reprocessing',
          es: 'Los cambios se conservan al reprocesar',
        },
      ],
      at: { x: 620, y: 90 },
    },
    {
      id: 'mixer',
      zone: 'browser',
      label: { en: 'Mixer', es: 'Mezclador' },
      sub: { en: 'Tone.js · wavesurfer', es: 'Tone.js · wavesurfer' },
      glyph: 'sliders',
      body: {
        en: 'Every stem and its MIDI on one timeline: mute, solo and EQ per channel, the MIDI played through sampled instruments, a loop from A to B, and a transport that stays on screen as you scroll. The original streams first, so it plays at once; each stem loads when you unmute it.',
        es: 'Todos los stems y sus MIDI en una misma línea de tiempo: mute, solo y ecualizador por canal, el MIDI reproducido con instrumentos sampleados, un bucle de A a B y unos controles de reproducción que se quedan fijos al hacer scroll. El original se reproduce en streaming, así que suena al instante; cada stem se carga cuando le quitas el mute.',
      },
      tags: [
        'Tone.js',
        'wavesurfer.js',
        'smplr',
        { en: 'A–B loop', es: 'Bucle A–B' },
      ],
      at: { x: 870, y: 90 },
    },

    // ── Sign-in ─────────────────────────────────────────────────
    {
      id: 'google',
      zone: 'signin',
      label: { en: 'Google', es: 'Google' },
      sub: { en: 'The only way in', es: 'La única entrada' },
      glyph: 'key',
      body: {
        en: 'Google says who you are; the app decides whether you are on the list. There are no passwords to keep.',
        es: 'Google confirma quién eres y la aplicación decide si estás en la lista. No hay contraseñas que gestionar.',
      },
      tags: ['OAuth', 'Supabase Auth'],
      at: { x: 110, y: 90 },
    },

    // ── The web app ─────────────────────────────────────────────
    {
      id: 'web',
      zone: 'web',
      label: { en: 'Next.js app', es: 'Aplicación Next.js' },
      sub: { en: 'Pages and API', es: 'Páginas y API' },
      glyph: 'window',
      body: {
        en: 'The pages, the sign-in and every API call, behind Postgres’s row-level security. It ships in one Docker image with the Python pipeline, and Coolify deploys it on every push to main. It also serves a read-only link to a song, for someone without an account.',
        es: 'Las páginas, el inicio de sesión y todas las llamadas a la API, protegidas por la seguridad a nivel de fila de Postgres. Se empaqueta en una sola imagen Docker junto con el pipeline de Python, y Coolify la despliega con cada push a main. También genera enlaces de solo lectura para compartir una canción con quien no tiene cuenta.',
      },
      tags: ['Next.js 16', 'React 19', 'RLS', 'Docker', 'Coolify'],
      caseStudy: 'infrastructure',
      at: { x: 330, y: 320 },
    },
    {
      id: 'queue',
      zone: 'web',
      label: { en: 'Job queue', es: 'Cola de trabajos' },
      sub: { en: 'One song at a time', es: 'Una canción cada vez' },
      glyph: 'queue',
      body: {
        en: 'Songs wait their turn here, first in, first out, so two separations never fight over the CPU. The queue lives in memory: every minute, a sweep finds the jobs a restart left behind and puts them back, up to three tries.',
        es: 'Las canciones esperan aquí su turno, por orden de llegada, para que dos separaciones no compitan por la CPU. La cola está en memoria: cada minuto, una comprobación busca los trabajos que un reinicio ha dejado a medias y los vuelve a encolar, con un máximo de tres intentos.',
      },
      tags: [
        'FIFO',
        { en: 'Requeues after a restart', es: 'Reencola tras un reinicio' },
      ],
      at: { x: 130, y: 455 },
    },
    {
      id: 'worker',
      zone: 'web',
      label: { en: 'Worker', es: 'Worker' },
      sub: { en: 'Runs the pipeline', es: 'Lanza el pipeline' },
      glyph: 'terminal',
      body: {
        en: 'A process of its own, so the web app can restart without killing a song. It downloads the original, runs the pipeline, uploads everything it made and marks the song ready. A heartbeat every few seconds says it is alive; a run that goes quiet is killed.',
        es: 'Un proceso independiente, para que la aplicación pueda reiniciarse sin cortar el procesado de una canción. Descarga el original, ejecuta el pipeline, sube todo lo que genera y marca la canción como lista. Cada pocos segundos envía un latido para indicar que sigue vivo; si una ejecución deja de dar señales, la detiene.',
      },
      tags: ['Node', { en: 'Heartbeat', es: 'Latido' }, 'Watchdog'],
      at: { x: 390, y: 455 },
    },

    // ── Supabase, self-hosted ───────────────────────────────────
    {
      id: 'storage',
      zone: 'supabase',
      label: { en: 'Storage', es: 'Storage' },
      sub: { en: 'Audio and results', es: 'Audio y resultados' },
      glyph: 'bucket',
      body: {
        en: 'Each song’s original, its stems as MP3, a MIDI file per stem, the analysis and the job’s log, in its owner’s folder. The mixer plays them straight from here.',
        es: 'El original de cada canción, sus stems en MP3, un MIDI por stem, el análisis y el log del proceso, en la carpeta de su propietario. El mezclador los reproduce directamente desde aquí.',
      },
      tags: ['Supabase Storage', 'MP3', 'MIDI', 'JSON'],
      at: { x: 870, y: 320 },
    },
    {
      id: 'postgres',
      zone: 'supabase',
      label: { en: 'Postgres', es: 'Postgres' },
      sub: { en: 'Songs · bands · charts', es: 'Canciones · grupos · hojas' },
      glyph: 'db',
      body: {
        en: 'Users, bands, songs and their status, and the band’s own version of each chart. The allow-list lives here too: only invited emails get in, and a band admin’s invite link adds you to the band.',
        es: 'Usuarios, grupos, canciones y su estado, y la versión de cada hoja corregida por el grupo. Aquí está también la lista de acceso: solo entran los correos invitados, y el enlace de invitación de un administrador te añade al grupo.',
      },
      tags: [
        'Postgres',
        'RLS',
        { en: 'Allow-list', es: 'Lista de acceso' },
        { en: 'Invite links', es: 'Enlaces de invitación' },
      ],
      at: { x: 690, y: 455 },
    },

    // ── The pipeline, in Python ─────────────────────────────────
    {
      id: 'demucs',
      zone: 'pipeline',
      label: { en: 'Demucs', es: 'Demucs' },
      sub: { en: 'Splits the stems', es: 'Separa los stems' },
      glyph: 'split',
      body: {
        en: 'Pulls the recording apart: bass, drums, vocals, guitar, piano and the rest. Three presets trade speed for quality, up to a fine-tuned model. It runs on the server’s CPU, with its weights baked into the image and checked against pinned hashes, so a job never downloads anything.',
        es: 'Separa la grabación en bajo, batería, voz, guitarra, piano y el resto. Tiene tres niveles, del más rápido al de más calidad, y el último usa un modelo afinado. Se ejecuta en la CPU del servidor, con los pesos incluidos en la imagen y verificados con hashes fijados, así que un trabajo nunca descarga nada.',
      },
      tags: [
        'PyTorch',
        'htdemucs',
        { en: 'Six stems', es: 'Seis stems' },
        'CPU',
      ],
      at: { x: 200, y: 640 },
    },
    {
      id: 'drums',
      zone: 'pipeline',
      label: { en: 'Omnizart', es: 'Omnizart' },
      sub: { en: 'Drums to MIDI', es: 'Batería a MIDI' },
      glyph: 'drum',
      body: {
        en: 'Turns the drum stem into kicks, snares, hi-hats, toms and cymbals. It runs in its own process, against the clock: if it fails or hangs, Basic Pitch takes the drums.',
        es: 'Convierte el stem de batería en bombo, caja, charles, toms y platos. Se ejecuta en su propio proceso y con un tiempo límite: si falla o se cuelga, la batería pasa a Basic Pitch.',
      },
      tags: [
        'Omnizart',
        'TensorFlow',
        { en: 'Time limit', es: 'Tiempo límite' },
      ],
      at: { x: 500, y: 640 },
    },
    {
      id: 'basicpitch',
      zone: 'pipeline',
      label: { en: 'Basic Pitch', es: 'Basic Pitch' },
      sub: { en: 'Notes to MIDI', es: 'Notas a MIDI' },
      glyph: 'roll',
      body: {
        en: 'Writes a MIDI file for each stem with notes, tuned per instrument: bass, vocals and guitar get their own range, and bass and vocals are cut down to one note at a time. A last pass moves bass notes heard an octave off, a phone recording’s usual mistake.',
        es: 'Genera un MIDI por cada stem con notas, ajustado a cada instrumento: bajo, voz y guitarra tienen su propio rango, y en bajo y voz solo suena una nota a la vez. Al final, corrige las notas de bajo detectadas una octava por encima, el error típico de las grabaciones hechas con el móvil.',
      },
      tags: [
        'Basic Pitch',
        { en: 'Per-instrument profiles', es: 'Perfiles por instrumento' },
        { en: 'Quantised', es: 'Cuantizado' },
      ],
      at: { x: 500, y: 770 },
    },
    {
      id: 'allin1',
      zone: 'pipeline',
      label: { en: 'allin1', es: 'allin1' },
      sub: { en: 'Sections and bars', es: 'Secciones y compases' },
      glyph: 'sections',
      body: {
        en: 'A model trained on labelled songs: it finds the verse, the chorus, the beats and the bars. It reuses Demucs’s split instead of separating again; on long takes, or with no stems, librosa steps in.',
        es: 'Un modelo entrenado con canciones etiquetadas: detecta estrofas, estribillos, pulsos y compases. Aprovecha la separación de Demucs en lugar de repetirla; con tomas largas, o si no hay stems, se usa librosa.',
      },
      tags: ['allin1', { en: 'Reuses the stems', es: 'Reutiliza los stems' }],
      at: { x: 200, y: 770 },
    },
    {
      id: 'librosa',
      zone: 'pipeline',
      label: { en: 'librosa', es: 'librosa' },
      sub: { en: 'Sections, the fallback', es: 'Secciones, de reserva' },
      glyph: 'wave',
      body: {
        en: 'Groups the song by how it sounds, and names each part by where it falls and the chords it shares with the others. Plainer than allin1, but it works on any take.',
        es: 'Divide la canción según cómo suena y pone nombre a cada parte según su posición y los acordes que comparte con las demás. Es más sencillo que allin1, pero funciona con cualquier toma.',
      },
      tags: ['librosa', 'MFCC'],
      at: { x: 200, y: 900 },
    },
    {
      id: 'madmom',
      zone: 'pipeline',
      label: { en: 'madmom', es: 'madmom' },
      sub: { en: 'Chords', es: 'Acordes' },
      glyph: 'note',
      body: {
        en: 'Listens to the whole mix for major and minor chords. It goes first because it matched real recordings best, and it takes a moment. If it hears no chord most of the time, Omnizart listens too.',
        es: 'Analiza la mezcla completa para detectar acordes mayores y menores. Va primero porque es el que más acierta con grabaciones reales, y apenas tarda. Si la mayor parte del tiempo no detecta ningún acorde, se prueba también con Omnizart.',
      },
      tags: ['madmom', { en: 'Major and minor', es: 'Mayores y menores' }],
      at: { x: 800, y: 640 },
    },
    {
      id: 'omnizart',
      zone: 'pipeline',
      label: { en: 'Omnizart', es: 'Omnizart' },
      sub: { en: 'Chords, the fallback', es: 'Acordes, de reserva' },
      glyph: 'chip',
      body: {
        en: 'A heavier model, trained on Billboard hits, kept as a second ear. Whichever of the two hears more chords wins; if both fail, the chords are read off Basic Pitch’s MIDI. Its audio plugin is built from source for the server’s ARM chip.',
        es: 'Un modelo más pesado, entrenado con éxitos de Billboard, que sirve de segunda opinión. Se queda el resultado del que detecte más acordes; si fallan los dos, los acordes se sacan del MIDI de Basic Pitch. Su plugin de audio se compila desde el código fuente para el procesador ARM del servidor.',
      },
      tags: [
        'Omnizart',
        'ARM64',
        { en: 'Second opinion', es: 'Segunda opinión' },
      ],
      at: { x: 800, y: 770 },
    },
    {
      id: 'builder',
      zone: 'pipeline',
      label: { en: 'Chart builder', es: 'Generador de la hoja' },
      sub: { en: 'The first draft', es: 'El primer borrador' },
      glyph: 'text',
      body: {
        en: 'Lays the chords over the sections. Where the chords change, a new section starts; a progression that repeats becomes one line and a number of laps. Saved as the song’s analysis: the chart the band starts from.',
        es: 'Coloca los acordes sobre las secciones. Donde cambian los acordes empieza una sección nueva, y una progresión que se repite se queda en una sola línea con su número de vueltas. Se guarda como el análisis de la canción: la hoja de la que parte el grupo.',
      },
      tags: [
        { en: 'Sections by chords', es: 'Secciones por acordes' },
        { en: 'Laps', es: 'Vueltas' },
        'JSON',
      ],
      at: { x: 500, y: 900 },
    },
  ],

  edges: [
    // In the browser, and the way in
    {
      from: 'library',
      to: 'google',
      kind: 'https',
      label: { en: 'sign in', es: 'entrar' },
    },
    {
      from: 'google',
      to: 'web',
      kind: 'https',
      label: { en: 'who you are', es: 'quién eres' },
    },
    {
      from: 'library',
      to: 'web',
      kind: 'files',
      label: {
        en: 'the recording, then its progress',
        es: 'la grabación y su progreso',
      },
    },
    {
      from: 'chart',
      to: 'web',
      kind: 'https',
      label: { en: 'loads and saves it', es: 'la carga y la guarda' },
    },
    {
      from: 'chart',
      to: 'mixer',
      kind: 'local',
      label: { en: 'jumps to a section', es: 'salta a una sección' },
    },
    {
      from: 'storage',
      to: 'mixer',
      kind: 'files',
      label: { en: 'stems and MIDI', es: 'stems y MIDI' },
    },
    // The web app and its Supabase
    {
      from: 'web',
      to: 'storage',
      kind: 'files',
      label: { en: 'the original', es: 'el original' },
    },
    {
      from: 'web',
      to: 'postgres',
      kind: 'local',
      label: {
        en: 'songs, bands, the allow-list',
        es: 'canciones, grupos, la lista',
      },
    },
    {
      from: 'web',
      to: 'queue',
      kind: 'local',
      label: { en: 'a job', es: 'un trabajo' },
    },
    {
      from: 'queue',
      to: 'worker',
      kind: 'local',
      label: { en: 'its turn', es: 'su turno' },
    },
    {
      from: 'worker',
      to: 'storage',
      kind: 'files',
      label: {
        en: 'the original in, the results out',
        es: 'descarga el original, sube el resto',
      },
    },
    {
      from: 'worker',
      to: 'postgres',
      kind: 'local',
      label: { en: 'progress, then ready', es: 'progreso y estado final' },
    },
    // The pipeline
    {
      from: 'worker',
      to: 'demucs',
      kind: 'files',
      label: { en: 'the original', es: 'el original' },
    },
    {
      from: 'demucs',
      to: 'drums',
      kind: 'files',
      label: { en: 'the drum stem', es: 'el stem de batería' },
    },
    {
      from: 'demucs',
      to: 'basicpitch',
      kind: 'files',
      label: { en: 'each stem with notes', es: 'cada stem con notas' },
    },
    {
      from: 'demucs',
      to: 'allin1',
      kind: 'files',
      label: { en: 'the same split', es: 'la misma separación' },
    },
    {
      from: 'drums',
      to: 'basicpitch',
      kind: 'fallback',
      label: { en: 'if it fails or hangs', es: 'si falla o se cuelga' },
    },
    {
      from: 'allin1',
      to: 'librosa',
      kind: 'fallback',
      label: { en: 'long takes, or no stems', es: 'tomas largas, o sin stems' },
    },
    {
      from: 'madmom',
      to: 'omnizart',
      kind: 'fallback',
      label: { en: 'if it hears no chords', es: 'si no oye acordes' },
    },
    {
      from: 'basicpitch',
      to: 'builder',
      kind: 'fallback',
      label: {
        en: 'chords from the MIDI, last of all',
        es: 'acordes del MIDI, como último recurso',
      },
    },
    {
      from: 'allin1',
      to: 'builder',
      kind: 'local',
      label: { en: 'sections and bars', es: 'secciones y compases' },
    },
    {
      from: 'librosa',
      to: 'builder',
      kind: 'local',
      label: { en: 'sections', es: 'secciones' },
    },
    {
      from: 'madmom',
      to: 'builder',
      kind: 'local',
      label: { en: 'chords', es: 'acordes' },
    },
    {
      from: 'omnizart',
      to: 'builder',
      kind: 'local',
      label: { en: 'chords', es: 'acordes' },
    },
  ],

  walkthroughs: [
    {
      id: 'upload',
      title: { en: 'Upload a song', es: 'Subir una canción' },
      steps: [
        {
          nodes: ['library', 'web'],
          caption: {
            en: 'A file, or a take from the room mic, goes up to the app.',
            es: 'Se sube a la aplicación un archivo o una toma grabada con el micro del local.',
          },
        },
        {
          nodes: ['web', 'storage', 'postgres'],
          caption: {
            en: 'The original lands in Storage, and the song gets its row, queued.',
            es: 'El original se guarda en Storage y la canción queda registrada, en cola.',
          },
        },
        {
          nodes: ['web', 'queue', 'worker'],
          caption: {
            en: 'It waits its turn, one song at a time, until the worker takes it.',
            es: 'Espera su turno, de una en una, hasta que la recoge el worker.',
          },
        },
        {
          nodes: ['worker', 'demucs'],
          caption: {
            en: 'The worker runs the pipeline: Demucs splits it into stems.',
            es: 'El worker ejecuta el pipeline: Demucs la separa en stems.',
          },
        },
        {
          nodes: ['demucs', 'drums', 'basicpitch', 'allin1'],
          caption: {
            en: 'Basic Pitch writes each stem’s MIDI and Omnizart the drums’; allin1 finds the sections in the same split.',
            es: 'Basic Pitch genera el MIDI de cada stem y Omnizart el de la batería; allin1 detecta las secciones con esa misma separación.',
          },
        },
        {
          nodes: ['allin1', 'madmom', 'builder'],
          caption: {
            en: 'madmom hears the chords, and the builder lays them over the sections.',
            es: 'madmom detecta los acordes y el generador los coloca sobre las secciones.',
          },
        },
        {
          nodes: ['worker', 'storage', 'postgres'],
          caption: {
            en: 'The worker uploads it all and marks the song ready.',
            es: 'El worker lo sube todo y marca la canción como lista.',
          },
        },
      ],
    },
    {
      id: 'practise',
      title: { en: 'Practise a hard part', es: 'Ensayar un pasaje difícil' },
      steps: [
        {
          nodes: ['storage', 'mixer'],
          caption: {
            en: 'The original plays at once; each stem loads when you unmute it.',
            es: 'El original suena al instante; cada stem se carga al quitarle el mute.',
          },
        },
        {
          nodes: ['mixer'],
          caption: {
            en: 'Solo the bass, mute the vocals, or play the bass line’s MIDI through a sampled bass.',
            es: 'Pones el bajo en solo, silencias la voz o escuchas el MIDI del bajo con un bajo sampleado.',
          },
        },
        {
          nodes: ['chart', 'mixer'],
          caption: {
            en: 'Tap the section on the chart, set A and B, and it loops.',
            es: 'Pulsas la sección en la hoja, marcas A y B, y se repite en bucle.',
          },
        },
      ],
    },
    {
      id: 'chord',
      title: { en: 'Fix a chord', es: 'Corregir un acorde' },
      steps: [
        {
          nodes: ['chart', 'web'],
          caption: {
            en: 'Anyone in the band corrects a chord, a section or its laps.',
            es: 'Cualquiera del grupo corrige un acorde, una sección o sus vueltas.',
          },
        },
        {
          nodes: ['web', 'postgres'],
          caption: {
            en: 'It is saved as the band’s version; whoever opens the song next sees it.',
            es: 'Se guarda como la versión del grupo, y es la que ve quien abra la canción después.',
          },
        },
        {
          nodes: ['worker', 'storage'],
          caption: {
            en: 'Reprocessing only rewrites the models’ draft. The band’s chart still wins.',
            es: 'Al reprocesar solo se sustituye el borrador de los modelos; la hoja del grupo tiene prioridad.',
          },
        },
      ],
    },
    {
      id: 'signin',
      title: { en: 'Get in, by invitation', es: 'Entrar, con invitación' },
      steps: [
        {
          nodes: ['library', 'google'],
          caption: {
            en: 'You sign in with Google.',
            es: 'Entras con Google.',
          },
        },
        {
          nodes: ['google', 'web', 'postgres'],
          caption: {
            en: 'The app looks for your email on the allow-list, and signs out anyone who isn’t on it.',
            es: 'La aplicación comprueba si tu correo está en la lista de acceso y cierra la sesión de quien no esté.',
          },
        },
        {
          nodes: ['library', 'web', 'postgres'],
          caption: {
            en: 'A band admin’s invite link puts you in the band, with its songs and charts.',
            es: 'El enlace de invitación de un administrador te añade al grupo, con sus canciones y sus hojas.',
          },
        },
      ],
    },
  ],

  offline: {
    label: { en: 'If a model fails', es: 'Si falla un modelo' },
    glyph: 'chip',
    note: {
      en: 'If a model fails, the song still comes out. Omnizart hangs on the drums: Basic Pitch writes them. allin1 can’t run: librosa finds the sections. madmom hears no chords: Omnizart listens again, and if both fail, the chords come from the MIDI.',
      es: 'Si falla un modelo, la canción se procesa igualmente. Si Omnizart se cuelga con la batería, la transcribe Basic Pitch. Si allin1 no puede ejecutarse, librosa detecta las secciones. Si madmom no detecta acordes, se prueba con Omnizart, y si fallan los dos, los acordes se sacan del MIDI.',
    },
    keep: [
      'library',
      'chart',
      'mixer',
      'google',
      'web',
      'queue',
      'worker',
      'storage',
      'postgres',
      'demucs',
      'basicpitch',
      'librosa',
      'omnizart',
      'builder',
    ],
    lose: [],
  },
};
