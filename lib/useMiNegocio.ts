'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseClient';

export function useMiNegocio() {
  const supabase = supabaseBrowser();
  const [negocio, setNegocio] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setCargando(false);
        return;
      }
      const { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', userData.user.id)
        .maybeSingle();
      setNegocio(data);
      setCargando(false);
    })();
  }, []);

  return { negocio, setNegocio, cargando, supabase };
}
