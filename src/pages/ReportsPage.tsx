import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { ReportCard } from '@/components/ReportCard';
import { getReportsTitleForRole } from '@/config/roleNavigation';
import { useAuth } from '@/hooks/useAuth';
import {
  downloadReportCsv,
  generateReport,
  getReportsForRole,
} from '@/services/reportService';

export function ReportsPage() {
  const { user } = useAuth();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!user) return null;

  const reports = getReportsForRole(user.role);

  const handleGenerate = async (reportId: string) => {
    setLoadingId(reportId);
    setMessage(null);
    try {
      const result = await generateReport(reportId);
      downloadReportCsv(reportId, result.rows);
      setMessage(`Generated ${reportId} report (${result.rows.length} rows) as CSV.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Report generation failed.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title={getReportsTitleForRole(user.role)}
        description="Export management reports for monitoring, review, and decision support. Recognition and inspection data originate from the mobile warehouse application."
      />

      {message ? <p className="mb-4 text-sm text-muted-foreground">{message}</p> : null}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report, index) => (
          <div key={report.id} className="relative">
            <ReportCard report={report} index={index} />
            <div className="mt-3 flex gap-2 px-1">
              <button
                type="button"
                className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                disabled={loadingId === report.id}
                onClick={() => void handleGenerate(report.id)}
              >
                {loadingId === report.id ? 'Generating...' : 'Export CSV'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {reports.length === 0 ? (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          No reports are assigned to your role.
        </div>
      ) : null}
    </div>
  );
}
