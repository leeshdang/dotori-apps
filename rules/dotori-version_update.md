# Dotori Family Unified Versioning & Build Auto-Update Rules

This rule is mandatory across all projects, repositories, web apps, Windows desktop executables/installers, and Android mobile applications for the Dotori Family.

---

## 1. Core Version Format

Every Dotori application MUST adopt the standardized **Timestamp-Based Versioning Scheme**:

```
[APP_PREFIX]-YYYYMMDD_HHMM
```

- **`APP_PREFIX`**: Unique uppercase acronym designated for the Dotori application (see Section 2).
- **`YYYY`**: 4-digit Year (e.g., `2026`)
- **`MM`**: 2-digit Month (`01`–`12`)
- **`DD`**: 2-digit Day (`01`–`31`)
- **`_`**: Separator underscore
- **`HH`**: 2-digit Hour in 24-hour format (`00`–`23`, Local Time KST / UTC+9)
- **`MM`**: 2-digit Minute (`00`–`59`)

**Example**: `DVIV-20261017_1527`

---

## 2. Dotori Family App Registry & Prefixes

| Application Name | Korean / Purpose | Designated Prefix | Version Example |
| :--- | :--- | :--- | :--- |
| **Dotori VR 이미지 뷰어** | VR 용 이미지 뷰어 | **`DVIV`** | `DVIV-20261017_1527` |
| **Dotori 이미지 뷰어** | 데스크톱 / 웹 이미지 뷰어 | **`DIV`** | `DIV-20261017_1527` |
| **Dotori 4k downloader** | 4K 비디오 / 미디어 다운로더 | **`D4kD`** | `D4kD-20261017_1527` |
| **Dotori QR maker** | QR 코드 생성기 | **`DQM`** | `DQM-20261017_1527` |
| **Dotori Go-Learning** | 바둑 학습 및 기보 분석 | **`DGL`** | `DGL-20261017_1527` |
| **Dotori Screen Recorder** | 화면 캡처 및 레코더 | **`DSR`** | `DSR-20261017_1527` |
| **Dotori mp3 player** | 오디오 / MP3 플레이어 | **`DMP`** | `DMP-20261017_1527` |
| **Dotori Video Editor** | 비디오 편집기 | **`DVE`** | `DVE-20261017_1527` |
| **Dotori Meme Maker** | 밈 / 짤 생성기 | **`DMM`** | `DMM-20261017_1527` |
| **Dotori Flow** | 이슈 관리 / 칸반 트래커 | **`DF`** | `DF-20261017_1527` |

### Future Dotori Apps Naming Rule:
Any new Dotori application MUST follow the camel/word-initial rule:
- Pattern: **`D`** + [Capital letters of following title words]
- Example: **Dotori Xyz Ybc** ➔ **`DXY`** (➔ `DXY-YYYYMMDD_HHMM`)
- Example: **Dotori Cloud Backup** ➔ **`DCB`** (➔ `DCB-YYYYMMDD_HHMM`)

---

## 3. Mandatory Build-Time Auto-Update Requirement

1. **Automatic Injection on Build**:
   - Versions MUST NOT be hardcoded manually.
   - Whenever any build command (`npm run build`, `vite build`, `gradlew assemble`, `electron-builder`, `pyinstaller`, etc.) is executed, the current build timestamp MUST automatically update the version string.
2. **Synchronized Display Areas**:
   The generated version MUST automatically reflect in:
   - **Menu ➔ About Modal / Screen**: The primary version display.
   - **Application Title Bar / Header**: Window title or navigation bar (if version is displayed).
   - **Footer / Settings Page**: Application info card, copyright line, or settings info.
   - **Android / Windows Installer Metadata**: `versionName` in Android `build.gradle`, File/Product Version in Windows executable properties.

---

## 4. Platform-Specific Implementation Standards

### A. Web Applications (Vite / React / Vue / HTML)

In `vite.config.js`:
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function getBuildVersion(prefix) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const min = pad(now.getMinutes());
  return `${prefix}-${yyyy}${mm}${dd}_${hh}${min}`;
}

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(getBuildVersion('DVIV')), // Replace with designated prefix
  },
});
```

In the Application UI (e.g., `AboutModal.jsx`):
```javascript
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' 
  ? __APP_VERSION__ 
  : 'DVIV-DEV_BUILD';

export default function AboutModal() {
  return (
    <div>
      <h3>Dotori VR 이미지 뷰어</h3>
      <p>Version: {APP_VERSION}</p>
    </div>
  );
}
```

### B. Windows Desktop Apps (Electron / Node.js)

Create a pre-build hook script:
```javascript
// scripts/update-version.js
const fs = require('fs');
const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const versionStr = `DSR-${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;

fs.writeFileSync('./src/version.json', JSON.stringify({ version: versionStr }, null, 2));
```

### C. Android Applications (Capacitor / Android Studio Gradle)

In `app/build.gradle`:
```groovy
def getDotoriVersion(String prefix) {
    def date = new Date()
    def formattedDate = date.format('yyyyMMdd_HHmm', TimeZone.getTimeZone('Asia/Seoul'))
    return "${prefix}-${formattedDate}"
}

android {
    defaultConfig {
        versionCode 1
        versionName getDotoriVersion("DGL")
    }
}
```

---

## 5. Verification Checklist for Developers & AI Agents

Before delivering or committing any build:
- [ ] Is the app prefix correct according to Section 2?
- [ ] Does `npm run build` (or platform equivalent) automatically refresh the timestamp?
- [ ] Does navigating to **Menu ➔ About** display the exact `[APP_PREFIX]-YYYYMMDD_HHMM` string?
- [ ] Are all other secondary version labels in footers, titles, or settings consistent with this string?
- [ ] Is there zero manual version hardcoding remaining in the codebase?
