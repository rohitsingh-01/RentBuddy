'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, ChevronLeft } from 'lucide-react'

// Demo data
const demoContacts = [
  { id: '1', name: 'Priya Sharma', role: 'Roommate Match', initials: 'PS', online: true, messages: [
    { text: 'Hey, saw your profile! Are you still looking?', sender: 'them', time: '10:15 AM' }
  ]},
  { id: '2', name: 'Ananya Desai', role: 'Landlord (Powai)', initials: 'AD', online: false, messages: [
    { text: 'The flat is available for visit tomorrow. Let me know.', sender: 'them', time: 'Yesterday' }
  ]},
  { id: '3', name: 'Aditya Mehta', role: 'Roommate Match', initials: 'AM', online: true, messages: [] }
]

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<typeof demoContacts[0] | null>(null)
  const [messageText, setMessageText] = useState('')
  const [contacts, setContacts] = useState(demoContacts)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [selectedContact, contacts])

  const handleSend = () => {
    if (!messageText.trim() || !selectedContact) return

    const newMessage = {
      text: messageText,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setContacts(prev => prev.map(c => 
      c.id === selectedContact.id ? { ...c, messages: [...c.messages, newMessage] } : c
    ))
    
    // Update local view immediately 
    setSelectedContact(prev => prev ? { ...prev, messages: [...prev.messages, newMessage] } : null)
    setMessageText('')

    // Auto reply simulation for realism
    setTimeout(() => {
      const reply = {
        text: 'Sounds good! I will get back to you soon.',
        sender: 'them',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setContacts(prev => prev.map(c => 
        c.id === selectedContact.id ? { ...c, messages: [...c.messages, reply] } : c
      ))
      if (selectedContact) {
        setSelectedContact(prev => prev ? { ...prev, messages: [...prev.messages, reply] } : null)
      }
    }, 1500)
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999]" id="global-chat-widget">
      {/* Floating Toggle Icon */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 rounded-full bg-forest-900 border border-forest-800 text-cream-100 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          title="Open Chat"
        >
          <div className="relative">
            <MessageSquare size={20} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-coral-500 rounded-full animate-ping" />
          </div>
        </button>
      )}

      {/* Chat Window Box Frame */}
      {isOpen && (
        <div className="w-80 h-[500px] bg-white rounded-2xl border border-forest-100 shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-forest-900 text-cream-100 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedContact && (
                <button onClick={() => setSelectedContact(null)} className="hover:text-cream-300">
                  <ChevronLeft size={18} />
                </button>
              )}
              <h3 className="font-display font-medium text-sm">
                {selectedContact ? selectedContact.name : 'Messages'}
              </h3>
            </div>
            <button onClick={() => { setIsOpen(false); setSelectedContact(null) }} className="hover:text-cream-300">
              <X size={16} />
            </button>
          </div>

          {/* Conversation Stream or Contacts list view */}
          <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
            {!selectedContact ? (
              /* Contacts list */
              <div className="space-y-2">
                {contacts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedContact(c)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-cream-50 rounded-xl transition-colors text-left"
                  >
                    <div className="relative flex-shrink-0 w-9 h-9 rounded-full bg-forest-100 flex items-center justify-center text-xs font-medium text-forest-800">
                      {c.initials}
                      {c.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs text-forest-900">{c.name}</h4>
                      <p className="text-[10px] text-forest-400 truncate">{c.role}</p>
                    </div>
                    {c.messages.length > 0 && (
                      <span className="text-[9px] text-forest-400">
                        {c.messages[c.messages.length - 1].time}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              /* Messages */
              <div className="space-y-3">
                {selectedContact.messages.length === 0 ? (
                  <p className="text-center text-xs text-forest-300 py-4">No messages yet. Say hello!</p>
                ) : (
                  selectedContact.messages.map((m, index) => (
                    <div key={index} className={`flex flex-col ${m.sender === 'me' ? 'items-end' : 'items-start'}`}>
                      <div className={`px-3 py-2 rounded-xl text-xs max-w-[80%] ${m.sender === 'me' ? 'bg-forest-900 text-cream-100 rounded-br-none' : 'bg-cream-100 text-forest-900 rounded-bl-none'}`}>
                        {m.text}
                      </div>
                      <span className="text-[9px] text-forest-400 mt-0.5">{m.time}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Input Panel */}
          {selectedContact && (
            <div className="p-3 border-t border-forest-50 bg-cream-50 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your reply..."
                className="flex-1 bg-white border border-forest-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-forest-500"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={!messageText.trim()}
                className="p-1.5 bg-forest-900 text-cream-100 rounded-lg hover:bg-forest-800 disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
