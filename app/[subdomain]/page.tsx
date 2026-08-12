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

type DominioBase = 'creatusitio.mx' | 'enla.mx';

function dominioSeguro(valor?: string): DominioBase {
  return valor === 'enla.mx' ? 'enla.mx' : 'creatusitio.mx';
}

export default async function PaginaNegocio({
  params,
  searchParams
}: {
  params: { subdomain: string };
  searchParams?: { __dominio?: string };
}) {
  const supabase = supabaseServer();
  const dominioBase = dominioSeguro(searchParams?.__dominio);

  let { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('subdominio', params.subdomain)
    .eq('dominio_base', dominioBase)
    .eq('estado', 'activo')
    .maybeSingle();

  // Compatibilidad temporal con registros viejos antes de ejecutar/backfillear la migración.
  if (!business && dominioBase === 'creatusitio.mx') {
    const legacy = await supabase
      .from('businesses')
      .select('*')
      .eq('subdominio', params.subdomain)
      .is('dominio_base', null)
      .eq('estado', 'activo')
      .maybeSingle();

    business = legacy.data;
  }

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
