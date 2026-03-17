import { useEffect, useRef, useState, useCallback, KeyboardEvent } from "react";
import Vapi from "@vapi-ai/web";
import {
  Mic, Phone, PhoneOff, X, Volume2,
  Loader2, MessageSquare, Send, ArrowLeft,
} from "lucide-react";

// ─── Vapi credentials (unchanged) ────────────────────────────────────────────
const VAPI_PUBLIC_KEY = "bc46bfe7-6c2e-4c9d-bc0a-e57feabe3150";
const ASSISTANT_ID    = "eea6e37c-56c8-4737-9b8b-bb6f8b38751b";
// ─────────────────────────────────────────────────────────────────────────────

// ─── Panel states ─────────────────────────────────────────────────────────────
// "closed"    → nothing visible (only FAB)
// "select"    → mode-selection popup
// "chat"      → text chat interface
// "voice"     → Vapi voice interface
type PanelMode = "closed" | "select" | "chat" | "voice";
type CallStatus  = "idle" | "connecting" | "active" | "ending";
type SpeakerRole = "user" | "assistant";

interface ChatMessage {
  id:        number;
  role:      SpeakerRole;
  text:      string;
  timestamp: Date;
}

/** Format a Date as "HH:MM" */
function fmtTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Shared chat-bubble renderer ─────────────────────────────────────────────
function Bubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div
      className="va-msg"
      style={{
        display:       "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems:    "flex-end",
        gap:           "7px",
      }}
    >
      {/* Avatar chip */}
      <div style={{
        width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
        background: isUser
          ? "linear-gradient(135deg,#1d4ed8,#3b82f6)"
          : "linear-gradient(135deg,#6d28d9,#8b5cf6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "9px", color: "#fff", fontWeight: 700,
      }}>
        {isUser ? "U" : "AI"}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth:    "73%",
        padding:     "8px 12px",
        borderRadius: isUser ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
        background:   isUser
          ? "linear-gradient(135deg,#1d4ed8 0%,#2563eb 100%)"
          : "rgba(255,255,255,0.055)",
        border:       isUser ? "none" : "1px solid rgba(255,255,255,0.065)",
        fontSize:    "12.5px",
        lineHeight:  1.55,
        color:       isUser ? "#eff6ff" : "#c3cfe2",
        wordBreak:   "break-word",
      }}>
        <div>{msg.text}</div>
        <div style={{
          fontSize: "10px", marginTop: "3px", textAlign: "right",
          color: isUser ? "rgba(219,234,254,0.5)" : "rgba(148,163,184,0.4)",
        }}>
          {fmtTime(msg.timestamp)}
        </div>
      </div>
    </div>
  );
}

// ─── Shared panel header ──────────────────────────────────────────────────────
function PanelHeader({
  title, subtitle, subtitleColor, showBack, onBack, onClose,
  avatarIcon, statusDot,
}: {
  title: string;
  subtitle?: string;
  subtitleColor?: string;
  showBack?: boolean;
  onBack?: () => void;
  onClose: () => void;
  avatarIcon: React.ReactNode;
  statusDot?: string; // CSS color
}) {
  return (
    <div style={{
      padding: "15px 16px",
      display: "flex", alignItems: "center", gap: "11px",
      background: "rgba(255,255,255,0.025)",
      borderBottom: "1px solid rgba(255,255,255,0.055)",
      flexShrink: 0,
    }}>
      {/* Back arrow */}
      {showBack && (
        <button
          onClick={onBack}
          title="Back"
          style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#94a3b8", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={13} />
        </button>
      )}

      {/* Avatar */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{
          width: 38, height: 38, borderRadius: "50%",
          background: "linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {avatarIcon}
        </div>
        {statusDot && (
          <span style={{
            position: "absolute", bottom: 1, right: 1,
            width: 9, height: 9, borderRadius: "50%",
            background: statusDot,
            border: "2px solid #0c0f1a",
            transition: "background 0.4s",
          }} />
        )}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "#f1f5f9", fontWeight: 600, fontSize: "13.5px", lineHeight: 1.2 }}>
          {title}
        </div>
        {subtitle && (
          <div style={{
            color: subtitleColor ?? "#4b5563",
            fontSize: "11.5px", marginTop: "2px",
            display: "flex", alignItems: "center", gap: "5px",
          }}>
            {subtitle}
          </div>
        )}
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        title="Close"
        style={{
          width: 30, height: 30, borderRadius: "50%",
          background: "rgba(239,68,68,0.12)",
          border: "1px solid rgba(239,68,68,0.22)",
          color: "#f87171", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.28)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.12)")}
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function VoiceAssistant() {
  // ── Vapi refs ───────────────────────────────────────────────────────────────
  const vapiRef             = useRef<Vapi | null>(null);
  const userDraftIdRef      = useRef<number | null>(null);
  const assistantDraftIdRef = useRef<number | null>(null);
  const msgIdRef            = useRef(0);

  // ── Scroll refs (one per mode) ──────────────────────────────────────────────
  const voiceScrollRef = useRef<HTMLDivElement>(null);
  const chatScrollRef  = useRef<HTMLDivElement>(null);

  // ── Panel / call state ──────────────────────────────────────────────────────
  const [panelMode,  setPanelMode]  = useState<PanelMode>("closed");
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [speaking,   setSpeaking]   = useState<SpeakerRole | null>(null);

  // ── Message stores ──────────────────────────────────────────────────────────
  const [voiceMessages, setVoiceMessages] = useState<ChatMessage[]>([]);
  const [chatMessages,  setChatMessages]  = useState<ChatMessage[]>([]);

  // ── Chat input state ────────────────────────────────────────────────────────
  const [chatInput,    setChatInput]    = useState("");
  const [chatLoading,  setChatLoading]  = useState(false);

  // ── Derived helpers ─────────────────────────────────────────────────────────
  const isCallLoading = callStatus === "connecting" || callStatus === "ending";
  const isCallActive  = callStatus === "active";

  const voiceStatusLabel =
    callStatus === "connecting"     ? "Connecting…"
    : speaking === "user"           ? "Listening…"
    : speaking === "assistant"      ? "Assistant speaking…"
    : isCallActive                  ? "Call active"
    : callStatus === "ending"       ? "Ending…"
    :                                 "Ready";

  const voiceStatusColor =
    speaking === "user"       ? "#60a5fa"
    : speaking === "assistant"? "#a78bfa"
    : isCallActive            ? "#22c55e"
    :                           "#4b5563";

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    voiceScrollRef.current?.scrollTo({ top: voiceScrollRef.current.scrollHeight, behavior: "smooth" });
  }, [voiceMessages]);

  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages]);

  // ── Vapi SDK init (unchanged logic) ─────────────────────────────────────────
  useEffect(() => {
    vapiRef.current = new Vapi(VAPI_PUBLIC_KEY);
    const vapi = vapiRef.current;

    vapi.on("call-start", () => {
      setCallStatus("active");
      setSpeaking(null);
      userDraftIdRef.current      = null;
      assistantDraftIdRef.current = null;
    });

    vapi.on("call-end", () => {
      setCallStatus("idle");
      setSpeaking(null);
      userDraftIdRef.current      = null;
      assistantDraftIdRef.current = null;
      // Return to mode-select after call ends naturally
      setTimeout(() => setPanelMode(prev => prev === "voice" ? "select" : prev), 900);
    });

    vapi.on("error", (err: unknown) => {
      console.error("[VoiceAssistant] error:", err);
      setCallStatus("idle");
      setSpeaking(null);
    });

    vapi.on("speech-start", () => setSpeaking("user"));
    vapi.on("speech-end",   () => setSpeaking(null));

    // Buffered transcript — same fix as before (no fragmented bubbles)
    vapi.on("message", (msg: {
      type:            string;
      transcriptType?: "partial" | "final";
      role?:           SpeakerRole;
      transcript?:     string;
    }) => {
      if (msg.type !== "transcript") return;
      if (!msg.role || !msg.transcript) return;

      const role     = msg.role;
      const text     = msg.transcript.trim();
      const isFinal  = msg.transcriptType === "final";
      const draftRef = role === "user" ? userDraftIdRef : assistantDraftIdRef;

      if (role === "assistant") setSpeaking("assistant");

      if (draftRef.current === null) {
        // Create a new bubble
        const newId = ++msgIdRef.current;
        draftRef.current = newId;
        setVoiceMessages(prev => [...prev, { id: newId, role, text, timestamp: new Date() }]);
      } else {
        // Update existing bubble in place
        const targetId = draftRef.current;
        setVoiceMessages(prev => prev.map(m => m.id === targetId ? { ...m, text } : m));
      }

      if (isFinal) {
        draftRef.current = null;
        if (role === "assistant") setSpeaking(null);
      }
    });

    return () => { try { vapi.stop(); } catch (_) { /* ignore */ } };
  }, []);

  // ── Start Vapi voice call ────────────────────────────────────────────────────
  const startCall = useCallback(async () => {
    const vapi = vapiRef.current;
    if (!vapi || callStatus !== "idle") return;
    setVoiceMessages([]);
    userDraftIdRef.current      = null;
    assistantDraftIdRef.current = null;
    setCallStatus("connecting");
    try {
      await vapi.start(ASSISTANT_ID);
    } catch (err) {
      console.error("[VoiceAssistant] start failed:", err);
      setCallStatus("idle");
      setPanelMode("select");
    }
  }, [callStatus]);

  // ── End Vapi voice call ──────────────────────────────────────────────────────
  const endCall = useCallback(() => {
    const vapi = vapiRef.current;
    if (!vapi) return;
    setCallStatus("ending");
    vapi.stop();
  }, []);

  // ── Open voice mode ──────────────────────────────────────────────────────────
  const openVoiceMode = useCallback(() => {
    setPanelMode("voice");
    startCall();
  }, [startCall]);

  // ── End call + return to select ──────────────────────────────────────────────
  const handleEndCall = useCallback(() => {
    endCall();
    // setPanelMode to "select" happens in the call-end handler after 900ms
  }, [endCall]);

  // ═══════════════════════════════════════════════════════════════════════════

  // ── OpenAI credentials ───────────────────────────────────────────────────────
  //   const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  // ── Groq credentials (free) ─────────────────────────────────────────────────
  // .env file mein add karo: VITE_GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
  const OPENAI_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
  const OPENAI_MODEL   = "llama-3.3-70b-versatile";

  // ── System prompt — Alex, CartNest AI Support ────────────────────────────────
  const SYSTEM_PROMPT = `You are Alex, an intelligent and friendly AI support assistant for CartNest — a modern e-commerce platform.

Your role is to help users with:
- Browsing and finding products on the website
- Creating an account and logging in
- Placing, tracking, and managing orders
- Returns, refunds, and exchanges
- Payment methods and billing questions
- Shipping options and delivery timelines
- Account settings and profile management
- Promo codes, discounts, and offers
- General website navigation and support

CartNest key details you should know:
- Free standard shipping on orders over $50
- Express shipping (1–2 days) for $9.99; Next-day for $19.99
- 30-day return policy on most items
- Accepted payments: Visa, Mastercard, Amex, PayPal, Apple Pay, Google Pay
- Support email: support@cartnest.com | Mon–Fri 9 AM–6 PM EST

Personality guidelines:
- Be warm, helpful, and concise — never robotic
- Use occasional relevant emojis to keep the tone friendly (not excessive)
- If you don't know something specific about a user's order, ask for their order number or direct them to My Account
- Keep responses focused; avoid unnecessary filler text
- If a question is clearly outside CartNest support scope, gently say so and redirect`;

  // ── Conversation history ref ─────────────────────────────────────────────────
  // Stored as a ref (not state) so it doesn't trigger re-renders and is always
  // up-to-date inside the sendChatMessage closure.
  // Shape matches OpenAI's messages array exactly.
  const convHistoryRef = useRef<Array<{ role: "system" | "user" | "assistant"; content: string }>>([
    { role: "system", content: SYSTEM_PROMPT },
  ]);

  // Reset history when the user navigates away from chat, so each new session
  // starts fresh with only the system prompt.
  useEffect(() => {
    if (panelMode !== "chat") {
      convHistoryRef.current = [{ role: "system", content: SYSTEM_PROMPT }];
    }
  // SYSTEM_PROMPT is a constant — safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelMode]);

  // ── sendChatMessage — calls OpenAI, maintains history ───────────────────────
  const sendChatMessage = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;

    // 1. Show user bubble immediately (optimistic)
    setChatMessages(prev => [
      ...prev,
      { id: ++msgIdRef.current, role: "user", text, timestamp: new Date() },
    ]);
    setChatInput("");
    setChatLoading(true);

    // 2. Append to history before sending (so the model sees it in context)
    convHistoryRef.current.push({ role: "user", content: text });

    try {
      // 3. POST to OpenAI Chat Completions API
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model:       OPENAI_MODEL,
          messages:    convHistoryRef.current,  // full history for context
          max_tokens:  600,                     // keep replies concise
          temperature: 0.7,                     // natural, slightly creative
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: { message: response.statusText } }));
        throw new Error(err?.error?.message ?? `OpenAI error ${response.status}`);
      }

      // 4. Extract the reply
      const data = await response.json();
      const reply: string =
        data?.choices?.[0]?.message?.content?.trim() ??
        "I couldn't generate a response. Please try again.";

      // 5. Append assistant reply to history (maintains context for next turn)
      convHistoryRef.current.push({ role: "assistant", content: reply });

      // 6. Render assistant bubble
      setChatMessages(prev => [
        ...prev,
        { id: ++msgIdRef.current, role: "assistant", text: reply, timestamp: new Date() },
      ]);

    } catch (err) {
      console.error("[VoiceAssistant] OpenAI chat error:", err);
      // Don't pollute history with failed turns
      convHistoryRef.current.pop(); // remove the user message we added
      setChatMessages(prev => [
        ...prev,
        {
          id:        ++msgIdRef.current,
          role:      "assistant",
          text:      "I'm having trouble connecting right now. Please check your connection and try again. 🔄",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading]);

  const handleChatKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  // ── Close everything ─────────────────────────────────────────────────────────
  const closePanel = useCallback(() => {
    if (isCallActive || isCallLoading) endCall();
    setPanelMode("closed");
  }, [isCallActive, isCallLoading, endCall]);

  // ── FAB click ────────────────────────────────────────────────────────────────
  const handleFab = () => {
    if (panelMode === "closed") setPanelMode("select");
    else closePanel();
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <>
      {/* ─── Scoped styles ───────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

        @keyframes va-up   { from{opacity:0;transform:translateY(14px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes va-in   { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes va-ring { 0%{transform:scale(1);opacity:.55} 100%{transform:scale(2.1);opacity:0} }
        @keyframes va-bar  { 0%,100%{height:4px} 50%{height:18px} }
        @keyframes va-dot  { 0%,80%,100%{transform:scaleY(.35)} 40%{transform:scaleY(1)} }
        @keyframes spin    { to{transform:rotate(360deg)} }

        .va-panel { animation: va-up 0.28s cubic-bezier(0.34,1.56,0.64,1) both; }
        .va-msg   { animation: va-in 0.22s ease both; }

        .va-bar {
          width:3px; border-radius:2px; background:currentColor;
          animation:va-bar .85s ease-in-out infinite;
        }
        .va-bar:nth-child(2){animation-delay:.10s}
        .va-bar:nth-child(3){animation-delay:.20s}
        .va-bar:nth-child(4){animation-delay:.10s}
        .va-bar:nth-child(5){animation-delay:.05s}

        .va-dots span {
          display:inline-block; width:4px; height:4px; border-radius:50%;
          background:currentColor; margin:0 1.5px;
          animation:va-dot 1.2s ease-in-out infinite;
        }
        .va-dots span:nth-child(2){animation-delay:.15s}
        .va-dots span:nth-child(3){animation-delay:.30s}

        .va-scroll::-webkit-scrollbar{width:3px}
        .va-scroll::-webkit-scrollbar-track{background:transparent}
        .va-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:9999px}

        .va-mode-card:hover { background: rgba(255,255,255,0.07) !important; transform: translateY(-1px); }
        .va-send:hover      { filter: brightness(1.12); }
        .va-textarea:focus  { outline: none; }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════════════
          STATE 1 — Mode Selection Popup
      ═══════════════════════════════════════════════════════════════════ */}
      {panelMode === "select" && (
        <div className="va-panel" style={panelWrap}>
          <PanelHeader
            title="AI Assistant"
            subtitle="How would you like to connect?"
            avatarIcon={<Volume2 size={17} color="#fff" />}
            onClose={closePanel}
          />

          <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Chat option */}
            <button
              className="va-mode-card"
              onClick={() => setPanelMode("chat")}
              style={modeCard}
            >
              <div style={modeIcon("#3b82f6")}>
                <MessageSquare size={20} color="#3b82f6" />
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ color: "#f1f5f9", fontWeight: 600, fontSize: "13.5px" }}>Chat with AI</div>
                <div style={{ color: "#64748b", fontSize: "11.5px", marginTop: "2px" }}>
                  Type your questions and get instant replies
                </div>
              </div>
              <span style={{ color: "#334155", fontSize: "16px" }}>›</span>
            </button>

            {/* Voice option */}
            <button
              className="va-mode-card"
              onClick={openVoiceMode}
              style={modeCard}
            >
              <div style={modeIcon("#8b5cf6")}>
                <Mic size={20} color="#8b5cf6" />
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ color: "#f1f5f9", fontWeight: 600, fontSize: "13.5px" }}>Voice Call with AI</div>
                <div style={{ color: "#64748b", fontSize: "11.5px", marginTop: "2px" }}>
                  Speak naturally and get a voice response
                </div>
              </div>
              <span style={{ color: "#334155", fontSize: "16px" }}>›</span>
            </button>
          </div>

          {/* Footer note */}
          <div style={{
            padding: "0 16px 16px",
            textAlign: "center",
            color: "#334155",
            fontSize: "11px",
          }}>
            Powered by AI · Available 24/7
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          STATE 2 — Chat Interface
      ═══════════════════════════════════════════════════════════════════ */}
      {panelMode === "chat" && (
        <div className="va-panel" style={panelWrap}>
          <PanelHeader
            title="Chat with AI"
            subtitle="Online · Replies instantly"
            subtitleColor="#22c55e"
            showBack
            onBack={() => setPanelMode("select")}
            onClose={closePanel}
            avatarIcon={<MessageSquare size={17} color="#fff" />}
            statusDot="#22c55e"
          />

          {/* Message area */}
          <div
            ref={chatScrollRef}
            className="va-scroll"
            style={scrollArea}
          >
            {chatMessages.length === 0 ? (
              <EmptyState icon={<MessageSquare size={19} color="#3b82f6" />} text="Send a message to start the conversation." />
            ) : (
              chatMessages.map(m => <Bubble key={m.id} msg={m} />)
            )}

            {/* Typing indicator while AI is fetching */}
            {chatLoading && (
              <div className="va-msg" style={{ display: "flex", alignItems: "flex-end", gap: "7px" }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg,#6d28d9,#8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "9px", color: "#fff", fontWeight: 700,
                }}>AI</div>
                <div style={{
                  padding: "10px 14px",
                  borderRadius: "4px 14px 14px 14px",
                  background: "rgba(255,255,255,0.055)",
                  border: "1px solid rgba(255,255,255,0.065)",
                  color: "#94a3b8",
                }}>
                  <span className="va-dots"><span/><span/><span/></span>
                </div>
              </div>
            )}
          </div>

          {/* Input bar */}
          <div style={{
            padding: "10px 12px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            display: "flex", alignItems: "flex-end", gap: "8px",
            flexShrink: 0,
          }}>
            <textarea
              className="va-textarea"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={handleChatKey}
              placeholder="Type a message… (Enter to send)"
              rows={1}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "9px 12px",
                color: "#f1f5f9",
                fontSize: "12.5px",
                fontFamily: "'DM Sans', sans-serif",
                resize: "none",
                lineHeight: 1.5,
                maxHeight: "80px",
                overflowY: "auto",
              }}
            />
            <button
              className="va-send"
              onClick={sendChatMessage}
              disabled={!chatInput.trim() || chatLoading}
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background:
                  chatInput.trim() && !chatLoading
                    ? "linear-gradient(135deg,#1d4ed8,#3b82f6)"
                    : "rgba(255,255,255,0.06)",
                border: "none",
                color: chatInput.trim() && !chatLoading ? "#fff" : "#475569",
                cursor: chatInput.trim() && !chatLoading ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.2s",
                boxShadow: chatInput.trim() ? "0 3px 10px rgba(37,99,235,0.35)" : "none",
              }}
            >
              {chatLoading
                ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                : <Send size={15} />}
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          STATE 3 — Voice Interface (Vapi)
      ═══════════════════════════════════════════════════════════════════ */}
      {panelMode === "voice" && (
        <div className="va-panel" style={panelWrap}>
          <PanelHeader
            title="Voice Call with AI"
            subtitle={
              (speaking === "user" || speaking === "assistant")
                ? undefined   // rendered separately below with dots
                : voiceStatusLabel
            }
            subtitleColor={voiceStatusColor}
            showBack={!isCallActive && !isCallLoading}
            onBack={() => setPanelMode("select")}
            onClose={() => {
              if (isCallActive || isCallLoading) handleEndCall();
              setPanelMode("closed");
            }}
            avatarIcon={<Mic size={17} color="#fff" />}
            statusDot={isCallActive ? "#22c55e" : "#4b5563"}
          />

          {/* Live speaking indicator strip */}
          {(speaking || isCallLoading) && (
            <div style={{
              padding: "8px 18px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
              minHeight: "34px",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              color:
                speaking === "assistant" ? "#a78bfa"
                : speaking === "user"    ? "#60a5fa"
                :                          "rgba(255,255,255,0.12)",
              transition: "color 0.35s",
              flexShrink: 0,
            }}>
              {isCallLoading
                ? <Loader2 size={14} color="#64748b" style={{ animation: "spin 1s linear infinite" }} />
                : [0,1,2,3,4].map(i => (
                    <div key={i} className="va-bar" style={{
                      height: speaking ? undefined : "4px",
                      animationPlayState: speaking ? "running" : "paused",
                      animationDelay: `${i * 0.1}s`,
                    }} />
                  ))
              }
              <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "6px" }}>
                {isCallLoading ? voiceStatusLabel : speaking === "user" ? "Listening…" : "Assistant speaking…"}
              </span>
            </div>
          )}

          {/* Voice transcript */}
          <div ref={voiceScrollRef} className="va-scroll" style={scrollArea}>
            {voiceMessages.length === 0 ? (
              <EmptyState
                icon={<Mic size={19} color="#8b5cf6" />}
                text={isCallLoading ? "Starting your session…" : "Speak — the conversation will appear here."}
              />
            ) : (
              voiceMessages.map(m => <Bubble key={m.id} msg={m} />)
            )}
          </div>

          {/* End Call footer */}
          <div style={{
            padding: "11px 16px",
            borderTop: "1px solid rgba(255,255,255,0.045)",
            display: "flex", justifyContent: "center",
            flexShrink: 0,
          }}>
            <button
              onClick={handleEndCall}
              disabled={!isCallActive}
              style={{
                display: "flex", alignItems: "center", gap: "7px",
                padding: "9px 24px",
                borderRadius: "9999px",
                border: "none",
                background: isCallActive
                  ? "linear-gradient(135deg,#dc2626,#ef4444)"
                  : "rgba(255,255,255,0.04)",
                color:      isCallActive ? "#fff" : "#374151",
                fontSize:   "12.5px",
                fontWeight: 600,
                cursor:     isCallActive ? "pointer" : "not-allowed",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow:  isCallActive ? "0 4px 16px rgba(239,68,68,0.32)" : "none",
                transition: "all 0.22s",
              }}
              onMouseEnter={e => { if (isCallActive) (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.12)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = ""; }}
            >
              <PhoneOff size={14} />
              End Call
            </button>
          </div>
        </div>
      )}

      {/* ─── Floating Action Button (always visible) ─────────────────────── */}
      <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999 }}>
        {/* Pulse ring while voice call is active */}
        {isCallActive && (
          <span style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: "rgba(59,130,246,0.38)",
            animation: "va-ring 1.7s ease-out infinite",
            pointerEvents: "none",
          }} />
        )}

        <button
          onClick={handleFab}
          disabled={isCallLoading}
          aria-label="AI Assistant"
          title="AI Assistant"
          style={{
            width: 56, height: 56, borderRadius: "50%", border: "none",
            cursor: isCallLoading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            background:
              isCallActive
                ? "linear-gradient(135deg,#1d4ed8,#3b82f6)"
                : panelMode !== "closed"
                  ? "linear-gradient(135deg,#4f46e5,#7c3aed)"
                  : "linear-gradient(135deg,#1e3a8a,#2563eb)",
            boxShadow: "0 6px 22px rgba(37,99,235,0.42)",
            transition: "background 0.3s, transform 0.15s",
            outline: "none",
          }}
          onMouseEnter={e => { if (!isCallLoading) (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
        >
          {isCallLoading  ? <Loader2 size={22} color="#fff" style={{ animation: "spin 1s linear infinite" }} />
          : isCallActive  ? <Phone   size={22} color="#fff" />
          : panelMode === "chat"  ? <MessageSquare size={22} color="#fff" />
          : panelMode !== "closed" ? <X      size={22} color="#fff" />
          :                          <Mic    size={22} color="#fff" />}
        </button>
      </div>
    </>
  );
}

// ─── Shared style helpers ─────────────────────────────────────────────────────

/** Shared panel wrapper style */
const panelWrap: React.CSSProperties = {
  position:    "fixed",
  bottom:      "92px",
  right:       "20px",
  width:       "clamp(300px, 90vw, 375px)",
  maxHeight:   "clamp(420px, 72vh, 540px)",
  display:     "flex",
  flexDirection: "column",
  borderRadius: "22px",
  overflow:    "hidden",
  fontFamily:  "'DM Sans', sans-serif",
  background:  "linear-gradient(160deg, #0c0f1a 0%, #111827 100%)",
  border:      "1px solid rgba(255,255,255,0.07)",
  boxShadow:   "0 28px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)",
  zIndex:      9998,
};

/** Shared scrollable message area */
const scrollArea: React.CSSProperties = {
  flex:          1,
  overflowY:     "auto",
  padding:       "14px 12px",
  display:       "flex",
  flexDirection: "column",
  gap:           "10px",
};

/** Mode selection card base style */
const modeCard: React.CSSProperties = {
  display:       "flex",
  alignItems:    "center",
  gap:           "14px",
  padding:       "14px 16px",
  borderRadius:  "14px",
  background:    "rgba(255,255,255,0.04)",
  border:        "1px solid rgba(255,255,255,0.07)",
  cursor:        "pointer",
  transition:    "background 0.2s, transform 0.15s",
  fontFamily:    "'DM Sans', sans-serif",
  width:         "100%",
};

/** Mode icon container */
function modeIcon(color: string): React.CSSProperties {
  return {
    width: 44, height: 44, borderRadius: "12px",
    background: `${color}18`,
    border: `1px solid ${color}33`,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  };
}

/** Empty state placeholder */
function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px", gap: "10px", textAlign: "center",
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: "50%",
        background: "rgba(59,130,246,0.08)",
        border: "1px solid rgba(59,130,246,0.18)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <p style={{ fontSize: "12.5px", lineHeight: 1.55, color: "#475569", margin: 0 }}>
        {text}
      </p>
    </div>
  );
}