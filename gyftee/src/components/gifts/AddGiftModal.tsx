'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Package } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthContext';
import { createGift } from '@/services/gifts.service';
import { submitSwipe } from '@/services/swipes.service';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CATEGORIES } from '@/lib/constants';
import type { GiftCategory } from '@/types/gift.types';

interface AddGiftModalProps {
  onClose: () => void;
}

export function AddGiftModal({ onClose }: AddGiftModalProps) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GiftCategory>('Tech');
  const [price, setPrice] = useState('');
  const [storeLink, setStoreLink] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [preview, setPreview] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const gift = await createGift({
        name,
        description,
        category,
        price: parseFloat(price) || 0,
        store_link: storeLink,
        tags,
        imageFile,
      });

      // Auto-add to user's wishlist
      await submitSwipe(user.id, gift.id, true);
      return gift;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gifts'] });
      qc.invalidateQueries({ queryKey: ['likedGifts'] });
      qc.invalidateQueries({ queryKey: ['recommendations'] });
      toast('Gift added to Discover and your Wishlist!', 'success');
      onClose();
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Failed to add gift.';
      toast(msg, 'error');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const canSubmit = name.trim() && price && parseFloat(price) > 0;

  return (
    <AnimatePresence>
      <motion.div
        key="add-gift-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      />
      <motion.div
        key="add-gift-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto glass-card p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Add a Gift</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 glass rounded-full flex items-center justify-center text-text-muted hover:text-text"
          >
            <X size={16} />
          </button>
        </div>

        {/* Image upload */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-24 h-24 glass-bright rounded-2xl flex flex-col items-center justify-center gap-1.5 text-text-muted hover:text-text transition-colors overflow-hidden"
          >
            {preview ? (
              <img src={preview} alt="" className="w-full h-full object-cover" />
            ) : (
              <>
                <Camera size={20} />
                <span className="text-xs">Add photo</span>
              </>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <p className="text-xs text-text-dim">Optional — helps others discover it</p>
        </div>

        {/* Fields */}
        <Input
          label="Gift name"
          placeholder="e.g. Kindle Paperwhite"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<Package size={14} />}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-muted">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as GiftCategory)}
            className="glass-bright rounded-xl px-4 py-3 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary/30"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-surface text-text">{c}</option>
            ))}
          </select>
        </div>

        <Input
          label="Price (USD)"
          type="number"
          min="0"
          step="0.01"
          placeholder="29.99"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-muted">Description <span className="text-text-dim">(optional)</span></label>
          <textarea
            rows={2}
            placeholder="What makes this gift great?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="glass-bright rounded-xl px-4 py-3 text-sm text-text placeholder-text-dim resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <Input
          label="Store link"
          placeholder="https://amazon.com/..."
          value={storeLink}
          onChange={(e) => setStoreLink(e.target.value)}
        />

        <Input
          label="Tags"
          placeholder="cozy, tech, desk, gaming (comma-separated)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />

        <p className="text-xs text-text-dim -mt-2">
          Tags help the ML engine match this gift to the right people.
        </p>

        <div className="flex gap-3 pt-1">
          <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
          <Button fullWidth loading={isPending} disabled={!canSubmit} onClick={() => mutate()}>
            Add Gift
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
