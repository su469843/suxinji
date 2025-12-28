const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '../package.json');
const changelogPath = path.join(__dirname, '../chenglog/chenglog.md');
const versionJsonPath = path.join(__dirname, '../chenglog/version.json');

const GITHUB_REPO = process.env.GITHUB_REPOSITORY || "su469843/M3U8-Downloader";

try {
    // 1. Get version from package.json or environment
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const version = process.env.APP_VERSION || packageJson.version;
    console.log(`Generating version info for: ${version} (Repo: ${GITHUB_REPO})`);

    // 2. Read changelog
    let changelogContent = '';
    if (fs.existsSync(changelogPath)) {
        changelogContent = fs.readFileSync(changelogPath, 'utf8');
    } else {
        console.warn('Warning: chenglog.md not found.');
    }

    // 3. Extract notes for this version
    const lines = changelogContent.split(/\r?\n/);
    let notesLines = [];
    let isCurrentVersion = false;

    const versionRegex = new RegExp(`^[#\\s]*v?${version.replace(/\./g, '\\.')}\\s*$`);
    const anyVersionRegex = /^[#\s]*v?\d+\.\d+\.\d+/;

    for (const line of lines) {
        if (versionRegex.test(line.trim())) {
            isCurrentVersion = true;
            continue;
        }

        if (isCurrentVersion) {
            if (anyVersionRegex.test(line.trim()) && !versionRegex.test(line.trim())) {
                break;
            }
            notesLines.push(line);
        }
    }

    let notes = notesLines.join('\n').trim();
    if (!notes) {
        notes = "No release notes provided.";
    }

    // 4. Construct download links
    const baseUrl = `https://github.com/${GITHUB_REPO}/releases/download/v${version}`;
    const downloadLinks = {
        windows: `${baseUrl}/M3U8.Downloader.Setup.${version}.exe`,
        macos: `${baseUrl}/M3U8.Downloader-${version}.dmg`,
        linux: `${baseUrl}/M3U8.Downloader-${version}.AppImage`
    };

    const output = {
        version: version,
        date: new Date().toISOString().split('T')[0],
        notes: notes,
        url: downloadLinks.windows, // Default to windows for simple check
        downloads: downloadLinks
    };

    // 5. Write to version.json
    fs.writeFileSync(versionJsonPath, JSON.stringify(output, null, 2), 'utf8');
    console.log(`Successfully generated version.json for v${version}`);
    console.log(output);

} catch (err) {
    console.error('Error generating version.json:', err);
    process.exit(1);
}
