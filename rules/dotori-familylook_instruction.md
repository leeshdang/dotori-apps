# Dotori Tools Unified GUI Layout & Family Look Guidelines (UX/UI Standard)

이 규칙은 도토리 툴즈(Dotori Tools)의 모든 패밀리 앱(웹 애플리케이션, Windows PC 인스톨러 및 실행 파일, Android APK, macOS/iOS 등)을 새로 제작하거나 수정할 때 필수로 준수해야 하는 **공통 GUI 레이아웃 및 UX/UI 표준**이다.

모든 앱은 사용자에게 도토리 툴즈 브랜드 고유의 감성, 직관적인 사용성, 일관된 패밀리 룩(Family Look)을 제공해야 한다.

---

## 1. Visual Theme & Design Tokens (비주얼 테마 & 디자인 토큰)

### 1.1 배경 및 색상 팔레트 (Dark Glassmorphism)
- **Base Background**: 다크 테마 기반의 `#0A0A0F` 또는 `#090A10`
- **Mesh Glow Effect**: 배경에 고정 또는 은은하게 퍼지는 멀티 포인트 Radial Gradient 글로우 효과 적용 (불투명도 20~40%)
  - Indigo (`#4F46E5`), Violet (`#7C3AED`), Pink (`#DB2777`), Blue (`#2563EB`)
- **Card & Panel Surface**:
  - 반투명 다크 글래스모피즘: `bg-[#12131D]/90` 또는 `bg-[#14141C]/90`
  - 섬세한 외곽선: `border border-white/10` 또는 `border-white/15`
  - 배경 블러: `backdrop-blur-xl` 또는 `backdrop-blur-2xl`
  - 곡률: 버튼 및 입력창 `rounded-xl` ~ `rounded-2xl`, 카드 및 모달 `rounded-3xl`
- **Accent Gradients**:
  - Primary CTA & 강조: 핑크~인디고~스카이 그라디언트 (`from-pink-500 via-indigo-500 to-sky-500` 또는 `from-pink-500 to-indigo-600`)
  - 텍스트 하이라이트: `bg-gradient-to-r from-white via-indigo-200 to-pink-300 bg-clip-text text-transparent`

---

## 2. Header Layout & Signature Components (헤더 레이아웃 표준)

모든 앱의 상단에는 도토리 패밀리 룩 공통 헤더를 배치한다.

```
+-----------------------------------------------------------------------------------------+
| [≡]  [Acorn] Dotori AppName [TAG] [v버전]        [프레임전환] [보조버튼] [상태알림] [CTA] |
+-----------------------------------------------------------------------------------------+
```

### 2.1 좌측 브랜드 영역
1. **햄버거 메뉴 버튼 ([≡])**:
   - `p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl`
   - 클릭 시 열리는 공통 드롭다운 메뉴 구성 필수:
     - **Dotoritools.com 포털 링크**: 공식 사이트 바로가기 (펄스 도트 포함)
     - **Dotori Family Apps 목록**: 패밀리 앱 목록 (현재 앱에는 "현재 앱" 배지 표시)
     - **프로젝트/데이터 관리**: 파일 열기, 백업 저장/불러오기, 초기화 등
     - **DVE/앱 정보 & 라이선스 (About)**: 버전 및 패밀리 정보 모달
     - **이용 약관 및 저작권 고지 (Terms)**: 상시 열람 모달 트리거 (필수)
2. **도토리 마스터 아이콘**:
   - 그라디언트 테두리(`from-pink-500 to-indigo-500`)가 들어간 둥근 사각형 뱃지 안에 공식 도토리 화이트 아이콘(`icon.png`) 삽입
3. **앱 타이틀 & 버전 배지**:
   - 타이틀: `Dotori <AppName>` (예: Dotori Video Editor, Dotori 4k Downloader, Dotori QR Maker)
   - 앱 태그 배지: 2~4글자 축약어 배지 (예: `DVE`, `D4kD`, `DQM`)
   - 버전 배지: `font-mono text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30` (동적 빌드 버전 자동 표시)
   - 서브타이틀: 모바일 이하에서는 숨김 처리하고 데스크톱에서 한 줄 설명 표시

### 2.2 우측 컨트롤 영역
1. **스마트폰 프레임 뷰 토글 (Dotori Signature Feature)**:
   - 스마트폰 화면 시뮬레이션(`Smartphone` 아이콘)과 일반 와이드 뷰(`Monitor` 아이콘) 간 원클릭 전환 버튼
2. **상태 알림 필 (Status Pill)**:
   - `bg-white/5 backdrop-blur-md rounded-full border border-white/10 px-4 py-1.5`
   - 초록색/빨간색 애니메이션 펄스 점으로 현재 엔진 상태 표시 (예: "엔진 준비 완료", "렌더링 중...")
3. **핵심 실행 버튼 (Primary CTA)**:
   - 핑크/인디고 그라디언트 + 그림자 효과 (`shadow-lg shadow-pink-500/25`)

---

## 3. Workspace Layout & Navigation (작업 영역 레이아웃)

### 3.1 듀얼 페인 구조 (Split-View Ergonomics)
- **메인 뷰포트 / 캔버스 영역 (Left / Center)**:
  - 데스크톱: 반응형 와이드 프리뷰 또는 스마트폰 베젤 프레임(Dynamic Island / Notch 포함 9:19 비율) 모의 렌더링
  - 하단: 타임라인 바 / 재생 컨트롤러 / 진행 바가 캔버스 하단에 유기적으로 통합
- **도구 및 제어 사이드바 (Right Sidebar)**:
  - `w-full lg:w-[420px] xl:w-[460px] bg-[#0E0F18] border-l border-white/10`
  - 상단: 선택된 탭 패널의 상세 조작 컨트롤 (스크롤 가능한 커스텀 스크롤바)
  - 하단: **바텀 네비게이션 바 (Navigation Bar)** 고정

### 3.2 하단 탭 네비게이션 (Navigation Component)
- 아이콘 + 텍스트 레이블 수직 정렬
- 활성 탭: 핑크/인디고 그라디언트 배경 또는 인디고 텍스트 + 상단 활성 인디케이터 점
- 비활성 탭: `text-gray-400 hover:text-white hover:bg-white/5 transition`
- 모바일 가로 스크롤 또는 균등 분할 지원

---

## 4. Modal & Dialog Standards (모달 및 팝업 규격)

모든 앱에서 대화상자는 아래 스타일로 통일한다.

1. **백드롭**: `fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4`
2. **컨테이너**: `bg-[#12131D] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl`
3. **필수 모달 2종 구비 의무**:
   - **이용 약관 및 저작권 고지 모달**: 첫 설치 실행 시 자동 팝업 강제 동의 + 메뉴를 통한 상시 열람
   - **About / 앱 정보 모달**: 도토리 패밀리 룩 로고, 빌드 버전, 기능 요약, 저작권 표기
4. **버튼 규격**:
   - Primary: `bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-bold rounded-2xl py-3`
   - Secondary / Close: `bg-white/10 hover:bg-white/15 text-white font-semibold rounded-2xl py-2.5`

---

## 5. Multi-Platform Adaptation (크로스 플랫폼 최적화)

1. **Web App (Vite + React + Tailwind)**:
   - 뷰포트 100vh 대응 (`h-[100dvh]`), 모바일 제스처 및 터치 타깃 (`min-h-[44px]`)
   - 아이프레임 임베드 감지 시 "새 창에서 실행하기" 링크 제공
2. **Windows Desktop App (Electron)**:
   - 다크 윈도우 배경 (`backgroundColor: '#090A10'`), 메뉴바 자동 숨김 (`autoHideMenuBar: true`)
   - `app.setAppUserModelId('com.dotori.<appName>')` 설정으로 작업표시줄 아이콘 보장
   - 윈도우 타이틀바 및 작업표시줄에 도토리 공식 마스터 아이콘 적용
3. **Android App (Capacitor / Native)**:
   - 상태 표시줄 다크 색상 통일 (`#090A10`)
   - 뒤로가기 하드웨어 키 처리 및 안전 영역(Safe Area Insets) 패딩 고려

---

## 6. Family Look Verification Checklist (구현 후 체크리스트)
새 앱을 개발하거나 기존 앱을 개편할 때 아래 7개 항목을 반드시 점검한다:
- [ ] 다크 테마(`#0A0A0F`) 및 메쉬 글로우 그라디언트 배경이 적용되었는가?
- [ ] 공식 도토리 마스터 아이콘이 헤더 좌측에 올바른 그라디언트 뱃지로 배치되었는가?
- [ ] 햄버거 메뉴에 `Dotoritools.com`, `Dotori Family Apps`, `이용 약관 및 저작권 고지`, `About`이 포함되어 있는가?
- [ ] 헤더에 `Dotori <AppName>`, 앱 약칭 배지, 동적 버전 배지가 표시되는가?
- [ ] 스마트폰 프레임 시뮬레이션 / 와이드 뷰 전환 모드가 지원되는가?
- [ ] 첫 실행 시 [이용 약관 및 저작권 고지] 필수 확인 모달이 정상 동작하는가?
- [ ] Windows 실행 시 작업표시줄, 타이틀바, 인스톨러에 공식 아이콘이 일관되게 표시되는가?
