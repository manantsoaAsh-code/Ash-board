export function renderPerformanceChart(metrics = {}) {
  const total = metrics.totalCases || 0;
  const resolved = metrics.resolvedCases || 0;
  const ratio = total ? Math.round((resolved / total) * 100) : 0;

  return `
    <section class="rounded-2xl border border-emerald-500/40 bg-slate-900 p-4">
      <p class="text-sm text-slate-300">Taux de résolution</p>
      <p class="text-3xl font-bold text-emerald-300">${ratio}%</p>
    </section>
  `;
}
