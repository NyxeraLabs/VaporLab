import Footer from '../components/common/Footer';

export default function SaaSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-saas app-shell">
      <div className="mx-auto flex min-h-screen max-w-wide flex-col px-4 py-5 sm:px-6">
        <div className="flex-1">{children}</div>
        <Footer variant="saas" />
      </div>
    </div>
  );
}
