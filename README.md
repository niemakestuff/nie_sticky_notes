# Nie Sticky Notes
Microsoft Sticky Notes clone but better.

## Stack
Tauri + React + TypeScript

## How to develop
Make sure to install Tauri prerequisites first:
https://v2.tauri.app/start/prerequisites/

**If developing from Linux, recommended to use Nix:**
```bash
nix-shell shell.nix
```

**If developing from WSL:**
It's recommended to put the repo in Windows and run the development server from there.
For other dev stuff like writing the code and using git, you can do it in WSL.

**Run the dev server:**
```bash
pnpm tauri dev
```
