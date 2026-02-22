'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';

export default function AuthCallback() {
    const router = useRouter();
    const { setUser } = useAuthStore();

    useEffect(() => {
        const handleCallback = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (session?.user) {
                // Map Supabase user to our internal User format
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
                router.push('/');
            } else if (error) {
                console.error('Auth Error:', error.message);
                router.push('/?error=auth');
            } else {
                // Fallback for cases where session might still be loading or missing
                router.push('/');
            }
        };

        handleCallback();
    }, [router, setUser]);

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-white">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B4332] mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">Completing sign in...</p>
            </div>
        </div>
    );
}
