import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import heroBg from "@/assets/hero-bg.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};

const iconMap: Record<string, typeof BookOpen> = { BookOpen, Users, Heart };

const Index = () => {
  const [serviceTimes, setServiceTimes] = useState<Tables<"service_times">[]>([]);
  const [announcements, setAnnouncements] = useState<Tables<"announcements">[]>([]);

  useEffect(() => {
    // Simple one-time fetch — no WebSocket/realtime needed on public homepage
    supabase.from("service_times").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => { if (data) setServiceTimes(data); });
    supabase.from("announcements").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => { if (data) setAnnouncements(data); });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="RCF YABATECH worship" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-hero opacity-80" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-gold font-medium text-sm tracking-widest uppercase mb-4">Welcome to</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="font-heading text-5xl md:text-7xl font-bold text-primary-foreground leading-tight mb-4">RCF YABATECH</motion.h1>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto mb-3">Redeemed Christian Fellowship, Yaba College of Technology</motion.p>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="text-gold font-heading text-xl md:text-2xl italic mb-8">"Raising Purpose-Driven Students for Christ"</motion.p>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            <Link to="/contact">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow-gold text-base px-8 py-6 rounded-full font-semibold">
                Join Us This Sunday <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Welcome */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="max-w-3xl mx-auto text-center">
            <motion.h2 variants={fadeUp} custom={0} className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">Welcome to Our Fellowship</motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg leading-relaxed">
              RCF YABATECH is a vibrant community of students passionate about knowing God and making Him known. We gather every week to worship, study God's Word, and build lasting friendships rooted in faith. Whether you're new on campus or looking for a spiritual family, you're welcome here!
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Service Times */}
      {serviceTimes.length > 0 && (
        <section className="py-20 bg-gradient-section">
          <div className="container mx-auto px-4">
            <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="font-heading text-3xl md:text-4xl font-bold text-foreground text-center mb-12">Service Times & Venue</motion.h2>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {serviceTimes.map((s, i) => (
                <motion.div key={s.id} variants={fadeUp} custom={i + 1} className="bg-card rounded-2xl p-8 text-center shadow-soft hover:shadow-glow-primary transition-shadow duration-300">
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-foreground font-medium">{s.day}</p>
                  <p className="text-muted-foreground text-sm">{s.time_range}</p>
                  <p className="text-muted-foreground text-xs mt-1">{s.venue}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="font-heading text-3xl md:text-4xl font-bold text-foreground text-center mb-4">Upcoming Programs</motion.h2>
            <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1} className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">Stay connected with what God is doing in our fellowship</motion.p>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {announcements.map((a, i) => {
                const Icon = iconMap[a.icon || "BookOpen"] || BookOpen;
                return (
                  <motion.div key={a.id} variants={fadeUp} custom={i + 2} className="bg-card rounded-2xl p-7 shadow-soft hover:-translate-y-1 transition-transform duration-300">
                    {a.tag && <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4 bg-primary/10 text-primary">{a.tag}</span>}
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                      <Icon className="text-foreground" size={22} />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{a.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{a.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-gradient-hero text-center">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} custom={0} className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Come Worship With Us</motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-primary-foreground/70 text-lg max-w-xl mx-auto mb-8">Experience the love of God in a community that cares. Every student is welcome.</motion.p>
            <motion.div variants={fadeUp} custom={2}>
              <Link to="/contact">
                <Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 rounded-full px-8 py-6 text-base font-semibold shadow-glow-gold">
                  Join Us This Sunday <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
