import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Truck } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy el asistente de GP Logistics. ¿En qué te puedo ayudar hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Llamamos a nuestro propio backend en Vercel, no a NVIDIA directamente.
      // Así protegemos la API Key.
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      if (!response.ok) {
        throw new Error('Error en el servidor');
      }

      const data = await response.json();
      const aiMessage = data.choices[0].message;
      setMessages([...newMessages, aiMessage]);

    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: 'Lo siento, tuve un problema al procesar tu solicitud. Por favor contacta a contacto@grupoponcelogistics.com' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button 
          className="chatbot-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir chat"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Ventana de chat */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={18} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>GP Asistente</span>
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
            {isLoading && (
              <div className="chat-bubble-container assistant">
                <div className="chat-bubble" style={{ opacity: 0.7 }}>
                  Escribiendo...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-area" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Escribe tu duda aquí..."
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
