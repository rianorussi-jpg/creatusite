'use client';
import LandingFlexible from './LandingFlexible';
export default function LandingNegocio({ business }: { business: any; products?: any[] }) {
  return <LandingFlexible business={business} preset="impulso" />;
}
