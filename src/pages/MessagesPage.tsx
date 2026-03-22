import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Headphones, Calendar, User, ChevronDown, ChevronUp } from "lucide-react";

interface Message {
  id: string;
  title: string;
  speaker: string;
  service_date: string;
  summary: string | null;
  audio_url: string | null;
  notes_url: string | null;
}

const MessagesPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("service_date", { ascending: false });

      if (!error && data) setMessages(data);
      setLoading(false);
    };

    fetchMessages();
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded(prev => (prev === id ? null : id));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-NG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-1">Messages</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Audio, notes, and summaries from our services.
      </p>

      {loading && (
        <p className="text-muted-foreground text-sm">Loading messages...</p>
      )}

      {!loading && messages.length === 0 && (
        <p className="text-muted-foreground text-sm">No messages uploaded yet.</p>
      )}

      <div className="flex flex-col gap-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="border rounded-xl p-5 bg-card shadow-sm transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold leading-snug">{msg.title}</h2>
                <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {msg.speaker}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(msg.service_date)}
                  </span>
                </div>
              </div>

              {msg.summary && (
                <button
                  onClick={() => toggleExpand(msg.id)}
                  className="text-muted-foreground hover:text-foreground transition mt-1 shrink-0"
                  aria-label="Toggle summary"
                >
                  {expanded === msg.id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>

            {/* Summary */}
            {msg.summary && expanded === msg.id && (
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed border-t pt-3">
                {msg.summary}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-4">
              {msg.audio_url && (
                <a
                  href={msg.audio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
                >
                  <Headphones className="w-4 h-4" />
                  Listen
                </a>
              )}
              {msg.notes_url && (
                <a
                  href={msg.notes_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border hover:bg-muted transition"
                >
                  <FileText className="w-4 h-4" />
                  Notes
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessagesPage;
