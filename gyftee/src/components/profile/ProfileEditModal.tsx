'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, User } from 'lucide-react';
import { useUpdateProfile } from '@/hooks/useProfile';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import type { AppUser } from '@/types/user.types';
import { getAvatarUrl } from '@/utils/pocketbase-image';

interface ProfileEditModalProps {
  user: AppUser;
  onClose: () => void;
}

export function ProfileEditModal({ user, onClose }: ProfileEditModalProps) {
  const [username, setUsername] = useState(user.username);
  const [preview, setPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);

  const { mutate, isPending } = useUpdateProfile();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = () => {
    mutate(
      { username: username.trim(), avatarFile },
      {
        onSuccess: () => {
          toast('Profile updated!', 'success');
          onClose();
        },
        onError: (err) => {
          const msg = err instanceof Error ? err.message : 'Update failed.';
          if (msg.includes('username')) toast('Username already taken.', 'error');
          else toast(msg, 'error');
        },
      }
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto glass-card p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Edit Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 glass rounded-full flex items-center justify-center text-text-muted hover:text-text"
          >
            <X size={16} />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar
              src={preview ?? getAvatarUrl(user)}
              username={user.username}
              size="xl"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 gradient-primary rounded-full flex items-center justify-center text-white shadow-lg"
            >
              <Camera size={14} />
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-xs text-text-dim">Tap the camera to change photo</p>
        </div>

        {/* Username */}
        <Input
          label="Username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
          }
          icon={<User size={14} />}
          placeholder="your_username"
        />

        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button fullWidth loading={isPending} onClick={handleSave}>
            Save
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
