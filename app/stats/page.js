'use client';

import { useEffect, useState } from 'react';
import { StatsBars, ALLAIS_LABELS, ELLSBERG_LABELS } from '../ui';

const BASE = '/paradox';

export default function StatsPage() {
  const [stats, setStats] = useState({ allais: {}, ellsberg: {} });
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch(`${BASE}/api/stats`, { cache: 'no-store' });
        const data = await res.json();
        if (alive) {
          setStats(data);
          setUpdatedAt(new Date());
        }
      } catch {
        /* 다음 갱신 때 재시도 */
      }
    }
    load();
    const id = setInterval(load, 5000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="container">
      <div className="top-title">DECISION LAB - LIVE</div>
      <h1>실시간 집계 현황</h1>
      <p className="subtitle">
        5초마다 자동으로 갱신됩니다.
        {updatedAt ? ` (마지막 갱신 ${updatedAt.toLocaleTimeString('ko-KR')})` : ''}
      </p>
      <h2>Stage 1 - 알레의 역설</h2>
      <StatsBars title="선택 분포" counts={stats.allais} labels={ALLAIS_LABELS} mine={null} />
      <h2>Stage 2 - 엘즈버그의 역설</h2>
      <StatsBars title="선택 분포" counts={stats.ellsberg} labels={ELLSBERG_LABELS} mine={null} />
      <p className="footer-note">
        A+D, &ldquo;빨강도 Ⅱ 검정도 Ⅱ&rdquo;가 기대효용이론과 모순되는 조합입니다.
      </p>
    </div>
  );
}
