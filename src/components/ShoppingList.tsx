"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Trash2, X, EyeOff, Eye } from "lucide-react";

type Item = {
  id: string;
  user_id: string;
  name: string;
  quantity: string;
  is_completed: boolean;
  is_hidden: boolean;
};

export default function ShoppingList() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function init() {
      // Anonymous login
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      let user = authData?.session?.user;
      
      if (!user) {
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
        if (anonError) console.error("Error signing in anonymously", anonError);
        user = anonData?.user || undefined;
      }

      if (user) {
        setUserId(user.id);
        fetchItems();
      }
    }
    
    init();
  }, []);

  useEffect(() => {
    if (isAddModalOpen && inputRef.current) {
      // Focus the input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isAddModalOpen]);

  async function fetchItems() {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error("Error fetching items", error);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemName.trim() || !userId) return;

    const newItem = {
      user_id: userId,
      name: newItemName.trim(),
      quantity: newItemQuantity.trim(),
      is_completed: false,
      is_hidden: false,
    };

    // Optimistic UI update
    const tempId = "temp-" + Date.now().toString();
    setItems((prev) => [{ ...newItem, id: tempId } as Item, ...prev]);
    setNewItemName("");
    setNewItemQuantity("");
    setIsAddModalOpen(false);

    const { data, error } = await supabase
      .from("items")
      .insert([newItem])
      .select()
      .single();

    if (error) {
      console.error("Error adding item", error);
      fetchItems(); // revert on error
    } else if (data) {
      setItems((prev) => prev.map((item) => (item.id === tempId ? data : item)));
    }
  }

  async function toggleComplete(item: Item) {
    const newStatus = !item.is_completed;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_completed: newStatus } : i))
    );

    const { error } = await supabase
      .from("items")
      .update({ is_completed: newStatus })
      .eq("id", item.id);

    if (error) {
      console.error("Error updating item", error);
      fetchItems(); // revert on error
    }
  }

  async function hideItem(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, is_hidden: true } : i))
    );

    const { error } = await supabase
      .from("items")
      .update({ is_hidden: true })
      .eq("id", id);

    if (error) {
      console.error("Error hiding item", error);
      fetchItems(); // revert on error
    }
  }

  async function unhideItem(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, is_hidden: false } : i))
    );

    const { error } = await supabase
      .from("items")
      .update({ is_hidden: false })
      .eq("id", id);

    if (error) {
      console.error("Error unhiding item", error);
      fetchItems(); // revert on error
    }
  }

  async function deleteItem(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setItems((prev) => prev.filter((i) => i.id !== id));

    const { error } = await supabase
      .from("items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting item", error);
      fetchItems();
    }
  }

  const activeItems = items.filter((i) => !i.is_completed && !i.is_hidden);
  const completedItems = items.filter((i) => i.is_completed && !i.is_hidden);
  const hiddenItems = items.filter((i) => i.is_hidden);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-[100dvh] relative">
      {/* Main List Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 pb-32 space-y-8">
        
        {/* Active Items */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {activeItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                key={item.id}
                onClick={() => toggleComplete(item)}
                className="group flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-md shadow-sm border border-zinc-100 dark:border-zinc-800 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                  <div className="w-5 h-5 rounded-sm border-2 border-red-500 dark:border-red-600 flex items-center justify-center flex-shrink-0 group-hover:border-red-400 transition-colors">
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-medium text-lg truncate">{item.name}</span>
                    {item.quantity && (
                      <span className="text-zinc-500 text-sm truncate">{item.quantity}</span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={(e) => hideItem(item.id, e)}
                  className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors focus:outline-none"
                  title="Ocultar"
                >
                  <EyeOff size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {activeItems.length === 0 && items.filter(i => !i.is_hidden).length === 0 && (
            <div className="text-center text-zinc-400 mt-10">
              Sua lista está vazia. Adicione itens clicando no botão abaixo!
            </div>
          )}
          {activeItems.length === 0 && completedItems.length > 0 && (
            <div className="text-center text-zinc-400 mt-10">
              Tudo comprado! 🎉
            </div>
          )}
        </div>

        {/* Completed Items */}
        {completedItems.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Comprados</h2>
            <AnimatePresence mode="popLayout">
              {completedItems.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 0.8, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  key={item.id}
                  onClick={() => toggleComplete(item)}
                  className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/80 rounded-md shadow-sm border border-zinc-100 dark:border-zinc-800 cursor-pointer hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    <div className="w-5 h-5 rounded-sm bg-green-500 dark:bg-green-600 flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-white" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium text-lg line-through text-zinc-500 dark:text-zinc-400 truncate">{item.name}</span>
                      {item.quantity && (
                        <span className="text-zinc-400 text-sm line-through truncate">{item.quantity}</span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => hideItem(item.id, e)}
                    className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors focus:outline-none"
                    title="Ocultar"
                  >
                    <EyeOff size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Hidden Items (Recycle Bin equivalent) */}
        {hiddenItems.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Ocultos / Lixeira</h2>
            <AnimatePresence mode="popLayout">
              {hiddenItems.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 0.4, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-transparent border border-dashed border-zinc-200 dark:border-zinc-800 rounded-md transition-opacity hover:opacity-60"
                >
                  <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium text-lg text-zinc-400 truncate">{item.name}</span>
                      {item.quantity && (
                        <span className="text-zinc-400 text-sm truncate">{item.quantity}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => unhideItem(item.id, e)}
                      className="p-2 text-zinc-400 hover:text-blue-500 transition-colors focus:outline-none"
                      title="Restaurar"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={(e) => deleteItem(item.id, e)}
                      className="p-2 text-zinc-400 hover:text-red-500 transition-colors focus:outline-none"
                      title="Deletar Definitivamente"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* FAB - Centered Floating Action Button for adding items */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-xl flex items-center justify-center transition-transform active:scale-95"
        title="Adicionar item"
      >
        <Plus size={28} />
      </button>

      {/* Add Item Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-5 w-[92%] max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold tracking-tight">Adicionar Item</h2>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddItem} className="flex flex-col gap-3">
                <div>
                  <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1 block">O que você precisa comprar?</label>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Ex: Maçã"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1 block">Quantidade (opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: 2kg, 3 unidades"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={!newItemName.trim()}
                  className="mt-1 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  Adicionar
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
