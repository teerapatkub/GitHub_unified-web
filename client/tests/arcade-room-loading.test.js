import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let vite;
let PublicRoomBrowser;

before(async () => {
  vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  ({ default: PublicRoomBrowser } = await vite.ssrLoadModule('/src/pages/Arcade/widgets/PublicRoomBrowser.jsx'));
});

after(async () => { await vite?.close(); });

function renderRoomBrowser(overrides = {}) {
  return renderToStaticMarkup(createElement(PublicRoomBrowser, {
    rooms: [],
    roomsLoaded: false,
    roomsError: false,
    fetchRooms: () => {},
    searchCode: '',
    setSearchCode: () => {},
    handleSearchJoin: () => {},
    setShowCreateModal: () => {},
    setJoinPasswordPrompt: () => {},
    handleJoinRoom: () => {},
    t: key => key,
    ...overrides,
  }));
}

test('Arcade room browser keeps loading, empty, and error states distinct', () => {
  const loading = renderRoomBrowser();
  assert.match(loading, /aria-label="กำลังโหลดห้อง Arcade/);
  assert.doesNotMatch(loading, /noRoomsTitle|โหลดรายการห้องไม่สำเร็จ/);

  const empty = renderRoomBrowser({ roomsLoaded: true });
  assert.match(empty, /noRoomsTitle/);
  assert.doesNotMatch(empty, /กำลังโหลดห้อง Arcade|โหลดรายการห้องไม่สำเร็จ/);

  const error = renderRoomBrowser({ roomsLoaded: true, roomsError: true });
  assert.match(error, /โหลดรายการห้องไม่สำเร็จ/);
  assert.doesNotMatch(error, /noRoomsTitle/);
});

test('Arcade room browser shows a skeleton again while refreshing prior rooms', () => {
  const room = { room_id: 1, room_name: 'Test room', room_code: 'ARC-1234', current_players: 1, max_players: 4 };
  const ready = renderRoomBrowser({ rooms: [room], roomsLoaded: true });
  assert.match(ready, /Test room/);

  const refreshing = renderRoomBrowser({ rooms: [room], roomsLoaded: false });
  assert.match(refreshing, /aria-label="กำลังโหลดห้อง Arcade/);
  assert.doesNotMatch(refreshing, /Test room/);
});
