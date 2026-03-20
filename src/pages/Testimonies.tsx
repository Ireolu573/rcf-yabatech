import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, CheckCircle, Quote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getUserFriendlyError } from "@/lib/errorHandler";
import type { Tables } from "@/integrations/supabase/types";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" as const },
  }),
};

const Testimonies = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState<Tables<"testimonies">[]>([]);
  const [form, setForm] = useState({ name: "", department: "", level: "", message: "" });

  useEffect(() => {
    supabase
      .from("testimonies")
      .select("*")
      .eq("is_reviewed", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setApproved(data); });
  }, [submitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.department || !form.level || !form.message) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("testimonies").insert({
      name: form.name,
      department: form.department,
      level: form.level,
      message: form.message,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error submitting", description: getUserFriendlyError(error), variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ title: "Testimony submitted!", description: "Thank you for sharing. Your testimony will be reviewed by the admin." });
  };

  return (
    <div>
      <section className="bg-gradient-hero py-28 text-center">
        <div className="container mx-auto px-4">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Testimonies</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-primary-foreground/70 text-lg max-w-xl mx-auto">God has been faithful! Read what He has done and share your own story.</motion.p>
        </div>
      </section>

      {/* Approved testimonies */}
      {approved.length > 0 && (
        <section className="py-20 bg-gradient-section">
          <div className="container mx-auto px-4">
            <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="font-heading text-3xl font-bold text-foreground text-center mb-12">What God Has Done</motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {approved.map((t, i) => (
                <motion.div key={t.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i} className="bg-card rounded-2xl p-6 shadow-soft">
                  <Quote className="text-gold mb-3" size={28} />
                  <p className="text-foreground leading-relaxed mb-4 italic">"{t.message}"</p>
                  <div className="border-t border-border pt-3">
                    <p className="font-semibold text-foreground text-sm">{t.name}</p>
                    <p className="text-muted-foreground text-xs">{t.department} • {t.level}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Submit form */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-2xl p-12 text-center shadow-soft">
              <CheckCircle className="text-secondary mx-auto mb-4" size={56} />
              <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Thank You!</h2>
              <p className="text-muted-foreground mb-6">Your testimony has been submitted and will be reviewed by our admin team.</p>
              <Button onClick={() => { setSubmitted(false); setForm({ name: "", department: "", level: "", message: "" }); }} variant="outline" className="rounded-full">Submit Another</Button>
            </motion.div>
          ) : (
            <motion.form onSubmit={handleSubmit} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-card rounded-2xl p-8 md:p-10 shadow-soft">
              <motion.h2 variants={fadeUp} custom={0} className="font-heading text-2xl font-bold text-foreground mb-6">Share Your Testimony</motion.h2>
              <div className="space-y-5">
                <motion.div variants={fadeUp} custom={1}><Label htmlFor="name">Full Name</Label><Input id="name" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1.5" /></motion.div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <motion.div variants={fadeUp} custom={2}><Label htmlFor="department">Department</Label><Input id="department" placeholder="e.g. Computer Science" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="mt-1.5" /></motion.div>
                  <motion.div variants={fadeUp} custom={3}><Label htmlFor="level">Level</Label><Input id="level" placeholder="e.g. ND1, HND2" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} className="mt-1.5" /></motion.div>
                </div>
                <motion.div variants={fadeUp} custom={4}><Label htmlFor="message">Your Testimony</Label><Textarea id="message" placeholder="Share what God has done in your life..." rows={6} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="mt-1.5" /></motion.div>
                <motion.div variants={fadeUp} custom={5}>
                  <Button type="submit" size="lg" disabled={loading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-semibold">
                    {loading ? "Submitting..." : "Submit Testimony"} <Send className="ml-2" size={16} />
                  </Button>
                </motion.div>
              </div>
            </motion.form>
          )}
        </div>
      </section>
    </div>
  );
};

export default Testimonies;
