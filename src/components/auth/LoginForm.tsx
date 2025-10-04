import { useState, useEffect } from 'react';
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

interface Country {
  name: string;
  code: string;
  dialCode: string;
}

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
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneData, setPhoneData] = useState<PhoneFormData | null>(null);
  const [otpSent, setOtpSent] = useState(false);
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

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        const data = await response.json();
        
        const formattedCountries: Country[] = data
          .map((country: any) => {
            const root = country.idd?.root || '';
            const suffix = country.idd?.suffixes?.[0] || '';
            const dialCode = root + suffix;
            
            return {
              name: country.name.common,
              code: country.cca2,
              dialCode: dialCode,
            };
          })
          .filter((c: Country) => c.dialCode && c.dialCode !== '')
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));
        
        setCountries(formattedCountries);
        
        // Auto-select US (+1) for convenience
        const usCountry = formattedCountries.find(c => c.code === 'US');
        if (usCountry) {
          phoneForm.setValue('countryCode', usCountry.dialCode);
        }
      } catch (error) {
        console.error('Failed to fetch countries:', error);
        toast.error('Failed to load country codes. Please refresh the page.');
      }
    };
    fetchCountries();
  }, []);

  const onPhoneSubmit = async (data: PhoneFormData) => {
    setLoading(true);
    setPhoneData(data);

    // Simulate network delay for OTP sending
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    setOtpSent(true);
    
    // Small delay before showing OTP form
    setTimeout(() => {
      setStep('otp');
      toast.success('OTP sent successfully! Check your phone.', {
        description: 'Enter the 6-digit code to continue',
      });
    }, 500);
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo and Welcome */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-card/50 backdrop-blur-sm border border-border/50 mb-2">
            <Sparkles className="w-10 h-10 text-primary animate-pulse-slow" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Good to See You!
            </h1>
            <p className="text-xl text-muted-foreground font-light">
              How Can I be an Assistance?
            </p>
            <p className="text-sm text-muted-foreground">
              I'm available 24/7 for you, ask me anything.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 p-8 rounded-3xl shadow-2xl space-y-6">
          {step === 'phone' ? (
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="countryCode" className="text-sm font-medium">
                    Country / Region
                  </Label>
                  <Select
                    value={phoneForm.watch('countryCode')}
                    onValueChange={(value) => {
                      phoneForm.setValue('countryCode', value);
                      phoneForm.clearErrors('countryCode');
                    }}
                  >
                    <SelectTrigger 
                      id="countryCode"
                      className="h-12 bg-secondary/50 border-border/50"
                    >
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-50">
                      {countries.map((country) => (
                        <SelectItem 
                          key={country.code} 
                          value={country.dialCode}
                          className="cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <span className="font-medium">{country.dialCode}</span>
                            <span className="text-muted-foreground">{country.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {phoneForm.formState.errors.countryCode && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      {phoneForm.formState.errors.countryCode.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="1234567890"
                      className="h-12 pl-10 bg-secondary/50 border-border/50"
                      {...phoneForm.register('phone')}
                      onChange={(e) => {
                        phoneForm.setValue('phone', e.target.value);
                        phoneForm.clearErrors('phone');
                      }}
                    />
                  </div>
                  {phoneForm.formState.errors.phone && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      {phoneForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base gradient-primary hover:opacity-90 transition-opacity" 
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Verify Your Phone</h3>
                <p className="text-sm text-muted-foreground">
                  We sent a code to <span className="font-medium text-foreground">{phoneData?.countryCode} {phoneData?.phone}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium">
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
                  className="h-14 text-center text-3xl tracking-[0.5em] font-bold bg-secondary/50 border-border/50"
                  autoFocus
                />
                {otpForm.formState.errors.otp && (
                  <p className="text-xs text-destructive text-center">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base gradient-primary hover:opacity-90 transition-opacity" 
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
                  className="text-sm"
                  onClick={() => {
                    setStep('phone');
                    setOtpSent(false);
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
        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};
