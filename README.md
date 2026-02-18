# Public Access — Foundry VTT System

A Foundry VTT game system for **Public Access** (TTRPG).

## Installation (for players)

In Foundry: **Setup** → **Game Systems** → **Install System**. Use this **Manifest URL**:

```
https://raw.githubusercontent.com/robb2828/publicaccessfoundryvtt/main/system.json
```

Then choose **Public Access** when creating a world.

*(If you see “Failure to download package from URL”, the maintainer has not created a release yet—see below.)*

---

## Creating your first release (maintainers)

Install fails at the download step until a GitHub Release exists with the system zip. Do this once:

1. **Build the zip** (from the repo root):
   ```bash
   chmod +x build-release.sh
   ./build-release.sh 0.1.0
   ```
   This creates `publicaccessfoundryvtt.zip` with the correct structure (system.json at root).

2. **Create a GitHub Release:**
   - Repo → **Releases** → **Create a new release**
   - Tag: `v0.1.0` (must match version in system.json)
   - Title: e.g. `v0.1.0`
   - Attach **`publicaccessfoundryvtt.zip`** (drag and drop)
   - Publish the release

3. **Install again in Foundry** using the manifest URL above. The download step will now succeed.

The `system.json` in this repo already points the download URL at `releases/latest/download/publicaccessfoundryvtt.zip`, so any new release that includes that asset name will work for “Install System” and updates.
