import { DiagnosisConfidenceSource } from './disease.types';

export interface DiseaseAnalyticsResponse {
  totalOutbreaks: number;
  activeOutbreaks: number;
  resolvedOutbreaks: number;
  highRiskOutbreaks: number;
  averageResolutionTimeHours: number;
  diseaseDistribution: Record<string, number>;
  mostCommonDiseases: string[];
  reportsByConfidenceSource: Record<DiagnosisConfidenceSource, number>;
}
