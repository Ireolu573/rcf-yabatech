
-- Contact messages constraints
ALTER TABLE public.contact_messages 
ADD CONSTRAINT contact_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
ADD CONSTRAINT contact_message_length CHECK (char_length(message) BETWEEN 1 AND 2000),
ADD CONSTRAINT contact_name_length CHECK (char_length(name) BETWEEN 1 AND 100),
ADD CONSTRAINT contact_email_length CHECK (char_length(email) <= 255);

-- Testimonies constraints
ALTER TABLE public.testimonies
ADD CONSTRAINT testimony_name_length CHECK (char_length(name) BETWEEN 1 AND 100),
ADD CONSTRAINT testimony_dept_length CHECK (char_length(department) BETWEEN 1 AND 100),
ADD CONSTRAINT testimony_level_length CHECK (char_length(level) BETWEEN 1 AND 20),
ADD CONSTRAINT testimony_message_length CHECK (char_length(message) BETWEEN 1 AND 5000);

-- Newsletter constraints
ALTER TABLE public.newsletter_subscriptions
ADD CONSTRAINT newsletter_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
ADD CONSTRAINT newsletter_email_length CHECK (char_length(email) <= 255);
