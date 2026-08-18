import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import './gold_prediction.css';

type ForecastPoint = {
  date: string;
  forecastPerGram24k: number;
  lowPerGram24k: number;
  highPerGram24k: number;
  changePct: number;
  direction: 'bullish' | 'bearish' | 'flat';
  perGram: {
    k24: number;
    k22: number;
    k18: number;
  };
};

type GoldForecastRun = {
  _id: string;
  trigger: 'manual' | 'scheduled-morning' | 'scheduled-evening' | 'startup';
  status: 'success' | 'failed';
  currency: string;
  scheduledFor?: string;
  executedAt: string;
  request: {
    horizonDays?: number;
    historyWindow?: number;
    includeDependencies?: boolean;
    useAi?: boolean;
    anchorPricePerGram24k?: number | null;
  };
  currentDay: {
    date: string;
    currency: string;
    retailPremiumFactor: number;
    perGram: {
      k24: number;
      k22: number;
      k18: number;
    };
  };
  ai?: {
    enabled: boolean;
    provider?: string;
    model?: string;
    confidence?: number;
    baselinePerGram24k?: number[];
    adjustedPerGram24k?: number[];
    notes?: string;
  };
  source: {
    history: string;
    spot: string;
    carat: string;
    intradayXau: string;
    intradayXag: string;
  };
  basis: {
    lastCloseUsdOz: number;
    historyWindow: number;
    trendScore: number;
    momentumScore: number;
    volatilityScore: number;
    dependencyScore: number;
  };
  context: {
    spotUsdOz: number;
    silverUsdOz?: number;
    goldSilverRatio?: number;
    btcUsd?: number;
    btcGoldOz?: number;
    goldMarketCapUsd?: number;
    centralBankReservesTonnes?: number;
    netCentralBankPurchasesTonnes?: number;
  };
  forecast: ForecastPoint[];
  narrative: string;
  warnings: string[];
  generatedAt: string;
  createdAt?: string;
  updatedAt?: string;
};

const API_BASE = 'https://ai-webservices.onrender.com';

function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function formatDateTime(value?: string) {
  if (!value) return 'Unknown';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatDate(value?: string) {
  if (!value) return 'Unknown';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getRunLabel(run: GoldForecastRun) {
  switch (run.trigger) {
    case 'scheduled-morning':
      return 'Morning snapshot';
    case 'scheduled-evening':
      return 'Evening snapshot';
    case 'startup':
      return 'Startup snapshot';
    default:
      return 'Manual run';
  }
}

function getRunTone(run: GoldForecastRun) {
  if (run.status === 'failed') return 'danger';
  if (run.ai?.enabled) return 'ai';
  if (run.trigger.startsWith('scheduled')) return 'scheduled';
  return 'manual';
}

function forecastDelta(run: GoldForecastRun) {
  const first = run.forecast?.[0]?.forecastPerGram24k ?? run.currentDay.perGram.k24;
  const base = run.currentDay.perGram.k24 || 1;
  return ((first - base) / base) * 100;
}

export default function GoldPredictionPage() {
  const navigate = useNavigate();
  const { runId } = useParams();
  const [runs, setRuns] = useState<GoldForecastRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(runId ?? null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [runningNow, setRunningNow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRun = useMemo(() => {
    if (!runs.length) return null;
    return runs.find((item) => item._id === selectedRunId) ?? runs[0] ?? null;
  }, [runs, selectedRunId]);

  const reloadRuns = useCallback(
    async (preserveSelection = true, selectionId?: string | null) => {
      setRefreshing(true);
      try {
        setError(null);
        const response = await fetch(`${API_BASE}/gold-prediction/runs?limit=24`);
        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = (await response.json()) as GoldForecastRun[];
        setRuns(data);

        const requestedId = preserveSelection ? selectionId : null;
        const nextSelectedId = requestedId
          ? data.find((item) => item._id === requestedId)?._id ?? data[0]?._id ?? null
          : runId ?? data[0]?._id ?? null;

        setSelectedRunId(nextSelectedId);
        if (nextSelectedId) {
          navigate(`/gold-prediction/${nextSelectedId}`, { replace: true });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navigate, runId],
  );

  useEffect(() => {
    void reloadRuns(false);
  }, [reloadRuns]);

  useEffect(() => {
    if (runId) {
      setSelectedRunId(runId);
    }
  }, [runId]);

  const rerunForecast = async () => {
    setRunningNow(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/gold-prediction/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency: 'INR',
          horizonDays: 2,
          historyWindow: 120,
          includeDependencies: true,
          useAi: true,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      await reloadRuns(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunningNow(false);
    }
  };

  const aiConfidence = selectedRun?.ai?.confidence ?? 0;
  const normalizedConfidence = clamp(aiConfidence, 0, 1);
  const currentK24 = selectedRun?.currentDay.perGram.k24 ?? 0;
  const currentK22 = selectedRun?.currentDay.perGram.k22 ?? 0;
  const currentK18 = selectedRun?.currentDay.perGram.k18 ?? 0;

  const trendTone = selectedRun
    ? selectedRun.basis.trendScore >= 0
      ? 'Positive'
      : 'Negative'
    : 'Neutral';
  const momentumTone = selectedRun
    ? selectedRun.basis.momentumScore >= 0
      ? 'Upward'
      : 'Softening'
    : 'Neutral';

  return (
    <main className="gold-page">
      <section className="gold-shell">
        <header className="gold-hero">
          <div className="gold-hero__copy">
            <div className="gold-badges">
              <span>Saved snapshots</span>
              <span>Twice daily cron</span>
              <span>AI-assisted forecast</span>
            </div>
            <h1>Gold forecast ledger</h1>
            <p>
              This dashboard shows the cron-saved gold prediction snapshots from the backend.
              Use it to compare the live anchor, the AI adjustment, and the two-day forecast
              curve in one place.
            </p>
          </div>
          <div className="gold-hero__actions">
            <button onClick={rerunForecast} disabled={runningNow}>
              {runningNow ? 'Running...' : 'Run now'}
            </button>
            <button className="secondary" onClick={() => void reloadRuns(true, selectedRunId)}>
              {refreshing ? 'Refreshing...' : 'Refresh list'}
            </button>
          </div>
        </header>

        {error && <div className="gold-alert">{error}</div>}

        <div className="gold-layout">
          <aside className="gold-sidebar">
            <div className="gold-sidebar__header">
              <div>
                <p className="eyebrow">History</p>
                <h2>Saved runs</h2>
              </div>
              <span>{runs.length} records</span>
            </div>

            <div className="gold-runlist">
              {loading && <div className="gold-empty">Loading forecast history...</div>}
              {!loading && !runs.length && (
                <div className="gold-empty">
                  No saved runs yet. Run a snapshot to seed the history.
                </div>
              )}
              {runs.map((run, index) => {
                const selected = run._id === selectedRun?._id;
                const tone = getRunTone(run);
                const delta = forecastDelta(run);
                return (
                  <button
                    key={run._id}
                    className={`gold-runcard ${selected ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedRunId(run._id);
                      navigate(`/gold-prediction/${run._id}`);
                    }}
                  >
                    <div className="gold-runcard__top">
                      <strong>{getRunLabel(run)}</strong>
                      <span className={`tone ${tone}`}>{run.status}</span>
                    </div>
                    <p>{formatDateTime(run.executedAt)}</p>
                    <div className="gold-runcard__metrics">
                      <div>
                        <span>24K</span>
                        <strong>{formatNumber(run.currentDay.perGram.k24)}</strong>
                      </div>
                      <div>
                        <span>2-day delta</span>
                        <strong>{formatNumber(run.forecast?.[1]?.forecastPerGram24k ?? run.forecast?.[0]?.forecastPerGram24k ?? 0)}</strong>
                        <small>{delta >= 0 ? '+' : ''}{formatNumber(delta, 2)}%</small>
                      </div>
                    </div>
                    <div className="gold-runcard__footer">
                      <span>{run.ai?.enabled ? `AI ${Math.round((run.ai.confidence ?? 0) * 100)}%` : 'No AI'}</span>
                      <span>#{runs.length - index}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="gold-main">
            {!selectedRun ? (
              <div className="gold-empty gold-main__empty">
                <h3>No forecast selected</h3>
                <p>Pick a saved run from the sidebar or run a fresh snapshot.</p>
              </div>
            ) : (
              <>
                <div className="gold-summary">
                  <div className="gold-summary__title">
                    <div>
                      <p className="eyebrow">Selected snapshot</p>
                      <h2>{formatDateTime(selectedRun.executedAt)}</h2>
                    </div>
                    <div className="chip-row">
                      <span className="chip">Current {selectedRun.currentDay.currency}</span>
                      <span className="chip">Retail premium {selectedRun.currentDay.retailPremiumFactor}x</span>
                      <span className="chip">{selectedRun.ai?.enabled ? 'AI on' : 'AI off'}</span>
                    </div>
                  </div>

                  <div className="gold-summary__stats">
                    <article>
                      <span>24K / gm</span>
                      <strong>{formatNumber(currentK24)}</strong>
                      <small>Base retail anchor</small>
                    </article>
                    <article>
                      <span>22K / gm</span>
                      <strong>{formatNumber(currentK22)}</strong>
                      <small>Purity adjusted</small>
                    </article>
                    <article>
                      <span>18K / gm</span>
                      <strong>{formatNumber(currentK18)}</strong>
                      <small>Purity adjusted</small>
                    </article>
                    <article>
                      <span>AI confidence</span>
                      <strong>{Math.round(normalizedConfidence * 100)}%</strong>
                      <small>{selectedRun.ai?.provider ?? 'baseline'}</small>
                    </article>
                  </div>
                </div>

                <div className="gold-grid">
                  <article className="panel focus">
                    <div className="panel__head">
                      <div>
                        <p className="eyebrow">Forecast curve</p>
                        <h3>Next two days</h3>
                      </div>
                      <span className={`tone ${selectedRun.status === 'failed' ? 'danger' : 'calm'}`}>
                        {selectedRun.status}
                      </span>
                    </div>

                    <div className="forecast-bars">
                      {selectedRun.forecast.map((point) => {
                        const scale = currentK24 ? (point.forecastPerGram24k / currentK24) * 100 : 100;
                        return (
                          <div key={point.date} className="forecast-row">
                            <div className="forecast-row__label">
                              <strong>{formatDate(point.date)}</strong>
                              <span>{point.direction}</span>
                            </div>
                            <div className="forecast-row__bar">
                              <div
                                className="forecast-row__fill"
                                style={{ width: `${clamp(scale, 70, 140)}%` }}
                              />
                            </div>
                            <div className="forecast-row__values">
                              <strong>{formatNumber(point.forecastPerGram24k)}</strong>
                              <span>
                                {formatNumber(point.lowPerGram24k)} - {formatNumber(point.highPerGram24k)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </article>

                  <article className="panel">
                    <div className="panel__head">
                      <div>
                        <p className="eyebrow">AI lens</p>
                        <h3>Baseline vs adjusted</h3>
                      </div>
                      <span className="tone ai">{selectedRun.ai?.enabled ? 'Active' : 'Fallback'}</span>
                    </div>
                    {selectedRun.ai?.enabled && selectedRun.ai.baselinePerGram24k && selectedRun.ai.adjustedPerGram24k ? (
                      <div className="ai-comparison">
                        {selectedRun.forecast.map((point, index) => {
                          const baseline = selectedRun.ai?.baselinePerGram24k?.[index] ?? point.forecastPerGram24k;
                          const adjusted = selectedRun.ai?.adjustedPerGram24k?.[index] ?? point.forecastPerGram24k;
                          return (
                            <div key={point.date} className="ai-comparison__row">
                              <div>
                                <strong>{formatDate(point.date)}</strong>
                                <span>Confidence-weighted blend</span>
                              </div>
                              <div className="ai-comparison__bars">
                                <div className="ai-comparison__bar ai-comparison__bar--base" style={{ width: `${clamp((baseline / currentK24) * 100, 70, 140)}%` }} />
                                <div className="ai-comparison__bar ai-comparison__bar--ai" style={{ width: `${clamp((adjusted / currentK24) * 100, 70, 140)}%` }} />
                              </div>
                            </div>
                          );
                        })}
                        <p className="panel__note">{selectedRun.ai.notes}</p>
                      </div>
                    ) : (
                      <div className="gold-empty compact">
                        This run used the statistical baseline only.
                      </div>
                    )}
                  </article>

                  <article className="panel">
                    <div className="panel__head">
                      <div>
                        <p className="eyebrow">Signals</p>
                        <h3>Model basis</h3>
                      </div>
                    </div>
                    <div className="signal-grid">
                      <div>
                        <span>Trend</span>
                        <strong>{formatNumber(selectedRun.basis.trendScore, 6)}</strong>
                        <small>{trendTone}</small>
                      </div>
                      <div>
                        <span>Momentum</span>
                        <strong>{formatNumber(selectedRun.basis.momentumScore, 6)}</strong>
                        <small>{momentumTone}</small>
                      </div>
                      <div>
                        <span>Volatility</span>
                        <strong>{formatNumber(selectedRun.basis.volatilityScore, 6)}</strong>
                        <small>Short-horizon band</small>
                      </div>
                      <div>
                        <span>Dependencies</span>
                        <strong>{formatNumber(selectedRun.basis.dependencyScore, 6)}</strong>
                        <small>Silver, BTC, reserves</small>
                      </div>
                    </div>
                  </article>

                  <article className="panel">
                    <div className="panel__head">
                      <div>
                        <p className="eyebrow">Context</p>
                        <h3>Today&apos;s snapshot</h3>
                      </div>
                    </div>
                    <div className="context-grid">
                      <div>
                        <span>Spot USD/oz</span>
                        <strong>{formatNumber(selectedRun.context.spotUsdOz)}</strong>
                      </div>
                      <div>
                        <span>Gold / Silver</span>
                        <strong>{formatNumber(selectedRun.context.goldSilverRatio ?? 0, 2)}</strong>
                      </div>
                      <div>
                        <span>BTC USD</span>
                        <strong>{formatNumber(selectedRun.context.btcUsd ?? 0)}</strong>
                      </div>
                      <div>
                        <span>Market cap</span>
                        <strong>{formatNumber(selectedRun.context.goldMarketCapUsd ?? 0)}</strong>
                      </div>
                    </div>
                  </article>

                  <article className="panel wide">
                    <div className="panel__head">
                      <div>
                        <p className="eyebrow">Narrative</p>
                        <h3>What the model is saying</h3>
                      </div>
                    </div>
                    <p className="narrative">{selectedRun.narrative}</p>
                    <div className="warning-list">
                      {selectedRun.warnings.map((warning) => (
                        <div key={warning} className="warning-item">
                          {warning}
                        </div>
                      ))}
                    </div>
                  </article>
                </div>
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
