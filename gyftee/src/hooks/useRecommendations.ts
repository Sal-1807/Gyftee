import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthContext';

interface RecommendationResult {
  gift_ids: string[];
  model_weights: Record<string, number>;
  user_swipe_count: number;
  fallback?: boolean;
}

export function useRecommendations(n = 20) {
  const { user } = useAuth();

  return useQuery<RecommendationResult>({
    queryKey: ['recommendations', user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      let interests: string[] = [];
      try {
        const stored = localStorage.getItem(`gyftee_interests_${user!.id}`);
        if (stored) interests = JSON.parse(stored);
      } catch {}

      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user!.id, n, interests }),
      });
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      return res.json();
    },
  });
}
