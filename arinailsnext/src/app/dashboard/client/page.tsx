import { Layout } from '@/presentation/components/layout/Layout';
import { ClientDashboardPage } from '@/presentation/components/pages/ClientDashboardPage';

export default function ClientDashboard() {
  return (
    <Layout showHeader={false} showFooter={false}>
      <ClientDashboardPage />
    </Layout>
  );
}
