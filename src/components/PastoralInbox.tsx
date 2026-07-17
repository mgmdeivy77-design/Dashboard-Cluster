import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Heart, Sparkles, Send, CheckCircle2, Clock, MessageSquare, ShieldCheck } from 'lucide-react';

interface PastoralInboxProps {
  currentUserId: string;
  users: User[];
}

export function PastoralInbox({ currentUserId, users }: PastoralInboxProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<Record<string, string>>({});

  const loadMessages = () => {
    try {
      const saved = localStorage.getItem('compas_pastoral_messages');
      if (saved) {
        const allMsgs = JSON.parse(saved);
        // Filter messages sent to the current user
        const myMsgs = allMsgs.filter((msg: any) => msg.receiverId === currentUserId);
        setMessages(myMsgs);
      } else {
        setMessages([]);
      }
    } catch (e) {
      console.error('Error loading pastoral messages:', e);
    }
  };

  useEffect(() => {
    loadMessages();

    // Listen to updates (e.g. if Pastor sends a new message while user is logged in)
    window.addEventListener('compas_pastoral_messages_updated', loadMessages);
    return () => {
      window.removeEventListener('compas_pastoral_messages_updated', loadMessages);
    };
  }, [currentUserId]);

  const handleMarkAsRead = (msgId: string) => {
    try {
      const saved = localStorage.getItem('compas_pastoral_messages');
      if (saved) {
        const allMsgs = JSON.parse(saved);
        const updated = allMsgs.map((m: any) => {
          if (m.id === msgId) {
            return { ...m, isRead: true };
          }
          return m;
        });
        localStorage.setItem('compas_pastoral_messages', JSON.stringify(updated));
        
        // Dispatch update event
        window.dispatchEvent(new Event('compas_pastoral_messages_updated'));
        loadMessages();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendReply = (msgId: string) => {
    const text = replyInputs[msgId]?.trim();
    if (!text) return;

    try {
      const saved = localStorage.getItem('compas_pastoral_messages');
      if (saved) {
        const allMsgs = JSON.parse(saved);
        const updated = allMsgs.map((m: any) => {
          if (m.id === msgId) {
            return { ...m, isRead: true, replyText: text, replyTimestamp: new Date().toISOString() };
          }
          return m;
        });
        localStorage.setItem('compas_pastoral_messages', JSON.stringify(updated));

        // Log reply into activities log as well
        const actSaved = localStorage.getItem('compas_activities');
        const acts = actSaved ? JSON.parse(actSaved) : [];
        const me = users.find(u => u.id === currentUserId);
        const newAct = {
          id: `act-pastoral-reply-${Date.now()}`,
          userId: currentUserId,
          userName: me?.name || 'Colaborador',
          userColor: me?.color || '#4f46e5',
          action: 'respondió al aliento pastoral enviado por',
          targetType: 'user',
          targetName: 'Pastor CDI',
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('compas_activities', JSON.stringify([newAct, ...acts]));

        // Dispatch events
        window.dispatchEvent(new Event('compas_pastoral_messages_updated'));
        window.dispatchEvent(new Event('compas_activities_updated'));

        setReplyInputs(prev => ({ ...prev, [msgId]: '' }));
        setSuccessMsg(prev => ({ ...prev, [msgId]: '¡Respuesta de agradecimiento enviada con éxito al Pastor!' }));
        loadMessages();

        setTimeout(() => {
          setSuccessMsg(prev => {
            const copy = { ...prev };
            delete copy[msgId];
            return copy;
          });
        }, 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="bg-linear-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center">
        <Heart className="w-9 h-9 mx-auto text-indigo-500 animate-pulse mb-3" />
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
          ⛪ Buzón de Aliento Pastoral
        </h3>
        <h4 className="text-sm font-black text-slate-800 dark:text-white mt-1">Sin mensajes pastorales aún</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
          Tu Pastor CDI usará el <strong className="text-slate-700 dark:text-slate-300 font-bold">"Buzón de Consejería"</strong> de su portal para enviarte de manera confidencial palabras de soporte, consejo ministerial, pautas de salud espiritual o instrucciones directas de balance de vida.
        </p>
      </div>
    );
  }

  // Count unread messages
  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500 animate-pulse shrink-0" />
          <div>
            <h3 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span>Buzón de Aliento Pastoral & Consejería</span>
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full animate-bounce">
                  {unreadCount} NUEVO{unreadCount > 1 ? 'S' : ''}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Palabras de soporte emocional, consejo ministerial y acompañamiento de tu Pastor.
            </p>
          </div>
        </div>
        <div title="Canal Pastoral Protegido">
          <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0" />
        </div>
      </div>

      <div className="space-y-4.5 max-h-[450px] overflow-y-auto pr-1">
        {messages.map((msg) => {
          const date = new Date(msg.timestamp);
          const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const formattedDate = date.toLocaleDateString([], { day: 'numeric', month: 'short' });

          return (
            <div 
              key={msg.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${
                msg.isRead 
                  ? 'bg-slate-50/40 dark:bg-slate-950/20 border-slate-100 dark:border-slate-850' 
                  : 'bg-indigo-50/30 dark:bg-indigo-950/10 border-indigo-150/50 dark:border-indigo-900/40 ring-1 ring-indigo-500/5'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs border-b border-slate-100/50 dark:border-slate-850/50 pb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: msg.senderColor || '#a855f7' }}
                  >
                    {msg.senderName[0]?.toUpperCase() || 'P'}
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-800 dark:text-slate-100 block">
                      {msg.senderName}
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">
                      Pastor del Centro
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {formattedDate} • {formattedTime}
                  </span>
                  {msg.isRead ? (
                    <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded text-[9px] font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Leído
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(msg.id)}
                      className="px-2 py-0.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded text-[9.5px] font-black transition-colors cursor-pointer"
                    >
                      Marcar Leído
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-750 dark:text-slate-300 whitespace-pre-line leading-relaxed italic font-medium pl-2.5 border-l-2 border-indigo-400">
                  "{msg.text}"
                </p>

                {msg.replyText && (
                  <div className="bg-white/80 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850 rounded-xl p-3 mt-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-wider">
                      <MessageSquare className="w-3 h-3" />
                      <span>Tu respuesta enviada:</span>
                    </div>
                    <p className="text-xs text-slate-750 dark:text-slate-350 leading-relaxed">
                      {msg.replyText}
                    </p>
                  </div>
                )}

                {!msg.replyText && (
                  <div className="mt-3.5 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Escribe un agradecimiento o confirmación al Pastor..."
                        value={replyInputs[msg.id] || ''}
                        onChange={(e) => setReplyInputs(prev => ({ ...prev, [msg.id]: e.target.value }))}
                        className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden placeholder:text-slate-400"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendReply(msg.id);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSendReply(msg.id)}
                        disabled={!(replyInputs[msg.id]?.trim())}
                        className={`p-1.5 rounded-xl cursor-pointer transition-all shrink-0 ${
                          replyInputs[msg.id]?.trim()
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-650'
                        }`}
                        title="Enviar respuesta"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {successMsg[msg.id] && (
                  <p className="text-[9.5px] font-bold text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 px-2.5 py-1 border border-emerald-100/50 dark:border-emerald-900/20 rounded-lg">
                    {successMsg[msg.id]}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
