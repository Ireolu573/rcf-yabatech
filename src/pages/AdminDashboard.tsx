import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getUserFriendlyError } from "@/lib/errorHandler";
import { LogOut, Plus, Trash2, Check, Clock, Image, MessageSquare, Megaphone, Mail, Info, Save, Users, Settings, Eye, EyeOff, BookOpen, Heart, Target, Headphones, Upload, Loader2, CheckCircle, FileText } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const ICONS = [
  { value: "BookOpen", label: "Book", icon: BookOpen },
  { value: "Users", label: "People", icon: Users },
  { value: "Heart", label: "Heart", icon: Heart },
  { value: "Target", label: "Target", icon: Target },
  { value: "Megaphone", label: "Announce", icon: Megaphone },
];

const AdminDashboard = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [serviceTimes, setServiceTimes] = useState<Tables<"service_times">[]>([]);
  const [announcements, setAnnouncements] = useState<Tables<"announcements">[]>([]);
  const [testimonies, setTestimonies] = useState<Tables<"testimonies">[]>([]);
  const [galleryImages, setGalleryImages] = useState<Tables<"gallery_images">[]>([]);
  const [contactMessages, setContactMessages] = useState<Tables<"contact_messages">[]>([]);
  const [newsletters, setNewsletters] = useState<Tables<"newsletter_subscriptions">[]>([]);
  const [aboutContent, setAboutContent] = useState<Tables<"about_content">[]>([]);
  const [leaders, setLeaders] = useState<Tables<"leaders">[]>([]);

  const [newService, setNewService] = useState({ title: "", day: "", time_range: "", venue: "" });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", description: "", tag: "", icon: "BookOpen" });
  const [uploading, setUploading] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [newDateLabel, setNewDateLabel] = useState("");
  const [newLeader, setNewLeader] = useState({ name: "", role: "", initials: "" });
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [editingAbout, setEditingAbout] = useState<Record<string, { title: string; content: string }>>({});
  const [savingAbout, setSavingAbout] = useState<string | null>(null);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [savingSettings, setSavingSettings] = useState(false);

  // ── SERMON UPLOAD STATE ────────────────────────────────────
  const [sermonForm, setSermonForm] = useState({ title: "", speaker: "", service_date: "", summary: "" });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [notesFile, setNotesFile] = useState<File | null>(null);
  const [sermonUploading, setSermonUploading] = useState(false);
  const [sermonSuccess, setSermonSuccess] = useState(false);
  const [sermonError, setSermonError] = useState("");
  const [sermonList, setSermonList] = useState<any[]>([]);

  const fetchAll = useCallback(async () => {
    const [st, ann, test, gal, cm, nl, ac, ld, ss, sr] = await Promise.all([
      supabase.from("service_times").select("*").order("sort_order"),
      supabase.from("announcements").select("*").order("sort_order"),
      supabase.from("testimonies").select("*").order("created_at", { ascending: false }),
      supabase.from("gallery_images").select("*").order("created_at", { ascending: false }),
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
      supabase.from("newsletter_subscriptions").select("*").order("created_at", { ascending: false }),
      supabase.from("about_content").select("*"),
      supabase.from("leaders").select("*").order("sort_order"),
      supabase.from("site_settings").select("*"),
      supabase.from("messages").select("*").order("service_date", { ascending: false }),
    ]);
    if (st.data) setServiceTimes(st.data);
    if (ann.data) setAnnouncements(ann.data);
    if (test.data) setTestimonies(test.data);
    if (gal.data) setGalleryImages(gal.data);
    if (cm.data) setContactMessages(cm.data);
    if (nl.data) setNewsletters(nl.data);
    if (ac.data) {
      setAboutContent(ac.data);
      const editMap: Record<string, { title: string; content: string }> = {};
      ac.data.forEach(item => { editMap[item.section_key] = { title: item.title, content: item.content }; });
      setEditingAbout(editMap);
    }
    if (ld.data) setLeaders(ld.data);
    if (ss.data) {
      const map: Record<string, string> = {};
      ss.data.forEach((row: any) => { map[row.setting_key] = row.setting_value; });
      setSiteSettings(map);
    }
    if (sr.data) setSermonList(sr.data);
  }, []);

  useEffect(() => { if (!loading && !user) navigate("/admin/login"); }, [user, loading, navigate]);
  useEffect(() => { if (user && isAdmin) fetchAll(); }, [user, isAdmin, fetchAll]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Verifying admin access...</p>
      </div>
    </div>
  );

  // ── SERVICE TIMES ──────────────────────────────────────────
  const addServiceTime = async () => {
    if (!newService.title || !newService.day || !newService.time_range || !newService.venue) return;
    const { error } = await supabase.from("service_times").insert({ ...newService, sort_order: serviceTimes.length });
    if (error) { toast({ title: "Error", description: getUserFriendlyError(error), variant: "destructive" }); return; }
    setNewService({ title: "", day: "", time_range: "", venue: "" });
    toast({ title: "Service time added" }); fetchAll();
  };

  const toggleServiceTime = async (id: string, current: boolean) => {
    await supabase.from("service_times").update({ is_active: !current }).eq("id", id);
    toast({ title: !current ? "Service shown on site" : "Service hidden from site" }); fetchAll();
  };

  const deleteServiceTime = async (id: string) => {
    await supabase.from("service_times").delete().eq("id", id);
    toast({ title: "Deleted" }); fetchAll();
  };

  // ── ANNOUNCEMENTS ─────────────────────────────────────────
  const addAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.description) return;
    const { error } = await supabase.from("announcements").insert({ ...newAnnouncement, sort_order: announcements.length });
    if (error) { toast({ title: "Error", description: getUserFriendlyError(error), variant: "destructive" }); return; }
    setNewAnnouncement({ title: "", description: "", tag: "", icon: "BookOpen" });
    toast({ title: "Announcement added" }); fetchAll();
  };

  const toggleAnnouncement = async (id: string, current: boolean) => {
    await supabase.from("announcements").update({ is_active: !current }).eq("id", id);
    toast({ title: !current ? "Announcement shown on site" : "Announcement hidden from site" }); fetchAll();
  };

  const deleteAnnouncement = async (id: string) => {
    await supabase.from("announcements").delete().eq("id", id);
    toast({ title: "Deleted" }); fetchAll();
  };

  // ── GALLERY ───────────────────────────────────────────────
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const maxWidth = 1200;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => resolve(blob || file), "image/jpeg", 0.8);
      };
      img.src = url;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      toast({ title: "Not authenticated", description: "Please log in again.", variant: "destructive" });
      setUploading(false); return;
    }
    let successCount = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const compressed = await compressImage(file);
      const fileName = `${Date.now()}_${i}_${file.name.replace(/\.[^.]+$/, "")}.jpg`;
      const { error: uploadError } = await supabase.storage.from("gallery").upload(fileName, compressed, { contentType: "image/jpeg" });
      if (uploadError) { toast({ title: `Image ${i + 1} failed`, description: uploadError.message, variant: "destructive" }); continue; }
      const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(fileName);
      const { error: dbError } = await supabase.from("gallery_images").insert({ image_url: urlData.publicUrl, caption: newCaption || null, date_label: newDateLabel || null, is_active: true });
      if (dbError) { toast({ title: "DB insert failed", description: dbError.message, variant: "destructive" }); continue; }
      successCount++;
    }
    setNewCaption(""); setNewDateLabel(""); setUploading(false);
    if (successCount > 0) toast({ title: `${successCount} image${successCount > 1 ? "s" : ""} uploaded` });
    fetchAll(); e.target.value = "";
  };

  const toggleGalleryImage = async (id: string, current: boolean) => {
    await supabase.from("gallery_images").update({ is_active: !current }).eq("id", id);
    toast({ title: !current ? "Image shown on site" : "Image hidden from site" }); fetchAll();
  };

  const deleteGalleryImage = async (id: string, imageUrl: string) => {
    const parts = imageUrl.split("/gallery/");
    if (parts[1]) await supabase.storage.from("gallery").remove([parts[1]]);
    await supabase.from("gallery_images").delete().eq("id", id);
    toast({ title: "Image deleted" }); fetchAll();
  };

  const deleteSelectedImages = async () => {
    if (selectedImages.size === 0) return;
    const toDelete = galleryImages.filter(img => selectedImages.has(img.id));
    const storageKeys = toDelete.map(img => img.image_url.split("/gallery/")[1]).filter(Boolean);
    if (storageKeys.length > 0) await supabase.storage.from("gallery").remove(storageKeys);
    for (const id of selectedImages) {
      await supabase.from("gallery_images").delete().eq("id", id);
    }
    toast({ title: `${selectedImages.size} image${selectedImages.size > 1 ? "s" : ""} deleted` });
    setSelectedImages(new Set());
    fetchAll();
  };

  const toggleSelectImage = (id: string) => {
    setSelectedImages(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ── TESTIMONIES ───────────────────────────────────────────
  const markReviewed = async (id: string) => {
    await supabase.from("testimonies").update({ is_reviewed: true }).eq("id", id);
    toast({ title: "Approved — now visible on site" }); fetchAll();
  };

  const unmarkReviewed = async (id: string) => {
    await supabase.from("testimonies").update({ is_reviewed: false }).eq("id", id);
    toast({ title: "Hidden from site" }); fetchAll();
  };

  const deleteTestimony = async (id: string) => {
    await supabase.from("testimonies").delete().eq("id", id);
    toast({ title: "Testimony deleted" }); fetchAll();
  };

  // ── CONTACT MESSAGES ──────────────────────────────────────
  const deleteContactMessage = async (id: string) => {
    await supabase.from("contact_messages").delete().eq("id", id);
    toast({ title: "Message deleted" }); fetchAll();
  };

  // ── SERMON UPLOAD ─────────────────────────────────────────
  const uploadSermonFile = async (file: File, folder: string) => {
    const ext = file.name.split(".").pop();
    const filename = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("messages").upload(filename, file);
    if (error) throw error;
    const { data } = supabase.storage.from("messages").getPublicUrl(filename);
    return data.publicUrl;
  };

  const handleSermonUpload = async () => {
    setSermonError("");
    setSermonSuccess(false);
    if (!sermonForm.title || !sermonForm.speaker || !sermonForm.service_date) {
      setSermonError("Title, speaker, and date are required.");
      return;
    }
    setSermonUploading(true);
    try {
      let audio_url = null;
      let notes_url = null;
      if (audioFile) audio_url = await uploadSermonFile(audioFile, "audio");
      if (notesFile) notes_url = await uploadSermonFile(notesFile, "notes");
      const { error } = await supabase.from("messages").insert({
        title: sermonForm.title,
        speaker: sermonForm.speaker,
        service_date: sermonForm.service_date,
        summary: sermonForm.summary || null,
        audio_url,
        notes_url,
      });
      if (error) throw error;
      setSermonSuccess(true);
      setSermonForm({ title: "", speaker: "", service_date: "", summary: "" });
      setAudioFile(null);
      setNotesFile(null);
      toast({ title: "Message uploaded successfully" });
      fetchAll();
    } catch (err: any) {
      setSermonError(err.message || "Something went wrong.");
    } finally {
      setSermonUploading(false);
    }
  };

  const deleteSermon = async (id: string) => {
    await supabase.from("messages").delete().eq("id", id);
    toast({ title: "Message deleted" });
    fetchAll();
  };

  // ── ABOUT ─────────────────────────────────────────────────
  const saveAboutSection = async (sectionKey: string) => {
    const data = editingAbout[sectionKey];
    if (!data) return;
    setSavingAbout(sectionKey);
    const existing = aboutContent.find(a => a.section_key === sectionKey);
    if (existing) {
      const { error } = await supabase.from("about_content").update({ title: data.title, content: data.content }).eq("id", existing.id);
      if (error) { toast({ title: "Error", description: getUserFriendlyError(error), variant: "destructive" }); setSavingAbout(null); return; }
    }
    setSavingAbout(null);
    toast({ title: "Saved — About page updated" }); fetchAll();
  };

  // ── LEADERS ───────────────────────────────────────────────
  const addLeader = async () => {
    if (!newLeader.name || !newLeader.role || !newLeader.initials) return;
    const { error } = await supabase.from("leaders").insert({ ...newLeader, sort_order: leaders.length });
    if (error) { toast({ title: "Error", description: getUserFriendlyError(error), variant: "destructive" }); return; }
    setNewLeader({ name: "", role: "", initials: "" });
    toast({ title: "Leader added" }); fetchAll();
  };

  const toggleLeader = async (id: string, current: boolean) => {
    await supabase.from("leaders").update({ is_active: !current }).eq("id", id);
    toast({ title: !current ? "Leader shown on site" : "Leader hidden from site" }); fetchAll();
  };

  const deleteLeader = async (id: string) => {
    await supabase.from("leaders").delete().eq("id", id);
    toast({ title: "Leader removed" }); fetchAll();
  };

  // ── SETTINGS ──────────────────────────────────────────────
  const saveSiteSettings = async () => {
    setSavingSettings(true);
    const keys = ["address", "phone", "email", "instagram", "facebook", "youtube"];
    for (const key of keys) {
      await supabase.from("site_settings").update({ setting_value: siteSettings[key] || "" }).eq("setting_key", key);
    }
    setSavingSettings(false);
    toast({ title: "Contact details updated — live on site" });
  };

  // ── RENDER ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-heading text-xl font-bold text-foreground">Admin Dashboard</h1>
          <Button variant="outline" size="sm" onClick={() => { signOut(); navigate("/"); }}>
            <LogOut size={16} className="mr-2" /> Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 h-auto">
            <TabsTrigger value="services"><Clock size={14} className="mr-1.5" />Services</TabsTrigger>
            <TabsTrigger value="announcements"><Megaphone size={14} className="mr-1.5" />Announcements</TabsTrigger>
            <TabsTrigger value="gallery"><Image size={14} className="mr-1.5" />Gallery</TabsTrigger>
            <TabsTrigger value="testimonies"><MessageSquare size={14} className="mr-1.5" />Testimonies</TabsTrigger>
            <TabsTrigger value="sermons"><Headphones size={14} className="mr-1.5" />Messages</TabsTrigger>
            <TabsTrigger value="messages"><Mail size={14} className="mr-1.5" />Inbox</TabsTrigger>
            <TabsTrigger value="about"><Info size={14} className="mr-1.5" />About</TabsTrigger>
            <TabsTrigger value="settings"><Settings size={14} className="mr-1.5" />Contact Info</TabsTrigger>
          </TabsList>

          {/* ── SERVICES ── */}
          <TabsContent value="services" className="space-y-6">
            <div className="bg-card rounded-2xl p-6 shadow-soft">
              <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Add Service Time</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div><Label>Title</Label><Input placeholder="Sunday Service" value={newService.title} onChange={e => setNewService({...newService, title: e.target.value})} className="mt-1" /></div>
                <div><Label>Day</Label><Input placeholder="Every Sunday" value={newService.day} onChange={e => setNewService({...newService, day: e.target.value})} className="mt-1" /></div>
                <div><Label>Time</Label><Input placeholder="9:00 AM - 11:30 AM" value={newService.time_range} onChange={e => setNewService({...newService, time_range: e.target.value})} className="mt-1" /></div>
                <div><Label>Venue</Label><Input placeholder="College Chapel" value={newService.venue} onChange={e => setNewService({...newService, venue: e.target.value})} className="mt-1" /></div>
              </div>
              <Button onClick={addServiceTime} className="bg-primary text-primary-foreground"><Plus size={16} className="mr-1" /> Add</Button>
            </div>
            <div className="space-y-3">
              {serviceTimes.length === 0 && <p className="text-muted-foreground text-center py-8">No service times yet.</p>}
              {serviceTimes.map(s => (
                <div key={s.id} className={`bg-card rounded-xl p-4 shadow-soft flex items-center justify-between gap-4 ${!s.is_active ? "opacity-50" : ""}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{s.title}</p>
                      {!s.is_active && <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">Hidden</span>}
                    </div>
                    <p className="text-muted-foreground text-sm">{s.day} • {s.time_range} • {s.venue}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => toggleServiceTime(s.id, s.is_active)} title={s.is_active ? "Hide from site" : "Show on site"}>
                      {s.is_active ? <Eye size={16} className="text-secondary" /> : <EyeOff size={16} className="text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteServiceTime(s.id)} className="text-destructive"><Trash2 size={16} /></Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── ANNOUNCEMENTS ── */}
          <TabsContent value="announcements" className="space-y-6">
            <div className="bg-card rounded-2xl p-6 shadow-soft">
              <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Add Announcement</h2>
              <div className="space-y-4 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label>Title</Label><Input placeholder="Event title" value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} className="mt-1" /></div>
                  <div><Label>Tag / Date</Label><Input placeholder="e.g. March 15" value={newAnnouncement.tag} onChange={e => setNewAnnouncement({...newAnnouncement, tag: e.target.value})} className="mt-1" /></div>
                </div>
                <div><Label>Description</Label><Textarea placeholder="Description" value={newAnnouncement.description} onChange={e => setNewAnnouncement({...newAnnouncement, description: e.target.value})} className="mt-1" /></div>
                <div>
                  <Label>Icon</Label>
                  <div className="flex gap-2 mt-1">
                    {ICONS.map(({ value, label, icon: Icon }) => (
                      <button key={value} type="button" onClick={() => setNewAnnouncement({...newAnnouncement, icon: value})}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-colors ${newAnnouncement.icon === value ? "border-primary bg-primary/10" : "border-border bg-card"}`}>
                        <Icon size={18} />
                        <span className="text-xs">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Button onClick={addAnnouncement} className="bg-primary text-primary-foreground"><Plus size={16} className="mr-1" /> Add</Button>
            </div>
            <div className="space-y-3">
              {announcements.length === 0 && <p className="text-muted-foreground text-center py-8">No announcements yet.</p>}
              {announcements.map(a => (
                <div key={a.id} className={`bg-card rounded-xl p-4 shadow-soft flex items-center justify-between gap-4 ${!a.is_active ? "opacity-50" : ""}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{a.title}</p>
                      {a.tag && <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{a.tag}</span>}
                      {!a.is_active && <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">Hidden</span>}
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">{a.description}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => toggleAnnouncement(a.id, a.is_active)} title={a.is_active ? "Hide from site" : "Show on site"}>
                      {a.is_active ? <Eye size={16} className="text-secondary" /> : <EyeOff size={16} className="text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteAnnouncement(a.id)} className="text-destructive"><Trash2 size={16} /></Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── GALLERY ── */}
          <TabsContent value="gallery" className="space-y-6">
            <div className="bg-card rounded-2xl p-6 shadow-soft">
              <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Upload Images</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div><Label>Caption (applies to all)</Label><Input placeholder="Image caption" value={newCaption} onChange={e => setNewCaption(e.target.value)} className="mt-1" /></div>
                <div><Label>Date Label</Label><Input placeholder="e.g. Feb 2025" value={newDateLabel} onChange={e => setNewDateLabel(e.target.value)} className="mt-1" /></div>
              </div>
              <div>
                <Label htmlFor="gallery-upload" className="cursor-pointer inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                  <Plus size={16} /> {uploading ? "Uploading..." : "Choose Images"}
                </Label>
                <input id="gallery-upload" type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
                <p className="text-muted-foreground text-xs mt-2">You can select multiple images at once. Images are compressed before upload.</p>
              </div>
            </div>

            {selectedImages.size > 0 && (
              <div className="flex items-center justify-between bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-foreground">{selectedImages.size} image{selectedImages.size > 1 ? "s" : ""} selected</p>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedImages(new Set())} className="text-muted-foreground">Clear</Button>
                  <Button size="sm" onClick={deleteSelectedImages} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    <Trash2 size={14} className="mr-1" /> Delete Selected
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryImages.length === 0 && <p className="text-muted-foreground text-center py-8 col-span-4">No images yet.</p>}
              {galleryImages.map(img => (
                <div key={img.id} className={`relative group rounded-xl overflow-hidden shadow-soft ${!img.is_active ? "opacity-50" : ""} ${selectedImages.has(img.id) ? "ring-2 ring-primary" : ""}`}>
                  <img src={img.image_url} alt={img.caption || ""} className="w-full h-40 object-cover" loading="lazy" />
                  <div
                    className={`absolute top-2 left-2 w-6 h-6 rounded border-2 flex items-center justify-center transition-all cursor-pointer z-10 ${selectedImages.has(img.id) ? "bg-primary border-primary" : "bg-black/50 border-white/80 hover:border-white"}`}
                    onClick={() => toggleSelectImage(img.id)}>
                    {selectedImages.has(img.id) && <Check size={13} className="text-white" />}
                  </div>
                  <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => toggleGalleryImage(img.id, img.is_active)} className="text-primary-foreground p-2 h-auto" title={img.is_active ? "Hide" : "Show"}>
                      {img.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteGalleryImage(img.id, img.image_url)} className="text-destructive p-2 h-auto"><Trash2 size={18} /></Button>
                  </div>
                  {!img.is_active && (
                    <div className="absolute top-2 right-2 bg-foreground/70 text-primary-foreground text-xs px-2 py-0.5 rounded-full">Hidden</div>
                  )}
                  {img.caption && <p className="absolute bottom-0 left-0 right-0 bg-foreground/60 text-primary-foreground text-xs p-2 truncate">{img.caption}</p>}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── TESTIMONIES ── */}
          <TabsContent value="testimonies" className="space-y-3">
            <p className="text-muted-foreground text-sm">Approve a testimony to make it visible on the Testimonies page.</p>
            {testimonies.length === 0 && <p className="text-muted-foreground text-center py-12">No testimonies yet.</p>}
            {testimonies.map(t => (
              <div key={t.id} className="bg-card rounded-xl p-5 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground">{t.name}</p>
                      {t.is_reviewed
                        ? <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">✓ Approved — visible on site</span>
                        : <span className="text-xs bg-gold/10 text-yellow-600 px-2 py-0.5 rounded-full">Pending review</span>}
                    </div>
                    <p className="text-muted-foreground text-xs mb-2">{t.department} • {t.level} • {new Date(t.created_at).toLocaleDateString()}</p>
                    <p className="text-foreground text-sm leading-relaxed">{t.message}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!t.is_reviewed
                      ? <Button variant="ghost" size="sm" onClick={() => markReviewed(t.id)} className="text-secondary" title="Approve"><Check size={16} /></Button>
                      : <Button variant="ghost" size="sm" onClick={() => unmarkReviewed(t.id)} className="text-muted-foreground" title="Hide from site"><EyeOff size={16} /></Button>}
                    <Button variant="ghost" size="sm" onClick={() => deleteTestimony(t.id)} className="text-destructive"><Trash2 size={16} /></Button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* ── SERMONS / MESSAGES UPLOAD ── */}
          <TabsContent value="sermons" className="space-y-6">
            <div className="bg-card rounded-2xl p-6 shadow-soft">
              <h2 className="font-heading text-lg font-semibold text-foreground mb-1">Upload Message</h2>
              <p className="text-muted-foreground text-sm mb-5">Add a new service message. It goes live on the public Messages page immediately.</p>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Title *</Label>
                    <Input placeholder="e.g. The Power of Faith" value={sermonForm.title} onChange={e => setSermonForm({...sermonForm, title: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <Label>Speaker *</Label>
                    <Input placeholder="e.g. Pst. Emmanuel Adeyemi" value={sermonForm.speaker} onChange={e => setSermonForm({...sermonForm, speaker: e.target.value})} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label>Service Date *</Label>
                  <Input type="date" value={sermonForm.service_date} onChange={e => setSermonForm({...sermonForm, service_date: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <Label>Summary <span className="text-muted-foreground">(optional)</span></Label>
                  <Textarea placeholder="Brief summary of the message..." rows={3} value={sermonForm.summary} onChange={e => setSermonForm({...sermonForm, summary: e.target.value})} className="mt-1 resize-none" />
                </div>
                <div>
                  <Label>Audio File <span className="text-muted-foreground">(optional)</span></Label>
                  <input type="file" accept="audio/*" onChange={e => setAudioFile(e.target.files?.[0] || null)}
                    className="mt-1 w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:opacity-90" />
                </div>
                <div>
                  <Label>Notes File <span className="text-muted-foreground">(PDF or Doc, optional)</span></Label>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={e => setNotesFile(e.target.files?.[0] || null)}
                    className="mt-1 w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:opacity-90" />
                </div>
                {sermonError && <p className="text-sm text-destructive">{sermonError}</p>}
                {sermonSuccess && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle size={16} /> Message uploaded successfully.
                  </div>
                )}
                <Button onClick={handleSermonUpload} disabled={sermonUploading} className="bg-primary text-primary-foreground w-full">
                  {sermonUploading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Upload size={16} className="mr-2" />}
                  {sermonUploading ? "Uploading..." : "Upload Message"}
                </Button>
              </div>
            </div>

            {/* Uploaded messages list */}
            <div className="space-y-3">
              <h3 className="font-heading text-base font-semibold text-foreground">Uploaded Messages ({sermonList.length})</h3>
              {sermonList.length === 0 && <p className="text-muted-foreground text-sm text-center py-6">No messages uploaded yet.</p>}
              {sermonList.map(s => (
                <div key={s.id} className="bg-card rounded-xl p-4 shadow-soft flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{s.title}</p>
                    <p className="text-muted-foreground text-sm">{s.speaker} • {new Date(s.service_date).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}</p>
                    <div className="flex gap-3 mt-2">
                      {s.audio_url && (
                        <a href={s.audio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                          <Headphones size={13} /> Audio
                        </a>
                      )}
                      {s.notes_url && (
                        <a href={s.notes_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                          <FileText size={13} /> Notes
                        </a>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteSermon(s.id)} className="text-destructive shrink-0"><Trash2 size={16} /></Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── INBOX (CONTACT MESSAGES) ── */}
          <TabsContent value="messages" className="space-y-6">
            <h2 className="font-heading text-lg font-semibold text-foreground">Contact Messages ({contactMessages.length})</h2>
            {contactMessages.length === 0 && <p className="text-muted-foreground text-center py-8">No messages yet.</p>}
            {contactMessages.map(m => (
              <div key={m.id} className="bg-card rounded-xl p-5 shadow-soft flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">{m.name} <span className="text-muted-foreground font-normal text-sm">({m.email})</span></p>
                  <p className="text-foreground text-sm mt-1">{m.message}</p>
                  <p className="text-muted-foreground text-xs mt-2">{new Date(m.created_at).toLocaleDateString()}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteContactMessage(m.id)} className="text-destructive shrink-0"><Trash2 size={16} /></Button>
              </div>
            ))}
            <h2 className="font-heading text-lg font-semibold text-foreground pt-4">Newsletter Subscribers ({newsletters.length})</h2>
            <div className="bg-card rounded-xl p-5 shadow-soft">
              {newsletters.length === 0 ? <p className="text-muted-foreground text-center">No subscribers yet.</p> : (
                <div className="space-y-2">
                  {newsletters.map(n => (
                    <div key={n.id} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{n.email}</span>
                      <span className="text-muted-foreground text-xs">{new Date(n.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── ABOUT ── */}
          <TabsContent value="about" className="space-y-6">
            {["history", "mission", "vision"].map(key => {
              const data = editingAbout[key];
              if (!data) return null;
              return (
                <div key={key} className="bg-card rounded-2xl p-6 shadow-soft">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading text-lg font-semibold text-foreground capitalize">{key}</h2>
                    <Button size="sm" onClick={() => saveAboutSection(key)} disabled={savingAbout === key} className="bg-primary text-primary-foreground">
                      <Save size={14} className="mr-1.5" /> {savingAbout === key ? "Saving..." : "Save"}
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div><Label>Title</Label><Input value={data.title} onChange={e => setEditingAbout(prev => ({ ...prev, [key]: { ...prev[key], title: e.target.value } }))} className="mt-1" /></div>
                    <div><Label>Content</Label><Textarea rows={key === "history" ? 6 : 3} value={data.content} onChange={e => setEditingAbout(prev => ({ ...prev, [key]: { ...prev[key], content: e.target.value } }))} className="mt-1" /></div>
                  </div>
                </div>
              );
            })}

            <div className="bg-card rounded-2xl p-6 shadow-soft">
              <h2 className="font-heading text-lg font-semibold text-foreground mb-4"><Users size={18} className="inline mr-2" />Leadership Team</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div><Label>Full Name</Label><Input placeholder="Bro. John Doe" value={newLeader.name} onChange={e => setNewLeader({...newLeader, name: e.target.value})} className="mt-1" /></div>
                <div><Label>Role / Position</Label><Input placeholder="e.g. President" value={newLeader.role} onChange={e => setNewLeader({...newLeader, role: e.target.value})} className="mt-1" /></div>
                <div><Label>Initials</Label><Input placeholder="e.g. JD" maxLength={3} value={newLeader.initials} onChange={e => setNewLeader({...newLeader, initials: e.target.value.toUpperCase()})} className="mt-1" /></div>
              </div>
              <Button onClick={addLeader} className="bg-primary text-primary-foreground"><Plus size={16} className="mr-1" /> Add Leader</Button>
            </div>

            <div className="space-y-3">
              {leaders.map(l => (
                <div key={l.id} className={`bg-card rounded-xl p-4 shadow-soft flex items-center justify-between ${!l.is_active ? "opacity-50" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-heading text-sm font-bold text-primary">{l.initials}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{l.name}</p>
                      <p className="text-muted-foreground text-sm">{l.role}</p>
                    </div>
                    {!l.is_active && <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">Hidden</span>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => toggleLeader(l.id, l.is_active)} title={l.is_active ? "Hide from site" : "Show on site"}>
                      {l.is_active ? <Eye size={16} className="text-secondary" /> : <EyeOff size={16} className="text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteLeader(l.id)} className="text-destructive"><Trash2 size={16} /></Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── SETTINGS ── */}
          <TabsContent value="settings" className="space-y-6">
            <div className="bg-card rounded-2xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-lg font-semibold text-foreground">Contact & Social Details</h2>
                <Button size="sm" onClick={saveSiteSettings} disabled={savingSettings} className="bg-primary text-primary-foreground">
                  <Save size={14} className="mr-1.5" /> {savingSettings ? "Saving..." : "Save All"}
                </Button>
              </div>
              <p className="text-muted-foreground text-sm mb-6">These details appear on the Contact page and in the website footer.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2"><Label>Address</Label><Input value={siteSettings.address || ""} onChange={e => setSiteSettings(prev => ({ ...prev, address: e.target.value }))} className="mt-1" placeholder="Full address" /></div>
                <div><Label>Phone Number</Label><Input value={siteSettings.phone || ""} onChange={e => setSiteSettings(prev => ({ ...prev, phone: e.target.value }))} className="mt-1" placeholder="+234 ..." /></div>
                <div><Label>Email Address</Label><Input value={siteSettings.email || ""} onChange={e => setSiteSettings(prev => ({ ...prev, email: e.target.value }))} className="mt-1" placeholder="email@example.com" /></div>
                <div><Label>Instagram URL</Label><Input value={siteSettings.instagram || ""} onChange={e => setSiteSettings(prev => ({ ...prev, instagram: e.target.value }))} className="mt-1" placeholder="https://instagram.com/..." /></div>
                <div><Label>Facebook URL</Label><Input value={siteSettings.facebook || ""} onChange={e => setSiteSettings(prev => ({ ...prev, facebook: e.target.value }))} className="mt-1" placeholder="https://facebook.com/..." /></div>
                <div><Label>YouTube URL</Label><Input value={siteSettings.youtube || ""} onChange={e => setSiteSettings(prev => ({ ...prev, youtube: e.target.value }))} className="mt-1" placeholder="https://youtube.com/..." /></div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;