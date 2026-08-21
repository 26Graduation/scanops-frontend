import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../../shared/ui/Icon'
import { useAuth } from '../../../shared/lib/auth'
import { completeSurvey, fetchSurveyStatus, submitSurvey } from '../../../shared/api/survey'

type StepType = 'intro' | 'single' | 'text' | 'done'

interface Option { v: string; label: string }
interface Step {
  id: string
  type: StepType
  eyebrow?: string
  title?: string
  sub?: string
  options?: Option[]
  placeholder?: string
  optional?: boolean
}

const QUESTIONS: Step[] = [
  {
    id: 'priorExperience', type: 'single', eyebrow: '경험',
    title: '기존에 보안 점검 사이트 또는\n보안 점검 서비스를 이용해보신 적이 있으신가요?',
    options: [{ v: '있음', label: '있어요' }, { v: '없음', label: '없어요' }],
  },
  {
    id: 'purpose', type: 'single', eyebrow: '목적',
    title: '무슨 목적으로 쓰시나요?',
    options: [
      { v: '배포전점검', label: '배포 전 점검' },
      { v: '실서비스보안점검', label: '실서비스 보안 점검 차 사용' },
      { v: '개인깃허브점검', label: '개인 GitHub 보안 점검' },
    ],
  },
  {
    id: 'role', type: 'single', eyebrow: '역할',
    title: '어떤 역할이신가요?',
    options: [
      { v: '개발자', label: '개발자' },
      { v: 'CTO', label: 'CTO' },
      { v: '기획자', label: '기획자' },
      { v: '보안담당자', label: '보안담당자' },
      { v: '기타', label: '기타' },
    ],
  },
  {
    id: 'continueIntent', type: 'single', eyebrow: '지속 의향',
    title: '베타 테스트가 끝나도\n계속 사용하실 의향이 있으신가요?',
    options: [
      { v: '예', label: '예' },
      { v: '아니오', label: '아니오' },
      { v: '성능개선시', label: '좀 더 성능 개선이 되면 사용 의향이 있다' },
    ],
  },
  {
    id: 'recommendIntent', type: 'single', eyebrow: '추천 의향',
    title: '동료 개발자에게\nScanOps를 추천할 의향이 있나요?',
    options: [
      { v: '전혀아니다', label: '전혀 아니다' },
      { v: '고민된다', label: '고민된다' },
      { v: '추천하겠다', label: '추천하겠다' },
    ],
  },
  {
    id: 'likedPoints', type: 'text', eyebrow: '의견',
    title: 'ScanOps의 어떤 점이\n마음에 드셨나요?',
    placeholder: '자유롭게 적어주세요', optional: true,
  },
  {
    id: 'suggestedFeature', type: 'text', eyebrow: '제안',
    title: 'ScanOps를 추천하려면\n이런 기능이 더 있었으면 좋겠다 하는 게 있나요?',
    placeholder: '자유롭게 적어주세요', optional: true,
  },
]

const STEPS: Step[] = [{ id: 'intro', type: 'intro' }, ...QUESTIONS, { id: 'done', type: 'done' }]

function clientId() {
  try {
    let id = localStorage.getItem('scanops_survey_cid')
    if (!id) {
      id = 'c' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
      localStorage.setItem('scanops_survey_cid', id)
    }
    return id
  } catch { return 'no-storage' }
}

export default function SurveyPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [checking, setChecking] = useState(true)

  // 계정당 1회 제한 — 이미 참여했으면 설문을 열지 않고 바로 마이페이지로 돌려보낸다.
  useEffect(() => {
    fetchSurveyStatus()
      .then((s) => { if (s.completed) navigate('/mypage', { replace: true }); else setChecking(false) })
      .catch(() => setChecking(false))
  }, [navigate])

  const step = STEPS[i]
  const isQuestion = (s: Step) => s.type !== 'intro' && s.type !== 'done'
  const qCount = STEPS.filter(isQuestion).length
  const doneCount = STEPS.slice(0, i).filter(isQuestion).length
  const pct = step.type === 'done' ? 100 : Math.round((doneCount / qCount) * 100)

  const submit = async (finalAnswers: Record<string, string>) => {
    if (submitting) return
    setSubmitting(true)
    await submitSurvey({
      clientId: clientId(),
      userEmail: user?.email ?? '',
      userName: user?.name ?? '',
      ...finalAnswers,
      submittedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
    })
    try { await completeSurvey() } catch { /* 참여 표시 실패해도 제출 자체는 끝난 상태로 둔다 */ }
    setSubmitting(false)
  }

  const goNext = (nextAnswers = answers) => {
    const j = i + 1
    setI(j)
    if (STEPS[j]?.type === 'done') submit(nextAnswers)
  }

  const pick = (v: string) => {
    const next = { ...answers, [step.id]: v }
    setAnswers(next)
    setTimeout(() => goNext(next), 220)
  }

  const back = () => { if (i > 0) setI(i - 1) }

  if (checking) return <div className="min-h-screen bg-field" />

  return (
    <div className="min-h-screen bg-field flex justify-center">
      <div className="w-full max-w-[480px] bg-field min-h-screen flex flex-col">
        {/* top */}
        <div className="sticky top-0 z-10 bg-field px-5 pt-2">
          <div className="h-11 flex items-center">
            {i > 0 && step.type !== 'done' && (
              <button onClick={back} aria-label="이전" className="w-8 h-8 -ml-1.5 flex items-center justify-center text-ink">
                <Icon name="chevron-left" size={22} />
              </button>
            )}
          </div>
          {step.type !== 'intro' && (
            <div className="h-1 bg-line rounded-full overflow-hidden">
              <div className="h-full bg-brand rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>
          )}
        </div>

        {/* body */}
        <div className="flex-1 px-5 pt-6 overflow-y-auto">
          {step.type === 'intro' && <IntroView onStart={() => goNext()} />}
          {step.type === 'done' && <DoneView submitting={submitting} onExit={() => navigate('/mypage')} />}
          {step.type === 'single' && (
            <SingleView step={step} value={answers[step.id]} onPick={pick} />
          )}
          {step.type === 'text' && (
            <TextView
              step={step}
              value={answers[step.id] ?? ''}
              onChange={(v) => setAnswers((a) => ({ ...a, [step.id]: v }))}
              onNext={() => goNext()}
              isLast={STEPS[i + 1]?.type === 'done'}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function IntroView({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-2 py-10 min-h-[70vh]">
      <div className="w-[72px] h-[72px] rounded-[22px] bg-brand flex items-center justify-center mb-6 shadow-[0_8px_24px_rgba(49,130,246,.35)]">
        <Icon name="edit-3" size={32} className="text-white" />
      </div>
      <h1 className="text-[26px] font-extrabold text-ink leading-snug tracking-tight">
        1분이면 끝나요.<br />베타 사용 경험을<br />들려주세요
      </h1>
      <p className="mt-3 text-[15px] text-ink-muted leading-relaxed">
        ScanOps를 더 잘 만들기 위한 짧은 설문이에요.<br />정답은 없어요.
      </p>
      <div className="inline-flex items-center gap-1.5 bg-white rounded-full px-3.5 py-2 text-[13px] font-semibold text-ink-sub mt-5">
        ⏱ 약 1분 · 7문항
      </div>
      <button
        onClick={onStart}
        className="mt-10 w-full h-[54px] rounded-2xl bg-brand text-white text-[17px] font-bold hover:bg-brand-hover active:scale-[.99] transition-all"
      >
        설문 시작하기
      </button>
    </div>
  )
}

function DoneView({ submitting, onExit }: { submitting: boolean; onExit: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-2 py-10 min-h-[70vh]">
      <div className="w-[72px] h-[72px] rounded-[22px] bg-brand flex items-center justify-center mb-6 shadow-[0_8px_24px_rgba(49,130,246,.35)]">
        <Icon name="check" size={34} className="text-white" strokeWidth={3} />
      </div>
      <h1 className="text-[24px] font-extrabold text-ink leading-snug tracking-tight">
        설문이 끝났어요!<br />고맙습니다 🙏
      </h1>
      <p className="mt-3 text-[15px] text-ink-muted leading-relaxed">
        들려주신 이야기로 ScanOps를<br />더 쓸모 있게 만들게요.
      </p>
      <button
        onClick={onExit}
        disabled={submitting}
        className="mt-10 w-full h-[54px] rounded-2xl bg-brand text-white text-[17px] font-bold hover:bg-brand-hover active:scale-[.99] transition-all disabled:opacity-60"
      >
        마이페이지로 돌아가기
      </button>
    </div>
  )
}

function SingleView({ step, value, onPick }: { step: Step; value?: string; onPick: (v: string) => void }) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-brand mb-2.5">{step.eyebrow}</p>
      <h1 className="text-[22px] font-bold text-ink leading-snug mb-6 whitespace-pre-line">{step.title}</h1>
      <div className="flex flex-col gap-2.5">
        {step.options!.map((o) => {
          const selected = value === o.v
          return (
            <button
              key={o.v}
              onClick={() => onPick(o.v)}
              className={`w-full text-left rounded-2xl px-4 py-4 text-[16px] font-semibold flex items-center justify-between gap-3 transition-all shadow-[0_1px_2px_rgba(0,0,0,.03)] border-[1.5px] active:scale-[.985] ${
                selected ? 'bg-brand-soft border-brand text-brand-press' : 'bg-white border-white text-ink'
              }`}
            >
              {o.label}
              <span
                className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  selected ? 'bg-brand border-brand' : 'border-line-strong'
                }`}
              >
                {selected && <Icon name="check" size={13} className="text-white" strokeWidth={3} />}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TextView({ step, value, onChange, onNext, isLast }: {
  step: Step; value: string; onChange: (v: string) => void; onNext: () => void; isLast: boolean
}) {
  return (
    <div className="flex flex-col h-full">
      <p className="text-[13px] font-semibold text-brand mb-2.5">{step.eyebrow}</p>
      <h1 className="text-[22px] font-bold text-ink leading-snug mb-6 whitespace-pre-line">{step.title}</h1>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={step.placeholder}
        rows={5}
        className="w-full rounded-2xl bg-white border border-line px-4 py-3.5 text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-brand transition-colors resize-none"
      />
      <div className="mt-auto pt-8 pb-6">
        <button
          onClick={onNext}
          className="w-full h-[54px] rounded-2xl bg-brand text-white text-[17px] font-bold hover:bg-brand-hover active:scale-[.99] transition-all"
        >
          {isLast ? '제출하기' : '다음'}
        </button>
        {step.optional && !value.trim() && (
          <button onClick={onNext} className="w-full text-center text-[14px] font-semibold text-ink-muted mt-2 py-2">
            건너뛰기
          </button>
        )}
      </div>
    </div>
  )
}
