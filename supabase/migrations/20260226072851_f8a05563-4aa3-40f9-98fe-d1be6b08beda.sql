
-- About page content sections (history, mission, vision)
CREATE TABLE public.about_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE,
  title text NOT NULL,
  content text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view about content" ON public.about_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage about content" ON public.about_content FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed default content
INSERT INTO public.about_content (section_key, title, content) VALUES
('history', 'Our History', 'The Redeemed Christian Fellowship at Yaba College of Technology was founded in the early 1990s by a group of passionate students who desired a deeper walk with God on campus. What began as a small prayer group in a classroom has grown into one of the most vibrant student fellowships in Lagos.

Over the decades, RCF YABATECH has raised leaders, ministers, and professionals who are making impact across Nigeria and beyond. The fellowship continues to be a beacon of light on campus, committed to the mandate of raising purpose-driven students for Christ.'),
('mission', 'Our Mission', 'To raise a generation of purpose-driven, Spirit-filled students who are rooted in God''s Word, equipped for service, and ready to transform their world through the power of the Gospel.'),
('vision', 'Our Vision', 'To be the foremost student Christian fellowship that produces leaders who impact their generation with the love of Christ, academic excellence, and moral integrity.');

-- Leaders table
CREATE TABLE public.leaders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  initials text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.leaders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active leaders" ON public.leaders FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage leaders" ON public.leaders FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed default leaders
INSERT INTO public.leaders (name, role, initials, sort_order) VALUES
('Pastor Adebayo', 'Fellowship Adviser', 'PA', 0),
('Bro. Tunde Ogunleye', 'President', 'TO', 1),
('Sis. Funmi Adeyemi', 'Vice President', 'FA', 2),
('Bro. Chidi Nwankwo', 'General Secretary', 'CN', 3),
('Sis. Blessing Eze', 'Prayer Secretary', 'BE', 4),
('Bro. Emeka Obi', 'Worship Lead', 'EO', 5);

-- Add updated_at trigger for about_content
CREATE TRIGGER update_about_content_updated_at
BEFORE UPDATE ON public.about_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
