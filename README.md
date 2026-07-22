# note-app ✍️

웹 기반 노트 앱.  
**텍스트·표·이미지 등 모든 콘텐츠 위에 Apple Pencil로 직접 필기**할 수 있는 것이 핵심입니다.

![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ 주요 기능

### 🗂 3단계 사이드바
- **노트북 → 섹션 → 페이지** 구조로 옆으로 펼쳐지는 Craft 스타일 패널

### ✏️ 드로잉 오버레이
- 페이지 전체(표, 캘린더, 이미지 위 포함)에 Apple Pencil / 마우스로 필기
- 펜 / 형광펜 / 지우개 도구, 7가지 색상, 두께 조절
- Undo · Clear 지원
- 자동저장 상태 표시 (드로우 중 → 저장 중 → 저장 완료)

### 🔤 텍스트 서식 툴바
텍스트를 드래그하면 선택 영역 위에 플로팅 툴바가 나타납니다.
- 굵게 / 기울임 / 밑줄 / 취소선
- 정렬 (왼쪽 · 가운데 · 오른쪽)
- 텍스트 크기 (소 / 중 / 대 / 특대)
- 텍스트 색상 8가지
- 텍스트 배경(하이라이트) 7가지

### 🧩 Notion 스타일 슬래시(`/`) 커맨드
입력창에 `/`를 입력하면 블록 삽입 메뉴가 열립니다.

| 카테고리 | 블록 |
|---------|------|
| 기본 | 텍스트, 제목 H1/H2/H3, 구분선 |
| 미디어 | 이미지, PDF |
| 구성 | 표, 할일(Todo), 칸반, 캘린더 |
| 코드 & 수식 | 코드 (highlight.js), 수식 (KaTeX), 마크다운 |
| 📁 템플릿 | 주간 시간표, 일일 플래너, 프로젝트 보드 |

---

## 🚀 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
# → http://localhost:5173
```

---

## 🛠 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | React 18 + Vite 5 |
| 드로잉 | HTML5 Canvas API + Pointer Events (압력 감지) |
| 수식 | KaTeX |
| 마크다운 | marked |
| 코드 하이라이트 | highlight.js |
| 스타일 | 순수 CSS (CSS 변수 기반 디자인 시스템) |

---

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── Sidebar.jsx          # 3단계 사이드바
│   ├── Toolbar.jsx          # 상단 도구 모음
│   ├── ContentArea.jsx      # 페이지 편집 영역
│   ├── DrawingCanvas.jsx    # 캔버스 오버레이
│   ├── BlockList.jsx        # 블록 렌더러
│   ├── SlashMenu.jsx        # / 커맨드 메뉴
│   ├── TextFormatBar.jsx    # 텍스트 서식 툴바
│   └── blocks/
│       ├── CodeBlock.jsx
│       ├── MathBlock.jsx
│       ├── MarkdownBlock.jsx
│       ├── TableBlock.jsx
│       ├── TodoBlock.jsx
│       ├── KanbanBlock.jsx
│       ├── CalendarBlock.jsx
│       ├── ImageBlock.jsx
│       └── PdfBlock.jsx
├── templates.js             # 블록 팩토리 & 템플릿
├── App.jsx
├── index.css                # 전역 디자인 시스템
└── blocks-extra.css         # 블록별 스타일
```

---

## 📱 iPad / Apple Pencil

웹 앱이므로 iPad Safari에서 바로 사용 가능합니다.  
Pointer Events API를 통해 Apple Pencil 압력(`e.pressure`)을 감지하여 선 두께에 반영합니다.
