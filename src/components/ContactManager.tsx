
import React, { useState, useEffect } from 'react';
import { User, Phone, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface Contact {
  id: string;
  name: string;
  numbers: string[];
}

interface ContactManagerProps {
  onMakeCall: (number: string, name: string) => void;
}

export const ContactManager: React.FC<ContactManagerProps> = ({ onMakeCall }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('siya_contacts');
    if (saved) {
      setContacts(JSON.parse(saved));
    } else {
      // Default contacts
      const defaults = [
        { id: '1', name: "Mummy", numbers: ["+919876543210"] },
        { id: '2', name: "Ranjeet", numbers: ["+911234567890"] },
        { id: '3', name: "Papa", numbers: ["+911234567891"] },
        { id: '4', name: "Bhai", numbers: ["+919000000000"] }
      ];
      setContacts(defaults);
      localStorage.setItem('siya_contacts', JSON.stringify(defaults));
    }
  }, []);

  const saveContacts = (updated: Contact[]) => {
    setContacts(updated);
    localStorage.setItem('siya_contacts', JSON.stringify(updated));
  };

  const handleAdd = () => {
    if (!newName || !newNumber) return;
    const newContact: Contact = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      numbers: [newNumber]
    };
    saveContacts([...contacts, newContact]);
    setNewName('');
    setNewNumber('');
    setIsAdding(false);
  };

  const handleUpdate = (id: string) => {
    const updated = contacts.map(c => {
      if (c.id === id) {
        return { ...c, name: newName, numbers: [newNumber] };
      }
      return c;
    });
    saveContacts(updated);
    setEditingId(null);
    setNewName('');
    setNewNumber('');
  };

  const handleDelete = (id: string) => {
    saveContacts(contacts.filter(c => c.id !== id));
  };

  const startEdit = (contact: Contact) => {
    setEditingId(contact.id);
    setNewName(contact.name);
    setNewNumber(contact.numbers[0]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-medium text-white/90 flex items-center gap-2">
          <User className="w-4 h-4 text-rose-400" />
          Aryan's Inner Circle
        </h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <AnimatePresence mode="popLayout">
          {isAdding && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 rounded-xl bg-white/5 border border-rose-500/30 space-y-3"
            >
              <input 
                autoFocus
                placeholder="Name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-rose-500/50 outline-none"
              />
              <input 
                placeholder="Number"
                value={newNumber}
                onChange={e => setNewNumber(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-rose-500/50 outline-none"
              />
              <div className="flex gap-2">
                <button onClick={handleAdd} className="flex-1 bg-rose-500 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2">
                  <Check className="w-3 h-3" /> Save
                </button>
                <button onClick={() => setIsAdding(false)} className="px-3 py-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}

          {contacts.map(contact => (
            <motion.div 
              key={contact.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="group relative p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
            >
              {editingId === contact.id ? (
                <div className="space-y-2">
                  <input 
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-md px-2 py-1 text-xs text-white"
                  />
                  <input 
                    value={newNumber}
                    onChange={e => setNewNumber(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-md px-2 py-1 text-xs text-white"
                  />
                  <div className="flex gap-1">
                    <button onClick={() => handleUpdate(contact.id)} className="flex-1 bg-green-500/20 text-green-400 text-[10px] py-1 rounded">Save</button>
                    <button onClick={() => setEditingId(null)} className="flex-1 bg-white/5 text-white/40 text-[10px] py-1 rounded">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 font-bold text-xs">
                      {contact.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white/90">{contact.name}</div>
                      <div className="text-[10px] text-white/30 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {contact.numbers[0]}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onMakeCall(contact.numbers[0], contact.name)}
                      className="p-1.5 rounded-full bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => startEdit(contact)}
                      className="p-1.5 rounded-full bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => handleDelete(contact.id)}
                      className="p-1.5 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
        <p className="text-[9px] uppercase tracking-widest text-rose-400/60 font-bold mb-1">Siya AI Synchronization</p>
        <p className="text-[10px] text-white/30 italic">"Boss, contacts are safe in local storage. Ask me to call any of these anytime! Just say - call Mummy!"</p>
      </div>
    </div>
  );
};
