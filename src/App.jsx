import { useEffect, useState } from 'react'
import words from '../data/words.json'

// data/pictures 폴더의 사진들 (파일 이름 = 정답)
const pictureUrls = import.meta.glob('../data/pictures/*.{png,jpg,jpeg,gif,webp,PNG,JPG,JPEG,GIF,WEBP}', {
  eager: true,
  import: 'default',
})

const GAMES = {
  relay: {
    title: '이어말하기',
    storageKey: 'quiz-used-relay',
    items: [...new Set(words.map((w) => String(w).trim()).filter(Boolean))],
    // "수수 께끼" → 문제 "수수", 정답 "수수께끼"
    question: (w) => <p className="word">{w.split(/\s+/)[0]}</p>,
    answer: (w) => w.replace(/\s+/g, ''),
  },
  person: {
    title: '인물 맞추기',
    storageKey: 'quiz-used-person',
    items: Object.keys(pictureUrls),
    question: (path) => <img className="photo" src={pictureUrls[path]} alt="인물 사진" />,
    answer: (path) => path.split('/').pop().replace(/\.[^.]+$/, ''),
  },
}

const load = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || []
  } catch {
    return []
  }
}
const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 저장이 막힌 브라우저에서는 새로고침 전까지만 기억
  }
}

// 이미 나온 문제는 localStorage에 기록, 전부 나오면 처음부터 다시
function useQuiz(storageKey, items) {
  const [used, setUsed] = useState(() => load(storageKey))
  const [current, setCurrent] = useState(null)
  const usedNow = used.filter((u) => items.includes(u)) // 데이터에서 빠진 문제는 무시

  const next = () => {
    let base = usedNow
    let pool = items.filter((i) => !base.includes(i))
    if (pool.length === 0) {
      base = []
      pool = items
    }
    if (pool.length === 0) return
    const pick = pool[Math.floor(Math.random() * pool.length)]
    const nextUsed = [...base, pick]
    setUsed(nextUsed)
    save(storageKey, nextUsed)
    setCurrent(pick)
  }

  const reset = () => {
    setUsed([])
    save(storageKey, [])
    setCurrent(null)
  }

  return { current, next, reset, done: usedNow.length, total: items.length }
}

function Quiz({ game, onBack }) {
  const { current, next, reset, done, total } = useQuiz(game.storageKey, game.items)
  const [showAnswer, setShowAnswer] = useState(false)

  const goNext = () => {
    setShowAnswer(false)
    next()
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault()
        goNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="quiz">
      <header className="bar">
        <button className="ghost" onClick={onBack}>← 처음으로</button>
        <h2>{game.title}</h2>
        <span className="count">{done} / {total}</span>
      </header>

      <main className="stage">
        {total === 0 ? (
          <p className="hint">문제가 없어요. data 폴더에 문제를 넣어주세요.</p>
        ) : current ? (
          game.question(current)
        ) : (
          <p className="hint">‘다음 문제’를 눌러 시작하세요</p>
        )}
        {current && showAnswer && <p className="answer">{game.answer(current)}</p>}
      </main>

      <footer className="bar">
        <button
          className="ghost"
          onClick={() => confirm('나온 문제 기록을 지우고 처음부터 할까요?') && reset()}
        >
          기록 초기화
        </button>
        <button className="ghost" disabled={!current} onClick={() => setShowAnswer((v) => !v)}>
          {showAnswer ? '정답 숨기기' : '정답 보기'}
        </button>
        <button className="primary" disabled={total === 0} onClick={goNext}>
          다음 문제 →
        </button>
      </footer>
    </div>
  )
}

export default function App() {
  const [gameId, setGameId] = useState(null)

  if (gameId) return <Quiz key={gameId} game={GAMES[gameId]} onBack={() => setGameId(null)} />

  return (
    <div className="home">
      <h1>퀴즈 게임</h1>
      <div className="menu">
        {Object.entries(GAMES).map(([id, g]) => (
          <button key={id} className="card" onClick={() => setGameId(id)}>
            <span className="card-title">{g.title}</span>
            <span className="card-sub">{g.items.length}문제</span>
          </button>
        ))}
      </div>
    </div>
  )
}
