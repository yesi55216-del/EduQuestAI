# EduQuest Dungeon Master & Player

Buka `index.html` (klik dua kali). Internet hanya untuk Google Fonts.
Demo: kode room `QUEST1` (terbuka), `FULL01` (penuh).

## Alur
- Dungeon Master (guru): Role Selection -> Create Adventure Room -> Room Lobby (Teacher Panel, remove siswa, kapasitas, Start) -> Teacher Dashboard (mock)
- Player (siswa): Role Selection -> Join Room -> Character Selection -> Room Lobby (Ready, tunggu guru)

## Struktur
```
index.html
css/   base, modals, home, room-lobby, character-select, teacher
js/
  types.js                 JSDoc types + ROLE_PERMISSIONS / can()
  data/characters.js       4 karakter + path gambar
  mocks/                   mockStories, mockTeacher, mockRooms
  services/
    roomService.js         mock room API (ganti ke backend/Socket.IO)
    AIProvider.js          interface AI + MockAIProvider
    storyEngine.js         guru pegang arah cerita, AI hanya menyarankan
    learningEngine.js      tantangan & penjelasan
    sceneManager.js        scene: id, lokasi, background, karakter, dialog, pilihan
    backgroundManager.js   memetakan scene ke background yang sudah ada
  roles.js                 pemilihan peran + form Create Room
  teacher.js               Teacher Panel + Dashboard placeholder
  home.js, room-lobby.js, character-select.js, modals.js, effects.js, utils.js, state.js
assets/characters, assets/backgrounds
```
Semua data mock + localStorage. Tidak ada backend, AI sungguhan, atau login.

## Baru: Adventure System (sesuai spec "Subject-Based AI Adventure")
- 4 adventure (Math, Science, History, English/Language), masing-masing **tepat 4 chapter** (`js/mocks/mockAdventures.js`)
- **Gameplay** (`js/game.js`): dialog, background crossfade, soal individual (MC / open / scenario), diskusi grup, voting, recap, 4 ending, ringkasan belajar individu + prestasi grup
- **Adventure Studio** (`js/studio.js`, tombol 📖 Studio di lobby DM): generate (mock AI), edit chapter, CRUD + urut ulang soal, approve per chapter/soal, publish. Status: Draft → AI Generated → Needs Review → Approved → Published
- **AI Dungeon Assistant** (chat, di Studio dan collapsible di gameplay): AI hanya membuat *draft*, guru harus approve; tidak bisa menambah chapter ke-5
- **Audio** (`js/services/audioManager.js`): volume musik/SFX, mute musik/SFX/master, tidak autoplay. Belum ada file audio asli: sementara synth WebAudio sebagai placeholder. Isi `src` di `AUDIO_TRACKS` untuk file asli.
- **Background** (`js/services/backgroundManager.js`): asset ID per scene + fallback gradient. 9 background: castle.jpg + 8 ilustrasi SVG original (kingdom, forest, library, cave, temple, mountains, battlefield, peaceful) di `assets/backgrounds/`, dibuat oleh `tools/make_backgrounds.py` (edit skripnya lalu jalankan ulang untuk mengubah gambar). Mau pakai foto/gambar sendiri? Ganti `src` + isi `credit`.
- **AI provider** (`js/services/AIProvider.js`): `MockAIProvider` (jalan) + `APIAIProvider` (titik integrasi, kosong). Ganti dengan `setAIProvider(new APIAIProvider())`. Konfigurasi di `js/config.js` / `.env.example`. API key asli harus di backend.

Demo: buat room sebagai Dungeon Master (subject Mathematics sudah *Published*), atau klik 📖 Studio → Preview. Subject lain perlu di-approve + publish dulu supaya Player bisa masuk.
Catatan: spec meminta React/TS/Tailwind; ini dibangun di stack vanilla yang sudah ada supaya tetap jalan dengan klik dua kali. Struktur service/store/mocks sengaja dibuat sejajar dengan spec agar mudah dipindah ke React.
