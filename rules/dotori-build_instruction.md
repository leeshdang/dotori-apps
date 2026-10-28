# Dotori Build Instructions & Guidelines

build 시 사용자가 지시하는 내용에 따라 아래와 같이 빌드한다.

## 1. OS별 빌드 요청 대응
- **windows 용 설치파일을 빌드 해달라고 할 경우**:
  - install 파일을 생성하되, 해당 파일 1개만 사용자에게 배포하면 사용자가 설치해서 사용할 수 있어야 한다.
  - 기본적으로 x64 (Windows 64-bit)로 빌드한다. (단일 NSIS .exe 설치 파일)
- **android 설치용 apk 파일을 요청할 경우**:
  - Android 설치용 apk 만 빌드한다.
- **모든 OS 빌드해줘 라고 요청할 경우**:
  - window x64, window x86, android, linux 용으로 빌드한다.

## 2. OS별 표준 고정 파일명 규칙 (Mandatory Naming Rules)
모든 Dotori 패밀리 앱은 빌드 시 생성되는 산출물 파일명을 아래 표준 고정 규칙에 맞추어 생성해야 한다. (가변 문자열이나 버전 번호 등은 파일명에 포함하지 않고 아래 지정된 표준 고정 파일명 형식을 엄격히 준수한다.)

[OS별 표준 고정 파일명]
- Windows : Dotori-[앱이름]-win-x64.exe
- Windows 무설치 : Dotori-[앱이름]-portable.zip
- macOS   : Dotori-[앱이름]-mac-universal.dmg
- Linux   : Dotori-[앱이름]-linux.AppImage
- Android : Dotori-[앱이름].apk
- Web     : Dotori-[앱이름]-web.zip

> **[앱이름] 표기 규칙**:
> - 각 앱의 공식 영문 명칭에서 'Dotori'를 제외한 식별 명칭(CamelCase 권장)을 사용한다.
> - 예시 (Dotori Screen Recorder) : Dotori-ScreenRecorder-win-x64.exe, Dotori-ScreenRecorder.apk
> - 예시 (Dotori Janggi Learning) : Dotori-JanggiLearning-win-x64.exe, Dotori-JanggiLearning.apk
> - 예시 (Dotori Go-Learning) : Dotori-GoLearning-win-x64.exe, Dotori-GoLearning.apk
> - 예시 (Dotori Video Editor) : Dotori-VideoEditor-win-x64.exe, Dotori-VideoEditor.apk
> - 예시 (Dotori Meme Maker) : Dotori-MemeMaker-win-x64.exe, Dotori-MemeMaker.apk
> - 예시 (Dotori Flow) : Dotori-Flow-win-x64.exe, Dotori-Flow.apk

## 3. electron-builder 및 빌드 스크립트 설정 가이드
package.json의 uild 설정에서 산출물 이름을 지정할 때 rtifactName 속성을 아래와 같이 명시하여 빌드 산출물이 자동으로 표준 고정 파일명으로 생성되도록 구성한다:

`json
build: {
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    installerLanguages: [ko_KR, en_US, ja_JP, zh_CN],
    language: 1042,
    artifactName: Dotori-[앱이름]-win-x64.exe
  },
  portable: {
    artifactName: Dotori-[앱이름]-portable.zip
  },
  mac: {
    target: dmg,
    artifactName: Dotori-[앱이름]-mac-universal.dmg
  },
  linux: {
    target: AppImage,
    artifactName: Dotori-[앱이름]-linux.AppImage
  }
}
`

> **다국어 설치 다이얼로그 연동 (NSIS Multilingual)**:
> - installerLanguages: [ko_KR, en_US, ja_JP, zh_CN] 설정을 반드시 포함하여, 사용자가 설치 시 4개 국어(한국어/영어/일본어/중국어) 중 원하는 언어를 선택할 수 있도록 구성한다.

Android 빌드 산출물(APK) 복사/저장 시:
- elease/Dotori-[앱이름].apk 경로로 복사 및 저장하도록 설정한다.

## 4. 프로젝트 소스코드 및 산출물 경로 표준
- **소스코드 위치**: D:\dotoritools\[앱폴더]
- **배포 산출물 위치**: D:\Package\[앱별폴더] (예: D:\Package\Dotori_4kDownloader, D:\Package\Dotori_Go_Learning 등)
- **통합 패키징 관리 경로**: D:\packing\

## 5. 앱 수정 후 필수 빌드 및 GitHub Release 자동 배포 원칙 (Mandatory Build & Release Push Pipeline)
**모든 Dotori 패밀리 앱의 코드 수정(기능 추가, UI/UX 개선, 버그 픽스, 설정 변경 등) 작업이 완료된 후에는 어떠한 예외도 없이 항상 아래 4대 플랫폼 설치/배포 파일을 생성하고 GitHub Release에 즉시 push 완료 후 최종 리포팅해야 한다.**

### 1) 4대 플랫폼 설치/배포 파일 생성 (Mandatory 4 Platforms)
- **Windows x64**: `Dotori-[앱이름]-win-x64.exe` (단일 NSIS 다국어 설치 파일)
- **Linux**: `Dotori-[앱이름]-linux.AppImage` (x64 실행 파일)
- **Android**: `Dotori-[앱이름].apk` (공식 release 키스토어 `dotori-release.jks` 서명 필수, 덮어쓰기 업데이트를 위한 versionCode 증가 필수)
- **웹 버전**: `Dotori-[앱이름]-web.zip` (웹 브라우저에서 바로 동작하는 HTML5/JS/CSS 번들 zip 파일)

> **산출물 로컬 저장**:
> - 빌드 완료 즉시 로컬 패키지 배포 디렉토리(`D:\Package\[앱별폴더]\Dotori-*`)에 최신 파일로 복사/저장한다.

### 2) GitHub Release v1.0.0 자동 Push & 대체 (Automated GitHub Release Push)
- **대상 릴리즈 저장소**: `https://github.com/leeshdang/dotori-apps/releases/tag/v1.0.0`
- **배포 방식**:
  - GitHub API를 통해 릴리즈의 기존 Assets 목록을 조회한다.
  - **기존에 동일한 파일명의 파일이 이미 존재할 경우**: 해당 Asset을 즉시 삭제(Delete)한 뒤 최신 파일로 교체(Replace) 업로드한다.
  - **기존 파일이 없을 경우**: 새 Asset으로 즉시 업로드(Upload)한다.
- **필수 업로드 대상 산출물**:
  1. `Dotori-[앱이름]-win-x64.exe`
  2. `Dotori-[앱이름]-linux.AppImage`
  3. `Dotori-[앱이름].apk`
  4. `Dotori-[앱이름]-web.zip` (웹 지원 앱)

### 3) 최종 결과 리포팅 (Final Report)
- 모든 빌드 및 GitHub Release 푸시가 완료된 후에는 다음 내용을 포함하여 사용자에게 보고한다:
  - 플랫폼별 파일명 및 파일 크기(MB)
  - 버전 정보 (versionCode, versionName, 빌드 타임스탬프)
  - GitHub Release 교체/업로드 완료 확인 (Asset ID 및 다운로드 링크)
