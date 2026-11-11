
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../App.css";
const API_URL = "http://127.0.0.1:5000";

const initialMessages = [
  {
    role: "assistant",
    content:
      "Hi! I'm GroundPulse Assistant 🌊 Ask me anything about groundwater, rainfall, environmental trends or your predictions in Varthur."
  }
];

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [loading, setLoading] = useState(false);
  const [historicalData, setHistoricalData] = useState([]);
  const [dataStatus, setDataStatus] = useState("loading");

  const messagesEndRef = useRef(null);

  // Fetch the existing historical data for chatbot context.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/historical-data`
        );

        if (!response.ok) {
          throw new Error("Could not fetch historical data");
        }

        const result = await response.json();

        setHistoricalData(Array.isArray(result) ? result : []);
        setDataStatus("loaded");
      } catch (error) {
        console.error("Chatbot data error:", error);
        setDataStatus("unavailable");
      }
    };

    fetchData();
  }, []);

  // Prepare a compact summary instead of sending all 353 records.
  const context = useMemo(() => {
    const validRows = historicalData
      .map((row) => ({
        date: new Date(row.date),
        groundwater: Number(row.groundwater),
        rainfall: Number(row.rainfall),
        temperature: Number(row.temperature),
        soil: Number(row.soil),
        radiation: Number(row.radiation)
      }))
      .filter(
        (row) =>
          !Number.isNaN(row.date.getTime()) &&
          Number.isFinite(row.groundwater)
      )
      .sort((a, b) => a.date - b.date);

    if (!validRows.length) {
      return {
        location: "Varthur, Bengaluru",
        dataAvailability: "Historical data unavailable"
      };
    }

    const average = (key) => {
      const values = validRows
        .map((row) => row[key])
        .filter(Number.isFinite);

      if (!values.length) return null;

      return Number(
        (values.reduce((sum, value) => sum + value, 0) /
          values.length).toFixed(3)
      );
    };

    const latest = validRows[validRows.length - 1];

    return {
      location: "Varthur, Bengaluru, Karnataka, India",
      observations: validRows.length,
      firstDate: validRows[0].date.toISOString().slice(0, 10),
      lastDate: latest.date.toISOString().slice(0, 10),

      latestObservation: {
        date: latest.date.toISOString().slice(0, 10),
        groundwater: latest.groundwater,
        rainfall: Number.isFinite(latest.rainfall)
          ? latest.rainfall
          : null,
        temperature: Number.isFinite(latest.temperature)
          ? latest.temperature
          : null,
        soilMoisture: Number.isFinite(latest.soil)
          ? latest.soil
          : null,
        solarRadiation: Number.isFinite(latest.radiation)
          ? latest.radiation
          : null
      },

      averages: {
        groundwater: average("groundwater"),
        rainfall: average("rainfall"),
        temperature: average("temperature"),
        soilMoisture: average("soil"),
        solarRadiation: average("radiation")
      }
    };
  }, [historicalData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, loading]);

  const sendMessage = async (text = input) => {
    const question = text.trim();

    if (!question || loading) return;

    const updatedMessages = [
      ...messages,
      {
        role: "user",
        content: question
      }
    ];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: updatedMessages.slice(-12),
          context
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Chat request failed");
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: result.reply
        }
      ]);
    } catch (error) {
      console.error("Chatbot request error:", error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            error.message ||
            "Sorry, something went wrong. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  const suggestions = [
    "What affects groundwater levels?",
    "Explain the role of rainfall.",
    "Summarize my historical data."
  ];

  return (
    <div className="gp-chatbot">

      {/* Floating button */}
      {!isOpen && (
        <button
          className="gp-chat-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Open GroundPulse Assistant"
        >
          <span className="gp-chat-icon">✦</span>
          <span className="gp-chat-toggle-label">
            Ask GroundPulse
          </span>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <section className="gp-chat-window">

          <header className="gp-chat-header">
            <div className="gp-chat-brand">
              <div className="gp-chat-avatar">✦</div>

              <div>
                <h3>GroundPulse Assistant</h3>
                <span>
                  <i className="gp-online-dot"></i>
                  AI-powered groundwater assistant
                </span>
              </div>
            </div>

            <button
              className="gp-chat-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              ×
            </button>
          </header>

          <div className="gp-chat-messages">

            <div className="gp-data-status">
              {dataStatus === "loaded"
                ? "Historical dataset connected"
                : dataStatus === "loading"
                ? "Connecting to historical data..."
                : "Historical data currently unavailable"}
            </div>

            {messages.map((message, index) => (
              <div
                key={index}
                className={`gp-message ${
                  message.role === "user"
                    ? "gp-user-message"
                    : "gp-ai-message"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="gp-message-avatar">✦</div>
                )}

                <div className="gp-message-content">
  {message.role === "assistant" ? (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {message.content}
    </ReactMarkdown>
  ) : (
    message.content
  )}
</div>
              </div>
            ))}

            {loading && (
              <div className="gp-message gp-ai-message">
                <div className="gp-message-avatar">✦</div>
                <div className="gp-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="gp-suggestions">
              <span>TRY ASKING</span>

              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  disabled={loading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <form
            className="gp-chat-input-area"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about groundwater..."
              disabled={loading}
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              ➤
            </button>
          </form>

          <div className="gp-chat-footer">
            Powered by Groq AI · GroundPulse
          </div>

        </section>
      )}
    </div>
  );
}

export default Chatbot;
