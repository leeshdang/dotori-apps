# Dotori Tools Unified Basic Rules & Master Guidelines (도토리 툴즈 기본 원칙 및 마스터 규정)

이 문서는 도토리 툴즈(Dotori Tools)의 모든 애플리케이션(웹 앱, Windows 데스크톱 PC 앱, Android 모바일 앱, macOS/Linux 등)에 공통으로 영구 적용되는 **최상위 기본 원칙(Master Rules)**이다.

---

## 1. 일관된 패밀리 룩 & 감성 통일 원칙 (Unified Family Look & Visual Identity)

- **브랜드 감성 동질성**:
  - 모든 Dotori Tools 앱은 독립적인 개별 앱이 아닌, **도토리 툴즈 패밀리**라는 거대한 생태계의 일원으로서 시각적·경험적 동질감을 주어야 한다.
  - 앱을 처음 실행했을 때 사용자가 한눈에 아, 이것도 도토리 툴즈 앱이구나! 하고 직관적으로 알아볼 수 있도록 **명확한 패밀리 룩(Family Look)**을 화면 전반에 유지해야 한다.
- **핵심 디자인 토큰**:
  - **배경**: 다크 테마 기반(#090A10 또는 #0A0A0F) + 부드러운 멀티 포인트 Radial Gradient 글로우(인디고, 바이올렛, 핑크).
  - **패널 & 카드**: 반투명 글래스모피즘(g-[#12131D]/90, order-white/10, ackdrop-blur-xl).
  - **강조 색상**: 핑크~인디고~스카이 그라디언트 CTA 및 텍스트 하이라이트.
  - **공통 헤더**: 좌측 공식 도토리 마스터 아이콘 뱃지 + 앱 이름 + 약칭 태그(DGL, DJL, DCL 등) + 동적 버전 배지([PREFIX]-YYYYMMDD_HHMM) + 스마트폰 프레임 시뮬레이션 토글 버튼.
  - **6대 필수 햄버거 메뉴**: dotoritools.com, celebmypet.com, 이용 약관 및 저작권 고지, 버그 리포팅 (Dotori Flow), About (앱 정보, 개발자: leeshdang@gmail.com), 프로그램 닫기.

---

## 2. 글로벌 4개 국어 다국어 기본 지원 원칙 (Multilingual Support Standard)

모든 Dotori Tools 앱은 국내뿐 아니라 글로벌 사용자 누구나 모국어로 원활히 이용할 수 있도록 **4개 국어를 필수로 지원**한다:

1. **지원 필수 언어 (4개 국어)**:
   - **한국어 (Korean / ko)** - 기본 언어
   - **영어 (English / en)**
   - **일본어 (Japanese / ja)**
   - **중국어 간체 (Chinese / zh)**

2. **설치 단계 언어 선택 원칙 (Installer Language Selection Standard - 필수)**:
   - **모든 Dotori Tools 앱은 설치할 때 언어 선택(한국어/영어/일본어/중국어) 메뉴가 반드시 있어야 한다.**
   - **사용자가 설치 절차 중에 선택한 언어로 앱의 모든 인터페이스를 표시한다.**
   - **Windows 데스크톱 설치 프로그램 (NSIS/electron-builder)**:
     - 인스톨러 실행 시 언어 선택 팝업/다이얼로그(installerLanguages: [ko_KR, en_US, ja_JP, zh_CN])를 표시하여 사용자가 설치 언어를 직접 선택할 수 있어야 한다.
     - 설치 단계에서 지정한 언어 코드를 레지스트리, 설정 파일 또는 초기 실행 인수로 전달/저장하여 앱 첫 구동 시 동일한 언어로 자동 로드한다.
   - **모바일/웹 초기 실행 (First Launch Setup)**:
     - 설치 직후 또는 최초 실행 화면(이용약관 동의 단계 등)에서 언어 선택 모달/메뉴를 최상단에 배치하여 원하는 언어를 고를 수 있도록 보장한다.

3. **언어 설정 인터페이스 규격 (In-App Language Selector)**:
   - 상단 헤더, 햄버거 드롭다운 메뉴, 또는 설정 패널에 사용자가 언제든지 언어를 즉시 전환할 수 있는 **[언어 선택 메뉴 (Language Selector)]**를 기본 탑재한다.
   - 언어 전환 시 새로고침 없이 화면의 모든 텍스트(헤더, 메뉴, 버튼, 설명, 가이드, 알림 등)가 즉각 변경되어야 한다.
   - 사용자가 선택한 언어 설정값은 브라우저 또는 앱 로컬 저장소(localStorage.getItem('dotori_lang'))에 자동 저장되어, 다음 실행 시에도 선택한 언어가 영구 유지되어야 한다.

4. **i18n 사전 관리 표준**:
   - src/i18n/translations.ts 또는 프로젝트 공통 번역 사전을 체계적으로 구축하여 하드코딩된 단일 언어 문자열을 지양하고, 다국어 키 기반으로 UI를 렌더링한다.

---

## 3. Android 릴리즈 서명 키스토어 원칙 (Android Release Signing Standard - 필수)

향후 빌드하는 **모든 Dotori Android 앱(APK)**은 아래 원칙을 반드시 적용한다.

- **공용 키스토어 사용**:
  - 키스토어 파일: `C:\Key_store\Dotori_keys\dotori-release.jks`
  - 서명 정보 파일: `C:\Key_store\Dotori_keys\keystore.properties` (storeFile, storePassword, keyAlias, keyPassword 포함)
  - 비밀번호는 `keystore.properties`에 평문으로 들어 있으므로, 이 파일을 참고하여 서명한다. (비밀번호를 소스 코드나 규칙 문서에 직접 적지 않는다.)
- **빌드 방식**:
  - APK는 debug 빌드(`assembleDebug`)가 아닌 **release 빌드(`assembleRelease`)**로 만들고, 위 키스토어로 서명된 APK만 배포한다.
  - 각 앱의 `android/app/build.gradle`(또는 `build.gradle.kts`)에 `signingConfigs.release`를 두고, `keystore.properties`를 읽어 `storeFile`, `storePassword`, `keyAlias`, `keyPassword`를 설정한다. release `buildTypes`에서 해당 `signingConfig`를 사용한다.
  - 신규 Android 앱도 동일한 키스토어를 사용한다. 새 키스토어를 따로 만들지 않는다. (같은 키로 서명해야 업데이트 설치가 가능하다.)
- **빌드 후 확인**: `apksigner verify`로 서명 검증을 통과한 APK만 `Package` 폴더에 저장한다.
- **보관 주의**: `dotori-release.jks`와 `keystore.properties`는 분실하면 동일 서명으로 업데이트할 수 없으므로 반드시 별도 백업을 유지하고, Git 저장소 등 외부에 공개하지 않는다.

---

## 4. 영구 준수 및 IDE 자동 적용
- 현재 및 향후 개발되거나 수정되는 모든 Dotori Family 프로젝트는 본 마스터 규칙과 하위 세부 규칙(dotori-familylook_instruction.md, dotori-menu_instruction.md, dotori-branding-icon.md, dotori-version_update.md, dotori-use_notice_instruction.md, dotori-build_instruction.md)을 100% 준수해야 한다.
---

## 5. 도토리 툴즈 프로젝트 및 작업 공간 경로 표준 (Workspace & Directory Structure)

- **소스코드 워크스페이스 표준 경로**: D:\dotoritools\
  - 모든 Dotori Family 개별 앱의 소스코드는 D:\dotoritools\[AppName] 하위에 위치한다.
  - 예시: D:\dotoritools\D4kD, D:\dotoritools\DCB, D:\dotoritools\DCL, D:\dotoritools\DDC, D:\dotoritools\DFE, D:\dotoritools\DGL, D:\dotoritools\DIV, D:\dotoritools\DJL, D:\dotoritools\DMM, D:\dotoritools\DMP, D:\dotoritools\Dotori_QR, D:\dotoritools\DSA, D:\dotoritools\DSR, D:\dotoritools\DVE, D:\dotoritools\DZP, D:\dotoritools\VIV 등
- **배포 패키지 보관 경로**: D:\Package\[AppName]
  - 빌드 완료된 산출물(Windows x64 인스톨러, Android APK 등)은 D:\Package 하위의 앱별 폴더에 저장한다.
- **통합 패키징/스크립트 작업 경로**: D:\packing\
  - 배치 빌드, 전체 패키징 스크립트 실행 및 통합 관리는 D:\packing 디렉토리를 기본 작업 공간으로 활용한다.

---

## 7. 앱 수정 후 4대 플랫폼 빌드 및 GitHub Release 배포 필수 원칙
모든 Dotori 패밀리 앱의 코드 수정 작업 완료 후에는 항상 `dotori-build_instruction.md` 규정에 따라 다음을 수행한다:
1. **Windows x64**, **Linux**, **Android**, **Web** 버전 설치/배포 파일 빌드.
2. `https://github.com/leeshdang/dotori-apps/releases/tag/v1.0.0`에 신규 파일 업로드 및 기존 파일 대체 push 완료.
3. 빌드 크기, 버전, Release 링크를 포함한 결과 리포트 작성.
