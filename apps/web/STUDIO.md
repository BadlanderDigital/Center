# ShoRebel Studio

Menu label: Studio. Host: https://studio.shorebel.com

Station subscribers and master admin only. The Pages function in `functions/_middleware.js` refuses the editor without a signed session from ShoRebel `POST /api/studio-session`.

Set the same `STUDIO_GATE_SECRET` on this Pages project and on the ShoRebel Pages project. Do not commit the secret.

Brand name, logo, colors, website, and bio are copied into the editor brand kit when a session opens. Buttons are pills. The wordmark is the ShoRebel mark with the word Studio.
