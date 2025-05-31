import AuthLayout from "./AuthPageLayout";
import SignUpForm from "@components/Admin/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
