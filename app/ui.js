'use client';

export const ALLAIS_LABELS = { AC: 'A + C', AD: 'A + D', BC: 'B + C', BD: 'B + D' };

export const ELLSBERG_LABELS = {
  II_II: '빨강도 Ⅱ, 검정도 Ⅱ',
  I_I: '빨강도 Ⅰ, 검정도 Ⅰ',
  II_I: '빨강은 Ⅱ, 검정은 Ⅰ',
  I_II: '빨강은 Ⅰ, 검정은 Ⅱ',
};

export function StatsBars({ counts, labels, mine, title }) {
  const total = Object.values(counts || {}).reduce((a, b) => a + Number(b || 0), 0);
  return (
    <div className="stats-box">
      <div className="stats-title">
        {title} (지금까지 {total.toLocaleString()}명 참여)
      </div>
      {Object.entries(labels).map(([key, label]) => {
        const n = Number(counts?.[key] || 0);
        const pct = total > 0 ? Math.round((n / total) * 100) : 0;
        return (
          <div key={key} className={`stat-row ${key === mine ? 'mine' : ''}`}>
            <div className="stat-label">
              <span>
                {label}
                {key === mine ? ' - 나의 선택' : ''}
              </span>
              <span className="pct">
                {pct}% ({n.toLocaleString()}명)
              </span>
            </div>
            <div className="stat-bar-bg">
              <div className="stat-bar" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
