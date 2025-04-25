## Summary

This guide demonstrates how to package a multi-file TypeScript ES-Module server into a single executable using Node.js’s SEA feature and **postject**, targeting the latest LTS Node via **nvm**. You will:

1. Install and manage Node.js versions with nvm.
2. Scaffold a simple HTTP server in TypeScript and enable ES modules.
3. Configure `tsconfig.json` for modern ESM output.
4. Bundle your code into one file using your custom `build.mjs` script.
5. Generate a SEA preparation blob with `node --experimental-sea-config`.
6. Inject the blob into the Node binary using **postject**.
7. Run your standalone executable to verify success.

---

## Prerequisites

- A Unix-like shell (`bash` or `zsh`).
- `curl` or `wget` for downloading install scripts.
- `git` for cloning repositories and installing nvm.

---

## 1. Install Node.js via nvm

1. **Install nvm**:

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
   ```

   This clones the nvm repository and updates your shell profile.

2. **Load nvm** (restart your terminal or run):

   ```bash
   source ~/.bashrc   # or `source ~/.zshrc`
   ```

   Makes the `nvm` command available in your session.

3. **Install & use the latest LTS**:

   ```bash
   nvm install --lts
   nvm use --lts
   ```

   After this, `node -v` should print the latest LTS version.

4. **Verify installation**:
   ```bash
   node -v
   npm -v
   ```
   Ensure both commands run without error.

---

## 2. Scaffold the ES-Module Server

1. **Initialize your project**:

   ```bash
   mkdir myapp && cd myapp
   npm init -y
   ```

   Creates `package.json` with default values.

2. **Enable ES modules**:
   In `package.json`, add:

   ```json
   {
     "type": "module",
     "scripts": {
       "start": "node server.bundle.js"
     }
   }
   ```

   Tells Node.js to interpret `.js` files as ES modules.

3. **Create the entry point** (`server.ts`):

   ```typescript
   import http from "node:http";

   const PORT = +(process.env.PORT || 3000);
   export const server = http.createServer((req, res) => {
     res.writeHead(200, { "Content-Type": "text/plain" });
     res.end(`Hello from standalone server!\n`);
   });

   server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
   ```

   A basic HTTP server responding on port 3000.

---

## 3. Configure TypeScript

1. **Generate a base `tsconfig.json`**:

   ```bash
   npx tsc --init
   ```

   Creates a template configuration file.

2. **Edit `tsconfig.json`**:
   ```json
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
  "include": ["./**/*.ts"],
  "exclude": ["node_modules", "dist", "dist/**/*.ts", "build"]
}   ```
   - `"module": "ESNext"` for modern ESM output.
   - `"sourceMap": true` emits `.map` files for debugging.

---

## 4. Bundle Your Code

1. **Ensure your `build.mjs`** script is present at the project root. This script should invoke esbuild or rollup to produce `server.bundle.js`.

2. **Run the build script**:
   ```bash
   node build.mjs
   ```
   Produces `server.bundle.js` as a single bundled file.

---

## 5. Generate the SEA Preparation Blob

1. **Create `sea-config.json`**:

   ```json
   {
     "main": "server.bundle.js",
     "output": "sea-prep.blob",
     "disableExperimentalSEAWarning": true,
     "useSnapshot": false,
     "useCodeCache": false
   }
   ```

   Matches the Node.js SEA schema.

2. **Run Node with SEA config**:
   ```bash
   node --experimental-sea-config sea-config.json
   ```
   Outputs:
   ```text
   Wrote single executable preparation blob to sea-prep.blob
   ```
   Embeds your bundle and V8 code cache.

---

## 6. Inject the Blob into the Node Binary

1. **Duplicate the Node executable**:

   ```bash
   cp "$(which node)" myserver
   ```

   Creates `myserver` for modification.

2. **(macOS only) Strip the code signature**:

   ```bash
   codesign --remove-signature myserver
   ```

   Allows Mach-O segment updates.

3. **Inject using postject**:

   ```bash
   npx postject myserver \
     NODE_SEA_BLOB \
     sea-prep.blob \
     --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
     --macho-segment-name NODE_SEA \
     --overwrite
   ```

   Embeds the SEA blob into the binary.

4. **(macOS only) Re-sign the binary (optional)**:
   ```bash
   codesign -s - myserver
   ```
   Restores a valid signature for system compatibility.

---

## 7. Run Your Standalone Executable

```bash
./myserver
```

You should see:

```
Listening on port 3000
```

Confirming your single-executable server is running without an external Node.js install.
