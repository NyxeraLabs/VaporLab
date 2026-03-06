'use client';

import { useState } from 'react';
import { applyCoupon, fetchAIConfig, fetchKBSearch, runBillingExport, runEmbed } from '../../../lib/api';

export default function WorkspaceBacklogPage() {
  const [couponCode, setCouponCode] = useState('SPRINT');
  const [couponAmount, setCouponAmount] = useState('100');
  const [billingFormat, setBillingFormat] = useState('json');
  const [billingResult, setBillingResult] = useState('No billing action executed.');
  const [kbQuery, setKbQuery] = useState('roadmap');
  const [embedText, setEmbedText] = useState('quarterly roadmap summary entry');
  const [aiResult, setAiResult] = useState('No content indexing action executed.');

  async function runBillingActions() {
    const amount = Number.parseInt(couponAmount, 10);
    if (Number.isNaN(amount)) {
      setBillingResult('Enter numeric amount');
      return;
    }
    const couponRes = await applyCoupon(couponCode, amount);
    const exportRes = await runBillingExport(billingFormat);
    setBillingResult(`coupon=${couponRes.status} export=${exportRes.status}`);
  }

  async function runIndexingActions() {
    const [searchRes, embedRes, cfgRes] = await Promise.all([
      fetchKBSearch(kbQuery),
      runEmbed(embedText),
      fetchAIConfig(),
    ]);
    setAiResult(
      `search=${searchRes.status} results=${searchRes.data?.matches.length ?? 0} embed=${embedRes.status} config=${cfgRes.status}`,
    );
  }

  return (
    <main className="grid gap-4 xl:grid-cols-2">
      <article className="surface-card p-4">
        <h2 className="heading-font text-lg">Billing Queue Actions</h2>
        <div className="mt-3 grid gap-2">
          <input className="field" value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="Discount code" />
          <input className="field" value={couponAmount} onChange={(event) => setCouponAmount(event.target.value)} placeholder="Amount" />
          <input className="field" value={billingFormat} onChange={(event) => setBillingFormat(event.target.value)} placeholder="Export format" />
          <button className="btn btn-primary" onClick={() => void runBillingActions()}>Run Billing Queue</button>
        </div>
        <p className="mt-3 rounded-12 border border-subtle bg-[var(--surface-soft)] p-2 text-xs break-all">{billingResult}</p>
      </article>

      <article className="surface-card p-4">
        <h2 className="heading-font text-lg">Knowledge Index Queue</h2>
        <div className="mt-3 grid gap-2">
          <input className="field" value={kbQuery} onChange={(event) => setKbQuery(event.target.value)} placeholder="Search query" />
          <input className="field" value={embedText} onChange={(event) => setEmbedText(event.target.value)} placeholder="Document chunk" />
          <button className="btn btn-secondary" onClick={() => void runIndexingActions()}>Run Indexing Job</button>
        </div>
        <p className="mt-3 rounded-12 border border-subtle bg-[var(--surface-soft)] p-2 text-xs break-all">{aiResult}</p>
      </article>
    </main>
  );
}
