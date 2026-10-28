# Dotori Tools Unified Application Icon & Branding Guidelines

This rule is mandatory across all projects, repositories, web apps, installers, and game developments for Dotori Tools.

## 1. Master Icon Source Path
- Master Icon Location: `G:\내 드라이브\Image_260618\DotoriTools_image\google-play-icon-white-512x512.png`

## 2. Mandatory Icon Usage Rules
Whenever developing, building, or packaging any application (Web App, Windows PC App, Android APK, macOS/iOS, etc.):
1. **Source of Truth**:
   - Always copy or generate necessary platform icons from the master icon file above.
2. **Web Applications**:
   - Use as Favicon (`favicon.ico`, `favicon.png`, `apple-touch-icon.png`).
   - Use as the top-left brand / menu icon button in the header.
3. **Windows Desktop Apps (Electron, Tauri, etc.)**:
   - **실행 중 작업 표시줄(Taskbar) 및 윈도우 타이틀바 공식 도토리 아이콘 필수 적용**:
     - **AppUserModelId 설정**: Windows 10/11에서 앱 실행 시 작업표시줄에 기본 Electron 아톰 아이콘 등 임의의 기본 아이콘이 노출되는 문제를 방지하기 위해, Electron 메인 프로세스 시작 시 `app.setAppUserModelId(appId)`를 반드시 호출해야 한다. (예: `app.setAppUserModelId('com.dotori.<appName>')`)
     - **BrowserWindow icon 옵션**: `new BrowserWindow({ icon: iconPath, ... })` 생성 시 공식 도토리 아이콘 파일 경로(`build/icon.ico` 또는 `build/icon.png`)를 명시적으로 전달해야 한다.
     - **패키징 파일 포함(files)**: `package.json`의 `build.files`에 `build/icon.png` 및 `build/icon.ico`를 반드시 포함하여 패키징된 asar 내부에서도 아이콘 파일이 누락되지 않도록 해야 한다.
     - **실행 파일(.exe) 리소스 아이콘 교체**: `package.json`의 `win` 빌드 설정에서 `"signAndEditExecutable": false`를 설정하면 실행 파일 자체의 아이콘 리소스가 교체되지 않아 작업표시줄에 기본 아이콘이 나타나므로, 이를 해제(기본값 사용)하여 실행 파일(.exe)에 도토리 공식 아이콘이 리소스로 정확히 주입되도록 해야 한다.
     - **NSIS 설치/제거 아이콘 명시**: `nsis` 설정에 `installerIcon`, `uninstallerIcon` 경로를 `build/icon.ico`로 명시 지정한다.
   - Convert to `.ico` containing multiple resolutions (16x16, 32x32, 48x48, 64x64, 128x128, 256x256) when packaging Windows executables.
4. **Android Applications (Capacitor, Flutter, Native)**:
   - App launcher icons for all density folders (`mipmap-mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`).
   - Push notification icons and splash screen logos.
5. **Image Resizing Guideline**:
   - The master image is 512x512. Downscale smoothly to appropriate target sizes (e.g., 16px, 32px, 64px, 128px, 192px, 256px) so that file sizes remain lightweight without loss of clarity.

## 3. Windows Application Icon Verification Checklist
빌드 후 배포 전 아래 5개 지점에서 모두 도토리 공식 아이콘이 정상 표시되는지 반드시 확인:
1. 단일 설치 파일 (`Dotori ... Setup x64.exe`) 아이콘
2. 바탕화면 및 시작 메뉴 바로가기 아이콘
3. 앱 설치 폴더 내 실행 파일 (`.exe`) 아이콘
4. **앱 실행 시 윈도우 좌측 상단 타이틀바 아이콘**
5. **앱 실행 시 Windows 하단 작업 표시줄 (Taskbar) 실행 아이콘**
