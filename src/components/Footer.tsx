import React from 'react';
import { BrandLogo } from './BrandLogo';
import { ShieldCheck, Heart, MapPin } from 'lucide-react';

interface FooterProps {
  onOpenPrivacyModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacyModal }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand info */}
          <div className="md:col-span-5 space-y-4">
            <BrandLogo size="md" showTagline={true} />
            <p className="text-slate-400 text-xs max-w-sm leading-relaxed mt-2">
              Plataforma tecnológica de conexión directa con transportistas de mudanza y fletes de carga en el Caribe colombiano. 
              Algoritmo de cotización transparente, seguridad jurídica y georreferenciación en ruta.
            </p>
            <div className="text-[11px] text-slate-400">
              Proyecto: <strong className="text-slate-200">Caribe Express MVP</strong>  · Versión: <strong className="text-orange-400">1.0</strong>
            </div>
          </div>

          {/* Coverage cities */}
          <div className="md:col-span-4 space-y-2">
            <span className="font-bold text-white text-xs block">Cobertura Regional Caribe</span>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400">
              <span>· Barranquilla (Atlántico)</span>
              <span>· Cartagena (Bolívar)</span>
              <span>· Santa Marta (Magdalena)</span>
              <span>· Valledupar (Cesar)</span>
              <span>· Montería (Córdoba)</span>
              <span>· Sincelejo (Sucre)</span>
              <span>· Riohacha (La Guajira)</span>
              <span>· Soledad y Ciénaga</span>
            </div>
          </div>

          {/* Legal and compliance */}
          <div className="md:col-span-3 space-y-2">
            <span className="font-bold text-white text-xs block">Seguridad y Marco Legal</span>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button
                  onClick={onOpenPrivacyModal}
                  className="hover:text-white transition-colors text-left flex items-center gap-1 text-orange-400 font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Política de Datos (Ley 1581)
                </button>
              </li>
              <li>Términos y Condiciones de Transporte</li>
              <li>Protocolo de Validación SOAT y RTM</li>
              <li>Pólizas de Responsabilidad Civil</li>
              <li>Atención a Disputas y Arbitraje</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            © 2026 Caribe Express. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-4">
            <span>Cartagena, Colombia</span>
            <span>·</span>
            <span>Seguridad SSL 256-bit</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
