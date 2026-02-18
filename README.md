# Public Access — Foundry VTT System

A Foundry VTT game system for **Public Access** (TTRPG).

## Installation (for players)

In Foundry: **Setup** → **Game Systems** → **Install System**. Use this **Manifest URL**:

```
https://raw.githubusercontent.com/robb2828/publicaccessfoundryvtt/main/system.json
```

Then choose **Public Access** when creating a world.

**Note:** If installation fails at the download step, a release may not exist yet. See “Releasing” below.

## Releasing (for maintainers)

So that “Install System” works fully (manifest + download), create a **GitHub Release** and attach:

1. **`system.json`**  
   Use the `system.json` from this repo (it must include the correct `version` and `download` URL for this release).

2. **`publicaccessfoundryvtt.zip`**  
   A zip of the **contents** of the system (so `system.json` is at the **root** of the zip, not inside a folder).

Then set in `system.json` (and in the `system.json` you attach to the release):

- **manifest:**  
  `https://raw.githubusercontent.com/robb2828/publicaccessfoundryvtt/main/system.json`  
  (or, for release-based manifest):  
  `https://github.com/robb2828/publicaccessfoundryvtt/releases/latest/download/system.json`
- **download:**  
  `https://github.com/robb2828/publicaccessfoundryvtt/releases/download/vX.Y.Z/publicaccessfoundryvtt.zip`  
  (replace `vX.Y.Z` with the release tag, e.g. `v0.1.0`).

After the first release exists, you can switch the manifest to the releases URL so update checks use the release manifest.
