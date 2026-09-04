import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { diseaseService } from '../core/api/diseaseService';
import { VaccinationKpiStrip } from '../components/vaccination/VaccinationKpiStrip';
import { PathogenCoverageGrid } from '../components/vaccination/PathogenCoverageGrid';
import { PriorityDeficitRankingCard } from '../components/vaccination/PriorityDeficitRankingCard';
import { ZoneVaccinationGapTable } from '../components/vaccination/ZoneVaccinationGapTable';
import { Syringe, RefreshCw, Info } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface VaccinationIntelligencePageProps {
  onNavigateToOutbreak?: (outbreakId: string) => void;
}

export const VaccinationIntelligencePage: React.FC<VaccinationIntelligencePageProps> = ({
  onNavigateToOutbreak,
}) => {
  const {
    data: vaccinationData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['vaccinationAnalytics'],
    queryFn: diseaseService.getVaccinationAnalytics,
    refetchInterval: 30000,
  });

  return (
    <div className="space-y-4 select-none pb-12">
      {/* Institutional Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-[6px] border border-[#E1E6EC] shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <Syringe className="w-5 h-5 text-[#1E5C97]" />
            <h1 className="text-base font-bold text-[#101826] tracking-tight">
              Livestock Vaccination Intelligence & Regional Immunity Surveillance
            </h1>
          </div>
          <p className="text-xs text-[#526074] mt-0.5 font-mono">
            Statewide animal immunization coverage, pathogen protection deficits, and outbreak cluster vulnerability mapping.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="font-mono text-xs text-[#526074]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>{isRefetching ? 'Polling Records...' : 'Refresh Telemetry'}</span>
          </Button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <VaccinationKpiStrip data={vaccinationData} isLoading={isLoading} />

      {/* Pathogen Specific Coverage Grid */}
      <PathogenCoverageGrid pathogens={vaccinationData?.pathogenCoverage || []} />

      {/* Priority Deficit Ranking */}
      <PriorityDeficitRankingCard
        priorityZones={vaccinationData?.priorityDeficitZones || []}
        onSelectOutbreak={onNavigateToOutbreak}
      />

      {/* Detailed Spatial Zone Breakdown Table */}
      <ZoneVaccinationGapTable
        zones={vaccinationData?.zoneVaccinationGaps || []}
        onSelectOutbreak={onNavigateToOutbreak}
      />

      {/* Methodological Context & Epidemiological Notice */}
      <div className="p-3.5 bg-[#F8FAFC] border border-[#BED2E8] rounded-[6px] text-xs font-mono text-[#526074] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#1E5C97] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-[#101826]">Epidemiological Methodological Note:</strong> Vaccination coverage reflects verified, non-expired clinical health records stored in the PASHU SATHI animal passport registry. Outbreak Risk is a spatial-temporal multi-signal index computed by the MultiSignalRiskEngine ($40\%$ cluster velocity, $20\%$ vector climate, $20\%$ endemic history, $20\%$ herd gap). Regional immunity deficit indicates vulnerability to pathogen propagation but does not alone predict localized clinical transmission without active field vector presence.
        </div>
      </div>
    </div>
  );
};
