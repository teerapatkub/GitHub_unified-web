const assert = require('node:assert/strict');
const { startTestApp } = require('./theme-test-app');
const { issueAdminToken, verifyAdminToken } = require('../adminAccess');

(async () => {
  const fixture = await startTestApp();
  const { client, origin } = fixture;
  let checks = 0;
  const request = async (route, method = 'GET', body, token = fixture.adminToken) => {
    const response = await fetch(`${origin}/api/themes${route}`, {
      method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: response.status, data: await response.json() };
  };
  const check = (actual, expected, message) => { assert.deepEqual(actual, expected, message); checks++; console.log(`PASS ${message}`); };
  try {
    const baseline = (await client.query('SELECT * FROM pg_temp.shop_items ORDER BY item_id')).rows;
    const publicBaseline = (await client.query('SELECT * FROM public.shop_items ORDER BY item_id')).rows;
    check((await request('/', 'GET', null, '')).status, 401, 'Missing identity is rejected');
    check((await request('/', 'GET', null, '900001')).status, 401, 'Knowing an admin id does not grant access');
    check(verifyAdminToken(fixture.adminToken + 'tampered'), null, 'Tampered login rejected');
    check(verifyAdminToken(issueAdminToken({ user_id: 900001, role: 'admin' }, 0)), null, 'Expired login rejected');
    check(issueAdminToken({ user_id: 900002, role: 'user' }), undefined, 'Student login receives no admin token');
    const staleToken = issueAdminToken({ user_id: 900002, role: 'admin' });
    check((await request('/', 'GET', null, staleToken)).status, 403, 'Database role revocation takes effect');
    for (const [route, type] of [['/', 'MOUSE_EFFECT'], ['/themes', 'THEME'], ['/frames', 'PROFILE_FRAME'], ['/backgrounds', 'PROFILE_BACKGROUND']]) {
      const body = { name: `QA ${type}`, description: 'Temporary test only', price: 42, asset_url: '/uploads/cyber-theme.svg', preview_image: '', is_active: true,
        effects: type === 'MOUSE_EFFECT' ? [{ trigger: 'click', visual: '💖', color: '#ff69b4', size: 24, duration: 800 }] : [] };
      const created = await request(route, 'POST', body);
      check(created.status, 201, `${type} can be created`);
      check(created.data.item_type, type, `${type} maps to the shop category`);
      check((await request(route)).data.some(row => row.item_id === created.data.item_id), true, `${type} persists after reload`);
      const idRoute = `${route === '/' ? '' : route}/${created.data.item_id}`;
      check((await request(idRoute, 'PUT', { ...body, name: `${body.name} edited`, is_active: false })).status, 200, `${type} can be edited/hidden`);
      const shop = await (await fetch(`${origin}/api/shop/items`)).json();
      check(shop.some(row => row.item_id === created.data.item_id), false, `${type} hidden from shop`);
      check((await request(idRoute, 'PUT', body)).data.is_active, 1, `${type} can be restored`);
      check((await request(route, 'POST', { ...body, price: -1 })).status, 400, 'Negative price rejected');
      check((await request(route, 'POST', { ...body, asset_url: 'javascript:alert(1)' })).status, 400, 'Unsafe asset URL rejected');
      const wrongRoute = type === 'MOUSE_EFFECT' ? '/themes' : '/';
      const wrongBody = { ...body, effects: [{ trigger: 'click', visual: '💖', color: '#ff69b4', size: 24, duration: 800 }] };
      check((await request(`${wrongRoute === '/' ? '' : wrongRoute}/${created.data.item_id}`, 'PUT', wrongBody)).status, 404, 'Cannot edit a different category');
    }
    check((await client.query('SELECT * FROM pg_temp.shop_items WHERE item_id < 1000000 ORDER BY item_id')).rows, baseline, 'Adding/editing new items preserves every existing item and image');
    const existing = baseline.find(row => row.item_type === 'THEME' && row.set_key);
    assert.ok(existing, 'Fixture includes a directly imported theme set');
    const edited = await request(`/themes/${existing.item_id}`, 'PUT', {
      name: `${existing.name} QA`, description: existing.description || '', price: Number(existing.price),
      asset_url: existing.asset_url, preview_image: existing.preview_image || '', is_active: false, effects: [],
    });
    check(edited.status, 200, 'Existing imported theme can be managed');
    check([edited.data.set_key, edited.data.rarity, edited.data.asset_url, edited.data.effects],
      [existing.set_key, existing.rarity, existing.asset_url, existing.effects], 'Editing preserves set membership, rarity, image and theme metadata');
    check((await client.query('SELECT * FROM public.shop_items ORDER BY item_id')).rows, publicBaseline, 'Live Supabase shop items remain unchanged');
    console.log(`${checks} checks passed (temporary tables only)`);
  } finally { await fixture.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
