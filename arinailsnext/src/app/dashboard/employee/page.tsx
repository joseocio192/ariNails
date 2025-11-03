import { Layout } from '@/presentation/components/layout/Layout';
import { DashboardPage } from '@/presentation/components/pages/DashboardPage';

export default function EmployeeDashboard() {
  return (
    <Layout showHeader={false} showFooter={false}>
      <DashboardPage />
    </Layout>
  );
}
