// Which profile picture a player shows, decided on the server in one place
// (ADR 0002: users.avatar_url is the single selector).
//
// A picture comes from the level default, Google, the shop or an achievement.
// Player uploads were retired on 2026-10-16: the free host has no persistent
// disk, so an uploaded file disappears at the next restart while the account
// still points at it. Rows that still name an upload resolve to the default.
const AVATAR_SOURCE = Object.freeze({
  DEFAULT: 'default',
  UPLOAD: 'upload',
  GOOGLE: 'google',
  SHOP: 'shop',
  ACHIEVEMENT: 'achievement',
});
const AVATAR_DEFAULT_BEGINNER = '/uploads/avatar-beginner.svg';
const AVATAR_DEFAULT_EXPERT = '/uploads/avatar-expert.svg';
const AVATAR_EXPERT_LEVEL = 10;

const levelDefault = (level) => ({
  url: Number(level || 1) >= AVATAR_EXPERT_LEVEL ? AVATAR_DEFAULT_EXPERT : AVATAR_DEFAULT_BEGINNER,
  source: AVATAR_SOURCE.DEFAULT,
});

const resolveAvatar = (user) => {
  // A picture with no recorded source was chosen before avatar_source existed,
  // which only uploads did.
  const source = user?.avatar_source || AVATAR_SOURCE.UPLOAD;
  if (user?.avatar_url && source !== AVATAR_SOURCE.UPLOAD) return { url: user.avatar_url, source };
  return levelDefault(user?.level);
};

// Every picture this player can switch to, for the profile picker: the level
// default, the remembered Google picture, and every PROFILE_PICTURE they own.
// `selected` marks the one shown now.
const avatarOptions = ({ user, ownedPictures }) => {
  const options = [
    { source: AVATAR_SOURCE.DEFAULT, url: levelDefault(user.level).url, label: 'รูปเริ่มต้น' },
    ...(user.google_picture_url ? [{ source: AVATAR_SOURCE.GOOGLE, url: user.google_picture_url, label: 'รูปจาก Google' }] : []),
    ...ownedPictures.map((picture) => ({ source: AVATAR_SOURCE.SHOP, itemId: Number(picture.item_id), url: picture.asset_url, label: picture.name })),
  ];
  const current = resolveAvatar(user).url;
  return options.map((option) => ({ ...option, selected: option.url === current }));
};

module.exports = { AVATAR_SOURCE, avatarOptions, resolveAvatar };
