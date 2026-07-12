'use client';

import { useEffect, useRef, useState } from 'react';
import { StatsBars, ALLAIS_LABELS, ELLSBERG_LABELS } from './ui';

const BASE = '/paradox';

const STEPS = ['intro', 'a1', 'a2', 'aResult', 'e0', 'e1', 'e2', 'eResult', 'end'];

/* ---------- 공통 컴포넌트 ---------- */

function Urn({ balls, small }) {
  // balls: [{color, n}, ...] 합계 100
  const list = [];
  balls.forEach(({ color, n }) => {
    for (let i = 0; i < n; i++) list.push(color);
  });
  return (
    <div className="urn">
      {list.map((c, i) => (
        <div key={i} className={`ball ${c}`} style={{ animationDelay: `${i * (small ? 4 : 8)}ms` }} />
      ))}
    </div>
  );
}

function Progress({ step }) {
  const idx = STEPS.indexOf(step);
  return (
    <div className="progress">
      {STEPS.map((s, i) => (
        <span key={s} className={i <= idx ? 'done' : ''} />
      ))}
    </div>
  );
}

function Amount({ v }) {
  if (v === 0) return <span className="amount zero">0 원</span>;
  if (v === 50) return <span className="amount big">50억 원</span>;
  return <span className="amount">10억 원</span>;
}

function PayoffRow({ color, count, label, v }) {
  return (
    <div className="payoff-row">
      <span className="dot" style={{ background: colorOf(color) }} />
      <span className="count">
        {label} {count}개
      </span>
      <Amount v={v} />
    </div>
  );
}

function colorOf(c) {
  return {
    red: '#ef4444',
    blue: '#3b82f6',
    white: '#e7e5db',
    black: '#3f3f46',
  }[c];
}

/* ---------- 알레 옵션 데이터 ---------- */

const ALLAIS_URN = [
  { color: 'red', n: 1 },
  { color: 'blue', n: 10 },
  { color: 'white', n: 89 },
];

const ALLAIS = {
  A: { red: 10, white: 10, blue: 10 },
  B: { red: 0, white: 10, blue: 50 },
  C: { red: 10, white: 0, blue: 10 },
  D: { red: 0, white: 0, blue: 50 },
};

function AllaisOption({ name, tagline, onPick }) {
  const p = ALLAIS[name];
  const certain = p.red === p.white && p.white === p.blue;
  return (
    <button className="option-card" onClick={onPick}>
      <div className="option-name">
        선택 {name} {tagline ? `- ${tagline}` : ''}
      </div>
      {certain ? (
        <div className="payoff-row">
          <span className="count" style={{ width: 'auto' }}>
            어떤 공이 나와도
          </span>
          <Amount v={p.red} />
        </div>
      ) : (
        <>
          <PayoffRow color="red" count={1} label="빨간 공" v={p.red} />
          <PayoffRow color="white" count={89} label="흰 공" v={p.white} />
          <PayoffRow color="blue" count={10} label="파란 공" v={p.blue} />
        </>
      )}
    </button>
  );
}

function AllaisTable({ options, covered }) {
  return (
    <table className={`reveal-table ${covered ? 'covered' : ''}`}>
      <thead>
        <tr>
          <th></th>
          <th>
            <span className="dot" style={{ background: colorOf('red'), display: 'inline-block', width: 10, height: 10, borderRadius: '50%', marginRight: 4 }} />
            빨강 (1)
          </th>
          <th className="white-col">
            <span className="dot" style={{ background: colorOf('white'), display: 'inline-block', width: 10, height: 10, borderRadius: '50%', marginRight: 4 }} />
            흰색 (89)
          </th>
          <th>
            <span className="dot" style={{ background: colorOf('blue'), display: 'inline-block', width: 10, height: 10, borderRadius: '50%', marginRight: 4 }} />
            파랑 (10)
          </th>
        </tr>
      </thead>
      <tbody>
        {options.map((o) => (
          <tr key={o}>
            <td className="opt-cell">{o}</td>
            <td>
              <Amount v={ALLAIS[o].red} />
            </td>
            <td className="white-col">
              <Amount v={ALLAIS[o].white} />
            </td>
            <td>
              <Amount v={ALLAIS[o].blue} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ---------- 알레 시뮬레이션 (질문 ①) ---------- */

function AllaisSim() {
  const [choice, setChoice] = useState(null); // 'A' | 'B'
  const [phase, setPhase] = useState('idle'); // 'idle' | 'drawing' | 'done'
  const [ball, setBall] = useState('white');
  const [reveal, setReveal] = useState(false);
  const [triedB, setTriedB] = useState(false);
  const ivRef = useRef(null);
  const toRef = useRef(null);

  useEffect(
    () => () => {
      clearInterval(ivRef.current);
      clearTimeout(toRef.current);
    },
    []
  );

  function draw(c) {
    if (phase === 'drawing') return;
    clearInterval(ivRef.current);
    clearTimeout(toRef.current);
    setChoice(c);
    setReveal(false);
    setPhase('drawing');

    const cycle = ['red', 'white', 'blue', 'white', 'blue', 'red', 'white', 'blue'];
    let i = 0;
    ivRef.current = setInterval(() => {
      i += 1;
      setBall(cycle[i % cycle.length]);
    }, 85);

    toRef.current = setTimeout(() => {
      clearInterval(ivRef.current);
      if (c === 'A') {
        // 선택 A는 어떤 공이든 10억 - 공은 정직하게 무작위로 뽑는다.
        const r = Math.random() * 100;
        setBall(r < 1 ? 'red' : r < 11 ? 'blue' : 'white');
      } else {
        // 교육용 white lie: 선택 B는 언제나 빨간 공(=0원)이 나오도록 조작.
        setBall('red');
        setTriedB(true);
      }
      setPhase('done');
    }, 1500);
  }

  const ballKo = { red: '빨간 공', white: '흰 공', blue: '파란 공' }[ball];

  return (
    <div className="sim-box">
      <h3>🎲 직접 뽑아보기</h3>
      <p className="sim-intro">
        질문 ①의 두 복권을 직접 돌려봅시다. <b>선택 A</b>는 어떤 공이든 확실한 10억,{' '}
        <b>선택 B</b>는 빨강이면 0원 · 흰색이면 10억 · 파랑이면 50억입니다. 어느 쪽으로
        뽑아보시겠어요? (여러 번 해봐도 됩니다.)
      </p>

      <div className="sim-buttons">
        <button
          className="sim-pick"
          onClick={() => draw('A')}
          disabled={phase === 'drawing'}
        >
          선택 A로 뽑기
          <small>확실한 10억</small>
        </button>
        <button
          className="sim-pick"
          onClick={() => draw('B')}
          disabled={phase === 'drawing'}
        >
          선택 B로 뽑기
          <small>1% 0원 · 89% 10억 · 10% 50억</small>
        </button>
      </div>

      {phase !== 'idle' && (
        <div className="sim-stage">
          <div className={`draw-ball ${ball} ${phase === 'drawing' ? 'spin' : 'land'}`} />
          {phase === 'drawing' ? (
            <div className="sim-hint">항아리에서 공을 뽑는 중…</div>
          ) : choice === 'A' ? (
            <div className="sim-result">
              {ballKo}이 나왔습니다.
              <br />
              <span className="win">선택 A는 어떤 공이 나와도 10억 원! ✅</span>
            </div>
          ) : (
            <div className="sim-result">
              {ballKo}이 나왔습니다.
              <br />
              <span className="lose">상금 0원 - 꽝입니다. 😱</span>
            </div>
          )}
        </div>
      )}

      {triedB && phase === 'done' && !reveal && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button className="reveal-btn" onClick={() => setReveal(true)}>
            🎭 왜 자꾸 빨간 공만 나올까? 진실 보기
          </button>
        </div>
      )}

      {reveal && (
        <div className="sim-reveal">
          <h4>사실 이건 몰래 조작된 추첨이었습니다</h4>
          <p>
            솔직히 털어놓겠습니다. 선택 B로 뽑으면 <b>언제나</b> 빨간 공이 나오도록 몰래
            정해 두었습니다. 원래대로라면 빨간 공이 나올 확률은 1%뿐인데도요. 방금의{' '}
            &lsquo;꽝&rsquo;은 우연이 아니라 설계된 결과였습니다.
          </p>
          <p>
            왜 이런 교육용 거짓말(white lie)을 했을까요? 사람들이 선택 A(확실한 10억)를
            선호하는 진짜 이유를 몸으로 느끼게 하려는 것입니다.
          </p>
          <p>
            기대값만 따지면 B가 A보다 낫습니다. 하지만 사람은 기대값만 보고 결정하지
            않습니다. 현실에는 <b>확률표에 적히지 않은 리스크</b>가 숨어 있기 때문입니다 -
            진행자가 거짓말을 할 수도, 추첨 기계가 고장 날 수도, 예상 못한 사고가 끼어들
            수도 있습니다.
          </p>
          <p>
            선택 A는 <b>어떤 공이 나와도</b> 10억이라 이런 조작·실수·사고에 전혀 흔들리지
            않습니다. 반면 선택 B는 &lsquo;추첨이 공정하게 작동한다&rsquo;는 가정 위에
            상금을 겁니다. 방금 느낀 배신감이 바로 그 <b>보이지 않는 리스크</b>입니다.
          </p>
          <p>
            그러니 확실한 A를 택하는 것은 결코 비합리적이지 않습니다. 눈에 보이는 확률
            너머의 불확실성까지 계산에 넣은, 오히려 신중한 선택일 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}

/* ---------- 메인 ---------- */

export default function Page() {
  const [step, setStep] = useState('intro');
  const [allais1, setAllais1] = useState(null); // 'A' | 'B'
  const [allais2, setAllais2] = useState(null); // 'C' | 'D'
  const [ellsRed, setEllsRed] = useState(null); // 'I' | 'II'
  const [ellsBlack, setEllsBlack] = useState(null); // 'I' | 'II'
  const [stats, setStats] = useState({ allais: {}, ellsberg: {} });
  const [covered, setCovered] = useState(false);

  const go = (s) => {
    setStep(s);
    window.scrollTo({ top: 0 });
  };

  async function vote(game, combo) {
    const votedKey = `paradox_voted_${game}`;
    const already = typeof window !== 'undefined' && localStorage.getItem(votedKey);
    try {
      if (!already) {
        const res = await fetch(`${BASE}/api/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ game, combo }),
        });
        const data = await res.json();
        if (data?.stored) localStorage.setItem(votedKey, combo);
        if (data?.counts) {
          setStats((prev) => ({ ...prev, [game]: data.counts }));
          return;
        }
      }
      const res = await fetch(`${BASE}/api/stats`);
      const data = await res.json();
      setStats(data);
    } catch {
      /* 통계 없이도 게임은 진행 */
    }
  }

  const allaisCombo = allais1 && allais2 ? `${allais1}${allais2}` : null;
  const ellsCombo = ellsRed && ellsBlack ? `${ellsRed}_${ellsBlack}` : null;

  useEffect(() => {
    if (step === 'aResult' && allaisCombo) vote('allais', allaisCombo);
    if (step === 'eResult' && ellsCombo) vote('ellsberg', ellsCombo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div className="container">
      <Progress step={step} />

      {step === 'intro' && (
        <div className="fade-in">
          <div className="top-title">DECISION LAB</div>
          <h1>선택의 역설</h1>
          <p className="subtitle">
            지금부터 두 개의 실험에 참여합니다.
            <br />
            정답은 없습니다. <b>당신이 실제로 하고 싶은 선택</b>을 하면 됩니다.
            <br />
            모든 선택이 끝나면, 당신의 선택이 무엇을 의미하는지 보여드립니다.
          </p>
          <div className="urn-wrap">
            <Urn balls={ALLAIS_URN} />
            <div className="urn-caption">
              <span>
                <span className="dot" style={{ background: colorOf('red') }} />
                빨간 공 1개
              </span>
              <span>
                <span className="dot" style={{ background: colorOf('blue') }} />
                파란 공 10개
              </span>
              <span>
                <span className="dot" style={{ background: colorOf('white') }} />
                흰 공 89개
              </span>
            </div>
          </div>
          <p className="subtitle">
            공 100개가 든 항아리에서 공 하나를 무작위로 뽑습니다.
            <br />
            어떤 공이 나오는지에 따라 상금이 결정됩니다.
          </p>
          <button className="btn" onClick={() => go('a1')}>
            실험 시작
          </button>
        </div>
      )}

      {step === 'a1' && (
        <div className="fade-in">
          <div className="stage-badge">STAGE 1 - 질문 ①</div>
          <h2>둘 중 하나를 고르세요</h2>
          <p className="question-text">
            항아리에서 공을 하나 뽑습니다. 어느 쪽 복권을 갖겠습니까?
          </p>
          <div className="options">
            <AllaisOption
              name="A"
              tagline="확실한 10억"
              onPick={() => {
                setAllais1('A');
                go('a2');
              }}
            />
            <AllaisOption
              name="B"
              tagline="더 큰 꿈"
              onPick={() => {
                setAllais1('B');
                go('a2');
              }}
            />
          </div>
        </div>
      )}

      {step === 'a2' && (
        <div className="fade-in">
          <div className="stage-badge">STAGE 1 - 질문 ②</div>
          <h2>이번에도 둘 중 하나를 고르세요</h2>
          <p className="question-text">
            같은 항아리에서 공을 하나 뽑습니다. 이번에는 어느 쪽입니까?
          </p>
          <div className="options">
            <AllaisOption
              name="C"
              tagline="안전한 도박"
              onPick={() => {
                setAllais2('C');
                go('aResult');
              }}
            />
            <AllaisOption
              name="D"
              tagline="큰 도박"
              onPick={() => {
                setAllais2('D');
                go('aResult');
              }}
            />
          </div>
        </div>
      )}

      {step === 'aResult' && (
        <div className="fade-in">
          <div className="stage-badge">STAGE 1 - 결과</div>
          <h2>알레의 역설</h2>
          <div className="you-chose">
            당신의 선택: <strong>{allais1}</strong> 그리고 <strong>{allais2}</strong>
          </div>

          <StatsBars
            title="전체 참여자의 선택 분포"
            counts={stats.allais}
            labels={ALLAIS_LABELS}
            mine={allaisCombo}
          />

          <div className="explain-box">
            <h3>두 문제를 나란히 놓고 봅시다</h3>
            <div className="table-name">질문 ① (A vs B)</div>
            <AllaisTable options={['A', 'B']} covered={covered} />
            <div className="table-name">질문 ② (C vs D)</div>
            <AllaisTable options={['C', 'D']} covered={covered} />
            <button className="btn secondary" onClick={() => setCovered(!covered)}>
              {covered ? '흰 공 칸 다시 보기' : '👉 흰 공 89개 칸을 가려보세요'}
            </button>
            {covered && (
              <p style={{ marginTop: 16 }}>
                흰 공 칸을 가리면 <b>질문 ①과 질문 ②는 완전히 같은 문제</b>입니다.
                흰 공 칸은 각 질문 안에서 두 선택지가 서로 같으므로 (①에서는 둘 다 10억,
                ②에서는 둘 다 0원), 선택에 영향을 주지 않아야 한다는 것이{' '}
                <b>기대효용이론의 요구</b>입니다.
              </p>
            )}
          </div>

          {(allaisCombo === 'AD' || allaisCombo === 'BC') ? (
            <div className="verdict paradox">
              <span className="headline">기대효용이론의 잣대로는 서로 모순인 선택입니다</span>
              {allaisCombo === 'AD' ? (
                <>
                  질문 ①에서 A를 골랐다는 것은 &ldquo;확실한 10억이 (1% 꽝 + 10% 50억)보다
                  낫다&rdquo;는 뜻이고, 질문 ②에서 D를 골랐다는 것은 정확히 그 반대를 뜻합니다.
                  기대효용이론에 따르면 이 두 선택은 동시에 성립할 수 없습니다.
                </>
              ) : (
                <>
                  질문 ①에서 B를 골랐다는 것은 &ldquo;(1% 꽝 + 10% 50억)이 확실한 10억보다
                  낫다&rdquo;는 뜻이고, 질문 ②에서 C를 골랐다는 것은 정확히 그 반대를 뜻합니다.
                  기대효용이론에 따르면 이 두 선택은 동시에 성립할 수 없습니다.
                </>
              )}
              <br />
              <br />
              다만 이것은 어디까지나 <b>기대효용이론이라는 특정한 잣대에서의 모순</b>일
              뿐입니다. 넓은 의미의 합리성에서 당신이 틀렸다고 말할 수는 없습니다 - 전
              세계에서 가장 흔한 선택이 바로 A+D이고, 노벨경제학상 수상자 모리스
              알레(Maurice Allais)가 1953년에 이 역설을 발표했을 때 저명한 경제학자들조차
              같은 선택을 했습니다. 아래 해설을 보세요.
            </div>
          ) : (
            <div className="verdict consistent">
              <span className="headline">기대효용이론과 일치하는 선택입니다</span>
              당신의 선택은 기대효용이론의 공리를 그대로 따랐습니다. 실험에서 대부분의
              사람들은 A+D를 골라 이 이론과 어긋나는 선택을 합니다. 당신은 소수파입니다!
              (그렇다고 다수파가 비합리적이라는 뜻은 아닙니다 - 아래 해설을 보세요.)
            </div>
          )}

          <div className="explain-box">
            <h3>왜 사람들은 A와 D를 고를까?</h3>
            <p>
              <b>후회 기피:</b> 질문 ①에서 B를 골랐다가 빨간 공이 나오면 &ldquo;확실한
              10억을 걷어찼다&rdquo;는 깊은 후회가 남습니다. 질문 ②에는 확실한 대안이
              없으므로, 실패해도 &ldquo;좋은 내기였는데 운이 없었을 뿐&rdquo;입니다.
            </p>
            <p>
              <b>전망이론 (카너먼-트버스키):</b> 확실한 10억(A)을 보는 순간 마음속
              기준점이 &ldquo;나는 이미 10억을 가졌다&rdquo;로 이동합니다. 그러면 B는
              이득의 기회가 아니라 <b>10억을 잃을 위험</b>으로 지각되고, 사람은 손실 앞에서
              훨씬 민감해집니다(손실 회피).
            </p>
            <p>
              그래서 알레의 역설은 &ldquo;사람이 비합리적&rdquo;이라는 증명이라기보다,
              효용이 최종 금액만이 아니라 <b>후회의 가능성과 기준점</b>에도 의존한다는 것을
              보여줍니다.
            </p>
          </div>

          <AllaisSim />

          <button className="btn" onClick={() => go('e0')}>
            다음 실험으로 →
          </button>
        </div>
      )}

      {step === 'e0' && (
        <div className="fade-in">
          <div className="stage-badge">STAGE 2</div>
          <h2>두 개의 항아리</h2>
          <p className="question-text">
            이번에는 항아리가 두 개입니다. 각 항아리에는 공이 100개씩 들어 있습니다.
          </p>
          <div className="urns-row">
            <div className="urn-col">
              <span className="urn-label">항아리 Ⅰ</span>
              <Urn small balls={[{ color: 'unknown', n: 100 }]} />
              <span className="urn-caption">빨강+검정 100개, 비율은 아무도 모름</span>
            </div>
            <div className="urn-col">
              <span className="urn-label">항아리 Ⅱ</span>
              <Urn
                small
                balls={[
                  { color: 'red', n: 50 },
                  { color: 'black', n: 50 },
                ]}
              />
              <span className="urn-caption">빨강 50개 + 검정 50개 (확실함)</span>
            </div>
          </div>
          <p className="subtitle">
            공을 뽑기 전에 어떤 색이 나올지 내기를 겁니다.
            <br />
            맞히면 100만 원을 받습니다.
          </p>
          <button className="btn" onClick={() => go('e1')}>
            내기 시작
          </button>
        </div>
      )}

      {step === 'e1' && (
        <div className="fade-in">
          <div className="stage-badge">STAGE 2 - 질문 ①</div>
          <h2>
            <span style={{ color: '#ef4444' }}>빨간 공</span>에 걸겠습니다
          </h2>
          <p className="question-text">
            빨간 공이 나오면 100만 원을 받습니다.
            <br />
            어느 항아리에서 뽑겠습니까?
          </p>
          <div className="options">
            <button
              className="option-card"
              onClick={() => {
                setEllsRed('I');
                go('e2');
              }}
            >
              <div className="option-name">항아리 Ⅰ</div>
              빨강과 검정의 비율을 알 수 없는 항아리
            </button>
            <button
              className="option-card"
              onClick={() => {
                setEllsRed('II');
                go('e2');
              }}
            >
              <div className="option-name">항아리 Ⅱ</div>
              빨강 50개, 검정 50개가 확실한 항아리
            </button>
          </div>
        </div>
      )}

      {step === 'e2' && (
        <div className="fade-in">
          <div className="stage-badge">STAGE 2 - 질문 ②</div>
          <h2>
            이번에는 <span style={{ color: '#a1a1aa' }}>검은 공</span>에 걸겠습니다
          </h2>
          <p className="question-text">
            검은 공이 나오면 100만 원을 받습니다.
            <br />
            어느 항아리에서 뽑겠습니까?
          </p>
          <div className="options">
            <button
              className="option-card"
              onClick={() => {
                setEllsBlack('I');
                go('eResult');
              }}
            >
              <div className="option-name">항아리 Ⅰ</div>
              빨강과 검정의 비율을 알 수 없는 항아리
            </button>
            <button
              className="option-card"
              onClick={() => {
                setEllsBlack('II');
                go('eResult');
              }}
            >
              <div className="option-name">항아리 Ⅱ</div>
              빨강 50개, 검정 50개가 확실한 항아리
            </button>
          </div>
        </div>
      )}

      {step === 'eResult' && (
        <div className="fade-in">
          <div className="stage-badge">STAGE 2 - 결과</div>
          <h2>엘즈버그의 역설</h2>
          <div className="you-chose">
            빨간 공 내기: <strong>항아리 {ellsRed === 'I' ? 'Ⅰ' : 'Ⅱ'}</strong> / 검은 공
            내기: <strong>항아리 {ellsBlack === 'I' ? 'Ⅰ' : 'Ⅱ'}</strong>
          </div>

          <StatsBars
            title="전체 참여자의 선택 분포"
            counts={stats.ellsberg}
            labels={ELLSBERG_LABELS}
            mine={ellsCombo}
          />

          {ellsCombo === 'II_II' || ellsCombo === 'I_I' ? (
            <div className="verdict paradox">
              <span className="headline">
                {ellsCombo === 'II_II'
                  ? '하나의 확률 믿음으로는 설명되지 않는 선택입니다'
                  : '흥미로운 선택입니다!'}
              </span>
              {ellsCombo === 'II_II' ? (
                <>
                  빨간 공 내기에서 항아리 Ⅱ를 골랐다면, 당신은 항아리 Ⅰ의 빨간 공이
                  50개보다 <b>적다</b>고 믿는 셈입니다. 검은 공 내기에서도 항아리 Ⅱ를
                  골랐다면, 항아리 Ⅰ의 검은 공도 50개보다 <b>적다</b>고 믿는 셈입니다.
                  그런데 항아리 Ⅰ에는 빨강과 검정을 합쳐 정확히 100개가 있습니다. 둘 다
                  50개보다 적을 수는 없습니다!
                </>
              ) : (
                <>
                  두 내기 모두 비율을 모르는 항아리 Ⅰ을 골랐다면, 당신은 항아리 Ⅰ의 빨간
                  공도 50개보다 많고 검은 공도 50개보다 많다고 믿는 셈입니다. 합쳐서 100개인
                  항아리에서 둘 다 50개를 넘을 수는 없습니다!
                </>
              )}
              <br />
              <br />
              다만 이것 역시 <b>하나의 확률 믿음을 요구하는 기대효용이론의 잣대에서 본
              모순</b>일 뿐, 넓은 의미의 합리성에서 당신이 틀렸다는 뜻은 아닙니다 - 아래
              &lsquo;모호성 회피&rsquo; 해설을 보세요.
            </div>
          ) : (
            <div className="verdict consistent">
              <span className="headline">기대효용이론과 양립하는 선택입니다</span>
              당신의 두 선택은 항아리 Ⅰ의 비율에 대한 하나의 일관된 믿음으로 설명될 수
              있습니다. 실험에서는 대부분의 사람들이 두 내기 모두 &ldquo;확실한&rdquo;
              항아리 Ⅱ를 골라, 하나의 확률 믿음으로는 설명되지 않는 선택을 합니다.
            </div>
          )}

          {ellsCombo === 'II_II' && (
            <div className="explain-box">
              <h3>당신의 믿음을 그림으로 보면</h3>
              <p>항아리 Ⅰ에 대한 당신의 (암묵적) 확률 추정:</p>
              <div className="prob-bar">
                <div className="seg red-seg" style={{ width: '40%' }}>
                  빨강 &lt; 50%
                </div>
                <div className="seg black-seg" style={{ width: '40%' }}>
                  검정 &lt; 50%
                </div>
                <div className="seg gap-seg" style={{ width: '20%' }}>
                  ??
                </div>
              </div>
              <p className="prob-caption">
                빨강과 검정의 확률을 합치면 반드시 100%가 되어야 하는데, 당신의 선택은
                합쳐서 100%가 안 되는 믿음을 드러냅니다.
              </p>
            </div>
          )}

          <div className="explain-box">
            <h3>모호성 회피 (Ambiguity Aversion)</h3>
            <p>
              항아리 Ⅱ는 <b>위험(risk)</b>입니다 - 확률(50%)을 정확히 압니다. 항아리 Ⅰ은{' '}
              <b>불확실성(uncertainty)</b>입니다 - 확률 자체를 모릅니다. 사람들은 같은
              조건이라면 <b>확률을 아는 쪽</b>을 강하게 선호합니다. 이것이 모호성
              회피입니다.
            </p>
            <div className="quote-box">
              &ldquo;우리의 항아리 예시에서 정보의 상태는 무지로도, 위험(risk)으로도
              특징지을 수 없다.&rdquo;
              <span className="who">- 다니엘 엘즈버그, 『위험, 모호성, 새비지 공리들』(1961)</span>
            </div>
            <p>
              이 역시 &ldquo;비합리성&rdquo;의 증명이라기보다, 확률을 아는 상황(위험)과
              모르는 상황(불확실성)에 대한 태도가 다르다는 것 - 그리고 표준 기대효용이론은
              그 차이를 담지 못한다는 것을 보여줍니다.
            </p>
          </div>

          <button className="btn" onClick={() => go('end')}>
            정리 →
          </button>
        </div>
      )}

      {step === 'end' && (
        <div className="fade-in">
          <div className="top-title">DECISION LAB</div>
          <h1>실험 종료</h1>
          <div className="explain-box">
            <h3>오늘 체험한 것</h3>
            <p>
              <b>알레의 역설</b>: 확실성은 특별한 힘을 갖습니다. 사람들은 확실한 것을
              포기할 때 생기는 후회의 가능성에 민감하고, 이는 기대효용이론의 공리(공통
              부분은 선택에 영향을 주지 않아야 한다)와 충돌합니다.
            </p>
            <p>
              <b>엘즈버그의 역설</b>: 사람들은 확률을 아는 위험보다 확률을 모르는 모호성을
              회피합니다. 이 선택 패턴은 어떤 단일한 확률 믿음으로도 설명되지 않습니다.
            </p>
            <p>
              두 역설 모두 &ldquo;인간이 어리석다&rdquo;는 이야기가 아니라, 합리적 선택
              이론이 <b>후회, 기준점, 모호성</b> 같은 요소를 어떻게 다루어야 하는가라는
              깊은 질문을 던집니다. 이 질문에서 행동경제학과 전망이론이 태어났습니다.
            </p>
          </div>
          <button
            className="btn secondary"
            onClick={() => {
              setAllais1(null);
              setAllais2(null);
              setEllsRed(null);
              setEllsBlack(null);
              setCovered(false);
              go('intro');
            }}
          >
            처음부터 다시 하기
          </button>
          <p className="footer-note">
            Maurice Allais (1953) · Daniel Ellsberg (1961)
            <br />
            <a href="https://www.shinhocheol.com">shinhocheol.com</a>
          </p>
        </div>
      )}
    </div>
  );
}
