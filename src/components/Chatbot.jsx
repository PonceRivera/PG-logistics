import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Truck } from 'lucide-react';

const QUICK_OPTIONS = [
  { label: '📦 Rastrear envío', message: 'Quiero rastrear mi envío' },
  { label: '💰 Cotizar flete', message: '¿Cómo puedo solicitar una cotización?' },
  { label: '🚛 Tipos de unidad', message: '¿Qué tipos de camiones manejan?' },
  { label: '📧 Contacto', message: '¿Cómo puedo contactarlos?' },
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy el asistente de servicio al cliente de GP Logistics. Puedo ayudarte a rastrear tu envío, resolver dudas o solicitar una cotización. ¿En qué te ayudo?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickOptions, setShowQuickOptions] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async (e, overrideText) => {
    if (e) e.preventDefault();
    const text = overrideText || input.trim();
    if (!text || isLoading) return;

    const userMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setShowQuickOptions(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      if (!response.ok) throw new Error('Error en el servidor');

      const data = await response.json();
      const aiMessage = data.choices[0].message;
      setMessages([...newMessages, aiMessage]);

    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: 'Lo siento, tuve un problema técnico. Por favor contacta directamente a contacto@grupoponcelogistics.com y te atenderemos de inmediato.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button 
          className="chatbot-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir chat de servicio al cliente"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={18} />
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>GP Asistente</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Servicio al Cliente</span>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`chat-bubble-container ${m.role === 'user' ? 'user' : 'assistant'}`}>
                <div className="chat-bubble">
                  {m.content}
                </div>
              </div>
            ))}

            {showQuickOptions && messages.length === 1 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                {QUICK_OPTIONS.map((opt, i) => (
                  <button 
                    key={i}
                    onClick={() => sendMessage(null, opt.message)}
                    style={{
                      background: 'var(--bg-main)',
                      border: '1px solid var(--border)',
                      borderRadius: '16px',
                      padding: '0.35rem 0.7rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseOver={e => e.target.style.borderColor = 'var(--primary)'}
                    onMouseOut={e => e.target.style.borderColor = 'var(--border)'}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="chat-bubble-container assistant">
                <div className="chat-bubble" style={{ opacity: 0.7 }}>
                  Consultando...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-area" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Escribe tu folio o pregunta..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" disabled={!input.trim() || isLoading}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
