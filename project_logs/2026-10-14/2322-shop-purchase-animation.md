# Shop purchase confirmation

Date and time: 2026-10-14 23:22 (Asia/Bangkok)

## Changed files

- `client/src/components/shop/PurchaseSuccessPopup.jsx` — animated confirmation card.
- `client/src/pages/ShopPage.jsx` — show confirmation after a successful item or set purchase and block duplicate purchase requests.
- `client/public/locales/th/translation.json` and `client/public/locales/en/translation.json` — confirmation and pending-state copy.
- This work log.

## Reason and impact

Players previously received no clear visual confirmation after buying cosmetics. The new popup confirms what was bought without blocking further shopping. The change is limited to the cosmetic shop UI and translations; it does not alter the purchase API, database schema, currency rules, Arcade items, or Bot AI. It uses the existing purchase response and may show the current shop error state if that request fails.

## Change and validation

- Added an animated, non-blocking purchase-success popup for both individual cosmetics and theme sets. The popup shows the purchased name and preview, supports Thai/English, closes automatically or by button, and disables motion when the user prefers reduced motion.
- The popup appears only after a successful API response. Purchase buttons are temporarily disabled while a request is pending to prevent accidental duplicate purchases.
- Validation: client `npm test` passed 35 tests; `npm run lint` had no errors (7 existing warnings); `npm run build` passed.
- Browser test at 390px with player `pong`: purchased two free (0-coin) items, `Heart` and `he`; saw the success popup after each request; refreshed and confirmed both items were owned and the page had no horizontal overflow. No coins were spent.

## Remaining work

The paid set purchase path was reviewed in code but not exercised on the live account to avoid spending coins. It should be checked with a dedicated test account before release.
