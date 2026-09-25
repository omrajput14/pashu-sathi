import { AIScreeningResponse } from '../types/disease.types';

export type AiReviewTone = 'pending' | 'escalated' | 'confirmed' | 'rejected';

/** What happened to an AI scan, from its status (not veterinarianVerified, which is also true on rejection). */
export function aiReviewState(
  s: Pick<AIScreeningResponse, 'status' | 'verifiedByVetName' | 'triagedByName' | 'reviewNotes' | 'triageNotes'>,
): { label: string; tone: AiReviewTone; detail?: string } {
  switch (s.status) {
    case 'VERIFIED':
      return { label: 'Confirmed by vet', tone: 'confirmed', detail: s.verifiedByVetName ?? undefined };
    case 'REJECTED':
      return {
        label: 'Rejected',
        tone: 'rejected',
        detail: [s.verifiedByVetName, s.reviewNotes].filter(Boolean).join(': ') || undefined,
      };
    case 'ESCALATED':
      return {
        label: 'Escalated by para-vet',
        tone: 'escalated',
        detail: [s.triagedByName, s.triageNotes].filter(Boolean).join(': ') || undefined,
      };
    default:
      return { label: 'Awaiting field check', tone: 'pending' };
  }
}

export const AI_REVIEW_BADGE: Record<AiReviewTone, string> = {
  pending: 'bg-[#FEF3E8] text-[#D97B1F] border-[#FADCC0]',
  escalated: 'bg-[#E4EDF6] text-[#1E5C97] border-[#C4D6EA]',
  confirmed: 'bg-[#EDF7F0] text-[#1B806A] border-[#C2E7DA]',
  rejected: 'bg-[#FBEBEB] text-[#B7301F] border-[#F5C2C7]',
};
