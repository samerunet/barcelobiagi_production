import dynamic from 'next/dynamic';

export default function AdminNewProductPage() {
  const AdminProductForm = dynamic(() => import('@/views/admin/AdminProductForm').then(m => m.AdminProductForm), { ssr: false });
  return <AdminProductForm />;
}
