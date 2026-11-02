import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = { title: 'Administrador', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default function AdminRaiz({ children }: { children: React.ReactNode }) {
  return <div className="adm">{children}</div>;
}
