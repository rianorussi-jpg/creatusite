'use client';
import LandingFlexible from './LandingFlexible';
export default function LandingProfesionista({ business }: { business: any; products?: any[] }) {
  return <LandingFlexible business={business} preset="esencia" />;
}
