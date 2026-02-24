import { operatorTheme } from '../../themes/operator';
import { saasTheme } from '../../themes/saas';

type FooterVariant = 'operator' | 'saas';

type FooterProps = {
  variant: FooterVariant;
};

export default function Footer({ variant }: FooterProps) {
  const themeName = variant === 'operator' ? operatorTheme.name : saasTheme.name;
  return (
    <footer className="footer-base">
      <p className="tracking-[0.02em]">
        VaporLab by Nyxera Labs
      </p>
      <p className="mt-1">
        © 2026 Nyxera Labs. All rights reserved.
      </p>
      <p className="mt-1 text-[0.72rem] uppercase tracking-[0.16em]">{themeName} interface</p>
    </footer>
  );
}
