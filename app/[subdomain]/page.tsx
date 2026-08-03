import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabaseServer';
import Minimalista from '@/components/templates/Minimalista';
import Sencillo from '@/components/templates/Sencillo';

export default async function PaginaNegocio({ params }: { params: { subdomain: string } }) {
  const supabase = supabaseServer();

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('subdominio', params.subdomain)
    .eq('estado', 'activo')
    .maybeSingle();

  if (!business) notFound();

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('business_id', business.id)
    .eq('disponible', true)
    .order('orden', { ascending: true });

  const Template = business.template_id === 'sencillo' ? Sencillo : Minimalista;

  return <Template business={business} products={products || []} />;
}
