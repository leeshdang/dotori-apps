# Dotori Tools Mandatory Top-Left Menu Guidelines (공통 햄버거 메뉴 표준)

이 규칙은 도토리 툴즈(Dotori Tools)의 모든 패밀리 앱(웹 애플리케이션, Windows PC 실행 파일/인스톨러, Android 앱 등)을 새로 제작하거나 수정/빌드할 때 필수로 적용되는 **좌측 상단 기본 메뉴 표준 지침**이다.

모든 Dotori Tools 앱은 좌측 상단 햄버거 메뉴(`[≡]`)를 클릭했을 때 열리는 드롭다운/사이드 메뉴에 아래 6가지 필수 항목이 반드시 기본으로 포함되어야 한다.

---

## 1. 필수 메뉴 항목 목록 (Mandatory Menu Items)

| 순서 | 메뉴명 | 동작 및 연결 대상 | 상세 내용 |
| :---: | :--- | :--- | :--- |
| **1** | **dotoritools.com** | 외부 브라우저 새 창 (`https://dotoritools.com`) | 도토리 툴즈 공식 포털 바로가기 |
| **2** | **celebmypet.com** | 외부 브라우저 새 창 (`https://celebmypet.com`) | 셀럽마이펫 공식 사이트 바로가기 |
| **3** | **이용 약관 및 저작권 고지** | 앱 내 모달 팝업 열기 | `dotori-use_notice_instruction.md`에 명시된 필수 고지 전문 열람 |
| **4** | **버그 리포팅** | 외부 브라우저 새 창 (`https://dotori-flow.vercel.app/`) | Dotori Flow 버그 접수 페이지 연결 |
| **5** | **About (앱 정보)** | 앱 내 모달 팝업 열기 | - 공식 도토리 마스터 아이콘<br>- 앱 이름 및 공식 배지<br>- **동적 빌드 버전 정보 (`v[APP_PREFIX]-YYYYMMDD_HHMM`)**<br>- **개발자 : leeshdang@gmail.com** |
| **6** | **프로그램 닫기** | 데스크톱 앱 종료 / 창 닫기 | Electron 데스크톱 앱 종료 (`window.close()` 또는 메인 프로세스 종료) 및 웹 닫기 처리 |

*(참고: 앱의 특성에 따른 프로젝트 열기/저장, 데이터 초기화 등 보조 기능은 위 필수 메뉴와 함께 구분선으로 구분하여 배치할 수 있다.)*

---

## 2. 세부 구현 규격 (Implementation Specification)

### 2.1 UI/UX 디자인 표준 (Family Look)
- **메뉴 버튼**: 좌측 상단 헤더의 햄버거 버튼 (`p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl`)
- **드롭다운 컨테이너**: `bg-[#12131D]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl`
- **메뉴 항목 스타일**: 가독성 높은 아이콘 + 한글 레이블 + 서브 텍스트(URL 등)
- **외부 링크**: 클릭 시 새 창(`target="_blank" rel="noopener noreferrer"`)으로 안전하게 이동하며 ExternalLink 아이콘 배치.

### 2.2 About 모달 표준 구성
- 앱 공식 타이틀 및 로고 뱃지
- **버전 배지**: `font-mono text-xs px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-400 font-bold` (동적 타임스탬프 버전 자동 출력)
- 앱의 주요 기능 3~5줄 요약
- **개발자 정보 필수 표기**: `개발자 : leeshdang@gmail.com`
- 하단 [이용 약관 및 저작권 고지 확인] 링크 및 [닫기] 버튼

### 2.3 프로그램 닫기 (Exit) 동작
- 데스크톱 앱(Electron) 환경 및 웹 환경에서 확인창 후 안전하게 닫기를 수행한다:
```javascript
const handleExitApp = () => {
  if (window.confirm('프로그램을 종료하시겠습니까?')) {
    window.close();
  }
};
```

---

## 3. 적용 대상 및 영구 준수 원칙
- **현재 및 향후 개발되는 모든 앱**: 개발 착수 시점부터 상기 6개 메뉴 항목을 Header 좌상단 메뉴 컴포넌트에 기본 탑재한다.
- **기존 앱**: 새로 빌드하거나 유지보수 시 상기 메뉴 규격으로 필수 갱신한다.
