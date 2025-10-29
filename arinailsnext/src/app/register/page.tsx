import { Layout } from "../../presentation/components/layout/Layout";
import { RegisterPage } from "../../presentation/components/pages/RegisterPage";

export default function Register() {
  return (
    <Layout showHeader={false} showFooter={false}>
      <RegisterPage />
    </Layout>
  );
}