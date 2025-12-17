import { Link } from 'react-router-dom';
import { GraduationCap, Mail, MapPin, Phone, Twitter, Linkedin, Instagram } from 'lucide-react';

const footerLinks = {
  platform: [
    { label: 'Universities', href: '/universities' },
    { label: 'AI Consultation', href: '/dashboard/ai-consultation' },
    { label: 'How It Works', href: '/about' },
    { label: 'Pricing', href: '/pricing' },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQs', href: '/faqs' },
    { label: 'Community', href: '/community' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Instagram, href: '#', label: 'Instagram' },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-background">EduPath</span>
            </Link>
            <p className="text-background/60 text-sm mb-6 max-w-xs">
              Empowering students worldwide to achieve their academic dreams through AI-powered guidance and seamless applications.
            </p>
            {/* Contact */}
            <div className="space-y-2 text-sm text-background/60">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                support@edupath.com
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                +1 (555) 123-4567
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                San Francisco, CA
              </div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-background mb-4">Platform</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-background mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-background mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/60">
            © {new Date().getFullYear()} EduPath. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="w-9 h-9 rounded-lg bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                aria-label={social.label}
              >
                <social.icon className="w-4 h-4 text-background" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
