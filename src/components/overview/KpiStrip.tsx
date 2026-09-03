import React from 'react';
import { Flame, CheckCircle2, HelpCircle, AlertOctagon } from 'lucide-react';
import { OutbreakStatisticsResponse } from '../../core/types/outbreak.types';
import { DiseaseAnalyticsResponse } from '../../core/types/analytics.types';

interface KpiStripProps {
  stats?: OutbreakStatisticsResponse;
  analytics?: DiseaseAnalyticsResponse;
  isLoading?: boolean;
}

export const KpiStrip: React.FC<KpiStripProps> = ({ stats, analytics, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 animate-pulse" data-testid="kpi-strip-loading">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-white border border-[#E1E6EC] rounded-[6px] p-3.5" />
        ))}
      </div>
    );
  }

  const hasStats = Boolean(stats);
  const hasAnalytics = Boolean(analytics && analytics.reportsByConfidenceSource);

  const totalActive = hasStats ? stats!.activeOutbreaks : null;
  const highRisk = hasStats ? stats!.highRiskOutbreaks : null;
  const resolved = hasStats ? stats!.resolvedOutbreaks : null;

  // Real data only: Vet + Lab confirmed reports from reportsByConfidenceSource
  const confirmedCount = hasAnalytics
    ? (analytics!.reportsByConfidenceSource.VETERINARIAN ?? 0) +
      (analytics!.reportsByConfidenceSource.LAB_CONFIRMED ?? 0)
    : null;

  // Real data only: AI verified + Government preliminary reports from reportsByConfidenceSource
  const suspectedCount = hasAnalytics
    ? (analytics!.reportsByConfidenceSource.AI_VERIFIED ?? 0) +
      (analytics!.reportsByConfidenceSource.GOVERNMENT ?? 0)
    : null;

  const kpis = [
    {
      title: 'ACTIVE OUTBREAK CLUSTERS',
      value: totalActive !== null ? totalActive : '—',
      subValue: highRisk !== null ? `${highRisk} High/Critical Severity` : 'Data unavailable',
      icon: Flame,
      iconColor: 'text-[#D97B1F]',
      badgeColor: (highRisk ?? 0) > 0 ? 'bg-[#FEF3E8] text-[#D97B1F] border-[#F9D7B5]' : 'bg-[#EDF7F0] text-[#3E7C4A] border-[#BFE4C9]',
      badgeText: (highRisk ?? 0) > 0 ? 'SURVEILLANCE ACTIVE' : 'NORMAL',
    },
    {
      title: 'CONFIRMED DIAGNOSES',
      value: confirmedCount !== null ? confirmedCount : '—',
      subValue: confirmedCount !== null ? 'Verified by Licensed Vets / Lab' : 'Data unavailable',
      icon: CheckCircle2,
      iconColor: 'text-[#B7301F]',
      badgeColor: 'bg-[#FBEBEB] text-[#B7301F] border-[#F5C2C7]',
      badgeText: 'VERIFIED',
    },
    {
      title: 'SUSPECTED / UNVERIFIED',
      value: suspectedCount !== null ? suspectedCount : '—',
      subValue: suspectedCount !== null ? 'Farmer Reports & AI Scans' : 'Data unavailable',
      icon: HelpCircle,
      iconColor: 'text-[#C9A227]',
      badgeColor: 'bg-[#FDF8E7] text-[#C9A227] border-[#F4E5A8]',
      badgeText: 'TRIAGE QUEUE',
    },
    {
      title: 'CRITICAL THREAT PERIMETERS',
      value: highRisk !== null ? highRisk : '—',
      subValue: resolved !== null ? `${resolved} Clusters Contained to Date` : 'Data unavailable',
      icon: AlertOctagon,
      iconColor: 'text-[#6E1423]',
      badgeColor: (highRisk ?? 0) > 0 ? 'bg-[#FBEBEB] text-[#6E1423] border-[#F5C2C7]' : 'bg-[#EDF7F0] text-[#3E7C4A] border-[#BFE4C9]',
      badgeText: (highRisk ?? 0) > 0 ? 'BIO-CONTAINMENT' : 'CLEAR',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5" data-testid="kpi-strip">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div
            key={index}
            className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 flex flex-col justify-between shadow-subtle hover:border-[#C7D0DB] transition-colors"
          >
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-mono uppercase font-semibold text-[#526074] tracking-wider">
                {kpi.title}
              </span>
              <Icon className={`w-4 h-4 ${kpi.iconColor}`} />
            </div>

            <div className="my-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-[#101826] tabular-nums">
                {kpi.value}
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] border font-medium uppercase ${kpi.badgeColor}`}>
                {kpi.badgeText}
              </span>
            </div>

            <div className="text-[11px] text-[#526074] flex items-center justify-between border-t border-[#F1F4F8] pt-1.5">
              <span>{kpi.subValue}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
