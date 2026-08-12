'use client';
import LandingFlexible, { type LandingPreset } from './LandingFlexible';
export default function LandingNegocio({ business }: { business: any; products?: any[] }) {
  const preset: LandingPreset = business?.config?.builderPreset === 'lienzo' ? 'lienzo' : 'impulso';
  return <LandingFlexible business={business} preset={preset} />;
}
