const assert = require('node:assert/strict');
const test = require('node:test');

const { AVATAR_SOURCE, avatarOptions, resolveAvatar } = require('../avatar');

// Players no longer upload their own profile picture: the free host has no
// persistent disk, so an uploaded file vanishes at the next restart while the
// account still points at it. A profile picture comes from the level default,
// Google, the shop or an achievement (CONTEXT.md, "รูปโปรไฟล์").

test('a chosen shop, Google or achievement picture is shown as chosen', () => {
  for (const source of [AVATAR_SOURCE.SHOP, AVATAR_SOURCE.GOOGLE, AVATAR_SOURCE.ACHIEVEMENT]) {
    assert.deepEqual(resolveAvatar({ level: 3, avatar_url: '/uploads/x.svg', avatar_source: source }), { url: '/uploads/x.svg', source });
  }
});

test('an old uploaded picture falls back to the level default instead of a broken image', () => {
  assert.deepEqual(resolveAvatar({ level: 3, avatar_url: '/uploads/old.jpg', avatar_source: 'upload' }),
    { url: '/uploads/avatar-beginner.svg', source: AVATAR_SOURCE.DEFAULT });
  assert.deepEqual(resolveAvatar({ level: 12, avatar_url: '/uploads/old.jpg', avatar_source: 'upload' }),
    { url: '/uploads/avatar-expert.svg', source: AVATAR_SOURCE.DEFAULT });
  // Pictures chosen before avatar_source existed were uploads too.
  assert.deepEqual(resolveAvatar({ level: 1, avatar_url: '/uploads/older.jpg', avatar_source: null }),
    { url: '/uploads/avatar-beginner.svg', source: AVATAR_SOURCE.DEFAULT });
});

test('no chosen picture means the level default', () => {
  assert.equal(resolveAvatar({ level: 9 }).url, '/uploads/avatar-beginner.svg');
  assert.equal(resolveAvatar({ level: 10 }).url, '/uploads/avatar-expert.svg');
  assert.equal(resolveAvatar(null).url, '/uploads/avatar-beginner.svg');
});

test('the picker offers the default, Google and owned shop pictures, never an upload', () => {
  const user = {
    level: 10,
    avatar_url: 'https://lh3.googleusercontent.com/a/me', avatar_source: 'google',
    uploaded_picture_url: '/uploads/old.jpg', google_picture_url: 'https://lh3.googleusercontent.com/a/me',
  };
  const options = avatarOptions({ user, ownedPictures: [{ item_id: 7, name: 'Cat', asset_url: '/uploads/avatar-shop-cat.svg' }] });
  assert.deepEqual(options.map((option) => option.source), ['default', 'google', 'shop']);
  assert.deepEqual(options.filter((option) => option.selected).map((option) => option.source), ['google']);
  assert.deepEqual(options[2], { source: 'shop', itemId: 7, url: '/uploads/avatar-shop-cat.svg', label: 'Cat', selected: false });
});

test('a player still pointing at an old upload sees the default selected', () => {
  const options = avatarOptions({ user: { level: 2, avatar_url: '/uploads/old.jpg', avatar_source: 'upload', uploaded_picture_url: '/uploads/old.jpg' }, ownedPictures: [] });
  assert.deepEqual(options.map((option) => [option.source, option.selected]), [['default', true]]);
});
