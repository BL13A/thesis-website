import { InspectionsPage } from '@/pages/InspectionsPage';

/** QA Manager queue for Manual Review and dimension-blocked cases. */
export function ManualReviewPage() {
  return (
    <InspectionsPage
      defaultDecisionFilter="Manual Review"
      reviewQueueOnly
      title="Manual Review Queue"
      description="Review AI-generated inspection results that require quality assurance validation before inventory release."
    />
  );
}
