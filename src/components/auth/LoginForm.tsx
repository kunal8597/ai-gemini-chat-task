import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { Loader2, Sparkles, CheckCircle2, Phone } from 'lucide-react';

// Hardcoded popular countries
const COUNTRIES = [
  { name: "United States", code: "US", dialCode: "+1" },
  { name: "United Kingdom", code: "GB", dialCode: "+44" },
  { name: "India", code: "IN", dialCode: "+91" },
  { name: "Canada", code: "CA", dialCode: "+1" },
  { name: "Australia", code: "AU", dialCode: "+61" },
  { name: "Germany", code: "DE", dialCode: "+49" },
  { name: "France", code: "FR", dialCode: "+33" },
  { name: "Japan", code: "JP", dialCode: "+81" },
  { name: "China", code: "CN", dialCode: "+86" },
  { name: "Brazil", code: "BR", dialCode: "+55" },
  { name: "Mexico", code: "MX", dialCode: "+52" },
  { name: "Spain", code: "ES", dialCode: "+34" },
  { name: "Italy", code: "IT", dialCode: "+39" },
  { name: "South Korea", code: "KR", dialCode: "+82" },
  { name: "Netherlands", code: "NL", dialCode: "+31" },
];

const phoneSchema = z.object({
  countryCode: z.string().min(1, 'Please select a country code'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be at most 15 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits'),
});

const otpSchema = z.object({
  otp: z.string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^[0-9]+$/, 'OTP must contain only digits'),
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

export const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneData, setPhoneData] = useState<PhoneFormData | null>(null);
  const login = useAuthStore((state) => state.login);

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      countryCode: '',
      phone: '',
    },
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const onPhoneSubmit = async (data: PhoneFormData) => {
    setLoading(true);
    setPhoneData(data);

    // Simulate network delay for OTP sending
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    
    // Show OTP form
    setStep('otp');
    toast.success('OTP sent successfully! Check your phone.', {
      description: 'Enter the 6-digit code to continue',
    });
  };

  const onOtpSubmit = async (data: OtpFormData) => {
    setLoading(true);

    // Simulate OTP validation with network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For simulation: any 6-digit OTP is valid
    if (data.otp.length === 6) {
      if (phoneData) {
        login({
          id: Date.now().toString(),
          phone: phoneData.phone,
          countryCode: phoneData.countryCode,
        });
        toast.success('Welcome! Login successful.', {
          description: 'Redirecting to your dashboard...',
        });
      }
    } else {
      setLoading(false);
      toast.error('Invalid OTP', {
        description: 'Please check the code and try again.',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0f0f1e]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md space-y-8 animate-fade-in relative z-10">
        {/* Logo and Welcome */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 mb-4 shadow-2xl shadow-purple-500/20">
            <Sparkles className="w-12 h-12 text-white animate-pulse" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              aetherAI
            </h1>
            <p className="text-xl text-white/80 font-light">
              {step === 'phone' ? 'Welcome Back!' : 'Verify Your Identity'}
            </p>
            <p className="text-sm text-white/60">
              {step === 'phone' 
                ? 'Enter your phone number to continue' 
                : 'Enter the verification code we sent you'}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl space-y-6">
          {step === 'phone' ? (
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="countryCode" className="text-sm font-medium text-white/80">
                    Country / Region
                  </Label>
                  <Select
                    value={phoneForm.watch('countryCode')}
                    onValueChange={(value) => {
                      phoneForm.setValue('countryCode', value);
                      phoneForm.clearErrors('countryCode');
                    }}
                    defaultValue="+1"
                  >
                    <SelectTrigger 
                      id="countryCode"
                      className="h-12 bg-white/5 border-white/10 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                    >
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/10 max-h-[300px]">
                      {COUNTRIES.map((country) => (
                        <SelectItem 
                          key={country.code} 
                          value={country.dialCode}
                          className="text-white hover:bg-white/10 cursor-pointer transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <span className="font-medium">{country.dialCode}</span>
                            <span className="text-white/60">{country.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {phoneForm.formState.errors.countryCode && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      {phoneForm.formState.errors.countryCode.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-white/80">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="1234567890"
                      className="h-12 pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20"
                      {...phoneForm.register('phone')}
                      onChange={(e) => {
                        phoneForm.setValue('phone', e.target.value);
                        phoneForm.clearErrors('phone');
                      }}
                    />
                  </div>
                  {phoneForm.formState.errors.phone && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      {phoneForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 text-white border-0 font-semibold transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6 animate-slide-up">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-2">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Verify Your Phone</h3>
                <p className="text-sm text-white/60">
                  We sent a code to <span className="font-medium text-white">{phoneData?.countryCode} {phoneData?.phone}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium text-white/80">
                  Enter 6-Digit Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  {...otpForm.register('otp')}
                  onChange={(e) => {
                    otpForm.setValue('otp', e.target.value);
                    otpForm.clearErrors('otp');
                  }}
                  className="h-14 text-center text-3xl tracking-[0.5em] font-bold bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500/50 focus:ring-purple-500/20"
                  autoFocus
                />
                {otpForm.formState.errors.otp && (
                  <p className="text-xs text-red-400 text-center">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 text-white border-0 font-semibold transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Continue'
                )}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-sm text-white/60 hover:text-white hover:bg-white/5"
                  onClick={() => {
                    setStep('phone');
                    otpForm.reset();
                  }}
                >
                  Change Phone Number
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Helper Text */}
        <p className="text-center text-xs text-white/40">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};
