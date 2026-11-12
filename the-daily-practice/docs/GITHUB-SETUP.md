# Upload to your own private GitHub

## Simple browser method (no Terminal required)

1. On GitHub, choose **New repository**.
2. Name it `the-daily-practice` and select **Private**.
3. For the cleanest import, do not create a README, license or .gitignore on GitHub: those are already in this package.
4. Download and **unzip** the repository ZIP. Do **not** upload the ZIP as a single file; GitHub would store it as a ZIP, not as project source.
5. Open your new GitHub repository. Choose **uploading an existing file** (or **Add file → Upload files**).
6. Drag the extracted project's **contents**, including `dashboard`, `integrations`, `docs`, `tests`, `.github`, and root files, onto the upload page. Some file pickers hide dotfiles; use Finder's **Command–Shift–.** to reveal them.
7. Commit with the message `Initial private prototype`.

Alternatively, use GitHub Desktop to publish the extracted folder as a **private** repository.

## Optional Terminal method

After creating an **empty private repository** on GitHub:

```sh
cd /path/to/the-daily-practice
git init
git branch -M main
git add .
git commit -m "Initial private prototype"
git remote add origin https://github.com/YOUR_USERNAME/the-daily-practice.git
git push -u origin main
```

Authenticate with GitHub's browser/CLI/credential manager as prompted, **never paste a token into code or the repository**. A private GitHub repository is still not an encrypted password vault.

## Keeping your existing v0.3 data

This repository includes the v0.3 code **not your browser profile**. Export data in the old app and re-import carefully at the new site/origin. Ebook blobs are **not included** in the JSON export. Your earlier Chrome data is not migrated merely by cloning this repository.

To see private local changes without publishing, use `git status`. Never commit real ebooks, magician scripts or journals unless you've deliberately reviewed their privacy and rights.
