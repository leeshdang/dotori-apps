import { Language } from '../types/janggi';

export interface Translations {
  questMissionBanner: string;
  questRetry: string;
  questObjectiveTitle: string;
  questTipPrefix: string;
  questRoadmap: string;
  questCompleted: string;
  tacticsRoadmap: string;
  tacticsReset: string;

  appTitle: string;
  appSubtitle: string;
  dotoriTag: string;
  menu: string;
  about: string;
  terms: string;
  language: string;
  selectLanguage: string;
  pieceTheme: string;
  selectPieceTheme: string;
  phoneView: string;
  monitorView: string;
  engineReady: string;
  aiThinking: string;
  newGame: string;
  // Tabs
  tabQuest: string;
  tabTactic: string;
  tabRank: string;
  tabMiniGames: string;
  tabProfile: string;
  // Game
  turnCho: string;
  turnHan: string;
  choCountry: string;
  hanCountry: string;
  score: string;
  points: string;
  check: string;
  checkmate: string;
  draw: string;
  resign: string;
  undo: string;
  hint: string;
  coachHint: string;
  // Themes
  themeChessClassic: string;
  themeChessModern: string;
  themeWood: string;
  themeCrystal: string;
  themeModern: string;
  themeChessClassicDesc: string;
  themeChessModernDesc: string;
  themeWoodDesc: string;
  themeCrystalDesc: string;
  themeModernDesc: string;
  // Menu items
  dotoritoolsLink: string;
  celebmypetLink: string;
  bugReport: string;
  resetProgress: string;
  closeApp: string;
  // Modal buttons
  agreeAndStart: string;
  close: string;
  confirm: string;
  developer: string;
}

export const translations: Record<Language, Translations> = {
  ko: {
    questMissionBanner: "상단 장기판에서 기물을 직접 터치하여 미션을 수행하세요!",
    questRetry: "다시하기",
    questObjectiveTitle: "퀘스트 목표 (MISSION)",
    questTipPrefix: "도토리 꿀팁: ",
    questRoadmap: "기초 교육 퀘스트 로드맵",
    questCompleted: "완료",
    tacticsRoadmap: "고급 전술 마스터 로드맵",
    tacticsReset: "전술 초기화",
    appTitle: '도토리 장기',
    appSubtitle: '기초 퀘스트부터 고급 전술 및 AI 급수 판정 대국까지',
    dotoriTag: 'DJL',
    menu: '메뉴',
    about: 'About (앱 정보)',
    terms: '이용 약관 및 저작권 고지',
    language: '언어 설정',
    selectLanguage: '언어를 선택하세요',
    pieceTheme: '장기말 디자인',
    selectPieceTheme: '장기말 디자인 선택',
    phoneView: '모바일 뷰',
    monitorView: '와이드 뷰',
    engineReady: 'AI 엔진 대기중',
    aiThinking: 'AI 수읽기 중...',
    newGame: '새 대국',
    tabQuest: '기초 퀘스트',
    tabTactic: '고급 전술',
    tabRank: 'AI 급수전',
    tabMiniGames: '미니게임',
    tabProfile: '내 프로필',
    turnCho: '초(楚) 차례',
    turnHan: '한(漢) 차례',
    choCountry: '초나라 (楚)',
    hanCountry: '한나라 (漢)',
    score: '점수',
    points: '점',
    check: '장군!',
    checkmate: '외통수 (Checkmate)',
    draw: '무승부',
    resign: '기권',
    undo: '무르기',
    hint: '힌트',
    coachHint: '도토리 AI 코치 힌트',
    themeChessClassic: '클래식 체스말',
    themeChessModern: '네오 모던 체스',
    themeWood: '황실 전통 목각',
    themeCrystal: '네오 크리스탈',
    themeModern: '프리미엄 흑백',
    themeChessClassicDesc: '정통 서양 체스말 심볼(킹, 룩, 나이트, 비숍 등)을 장기 기물에 접목한 직관적 디자인',
    themeChessModernDesc: '세련된 3D 네온 및 크롬 광택의 미래형 체스 피규어 토큰',
    themeWoodDesc: '고풍스러운 원목 질감과 전통 서예 한자 각인의 정통 한국 장기말',
    themeCrystalDesc: '영롱하게 빛나는 사이버네틱 크리스탈 보석 장기말',
    themeModernDesc: '바둑알처럼 깔끔한 흑백 옵시디언 & 아이보리 모던 양석',
    dotoritoolsLink: 'dotoritools.com 포털',
    celebmypetLink: 'celebmypet.com 바로가기',
    bugReport: '버그 리포팅 (Dotori Flow)',
    resetProgress: '학습 진도 초기화',
    closeApp: '프로그램 닫기',
    agreeAndStart: '동의하고 시작하기',
    close: '닫기',
    confirm: '확인',
    developer: '개발자',
  },
  en: {
    questMissionBanner: "Touch and move pieces on the board to complete missions!",
    questRetry: "Retry",
    questObjectiveTitle: "QUEST MISSION",
    questTipPrefix: "Dotori Tip: ",
    questRoadmap: "Basic Quest Roadmap",
    questCompleted: "Cleared",
    tacticsRoadmap: "Advanced Tactics Roadmap",
    tacticsReset: "Reset Tactics",
    appTitle: 'Dotori Janggi',
    appSubtitle: 'From Beginner Quests to Advanced Tactics & AI Rating Matches',
    dotoriTag: 'DJL',
    menu: 'Menu',
    about: 'About',
    terms: 'Terms of Use & Copyright',
    language: 'Language',
    selectLanguage: 'Select Language',
    pieceTheme: 'Piece Style',
    selectPieceTheme: 'Choose Piece Design',
    phoneView: 'Mobile View',
    monitorView: 'Wide View',
    engineReady: 'Engine Ready',
    aiThinking: 'AI Thinking...',
    newGame: 'New Game',
    tabQuest: 'Quests',
    tabTactic: 'Tactics',
    tabRank: 'AI Match',
    tabMiniGames: 'Mini Games',
    tabProfile: 'Profile',
    turnCho: 'Cho (Blue) Turn',
    turnHan: 'Han (Red) Turn',
    choCountry: 'Cho Nation (Blue)',
    hanCountry: 'Han Nation (Red)',
    score: 'Score',
    points: 'pts',
    check: 'Check!',
    checkmate: 'Checkmate!',
    draw: 'Draw',
    resign: 'Resign',
    undo: 'Undo',
    hint: 'Hint',
    coachHint: 'Dotori AI Coach Hint',
    themeChessClassic: 'Classic Chess',
    themeChessModern: 'Neo Modern Chess',
    themeWood: 'Royal Wood',
    themeCrystal: 'Neo Crystal',
    themeModern: 'Ivory & Slate',
    themeChessClassicDesc: 'Intuitive Western chess figures (King, Rook, Knight, Cannon, etc.) on Janggi pieces',
    themeChessModernDesc: 'Futuristic 3D neo-neon chess figurines with metallic glow',
    themeWoodDesc: 'Authentic octagonal royal wood carving with classic calligraphy',
    themeCrystalDesc: 'Glowing cybernetic crystal gemstone Janggi tokens',
    themeModernDesc: 'Clean modern obsidian and ivory stones',
    dotoritoolsLink: 'dotoritools.com Portal',
    celebmypetLink: 'celebmypet.com Website',
    bugReport: 'Bug Report (Dotori Flow)',
    resetProgress: 'Reset Progress',
    closeApp: 'Exit Program',
    agreeAndStart: 'Agree & Start',
    close: 'Close',
    confirm: 'Confirm',
    developer: 'Developer',
  },
  ja: {
    questMissionBanner: "盤上の駒を直接タッチして動かし、ミッションを達成しましょう！",
    questRetry: "やり直し",
    questObjectiveTitle: "クエスト目標 (MISSION)",
    questTipPrefix: "ドングリの秘訣: ",
    questRoadmap: "基礎教育クエストロードマップ",
    questCompleted: "達成",
    tacticsRoadmap: "高等戦術マスターロードマップ",
    tacticsReset: "戦術リセット",
    appTitle: 'ドングリ将棋ラーニング',
    appSubtitle: '初心者クエストから高度な戦術、AI段級位判定対局まで',
    dotoriTag: 'DJL',
    menu: 'メニュー',
    about: 'アプリ情報 (About)',
    terms: '利用規約および著作権告知',
    language: '言語設定',
    selectLanguage: '言語を選択してください',
    pieceTheme: '駒のデザイン',
    selectPieceTheme: '駒のデザインを選択',
    phoneView: 'モバイル表示',
    monitorView: 'ワイド表示',
    engineReady: 'AIエンジン待機中',
    aiThinking: 'AI思考中...',
    newGame: '対局開始',
    tabQuest: '基本クエスト',
    tabTactic: '高度戦術',
    tabRank: 'AI級位戦',
    tabMiniGames: 'ミニゲーム',
    tabProfile: 'プロフィール',
    turnCho: '楚(青)の手番',
    turnHan: '漢(赤)の手番',
    choCountry: '楚(青)',
    hanCountry: '漢(赤)',
    score: '点数',
    points: '点',
    check: '王手 (ジャンクン)!',
    checkmate: '詰み (Checkmate)',
    draw: '引き分け',
    resign: '投了',
    undo: '待った',
    hint: 'ヒント',
    coachHint: 'ドングリAIコーチのヒント',
    themeChessClassic: 'クラシックチェス',
    themeChessModern: 'ネオモダンチェス',
    themeWood: '宮廷伝統木彫り',
    themeCrystal: 'ネオクリスタル',
    themeModern: '高級白黒石',
    themeChessClassicDesc: '西洋チェスの駒記号（キング、ルーク、ナイトなど）を将棋の駒に融合した直感的なデザイン',
    themeChessModernDesc: '洗練された3Dネオンとメタリック発光の未来型チェス駒トークン',
    themeWoodDesc: '伝統的な八角形の木目調と書道漢字の本格的な韓国将棋駒',
    themeCrystalDesc: '輝くサイバークリスタルの宝石風駒',
    themeModernDesc: '碁石のように洗練されたモダンな白黒ストーン',
    dotoritoolsLink: 'dotoritools.com 公式',
    celebmypetLink: 'celebmypet.com 公式',
    bugReport: 'バグ報告 (Dotori Flow)',
    resetProgress: '学習進度初期化',
    closeApp: 'プログラム終了',
    agreeAndStart: '同意して始める',
    close: '閉じる',
    confirm: '確認',
    developer: '開発者',
  },
  zh: {
    questMissionBanner: "直接点击并移动棋盘上的棋子以完成任务！",
    questRetry: "重新开始",
    questObjectiveTitle: "任务目标 (MISSION)",
    questTipPrefix: "橡果锦囊: ",
    questRoadmap: "基础教程任务路线图",
    questCompleted: "已完成",
    tacticsRoadmap: "进阶战术大师路线图",
    tacticsReset: "重置战术",
    appTitle: '橡果朝鲜象棋学习',
    appSubtitle: '从基础任务到高级战术及AI段位测定对局',
    dotoriTag: 'DJL',
    menu: '菜单',
    about: '关于 (About)',
    terms: '使用条款与版权声明',
    language: '语言设置',
    selectLanguage: '选择语言',
    pieceTheme: '棋子造型',
    selectPieceTheme: '选择棋子设计',
    phoneView: '手机视图',
    monitorView: '宽屏视图',
    engineReady: 'AI引擎就绪',
    aiThinking: 'AI思考中...',
    newGame: '新对局',
    tabQuest: '入门任务',
    tabTactic: '高级战术',
    tabRank: 'AI定段赛',
    tabMiniGames: '迷你游戏',
    tabProfile: '个人主页',
    turnCho: '楚方(蓝)行棋',
    turnHan: '汉方(红)行棋',
    choCountry: '楚国 (蓝)',
    hanCountry: '汉国 (红)',
    score: '得分',
    points: '分',
    check: '将军!',
    checkmate: '绝杀 (Checkmate)',
    draw: '和棋',
    resign: '认输',
    undo: '悔棋',
    hint: '提示',
    coachHint: '橡果AI教练指导',
    themeChessClassic: '经典国际象棋风',
    themeChessModern: '新潮3D霓虹风',
    themeWood: '皇家传统木雕',
    themeCrystal: '璀璨水晶',
    themeModern: '黑白雅石',
    themeChessClassicDesc: '将经典西洋棋子造型（王、车、马、炮等）融入朝鲜象棋的直观精美设计',
    themeChessModernDesc: '结合科技感3D霓虹与立体金属反光的现代国际象棋棋子造型',
    themeWoodDesc: '传统八角木纹与书法汉字刻印的传统韩国象棋棋子',
    themeCrystalDesc: '发光赛博水晶晶石质感棋子',
    themeModernDesc: '如围棋黑白玉石般极简大气的现代造型',
    dotoritoolsLink: 'dotoritools.com 门户',
    celebmypetLink: 'celebmypet.com 官网',
    bugReport: '缺陷反馈 (Dotori Flow)',
    resetProgress: '重置进度',
    closeApp: '退出程序',
    agreeAndStart: '同意并开始',
    close: '关闭',
    confirm: '确定',
    developer: '开发者',
  },
};