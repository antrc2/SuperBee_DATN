import PageMeta from "@components/Admin/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "@components/Admin/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
