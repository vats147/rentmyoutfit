'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Phone, ChevronRight, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores';
import { cn } from '@/lib/utils';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const { setTempPhone, setOnboardingStep, setUser, loginWithGoogle } = useAuthStore();
  const [step, setStep] = useState<'options' | 'phone' | 'otp'>('options');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handlePhoneSubmit = async () => {
    if (phone.length !== 10) return;

    setIsLoading(true);
    // Simulate OTP send
    await new Promise(resolve => setTimeout(resolve, 1000));
    setTempPhone('+91' + phone);
    setOtpSent(true);
    setStep('otp');
    setIsLoading(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all filled
    if (newOtp.every(digit => digit) && newOtp.join('').length === 6) {
      handleOtpVerify(newOtp.join(''));
    }
  };

  const handleOtpVerify = async (otpValue: string) => {
    setIsLoading(true);
    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful verification
    setUser({
      id: 'user-' + Date.now(),
      phone: '+91' + phone,
      role: 'customer',
      kycStatus: 'pending',
      isBanned: false,
      isHoldSelling: false,
      walletBalance: 0,
      createdAt: new Date().toISOString(),
    });
    setOnboardingStep(1);
    onOpenChange(false);
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await loginWithGoogle();
      // Redirect happens automatically with Supabase OAuth
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setStep('options');
    setPhone('');
    setOtp(['', '', '', '', '', '']);
    setOtpSent(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetModal(); onOpenChange(v); }}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        {/* Header with background */}
        <div className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] p-6 text-white">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-2xl font-serif">ShahidRa</h2>
          <p className="text-white/80 text-sm mt-1">The Palace of Ethnic Wear</p>
        </div>

        <div className="p-6">
          {step === 'options' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <Button
                variant="outline"
                className="w-full h-12 flex items-center justify-start gap-3"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-12 flex items-center justify-start gap-3"
                onClick={() => setStep('phone')}
              >
                <Phone className="w-5 h-5" />
                <span>Continue with Phone</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>

              <p className="text-xs text-center text-gray-500 mt-4">
                By continuing, you agree to our{' '}
                <button className="text-[#1B4332] underline">Terms</button> and{' '}
                <button className="text-[#1B4332] underline">Privacy Policy</button>
              </p>
            </motion.div>
          )}

          {step === 'phone' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <Button
                variant="ghost"
                size="sm"
                className="mb-2 -ml-2"
                onClick={() => setStep('options')}
              >
                <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
                Back
              </Button>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex mt-1.5">
                  <div className="flex items-center px-3 bg-gray-100 border border-r-0 rounded-l-md text-gray-600 text-sm">
                    +91
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="rounded-l-none"
                    maxLength={10}
                  />
                </div>
              </div>

              <Button
                className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] h-12"
                onClick={handlePhoneSubmit}
                disabled={phone.length !== 10 || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Send OTP'
                )}
              </Button>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <Button
                variant="ghost"
                size="sm"
                className="mb-2 -ml-2"
                onClick={() => setStep('phone')}
              >
                <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
                Back
              </Button>

              <div>
                <Label>Enter OTP</Label>
                <p className="text-sm text-gray-500 mt-1">
                  We sent a 6-digit code to +91{phone}
                </p>
              </div>

              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !digit && index > 0) {
                        const prevInput = document.getElementById(`otp-${index - 1}`);
                        prevInput?.focus();
                      }
                    }}
                    className="w-12 h-12 text-center text-lg font-bold"
                  />
                ))}
              </div>

              <Button
                variant="link"
                className="w-full text-[#1B4332]"
                onClick={handlePhoneSubmit}
                disabled={isLoading}
              >
                Resend OTP
              </Button>

              <div className="text-center">
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2 text-sm text-gray-500"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
