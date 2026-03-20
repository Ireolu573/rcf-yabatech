import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Instagram, Facebook, Youtube } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Footer = () => {
  const { settings } = useSiteSettings();

  const socialLinks = [
    { icon: Instagram, url: settings.instagram, label: "Instagram" },
    { icon: Facebook, url: settings.facebook, label: "Facebook" },
    { icon: Youtube, url: settings.youtube, label: "YouTube" },
  ].filter(s => s.url); // only show social icons that have a URL set

  const contactItems = [
    { icon: MapPin, value: settings.address, href: settings.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}` : undefined, external: true },
    { icon: Phone, value: settings.phone, href: settings.phone ? `tel:${settings.phone.replace(/\s/g, "")}` : undefined, external: false },
    { icon: Mail, value: settings.email, href: settings.email ? `mailto:${settings.email}` : undefined, external: false },
  ].filter(item => item.value);

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-2xl font-bold mb-3">RCF YABATECH</h3>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Redeemed Christian Fellowship, Yaba College of Technology. Raising a generation of
              purpose-driven students rooted in God's Word.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {[
                { to: "/", label: "Home" },
                { to: "/about", label: "About Us" },
                { to: "/gallery", label: "Gallery" },
                { to: "/testimonies", label: "Testimonies" },
                { to: "/contact", label: "Contact" },
              ].map((link) => (
                <Link key={link.to} to={link.to} className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Contact Us</h4>
            <div className="flex flex-col gap-3 text-sm text-primary-foreground/70">
              {contactItems.map((item, i) => (
                item.href ? (
                  <a key={i} href={item.href} target={item.external ? "_blank" : undefined} rel="noopener noreferrer" className="flex items-start gap-2 hover:text-primary-foreground transition-colors">
                    <item.icon size={16} className="mt-0.5 shrink-0" />
                    <span>{item.value}</span>
                  </a>
                ) : (
                  <div key={i} className="flex items-start gap-2">
                    <item.icon size={16} className="mt-0.5 shrink-0" />
                    <span>{item.value}</span>
                  </div>
                )
              ))}
            </div>
            {socialLinks.length > 0 && (
              <div className="flex gap-3 mt-5">
                {socialLinks.map((social) => (
                  <a key={social.label} href={social.url} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                  >
                    <social.icon size={16} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-6 text-center text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} RCF YABATECH. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
