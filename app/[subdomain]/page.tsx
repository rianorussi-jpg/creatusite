import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabaseServer';
import LandingNegocio from '@/components/templates/LandingNegocio';
import LandingProfesionista from '@/components/templates/LandingProfesionista';
import TiendaModerno from '@/components/templates/TiendaModerno';
import TiendaDirecto from '@/components/templates/TiendaDirecto';

const TEMPLATES: Record<string, any> = {
  'landing-negocio': LandingNegocio,
  'landing-profesionista': LandingProfesionista,
  'tienda-moderno': TiendaModerno,
  'tienda-directo': TiendaDirecto
};

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

  const Template = TEMPLATES[business.template_id] || LandingNegocio;

  return <Template business={business} products={products || []} />;
}
