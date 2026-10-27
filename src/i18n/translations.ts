import { Language } from '../types/chess';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  dotoriTag: string;
  menu: string;
  about: string;
  terms: string;
  language: string;
  selectLanguage: string;
  phoneView: string;
  monitorView: string;
  engineReady: string;
  aiThinking: string;
  newGame: string;
  tabQuest: string;
  tabTactic: string;
  tabRank: string;
  tabAnalysis: string;
  turnWhite: string;
  turnBlack: string;
  check: string;
  checkmate: string;
  draw: string;
  resign: string;
  undo: string;
  hint: string;
  coachHint: string;
  resetProgress: string;
  exitApp: string;
  exitConfirm: string;
}

export const translations: Record<Language, Translations> = {
  ko: {
    appTitle: '도토리 체스 러닝',
    appSubtitle: '초보자 기초 퀘스트부터 마스터 전술 및 AI 급수 공인 대국까지',
    dotoriTag: 'DCL 체스',
    menu: '메뉴 열기',
    about: 'About (도토리 체스)',
    terms: '이용 약관 및 저작권 고지',
    language: '언어 변경 (Language)',
    selectLanguage: '언어 선택',
    phoneView: '스마트폰 뷰',
    monitorView: 'PC 와이드 뷰',
    engineReady: '엔진 준비 완료',
    aiThinking: 'AI 수읽기 중...',
    newGame: '새 대국',
    tabQuest: '초보자 퀘스트',
    tabTactic: '마스터 전술',
    tabRank: 'AI 급수전',
    tabAnalysis: '대국 분석',
    turnWhite: '백(White) 차례',
    turnBlack: '흑(Black) 차례',
    check: '체크!',
    checkmate: '체크메이트!',
    draw: '무승부',
    resign: '기권',
    undo: '무르기',
    hint: '힌트 요청',
    coachHint: '코치 훈수',
    resetProgress: '학습 진행도 초기화',
    exitApp: '프로그램 종료',
    exitConfirm: '도토리 체스 러닝 프로그램을 종료하시겠습니까?',
  },
  en: {
    appTitle: 'Dotori Chess Learning',
    appSubtitle: 'From beginner quests to master tactics and AI ranked matches',
    dotoriTag: 'DCL Chess',
    menu: 'Open Menu',
    about: 'About (Dotori Chess)',
    terms: 'Terms of Use & Copyright Notice',
    language: 'Change Language',
    selectLanguage: 'Select Language',
    phoneView: 'Smartphone View',
    monitorView: 'PC Wide View',
    engineReady: 'Engine Ready',
    aiThinking: 'AI Thinking...',
    newGame: 'New Game',
    tabQuest: 'Beginner Quests',
    tabTactic: 'Master Tactics',
    tabRank: 'AI Ranked Match',
    tabAnalysis: 'Game Analysis',
    turnWhite: "White's Turn",
    turnBlack: "Black's Turn",
    check: 'Check!',
    checkmate: 'Checkmate!',
    draw: 'Draw',
    resign: 'Resign',
    undo: 'Undo',
    hint: 'Get Hint',
    coachHint: 'Coach Advice',
    resetProgress: 'Reset Progress',
    exitApp: 'Exit App',
    exitConfirm: 'Do you want to exit Dotori Chess Learning?',
  },
  ja: {
    appTitle: 'ドングリ チェス ラーニング',
    appSubtitle: '初心者クエストからマスター戦術、AI段級位対局まで',
    dotoriTag: 'DCL チェス',
    menu: 'メニューを開く',
    about: 'About (ドングリ チェス)',
    terms: '利用規約と著作権情報',
    language: '言語切替 (Language)',
    selectLanguage: '言語を選択',
    phoneView: 'スマートフォン表示',
    monitorView: 'PCワイド表示',
    engineReady: 'エンジン待機中',
    aiThinking: 'AI思考中...',
    newGame: '新しい対局',
    tabQuest: '初心者クエスト',
    tabTactic: 'マスター戦術',
    tabRank: 'AI段級戦',
    tabAnalysis: '棋譜分析',
    turnWhite: '白の手番',
    turnBlack: '黒の手番',
    check: 'チェック！',
    checkmate: 'チェックメイト！',
    draw: '引き分け',
    resign: '投了',
    undo: '待った',
    hint: 'ヒント要求',
    coachHint: 'コーチのアドバイス',
    resetProgress: '学習進捗の初期化',
    exitApp: 'プログラム終了',
    exitConfirm: 'ドングリ チェス ラーニングを終了しますか？',
  },
  zh: {
    appTitle: '橡果 国际象棋 学习',
    appSubtitle: '从新手入门任务到大师战术及AI段位评定对局',
    dotoriTag: 'DCL 象棋',
    menu: '打开菜单',
    about: '关于 (橡果国际象棋)',
    terms: '使用条款与版权声明',
    language: '切换语言 (Language)',
    selectLanguage: '选择语言',
    phoneView: '手机视图',
    monitorView: '电脑宽屏视图',
    engineReady: '引擎准备就绪',
    aiThinking: 'AI正在思考...',
    newGame: '新对局',
    tabQuest: '新手任务',
    tabTactic: '大师战术',
    tabRank: 'AI段位战',
    tabAnalysis: '棋局分析',
    turnWhite: '白方走棋',
    turnBlack: '黑方走棋',
    check: '将军！',
    checkmate: '将死！',
    draw: '和棋',
    resign: '认输',
    undo: '悔棋',
    hint: '提示',
    coachHint: '教练建议',
    resetProgress: '重置学习进度',
    exitApp: '退出程序',
    exitConfirm: '确定要退出橡果国际象棋学习程序吗？',
  },
};
