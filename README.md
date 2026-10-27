# Edna💎 · Birthday Jackpot

A romantic birthday website built with plain HTML, CSS and JavaScript (no frameworks).

## Open in VS Code
1. Unzip the folder, then in VS Code choose **File → Open Folder** and pick `edna-birthday-jackpot`.

## Add your photo and song
- Photo: put it at `assets/images/edna-memory.jpeg` (or `edna-memory.jpg`, both work; portrait, about 800×1000 px, under 300 KB works well).
- Song: put it at `assets/audio/birthday-song.mp3`.
- If either file is missing, the site shows a friendly placeholder or message instead of breaking.

## Run locally
- Easiest: install the **Live Server** extension, right-click `index.html`, then **Open with Live Server**.
- Or just double-click `index.html`. Or run `python3 -m http.server 8000` in the folder and visit `http://localhost:8000`.

## Publish with GitHub Pages
1. Create a GitHub repository and upload all the files, keeping the folder structure.
2. Go to **Settings → Pages**, set Source to **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. After a minute, your link appears at the top of the Pages screen. Send it to Edna.

## How the jackpot works
- Prizes shown: GH₵1,000, GH₵500, GH₵150, GH₵100. The animation cycles through all of them, then slows and always stops on **GH₵150** (fixed in `js/script.js`, no randomness).
- The attempt is saved the instant she taps Spin (`localStorage`, key `edna_birthday_jackpot_v1`). The button is disabled, rapid taps are ignored, and after a refresh or replay she sees her original GH₵150 result with no second spin.
- Claiming only shows a message. The site never moves money or asks for payment details. You arrange the GH₵150 gift yourself.

## localStorage limits
It only stops casual repeat attempts in the same browser. Clearing site data, private browsing or another device allows another spin. It is not tamper-proof, which is fine because the result is always GH₵150 anyway.
To test again as the developer: open DevTools → Application → Local Storage and delete `edna_birthday_jackpot_v1`.
