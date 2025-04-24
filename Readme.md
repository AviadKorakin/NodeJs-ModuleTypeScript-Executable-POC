<!-- README.md -->

## Summary

This guide shows how to package a multi-file TypeScript ES-module server (entry point `server.ts`) into a **single executable** using Node.js’s Single Executable Applications (SEA) feature and **postject**, always targeting the latest LTS Node via **nvm** [oai_citation_attribution:0‡Node.js — Run JavaScript Everywhere](https://nodejs.org/api/single-executable-applications.html?utm_source=chatgpt.com).

---

## Prerequisites

- A Unix-like shell (macOS/Linux) with `bash` or `zsh`.
- `curl` or `wget` for downloading scripts.
- `git` for nvm installation.

---

## 1. Install “Latest LTS” Node via nvm

1. **Install nvm**  
   Run the official install script to clone nvm into `~/.nvm` and update your shell profile:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
   ```

This script clones the nvm repo and adds export NVM_DIR=… and source $NVM_DIR/nvm.sh to your shell startup file ￼. 2. Load nvm into your shell
Restart your terminal or run:

source ~/.bashrc # or `source ~/.zshrc`

This makes the nvm command available in your session ￼.

    3.	Install & use the latest LTS

nvm install --lts
nvm use --lts

After this, node -v should print the latest LTS version (e.g. v24.x.x) ￼.

⸻

2. Scaffold the ES-Module Server
   1. Initialize your project

mkdir myapp && cd myapp
npm init -y

    2.	Enable ES modules

In package.json, add:

{
"type": "module",
"scripts": {
"start": "node server.bundle.js"
}
}

    3.	Create your entry point

server.ts:

import http from 'node:http';

const PORT = +(process.env.PORT || 3000);
export const server = http.createServer((req, res) => {
res.writeHead(200, { 'Content-Type': 'text/plain' });
res.end(`Hello from standalone server!\n`);
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

This simple HTTP server responds on port 3000 ￼.

⸻

3. Configure TypeScript
   1. Generate a base tsconfig.json:

npx tsc --init

This creates a template you can customize ￼.

    2.	Edit tsconfig.json:

{
"compilerOptions": {
"target": "ES2020",
"module": "ESNext",
"moduleResolution": "node",
"esModuleInterop": true,
"allowSyntheticDefaultImports": true,
"strict": true,
"skipLibCheck": true,
"sourceMap": true
},
"include": ["server.ts", "routes/**/*.ts"]
}

    •	module: "ESNext" ensures modern ESM output  ￼.
    •	sourceMap: true emits .map files for debugging.

⸻

4. Bundle Your Code

esbuild 1. Install:

npm install --save-dev esbuild

    2.	Bundle:

node build.mjs

Outputs a single CommonJS bundle quickly ￼.

⸻

5. Generate the SEA Preparation Blob
   1. Write sea-config.json:

{
"main": "server.bundle.js",
"output": "sea-prep.blob",
"disableExperimentalSEAWarning": true,
"useSnapshot": false,
"useCodeCache": false
}

Matches Node.js SEA schema ￼.

    2.	Run:

node --experimental-sea-config sea-config.json

Prints:

Wrote single executable preparation blob to sea-prep.blob

Embeds your bundle and V8 code cache ￼.

⸻

6. Copy & Inject into Node Binary
   1. Duplicate the nvm-managed Node executable:

cp "$(which node)" myserver

    2.	(macOS) Strip signature:

codesign --remove-signature myserver

Required to modify Mach-O segments ￼.

    3.	Inject via postject:

npx postject myserver \
 NODE_SEA_BLOB \
 sea-prep.blob \
 --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
 --macho-segment-name NODE_SEA \
 --overwrite

Flips the single fuse entry and embeds your blob ￼.

    4.	(macOS) Re-sign (optional):

codesign --sign - myserver

⸻

7. Run Your Standalone Executable

./myserver

You should see:

Listening on port 3000

instead of the Node REPL prompt, confirming your single-executable server ￼.

⸻

Enjoy your self-contained Node.js server—no external Node install needed!
