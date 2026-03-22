import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Check } from "lucide-react";
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
  const [selectedForDownload, setSelectedForDownload] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);

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

  const toggleSelectForDownload = (id: string) => {
    setSelectedForDownload(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const downloadSelected = async () => {
    if (selectedForDownload.size === 0) return;
    setDownloading(true);
    const toDownload = images.filter(img => selectedForDownload.has(img.id));
    for (const img of toDownload) {
      await handleDownload(img.image_url, img.caption);
      await new Promise(r => setTimeout(r, 500));
    }
    setDownloading(false);
    setSelectedForDownload(new Set());
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

          {selectedForDownload.size > 0 && (
            <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 mb-6">
              <p className="text-sm font-medium text-foreground">{selectedForDownload.size} image{selectedForDownload.size > 1 ? "s" : ""} selected</p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedForDownload(new Set())} className="text-muted-foreground">Clear</Button>
                <Button size="sm" onClick={downloadSelected} disabled={downloading} className="bg-primary text-primary-foreground">
                  <Download size={14} className="mr-1" /> {downloading ? "Downloading..." : "Download Selected"}
                </Button>
              </div>
            </div>
          )}

          {images.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No images yet. Check back soon!</p>
          ) : (
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {images.map((img, i) => (
                <motion.div key={img.id} variants={fadeUp} custom={i}
                  className={`group relative rounded-2xl overflow-hidden shadow-soft hover:shadow-glow-primary transition-shadow duration-300 cursor-pointer ${selectedForDownload.has(img.id) ? "ring-2 ring-primary" : ""}`}
                  onClick={() => toggleSelectForDownload(img.id)}>
                  <img src={img.image_url} alt={img.caption || "Gallery image"} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />

                  {/* Checkbox */}
                  <div className={`absolute top-3 left-3 w-6 h-6 rounded border-2 flex items-center justify-center transition-all z-10 ${selectedForDownload.has(img.id) ? "bg-primary border-primary" : "bg-black/40 border-white/60 group-hover:border-white"}`}>
                    {selectedForDownload.has(img.id) && <Check size={14} className="text-white" />}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-5 pointer-events-none">
                    <div>
                      {img.caption && <p className="text-primary-foreground font-medium text-sm">{img.caption}</p>}
                      {img.date_label && <p className="text-primary-foreground/60 text-xs">{img.date_label}</p>}
                    </div>
                    <div className="flex gap-2 pointer-events-auto" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20 rounded-full p-2 h-auto"
                        onClick={() => handleDownload(img.image_url, img.caption)}>
                        <Download size={18} />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20 rounded-full p-2 h-auto"
                        onClick={() => setSelected(img)}>
                        <X size={18} className="rotate-45" />
                      </Button>
                    </div>
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
              <button className="text-primary-foreground/80 hover:text-primary-foreground bg-primary-foreground/10 rounded-full p-2 hover:bg-primary-foreground/20 transition-colors"
                onClick={(e) => { e.stopPropagation(); handleDownload(selected.image_url, selected.caption); }}>
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