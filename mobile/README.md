# KUJUK – كجوك | Android & iOS delivery plan

This is an implementation plan, not a packaged or tested native app. Neither Android nor iOS support has been claimed. The Next.js storefront is responsive and has been tested at a mobile viewport; this does not replace native testing.

## Proposed Expo app

- Create `mobile/app` (Expo Router + TypeScript) after choosing supported Android/iOS versions and store identifiers; proposed identifier `com.kujuk.marketplace` subject to account ownership/availability.
- Tabs: home/search, categories, cart, favorites and account. Stack: product, shop, checkout, order detail/tracking and notifications. Keep seller/admin tools on the web first.
- Use the shared [`checkout.d.ts`](../shared/checkout.d.ts) and the same API. Configure a **public HTTPS** site origin (`EXPO_PUBLIC_KUJUK_ORIGIN`); never embed a Firebase service account or point a phone at a sandbox loopback address.
- Native Firebase Auth supports ID tokens. Treat `POST /api/auth/firebase` as the first-session bootstrap and use `Authorization: Bearer <Firebase ID token>` for protected calls. Use platform-appropriate secure session storage and test logout/revocation. Android/iOS OAuth, Firebase project registration and native verification flows must be configured per environment.
- Persist the cart and idempotency key locally. Fetch `POST /api/orders/quote` with item IDs/quantities, country, currency and coupon, then call `POST /api/orders` with address, confirmed total and `Idempotency-Key` UUID. For a lost response use `GET /api/orders/recovery/:key` to retrieve the existing order. Never calculate the amount payable or mutate inventory on the device.
- Reuse translation keys and test RTL layout, bidi order references, regional phone/address inputs and explicit currency formatting. Apply the KUJUK palette and emblem. Use accessible touch targets and platform screen readers.
- Inbox is `GET /api/notifications`. The built FCM subscription flow is **Web Push only**. Add a native platform-specific token registration / FCM or APNs adapter, rotate tokens and unregister on logout before relying on device push.

## Native release checks

Build Expo development profiles with the Android SDK or EAS, and with Xcode/macOS or EAS for iOS. Verify signup, email links, browsing/search, flaky/offline checkout recovery, COD receipt, notifications and tracking on physical Android and iOS devices. Review permissions/privacy strings and submit signed builds. Play Console and Apple Developer Program accounts, and possibly EAS build usage, incur separate costs. Do not declare native readiness before both builds and tests are complete.
