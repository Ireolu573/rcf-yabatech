import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Gallery = () => {
  const [images, setImages] = useState<Tables<"gallery_images">[]>([]);
  const [selected, setSelected] = useState<Tables<"gallery_images"> | null>(null);

  useEffect(() => {
    supabase.from("gallery_images").select("*").eq("is_active", true).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setImages(data);
    });
  }, []);

  const handleDownload = async (imageUrl: string, caption: string | null) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = caption ? `${caption.replace(/[^a-zA-Z0-9]/g, "_")}.jpg` : "gallery-image.jpg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  return (
    <div>
      <section className="bg-gradient-hero py-28 text-center">
        <div className="container mx-auto px-4">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Gallery</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-primary-foreground/70 text-lg">Moments from our fellowship</motion.p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {images.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No images yet. Check back soon!</p>
          ) : (
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {images.map((img, i) => (
                <motion.div key={img.id} variants={fadeUp} custom={i} className="group relative rounded-2xl overflow-hidden shadow-soft hover:shadow-glow-primary transition-shadow duration-300">
                  <img src={img.image_url} alt={img.caption || "Gallery image"} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer" loading="lazy" onClick={() => setSelected(img)} />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-5 pointer-events-none">
                    <div>
                      {img.caption && <p className="text-primary-foreground font-medium text-sm">{img.caption}</p>}
                      {img.date_label && <p className="text-primary-foreground/60 text-xs">{img.date_label}</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="pointer-events-auto text-primary-foreground hover:bg-primary-foreground/20 rounded-full p-2 h-auto"
                      onClick={(e) => { e.stopPropagation(); handleDownload(img.image_url, img.caption); }}
                    >
                      <Download size={18} />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="absolute top-6 right-6 flex gap-2">
              <button
                className="text-primary-foreground/80 hover:text-primary-foreground bg-primary-foreground/10 rounded-full p-2 hover:bg-primary-foreground/20 transition-colors"
                onClick={(e) => { e.stopPropagation(); handleDownload(selected.image_url, selected.caption); }}
              >
                <Download size={22} />
              </button>
              <button className="text-primary-foreground/80 hover:text-primary-foreground" onClick={() => setSelected(null)}><X size={28} /></button>
            </div>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
              <img src={selected.image_url} alt={selected.caption || ""} className="w-full rounded-2xl" />
              <div className="mt-4 text-center">
                {selected.caption && <p className="text-primary-foreground font-heading text-lg">{selected.caption}</p>}
                {selected.date_label && <p className="text-primary-foreground/60 text-sm">{selected.date_label}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
