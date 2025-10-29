import { Layout } from "../../presentation/components/layout/Layout";
import { LoginPage } from "../../presentation/components/pages/LoginPage";

export default function Login() {
  return (
    <Layout showHeader={false} showFooter={false}>
      <LoginPage />
    </Layout>
  );
}