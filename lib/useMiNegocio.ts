'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseClient';

const STORAGE_KEY = 'creatusitio_negocio_activo';
const EVENT_NAME = 'creatusitio:negocio-activo';

export function useMiNegocio() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [negocios, setNegocios] = useState<any[]>([]);
  const [negocio, setNegocioState] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  const aplicarNegocioActivo = useCallback((lista: any[], idPreferido?: string | null) => {
    if (!lista.length) {
      setNegocioState(null);
      return;
    }

    const guardado = idPreferido || (typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null);
    const seleccionado = lista.find((item) => item.id === guardado) || lista[0];

    setNegocioState(seleccionado);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, seleccionado.id);
    }
  }, []);

  const recargarNegocios = useCallback(async (idPreferido?: string | null) => {
    setCargando(true);
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setNegocios([]);
      setNegocioState(null);
      setCargando(false);
      return;
    }

    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', userData.user.id);

    const lista = error ? [] : data || [];
    setNegocios(lista);
    aplicarNegocioActivo(lista, idPreferido);
    setCargando(false);
  }, [aplicarNegocioActivo, supabase]);

  useEffect(() => {
    recargarNegocios();
  }, [recargarNegocios]);

  useEffect(() => {
    const manejarCambio = (event: Event) => {
      const customEvent = event as CustomEvent<{ id?: string }>;
      const id = customEvent.detail?.id || window.localStorage.getItem(STORAGE_KEY);
      setNegocioState((actual: any) => negocios.find((item) => item.id === id) || actual);
    };

    const manejarStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const seleccionado = negocios.find((item) => item.id === event.newValue);
      if (seleccionado) setNegocioState(seleccionado);
    };

    window.addEventListener(EVENT_NAME, manejarCambio as EventListener);
    window.addEventListener('storage', manejarStorage);

    return () => {
      window.removeEventListener(EVENT_NAME, manejarCambio as EventListener);
      window.removeEventListener('storage', manejarStorage);
    };
  }, [negocios]);

  const seleccionarNegocio = useCallback((id: string) => {
    const seleccionado = negocios.find((item) => item.id === id);
    if (!seleccionado) return;

    setNegocioState(seleccionado);
    window.localStorage.setItem(STORAGE_KEY, id);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { id } }));
  }, [negocios]);

  const setNegocio = useCallback((actualizado: any) => {
    setNegocioState(actualizado);
    setNegocios((lista) => lista.map((item) => item.id === actualizado?.id ? actualizado : item));
  }, []);

  return {
    negocio,
    negocios,
    setNegocio,
    seleccionarNegocio,
    recargarNegocios,
    cargando,
    supabase
  };
}
