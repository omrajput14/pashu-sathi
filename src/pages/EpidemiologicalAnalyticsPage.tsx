import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, RefreshCw, AlertTriangle, ChevronLeft } from 'lucide-react';
import { diseaseService } from '../core/api/diseaseService';
import { gisService } from '../core/api/gisService';
import { AnalyticsKpiBar } from '../components/analytics/AnalyticsKpiBar';
import { DiseaseDistributionChart } from '../components/analytics/DiseaseDistributionChart';
import { ConfidenceSourceDistributionChart } from '../components/analytics/ConfidenceSourceDistributionChart';
import { OutbreakResolutionMetricsCard } from '../components/analytics/OutbreakResolutionMetricsCard';
import { RiskSeverityDistributionCard } from '../components/analytics/RiskSeverityDistributionCard';
import { GeographicThreatRanking } from '../components/intelligence/GeographicThreatRanking';
import { Button } from '../components/ui/Button';
import { OutbreakResponse } from '../core/types/outbreak.types';

interface EpidemiologicalAnalyticsPageProps {
  onNavigateToOutbreak?: (outbreakId: string) => void;
  onBackToOverview?: () => void;
}

export const EpidemiologicalAnalyticsPage: React.FC<EpidemiologicalAnalyticsPageProps> = ({
  onNavigateToOutbreak,
  onBackToOverview,
}) => {
  // 1. Fetch Disease Analytics Data
  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    isError: isErrorAnalytics,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ['diseaseAnalytics'],
    queryFn: () => diseaseService.getDiseaseAnalytics(),
    refetchInterval: 60000,
  });

  // 2. Fetch Outbreak Statistics
  const {
    data: stats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['outbreakStats'],
    queryFn: () => diseaseService.getOutbreakStatistics(),
    refetchInterval: 60000,
  });

  // 3. Fetch Active Outbreaks for Threat Ranking & Risk Severity Breakdown
  const {
    data: outbreaks = [],
    isLoading: isLoadingOutbreaks,
    refetch: refetchOutbreaks,
  } = useQuery({
    queryKey: ['activeOutbreaksList'],
    queryFn: () => gisService.getOutbreaks(),
    refetchInterval: 60000,
  });

  const handleRefreshAll = () => {
    refetchAnalytics();
    refetchStats();
    refetchOutbreaks();
  };

  const isAnyLoading = isLoadingAnalytics || isLoadingStats || isLoadingOutbreaks;

  return (
    <div className="space-y-5" data-testid="epidemiological-analytics-page">
      {/* Top Header Command Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#E1E6EC] rounded-[6px] px-4 py-3 shadow-subtle">
        <div className="flex items-center gap-3">
          {onBackToOverview && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onBackToOverview}
              className="font-mono text-xs text-[#526074]"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span>Command Overview</span>
            </Button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#101826] font-mono uppercase tracking-tight">
                Epidemiological Surveillance Analytics
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#E4EDF6] text-[#1E5C97] text-[10px] font-mono font-bold">
                <BarChart3 className="w-3 h-3 text-[#1E5C97]" />
                <span>Statewide Insights</span>
              </span>
            </div>
            <p className="text-xs text-[#526074] mt-0.5 font-mono">
              Disease Prevalence · Diagnostic Pipelines · Containment Duration · Risk Profiles
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefreshAll}
            disabled={isAnyLoading}
            className="p-1.5 text-[#526074] hover:text-[#1E5C97] hover:bg-[#E4EDF6] rounded-[3px] border border-[#E1E6EC] transition-colors disabled:opacity-40"
            title="Refresh Analytics Dataset"
            aria-label="Refresh Analytics Dataset"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnyLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error State */}
      {isErrorAnalytics ? (
        <div className="p-8 bg-white border border-[#F5C2C7] rounded-[6px] text-center text-xs font-mono text-[#6E1423]">
          <AlertTriangle className="w-8 h-8 mx-auto text-[#6E1423] mb-2" />
          <p className="font-bold text-sm">Failed to Load Epidemiological Analytics</p>
          <p className="text-[#526074] mt-1">
            Unable to connect to the disease analytics endpoint.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefreshAll}
            className="mt-3 font-mono"
          >
            Retry Analytics Ingestion
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* High-Level KPI Summary Strip */}
          <AnalyticsKpiBar
            stats={stats}
            analytics={analytics}
            isLoading={isAnyLoading}
          />

          {/* Core Analytics Grid: Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Disease Distribution & Prevalence */}
            <DiseaseDistributionChart
              diseaseDistribution={analytics?.diseaseDistribution}
              mostCommonDiseases={analytics?.mostCommonDiseases}
            />

            {/* Diagnostic Verification Pipeline */}
            <ConfidenceSourceDistributionChart
              confidenceSources={analytics?.reportsByConfidenceSource}
            />
          </div>

          {/* Core Analytics Grid: Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Outbreak Containment Dynamics */}
            <OutbreakResolutionMetricsCard
              analytics={analytics}
              stats={stats}
            />

            {/* Risk Severity Spectrum */}
            <RiskSeverityDistributionCard
              outbreaks={outbreaks}
            />
          </div>

          {/* Spatial Threat Ranking */}
          <GeographicThreatRanking
            outbreaks={outbreaks}
            onSelectOutbreak={(o: OutbreakResponse) => onNavigateToOutbreak?.(o.id)}
          />
        </div>
      )}
    </div>
  );
};
