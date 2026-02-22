'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setUser, setLoading } = useAuthStore();

    useEffect(() => {
        // Initial session check
        const initAuth = async () => {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    displayName: session.user.user_metadata.full_name || session.user.user_metadata.name || 'User',
                    role: 'customer',
                    kycStatus: 'pending',
                    isBanned: false,
                    isHoldSelling: false,
                    walletBalance: 0,
                    createdAt: session.user.created_at,
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    displayName: session.user.user_metadata.full_name || session.user.user_metadata.name || 'User',
                    role: 'customer',
                    kycStatus: 'pending',
                    isBanned: false,
                    isHoldSelling: false,
                    walletBalance: 0,
                    createdAt: session.user.created_at,
                });
            } else {
                setUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [setUser, setLoading]);

    return <>{children}</>;
}
