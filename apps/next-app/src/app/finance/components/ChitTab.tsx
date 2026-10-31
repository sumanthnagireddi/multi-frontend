"use client";

import React, { useEffect, useState } from 'react';
import {
  Chit,
  ChitAnalysis,
  ChitDashboard,
  financeService,
} from '../services';

interface ChitTabProps {
  triggerToast: (message: string, type?: 'success' | 'error') => void;
}

const inr = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const calendarMonth = (startMonth: string, month: number) => {
  if (!startMonth || !/^\d{4}-\d{2}$/.test(startMonth)) return `Month ${month}`;
  const [year, monthNumber] = startMonth.split('-').map(Number);
  const date = new Date(year, monthNumber - 1 + month - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

export default function ChitTab({ triggerToast }: ChitTabProps) {
  const [dashboard, setDashboard] = useState<ChitDashboard | null>(null);
  const [selectedId, setSelectedId] = useState('');
  const [analysis, setAnalysis] = useState<ChitAnalysis | null>(null);
  const [monthScenarios, setMonthScenarios] = useState<ChitAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [targetReturn, setTargetReturn] = useState('12');
  const [withdrawalMonth, setWithdrawalMonth] = useState('1');
  const [bid, setBid] = useState('');
  const [form, setForm] = useState({
    name: '',
    chitValue: '500000',
    duration: '20',
    members: '20',
    monthlyInstallment: '25000',
    commissionType: 'PERCENT' as 'PERCENT' | 'FIXED',
    commissionValue: '5',
    currentMonth: '1',
    startMonth: new Date().toISOString().slice(0, 7),
  });
  const [editForm, setEditForm] = useState({
    name: '',
    chitValue: '',
    duration: '',
    members: '',
    monthlyInstallment: '',
    commissionType: 'PERCENT' as 'PERCENT' | 'FIXED',
    commissionValue: '',
    currentMonth: '',
    startMonth: '',
  });

  const selected = dashboard?.chits.find((chit) => chit.id === selectedId) ??
    dashboard?.chits[0];
  const auctionKey = selected?.auctions
    .map((auction) => `${auction.month}:${auction.winningBid}:${auction.verified === true}`)
    .join('|') ?? '';

  const buildFallbackMonthScenarios = (chit: Chit): ChitAnalysis[] => {
    const commission = chit.commissionType === 'PERCENT'
      ? (chit.chitValue * chit.commissionValue) / 100
      : chit.commissionValue;
    const finalBid = Math.max(1, chit.chitValue - commission);
    const auctionMap = new Map(
      chit.auctions.map((auction) => [auction.month, auction.winningBid]),
    );
    const startBid = Math.round(chit.chitValue * 0.76);

    const bids = Array.from({ length: chit.duration }, (_, index) => {
      const month = index + 1;
      if (month === chit.duration) return finalBid;
      return auctionMap.get(month) ??
        Math.round(startBid + (finalBid - startBid) * (index / Math.max(1, chit.duration - 1)));
    });

    const monthlySchedule = bids.map((winningBid, index) => {
      const month = index + 1;
      const discount = Math.max(0, chit.chitValue - winningBid);
      const dividendPerMember = Math.max(0, discount - commission) / chit.members;
      const firstOrLast = month === 1 || month === chit.duration;
      const previousDividend = index > 0
        ? Math.max(0, chit.chitValue - bids[index - 1] - commission) / chit.members
        : 0;

      return {
        month,
        winningBid,
        discount,
        commission,
        dividendPerMember,
        installmentPaid: chit.firstAndLastFixed && firstOrLast
          ? chit.monthlyInstallment
          : Math.max(0, chit.monthlyInstallment - previousDividend),
        terminalDividend: chit.terminalDividendMonths.includes(month)
          ? dividendPerMember
          : 0,
        isActual: auctionMap.has(month),
        amountPaid: 0,
        totalAmountPaid: 0,
      };
    });

    let cumulativeAmountPaid = 0;
    monthlySchedule.forEach((row) => {
      const savedPayment = chit.payments?.find((payment) => payment.month === row.month);
      row.amountPaid = savedPayment?.amountPaid ?? row.installmentPaid;
      cumulativeAmountPaid += row.amountPaid;
      row.totalAmountPaid = cumulativeAmountPaid;
    });

    const totalInstallments = monthlySchedule.reduce((sum, row) => sum + row.installmentPaid, 0);
    const terminalDividends = monthlySchedule.reduce((sum, row) => sum + row.terminalDividend, 0);
    const lifeCost = totalInstallments - terminalDividends;

    return monthlySchedule.map((row) => ({
      withdrawalMonth: row.month,
      winningBid: row.winningBid,
      totalInstallments,
      terminalDividends,
      netCashCost: lifeCost,
      payout: row.winningBid,
      nominalNetGain: row.winningBid - lifeCost,
      nominalReturnPercent: lifeCost > 0
        ? ((row.winningBid - lifeCost) / lifeCost) * 100
        : 0,
      npvAtTargetReturn: 0,
      targetAnnualReturn: Number(targetReturn),
      maximumDiscountBidForTargetReturn: 0,
      minimumWinningPayoutForTargetReturn: 0,
      monthlySchedule,
      assumptions: [],
    }));
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await financeService.getChitDashboard();
      setDashboard(data);
      if (!selectedId && data.chits[0]) setSelectedId(data.chits[0].id);
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : 'Unable to load chits', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (!selected) return;
    setMonthScenarios(buildFallbackMonthScenarios(selected));
    const month = Math.min(selected.currentMonth, selected.duration);
    setWithdrawalMonth(String(month));
    const defaultBid =
      selected.auctions.find((auction) => auction.month === month)?.winningBid ??
      selected.auctions[selected.auctions.length - 1]?.winningBid ??
      Math.round(selected.chitValue * 0.76);
    setBid(String(defaultBid));
  }, [selectedId, selected?.id, auctionKey, selected?.currentMonth]);

  const simulate = async (chit = selected, month = Number(withdrawalMonth), payout = Number(bid)) => {
    if (!chit || !month || !payout) return;
    try {
      const result = await financeService.simulateChit(
        chit.id,
        month,
        payout,
        Number(targetReturn),
      );
      const commission = chit.commissionType === 'PERCENT'
        ? (chit.chitValue * chit.commissionValue) / 100
        : chit.commissionValue;
      const fallbackResult = buildFallbackMonthScenarios(chit)[0];
      const fallbackByMonth = new Map(
        fallbackResult.monthlySchedule.map((row) => [row.month, row]),
      );
      const normalizedSchedule = Array.from({ length: chit.duration }, (_, index) => {
        const scheduleMonth = index + 1;
        const apiRow = result.monthlySchedule.find((row) => row.month === scheduleMonth);
        const fallbackRow = fallbackByMonth.get(scheduleMonth);
        if (!apiRow) return fallbackRow;
        return {
          ...fallbackRow,
          ...apiRow,
          winningBid: scheduleMonth === chit.duration
            ? Math.max(1, chit.chitValue - commission)
            : apiRow.winningBid || fallbackRow?.winningBid || 0,
        };
      }).filter((row): row is NonNullable<typeof row> => Boolean(row));
      const normalizedResult = {
        ...result,
        monthlySchedule: normalizedSchedule,
      };
      setAnalysis(normalizedResult);
      const lifeInstallments = normalizedSchedule.reduce(
        (sum, row) => sum + row.installmentPaid,
        0,
      );
      const terminalDividends = normalizedSchedule.reduce(
        (sum, row) => sum + row.terminalDividend,
        0,
      );
      const lifeCost = lifeInstallments - terminalDividends;
      const fallbackScenarios = normalizedSchedule.map((row) => ({
        ...normalizedResult,
        withdrawalMonth: row.month,
        winningBid: row.winningBid,
        nominalNetGain: row.winningBid - lifeCost,
        nominalReturnPercent: lifeCost > 0
          ? ((row.winningBid - lifeCost) / lifeCost) * 100
          : 0,
        monthlySchedule: normalizedSchedule,
      }));
      setMonthScenarios(fallbackScenarios);
      const projectedBids = new Map(
        normalizedSchedule.map((row) => [row.month, row.winningBid]),
      );
      const scenarios = await Promise.all(
        Array.from({ length: chit.duration }, (_, index) => index + 1).map(
          (scenarioMonth) =>
            financeService.simulateChit(
              chit.id,
              scenarioMonth,
              projectedBids.get(scenarioMonth) ?? Number(bid),
              Number(targetReturn),
            ).catch(() => null),
        ),
      );
      const loadedScenarios = scenarios.filter(
        (scenario): scenario is ChitAnalysis => scenario !== null,
      );
      if (loadedScenarios.length) {
        const scenarioByMonth = new Map(
          loadedScenarios.map((scenario) => [scenario.withdrawalMonth, scenario]),
        );
        setMonthScenarios(
          fallbackScenarios.map((fallback) =>
            scenarioByMonth.get(fallback.withdrawalMonth) ?? fallback,
          ),
        );
      } else {
        setMonthScenarios(fallbackScenarios);
      }
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : 'Unable to calculate', 'error');
      if (chit) {
        const fallbackChit = chit;
        const commission = fallbackChit.commissionType === 'PERCENT'
          ? (fallbackChit.chitValue * fallbackChit.commissionValue) / 100
          : fallbackChit.commissionValue;
        const finalBid = Math.max(1, fallbackChit.chitValue - commission);
        const auctionMap = new Map(
          fallbackChit.auctions.map((auction) => [auction.month, auction.winningBid]),
        );
        const bids = Array.from({ length: fallbackChit.duration }, (_, index) => {
          const month = index + 1;
          return month === fallbackChit.duration
            ? finalBid
            : auctionMap.get(month) ?? Math.round(
                fallbackChit.chitValue * 0.76 +
                (fallbackChit.chitValue * 0.20 * index) / Math.max(1, fallbackChit.duration - 1),
              );
        });
        const monthlySchedule = bids.map((winningBid, index) => {
          const month = index + 1;
          const discount = Math.max(0, fallbackChit.chitValue - winningBid);
          const distributableDiscount = Math.max(0, discount - commission);
          const dividendPerMember = distributableDiscount / fallbackChit.members;
          const firstOrLast = month === 1 || month === fallbackChit.duration;
          const previousDividend = index > 0
            ? monthlyScheduleDividend(index - 1)
            : 0;
          return {
            month,
            winningBid,
            discount,
            commission,
            dividendPerMember,
            installmentPaid: fallbackChit.firstAndLastFixed && firstOrLast
              ? fallbackChit.monthlyInstallment
              : Math.max(0, fallbackChit.monthlyInstallment - previousDividend),
            terminalDividend: fallbackChit.terminalDividendMonths.includes(month)
              ? dividendPerMember
              : 0,
            isActual: auctionMap.has(month),
            amountPaid: 0,
            totalAmountPaid: 0,
          };

          function monthlyScheduleDividend(scheduleIndex: number) {
            const priorRow = bids[scheduleIndex] ?? 0;
            const priorDiscount = Math.max(0, fallbackChit.chitValue - priorRow);
            return Math.max(0, priorDiscount - commission) / fallbackChit.members;
          }
        });
        let fallbackCumulativePaid = 0;
        monthlySchedule.forEach((row) => {
          const savedPayment = fallbackChit.payments?.find((payment) => payment.month === row.month);
          row.amountPaid = savedPayment?.amountPaid ?? row.installmentPaid;
          fallbackCumulativePaid += row.amountPaid;
          row.totalAmountPaid = fallbackCumulativePaid;
        });
        const totalInstallments = monthlySchedule.reduce(
          (sum, row) => sum + row.installmentPaid,
          0,
        );
        const terminalDividends = monthlySchedule.reduce(
          (sum, row) => sum + row.terminalDividend,
          0,
        );
        const lifeCost = totalInstallments - terminalDividends;
        setMonthScenarios(monthlySchedule.map((row) => ({
          withdrawalMonth: row.month,
          winningBid: row.winningBid,
          totalInstallments,
          terminalDividends,
          netCashCost: lifeCost,
          payout: row.winningBid,
          nominalNetGain: row.winningBid - lifeCost,
          nominalReturnPercent: lifeCost > 0
            ? ((row.winningBid - lifeCost) / lifeCost) * 100
            : 0,
          npvAtTargetReturn: 0,
          targetAnnualReturn: Number(targetReturn),
          maximumDiscountBidForTargetReturn: 0,
          minimumWinningPayoutForTargetReturn: 0,
          monthlySchedule,
          assumptions: ['Local fallback calculation'],
        })));
      }
    }
  };

  useEffect(() => {
    if (!selected || !withdrawalMonth || !bid) return;
    const timer = window.setTimeout(() => {
      void simulate(selected, Number(withdrawalMonth), Number(bid));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [selectedId, selected?.id, withdrawalMonth, bid, targetReturn, auctionKey]);

  const createChit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await financeService.createChit({
        name: form.name,
        chitValue: Number(form.chitValue),
        duration: Number(form.duration),
        members: Number(form.members),
        monthlyInstallment: Number(form.monthlyInstallment),
        commissionType: form.commissionType,
        commissionValue: Number(form.commissionValue),
        currentMonth: Number(form.currentMonth),
        startMonth: form.startMonth,
      });
      setShowAdd(false);
      triggerToast('Chit fund created.');
      await refresh();
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : 'Could not create chit', 'error');
    }
  };

  const deleteSelected = async () => {
    if (!selected || !confirm(`Delete ${selected.name}?`)) return;
    try {
      await financeService.deleteChit(selected.id);
      setSelectedId('');
      setAnalysis(null);
      triggerToast('Chit fund deleted.');
      await refresh();
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : 'Could not delete chit', 'error');
    }
  };

  const openEdit = () => {
    if (!selected) return;
    setEditForm({
      name: selected.name,
      chitValue: String(selected.chitValue),
      duration: String(selected.duration),
      members: String(selected.members),
      monthlyInstallment: String(selected.monthlyInstallment),
      commissionType: selected.commissionType,
      commissionValue: String(selected.commissionValue),
      currentMonth: String(selected.currentMonth),
      startMonth: selected.startMonth || new Date().toISOString().slice(0, 7),
    });
    setShowEdit(true);
  };

  const saveChit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    try {
      await financeService.updateChit(selected.id, {
        name: editForm.name,
        chitValue: Number(editForm.chitValue),
        duration: Number(editForm.duration),
        members: Number(editForm.members),
        monthlyInstallment: Number(editForm.monthlyInstallment),
        commissionType: editForm.commissionType,
        commissionValue: Number(editForm.commissionValue),
        currentMonth: Number(editForm.currentMonth),
        startMonth: editForm.startMonth,
      });
      setShowEdit(false);
      triggerToast('Chit fund updated.');
      await refresh();
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : 'Could not update chit', 'error');
    }
  };

  const saveTablePayout = async (month: number, value: string) => {
    if (!selected) return;
    const winningBid = Number(value);
    if (!winningBid || winningBid <= 0 || winningBid >= selected.chitValue) {
      triggerToast('Winning payout must be greater than zero and below chit value.', 'error');
      return;
    }
    try {
      await financeService.addChitAuction(selected.id, month, winningBid);
      triggerToast(`${calendarMonth(selected.startMonth, month)} payout updated.`);
      await refresh();
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : 'Could not update payout', 'error');
    }
  };

  const saveTablePayment = async (month: number, value: string) => {
    if (!selected) return;
    const amountPaid = Number(value);
    if (!Number.isFinite(amountPaid) || amountPaid < 0) {
      triggerToast('Amount paid must be zero or greater.', 'error');
      return;
    }
    try {
      await financeService.setChitMonthlyPayment(selected.id, month, amountPaid);
      triggerToast(`${calendarMonth(selected.startMonth, month)} payment saved.`);
      await refresh();
      await simulate(selected, month, Number(bid));
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : 'Could not save payment', 'error');
    }
  };

  const verifyTableAuction = async (month: number) => {
    if (!selected) return;
    try {
      await financeService.verifyChitAuction(selected.id, month);
      triggerToast(`${calendarMonth(selected.startMonth, month)} auction verified.`);
      await refresh();
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : 'Could not verify auction', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[color:var(--claude-accent)]">Chit funds</p>
          <h2 className="mt-1 text-2xl font-semibold">ChitWise portfolio</h2>
        </div>
        <button onClick={() => setShowAdd(true)} className="rounded-xl bg-[color:var(--claude-accent)] px-4 py-2.5 text-xs font-semibold text-white">
          + Add chit fund
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Total chit value" value={inr(dashboard?.totalChitValue ?? 0)} />
        <Metric label="Installments paid" value={inr(dashboard?.totalPaidToDate ?? 0)} />
        <Metric label="Dividends earned" value={inr(dashboard?.totalDividendsEarnedToDate ?? 0)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dashboard?.chits.map((chit) => (
          <button
            key={chit.id}
            onClick={() => setSelectedId(chit.id)}
            className={`rounded-2xl border p-5 text-left transition ${
              selected?.id === chit.id
                ? 'border-[color:var(--claude-accent)] ring-2 ring-[color:var(--claude-accent)]/10'
                : 'border-[color:var(--claude-border)]'
            } bg-[color:var(--claude-card)]`}
          >
            <div className="flex justify-between gap-3"><b>{chit.name}</b><span className="text-[10px] font-bold text-emerald-600">ACTIVE</span></div>
            <div className="mt-4 text-xl font-semibold">{inr(chit.chitValue)}</div>
            <div className="mt-1 text-[11px] text-[color:var(--claude-ink-sub)]">
              {calendarMonth(chit.startMonth, chit.currentMonth)} · Month {chit.currentMonth}/{chit.duration} · {chit.members} members
            </div>
          </button>
        ))}
        {!dashboard?.chits.length && (
          <div className="md:col-span-3 rounded-2xl border border-dashed border-[color:var(--claude-border)] p-10 text-center text-sm text-[color:var(--claude-ink-sub)]">
            No chit funds yet. Add your first fund to begin.
          </div>
        )}
      </div>

      {selected && (
        <div className="space-y-5">
          <div className="space-y-5">
            <div className="rounded-2xl border border-[color:var(--claude-border)] bg-[color:var(--claude-card)] p-5">
              <div className="flex justify-between gap-3">
                <div><p className="text-[10px] uppercase tracking-wider text-[color:var(--claude-ink-sub)]">{selected.id}</p><h3 className="mt-1 text-lg font-semibold">{selected.name}</h3></div>
                  <div className="flex gap-2">
                    <button onClick={openEdit} className="h-9 rounded-lg border border-[color:var(--claude-border)] px-3 text-xs font-semibold">Edit chit</button>
                    <button onClick={deleteSelected} className="h-9 rounded-lg border border-rose-200 px-3 text-xs font-semibold text-rose-600">Delete</button>
                  </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Metric label="Chit value" value={inr(selected.chitValue)} compact />
                <Metric label="Monthly max" value={inr(selected.monthlyInstallment)} compact />
                <Metric label="Current month" value={`${selected.currentMonth}/${selected.duration}`} compact />
                <Metric label="Auctions" value={String(selected.auctions.length)} compact />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[color:var(--claude-border)] bg-[color:var(--claude-card)]">
              <div className="border-b border-[color:var(--claude-border)] p-4">
                <h3 className="text-sm font-semibold">Monthly profit zone</h3>
                <p className="mt-1 text-[10px] text-[color:var(--claude-ink-sub)]">
                  Automatically calculated for all {selected.duration} months using projected or recorded auction payouts.
                </p>
                <p className="mt-2 text-[10px] text-[color:var(--claude-ink-sub)]">
                  Profit/loss = winning payout − (all-life installments − terminal dividends). Enter the actual amount paid each month; Total paid adds every month's amount one by one.
                </p>
                <p className="mt-1 text-[10px] text-[color:var(--claude-ink-sub)]">
                  Max discount = chit value − minimum winning payout needed to meet the target return.
                </p>
              </div>
              <div className="block overflow-x-auto">
                <table className="w-full min-w-[980px] table-fixed text-left text-xs">
                  <thead className="bg-[color:var(--claude-bg-strong)] text-[color:var(--claude-ink-sub)]">
                    <tr>
                      <th className="w-[12%] px-3 py-3">Month</th>
                      <th className="w-[13%] px-3 py-3">Winning payout</th>
                      <th className="w-[12%] px-3 py-3">Amount paid this month</th>
                      <th className="w-[11%] px-3 py-3">Total paid</th>
                      <th className="w-[12%] px-3 py-3">Profit / loss</th>
                      <th className="w-[8%] px-3 py-3">Return</th>
                      <th className="w-[14%] px-3 py-3" title="Chit value minus the minimum winning payout needed for the target return">Max discount</th>
                      <th className="w-[10%] px-3 py-3">Zone</th>
                      <th className="w-[8%] px-3 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthScenarios.map((scenario) => (
                      <tr key={scenario.withdrawalMonth} className="border-t border-[color:var(--claude-border)] transition-colors hover:bg-[color:var(--claude-bg-strong)]/40">
                        <td className="px-3 py-3 font-semibold whitespace-nowrap">
                          <div>{calendarMonth(selected.startMonth, scenario.withdrawalMonth)}</div>
                        </td>
                        <td className="px-3 py-3">
                          <input
                            key={`${scenario.withdrawalMonth}:${scenario.winningBid}`}
                            type="number"
                            defaultValue={scenario.winningBid}
                            readOnly={scenario.withdrawalMonth === selected.duration}
                            onBlur={(event) => {
                              if (Number(event.target.value) !== scenario.winningBid) {
                                void saveTablePayout(scenario.withdrawalMonth, event.target.value);
                              }
                            }}
                            aria-label={`Edit payout for ${calendarMonth(selected.startMonth, scenario.withdrawalMonth)}`}
                            title={scenario.withdrawalMonth === selected.duration
                              ? 'Final-month payout is automatically chit value minus commission'
                              : undefined}
                            className={`w-28 rounded-lg border border-[color:var(--claude-border)] bg-transparent px-2 py-1.5 font-semibold ${
                              scenario.withdrawalMonth === selected.duration ? 'cursor-not-allowed opacity-80' : ''
                            }`}
                          />
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          {(() => {
                            const scheduleRow = scenario.monthlySchedule.find(
                              (row) => row.month === scenario.withdrawalMonth,
                            );
                            const savedPayment = selected.payments?.find(
                              (payment) => payment.month === scenario.withdrawalMonth,
                            );
                            return (
                              <input
                                key={`${scenario.withdrawalMonth}:${savedPayment?.amountPaid ?? scheduleRow?.installmentPaid ?? selected.monthlyInstallment}`}
                                type="number"
                                min="0"
                                defaultValue={savedPayment?.amountPaid ?? scheduleRow?.installmentPaid ?? selected.monthlyInstallment}
                                onBlur={(event) => {
                                  const currentValue = savedPayment?.amountPaid ?? scheduleRow?.installmentPaid ?? selected.monthlyInstallment;
                                  if (Number(event.target.value) !== currentValue) {
                                    void saveTablePayment(scenario.withdrawalMonth, event.target.value);
                                  }
                                }}
                                aria-label={`Enter amount paid for ${calendarMonth(selected.startMonth, scenario.withdrawalMonth)}`}
                                className="w-28 rounded-lg border border-[color:var(--claude-border)] bg-transparent px-2 py-1.5 font-semibold"
                              />
                            );
                          })()}
                        </td>
                        <td className="px-3 py-3 font-semibold whitespace-nowrap">
                          {inr((() => {
                            const currentRow = scenario.monthlySchedule.find(
                              (row) => row.month === scenario.withdrawalMonth,
                            );
                            if (Number.isFinite(currentRow?.totalAmountPaid)) {
                              return currentRow?.totalAmountPaid ?? 0;
                            }
                            return scenario.monthlySchedule
                              .filter((row) => row.month <= scenario.withdrawalMonth)
                              .reduce((sum, row) => {
                                const savedPayment = selected.payments?.find(
                                  (payment) => payment.month === row.month,
                                );
                                return sum + (savedPayment?.amountPaid ?? row.amountPaid ?? row.installmentPaid);
                              }, 0);
                          })())}
                        </td>
                        <td className={`px-3 py-3 font-semibold whitespace-nowrap ${scenario.nominalNetGain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {scenario.nominalNetGain >= 0 ? '+' : ''}{inr(scenario.nominalNetGain)}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">{scenario.nominalReturnPercent.toFixed(2)}%</td>
                        <td className="px-3 py-3 font-semibold whitespace-nowrap">{inr(scenario.maximumDiscountBidForTargetReturn)}</td>
                        <td className="px-3 py-3">
                          <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                            scenario.nominalNetGain >= 0
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                          }`}>
                            {scenario.nominalNetGain >= 0 ? 'PROFIT ZONE' : 'LOSS ZONE'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {selected.auctions.find((auction) => auction.month === scenario.withdrawalMonth)?.verified ? (
                            <span className="inline-flex text-emerald-600" title="Verified" aria-label="Verified">
                              <svg viewBox="0 0 20 20" className="h-5 w-5" role="img" style={{ color: '#16a34a' }}>
                                <circle cx="10" cy="10" r="8" fill="currentColor" />
                                <path d="M6.2 10.1l2.35 2.35 5.25-5.25" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                          ) : selected.auctions.find((auction) => auction.month === scenario.withdrawalMonth) ? (
                            <button
                              type="button"
                              onClick={() => void verifyTableAuction(scenario.withdrawalMonth)}
                              className="inline-flex text-slate-400 transition-colors hover:text-emerald-600"
                              title="Mark completed and verified"
                              aria-label="Mark completed and verified"
                            >
                              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-current">
                                <path fillRule="evenodd" d="M10 2.1l2.05 1.25 2.38-.2.62 2.31 1.95 1.36-.86 2.23.86 2.23-1.95 1.36-.62 2.31-2.38-.2L10 17.9l-2.05-1.25-2.38.2-.62-2.31-1.95-1.36.86-2.23-.86-2.23 1.95-1.36.62-2.31 2.38.2L10 2.1zm-1.08 10.7l5.1-5.1-1.06-1.06-4.04 4.04-1.98-1.98-1.06 1.06 3.04 3.04z" clipRule="evenodd" />
                              </svg>
                            </button>
                          ) : (
                            <span className="text-[10px] text-[color:var(--claude-ink-sub)]">Forecast</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!monthScenarios.length && (
                  <div className="p-8 text-center text-xs text-[color:var(--claude-ink-sub)]">Calculating all month scenarios…</div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {showAdd && (
        <Modal title="Add a chit fund" onClose={() => setShowAdd(false)}>
          <form onSubmit={createChit} className="grid gap-3 sm:grid-cols-2">
            <Input label="Chit name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
            <Input label="Chit value" type="number" value={form.chitValue} onChange={(value) => setForm({ ...form, chitValue: value })} />
            <Input label="Duration (months)" type="number" value={form.duration} onChange={(value) => setForm({ ...form, duration: value })} />
            <Input label="Members" type="number" value={form.members} onChange={(value) => setForm({ ...form, members: value })} />
            <Input label="Monthly installment" type="number" value={form.monthlyInstallment} onChange={(value) => setForm({ ...form, monthlyInstallment: value })} />
            <Input label="Current month" type="number" value={form.currentMonth} onChange={(value) => setForm({ ...form, currentMonth: value })} />
            <Input label="Start month (YYYY-MM)" type="month" value={form.startMonth} onChange={(value) => setForm({ ...form, startMonth: value })} />
            <div>
              <label className="text-[10px] font-bold uppercase text-[color:var(--claude-ink-sub)]">Commission type</label>
              <select value={form.commissionType} onChange={(event) => setForm({ ...form, commissionType: event.target.value as 'PERCENT' | 'FIXED' })} className="mt-1 w-full rounded-lg border border-[color:var(--claude-border)] bg-transparent px-3 py-2.5 text-sm">
                <option value="PERCENT">Percentage</option><option value="FIXED">Fixed amount</option>
              </select>
            </div>
            <Input label="Commission value" type="number" value={form.commissionValue} onChange={(value) => setForm({ ...form, commissionValue: value })} />
            <div className="flex justify-end gap-2 pt-3 sm:col-span-2">
              <button type="button" onClick={() => setShowAdd(false)} className="rounded-lg border border-[color:var(--claude-border)] px-4 py-2 text-xs">Cancel</button>
              <button className="rounded-lg bg-[color:var(--claude-accent)] px-4 py-2 text-xs font-semibold text-white">Create chit</button>
            </div>
          </form>
        </Modal>
      )}

      {showEdit && selected && (
        <Modal title={`Edit chit · ${selected.name}`} onClose={() => setShowEdit(false)}>
          <form onSubmit={saveChit} className="grid gap-3 sm:grid-cols-2">
            <Input label="Chit name" value={editForm.name} onChange={(value) => setEditForm({ ...editForm, name: value })} required />
            <Input label="Chit value" type="number" value={editForm.chitValue} onChange={(value) => setEditForm({ ...editForm, chitValue: value })} />
            <Input label="Duration (months)" type="number" value={editForm.duration} onChange={(value) => setEditForm({ ...editForm, duration: value })} />
            <Input label="Members" type="number" value={editForm.members} onChange={(value) => setEditForm({ ...editForm, members: value })} />
            <Input label="Monthly installment" type="number" value={editForm.monthlyInstallment} onChange={(value) => setEditForm({ ...editForm, monthlyInstallment: value })} />
            <Input label="Current month" type="number" value={editForm.currentMonth} onChange={(value) => setEditForm({ ...editForm, currentMonth: value })} />
            <Input label="Start month (YYYY-MM)" type="month" value={editForm.startMonth} onChange={(value) => setEditForm({ ...editForm, startMonth: value })} />
            <Input label="Commission value" type="number" value={editForm.commissionValue} onChange={(value) => setEditForm({ ...editForm, commissionValue: value })} />
            <div>
              <label className="text-[10px] font-bold uppercase text-[color:var(--claude-ink-sub)]">Commission type</label>
              <select value={editForm.commissionType} onChange={(event) => setEditForm({ ...editForm, commissionType: event.target.value as 'PERCENT' | 'FIXED' })} className="mt-1 w-full rounded-lg border border-[color:var(--claude-border)] bg-transparent px-3 py-2.5 text-sm">
                <option value="PERCENT">Percentage</option><option value="FIXED">Fixed amount</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-3 sm:col-span-2">
              <button type="button" onClick={() => setShowEdit(false)} className="rounded-lg border border-[color:var(--claude-border)] px-4 py-2 text-xs">Cancel</button>
              <button className="rounded-lg bg-[color:var(--claude-accent)] px-4 py-2 text-xs font-semibold text-white">Save changes</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Metric({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return <div className={compact ? '' : 'rounded-2xl border border-[color:var(--claude-border)] bg-[color:var(--claude-card)] p-5'}><div className="text-[10px] text-[color:var(--claude-ink-sub)]">{label}</div><div className={`${compact ? 'text-sm' : 'mt-2 text-xl'} font-semibold`}>{value}</div></div>;
}

function Result({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-3"><span className="text-[color:var(--claude-ink-sub)]">{label}</span><b>{value}</b></div>;
}

function Input({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <div><label className="text-[10px] font-bold uppercase text-[color:var(--claude-ink-sub)]">{label}</label><input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-[color:var(--claude-border)] bg-transparent px-3 py-2.5 text-sm" /></div>;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"><div className="w-full max-w-lg rounded-2xl border border-[color:var(--claude-border)] bg-[color:var(--claude-card)] p-5 shadow-2xl"><div className="mb-5 flex justify-between"><h3 className="text-sm font-semibold">{title}</h3><button onClick={onClose} className="text-xl leading-none">×</button></div>{children}</div></div>;
}
