import AuthGuard from '../components/AuthGuard';

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
