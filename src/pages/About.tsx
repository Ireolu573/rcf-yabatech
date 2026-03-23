import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Eye, Heart, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" as const },
  }),
};

interface AboutSection {
  section_key: string;
  title: string;
  content: string;
}

interface Leader {
  id: string;
  name: string;
  role: string;
  initials: string;
}

const About = () => {
  const [sections, setSections] = useState<Record<string, AboutSection>>({});
  const [leaders, setLeaders] = useState<Leader[]>([]);

  useEffect(() => {
    const fetchAbout = async () => {
      const [ac, ld] = await Promise.all([
        supabase.from("about_content").select("*"),
        supabase.from("leaders").select("*").order("sort_order"),
      ]);
      if (ac.data) {
        const map: Record<string, AboutSection> = {};
        ac.data.forEach(item => { map[item.section_key] = item; });
        setSections(map);
      }
      if (ld.data) setLeaders(ld.data);
    };
    fetchAbout();
  }, []);

  const history = sections.history;
  const mission = sections.mission;
  const vision = sections.vision;

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-hero py-28 text-center">
        <div className="container mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4"
          >
            About RCF YABATECH
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-primary-foreground/70 text-lg max-w-xl mx-auto"
          >
            Our story, mission, and the people who make it happen
          </motion.p>
        </div>
      </section>

      {/* History */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0 }}>
            <motion.h2 variants={fadeUp} custom={0} className="font-heading text-3xl font-bold text-foreground mb-6 text-center">
              {history?.title || "Our History"}
            </motion.h2>
            {(history?.content || "").split("\n\n").map((para, i) => (
              <motion.p key={i} variants={fadeUp} custom={i + 1} className="text-muted-foreground leading-relaxed mb-4">
                {para}
              </motion.p>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gradient-section">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0 }}
              variants={fadeUp}
              custom={0}
              className="bg-card rounded-2xl p-8 shadow-soft"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Target className="text-primary" size={26} />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-3">{mission?.title || "Our Mission"}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {mission?.content || ""}
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0 }}
              variants={fadeUp}
              custom={1}
              className="bg-card rounded-2xl p-8 shadow-soft"
            >
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                <Eye className="text-secondary" size={26} />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-3">{vision?.title || "Our Vision"}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {vision?.content || ""}
              </p>
            </motion.div>
          </div>

          {/* Core Values */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0 }}
            className="mt-12 max-w-4xl mx-auto"
          >
            <motion.h3 variants={fadeUp} custom={0} className="font-heading text-2xl font-bold text-foreground text-center mb-8">
              Our Core Values
            </motion.h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: BookOpen, label: "God's Word" },
                { icon: Heart, label: "Love & Unity" },
                { icon: Target, label: "Excellence" },
                { icon: Eye, label: "Integrity" },
              ].map((val, i) => (
                <motion.div
                  key={val.label}
                  variants={fadeUp}
                  custom={i + 1}
                  className="bg-card rounded-xl p-5 text-center shadow-soft"
                >
                  <val.icon className="text-gold mx-auto mb-2" size={24} />
                  <span className="text-sm font-medium text-foreground">{val.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-heading text-3xl font-bold text-foreground text-center mb-12"
          >
            Our Leadership Team
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {leaders.map((leader, i) => (
              <motion.div
                key={leader.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="bg-card rounded-2xl p-6 text-center shadow-soft hover:shadow-glow-primary transition-shadow duration-300"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="font-heading text-xl font-bold text-primary">{leader.initials}</span>
                </div>
                <h4 className="font-heading font-semibold text-foreground">{leader.name}</h4>
                <p className="text-muted-foreground text-sm">{leader.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;