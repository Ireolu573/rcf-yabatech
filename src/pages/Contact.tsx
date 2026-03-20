import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Send, CheckCircle, Instagram, Facebook, Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getUserFriendlyError } from "@/lib/errorHandler";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" as const },
  }),
};

const Contact = () => {
  const { toast } = useToast();
  const { settings } = useSiteSettings();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert(contactForm);
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: getUserFriendlyError(error), variant: "destructive" });
      return;
    }
    setSent(true);
    toast({ title: "Message sent!", description: "We'll get back to you soon." });
  };

  const handleNewsletter = async () => {
    if (!newsletterEmail) return;
    const { error } = await supabase.from("newsletter_subscriptions").insert({ email: newsletterEmail });
    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already subscribed", description: "This email is already on our list." });
      } else {
        toast({ title: "Error", description: getUserFriendlyError(error), variant: "destructive" });
      }
      return;
    }
    setNewsletterEmail("");
    toast({ title: "Subscribed!", description: "You'll receive our updates." });
  };

  const contactItems = [
    {
      icon: MapPin,
      label: "Address",
      value: settings.address,
      href: settings.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}` : undefined,
      external: true,
    },
    {
      icon: Phone,
      label: "Phone",
      value: settings.phone,
      href: settings.phone ? `tel:${settings.phone.replace(/\s/g, "")}` : undefined,
      external: false,
    },
    {
      icon: Mail,
      label: "Email",
      value: settings.email,
      href: settings.email ? `mailto:${settings.email}` : undefined,
      external: false,
    },
  ].filter(item => item.value);

  const socialLinks = [
    { icon: Instagram, url: settings.instagram, label: "Instagram" },
    { icon: Facebook, url: settings.facebook, label: "Facebook" },
    { icon: Youtube, url: settings.youtube, label: "YouTube" },
  ].filter(s => s.url);

  return (
    <div>
      <section className="bg-gradient-hero py-28 text-center">
        <div className="container mx-auto px-4">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Contact Us</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-primary-foreground/70 text-lg">We'd love to hear from you</motion.p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.h2 variants={fadeUp} custom={0} className="font-heading text-2xl font-bold text-foreground mb-6">Get In Touch</motion.h2>
              <motion.p variants={fadeUp} custom={1} className="text-muted-foreground mb-8 leading-relaxed">Whether you have questions about our fellowship, need prayer, or want to connect, don't hesitate to reach out. We're here for you!</motion.p>

              <div className="space-y-5">
                {contactItems.map((item, i) => (
                  <motion.div key={item.label} variants={fadeUp} custom={i + 2} className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="text-primary" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} target={item.external ? "_blank" : undefined} rel="noopener noreferrer" className="text-muted-foreground hover:text-primary text-sm transition-colors underline-offset-2 hover:underline">{item.value}</a>
                      ) : (
                        <span className="text-muted-foreground text-sm">{item.value}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {socialLinks.length > 0 && (
                <motion.div variants={fadeUp} custom={5} className="flex gap-3 mt-8">
                  {socialLinks.map((social) => (
                    <a key={social.label} href={social.url} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                      aria-label={social.label}
                    >
                      <social.icon size={18} className="text-primary" />
                    </a>
                  ))}
                </motion.div>
              )}

              <motion.div variants={fadeUp} custom={6} className="mt-10 bg-muted rounded-2xl p-6">
                <h3 className="font-heading font-semibold text-foreground mb-2">Newsletter</h3>
                <p className="text-muted-foreground text-sm mb-4">Subscribe for updates and event announcements.</p>
                <div className="flex gap-2">
                  <Input placeholder="Your email" value={newsletterEmail} onChange={e => setNewsletterEmail(e.target.value)} className="flex-1" />
                  <Button onClick={handleNewsletter} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg">Subscribe</Button>
                </div>
              </motion.div>
            </motion.div>

            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-2xl p-12 text-center shadow-soft flex flex-col items-center justify-center">
                <CheckCircle className="text-secondary mb-4" size={56} />
                <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Message Sent!</h2>
                <p className="text-muted-foreground mb-6">We'll respond as soon as possible.</p>
                <Button onClick={() => { setSent(false); setContactForm({ name: "", email: "", message: "" }); }} variant="outline" className="rounded-full">Send Another</Button>
              </motion.div>
            ) : (
              <motion.form onSubmit={handleSubmit} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-card rounded-2xl p-8 shadow-soft">
                <motion.h2 variants={fadeUp} custom={0} className="font-heading text-2xl font-bold text-foreground mb-6">Send a Message</motion.h2>
                <div className="space-y-5">
                  <motion.div variants={fadeUp} custom={1}><Label htmlFor="contact-name">Name</Label><Input id="contact-name" placeholder="Your name" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} required className="mt-1.5" /></motion.div>
                  <motion.div variants={fadeUp} custom={2}><Label htmlFor="contact-email">Email</Label><Input id="contact-email" type="email" placeholder="you@example.com" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} required className="mt-1.5" /></motion.div>
                  <motion.div variants={fadeUp} custom={3}><Label htmlFor="contact-msg">Message</Label><Textarea id="contact-msg" placeholder="How can we help?" rows={5} value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} required className="mt-1.5" /></motion.div>
                  <motion.div variants={fadeUp} custom={4}>
                    <Button type="submit" size="lg" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-semibold">
                      {loading ? "Sending..." : "Send Message"} <Send className="ml-2" size={16} />
                    </Button>
                  </motion.div>
                </div>
              </motion.form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
