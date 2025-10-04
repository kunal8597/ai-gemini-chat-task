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
import { Loader2, Sparkles } from 'lucide-react';

interface Country {
  name: string;
  code: string;
  dialCode: string;
}

const phoneSchema = z.object({
  countryCode: z.string().min(1, 'Country code is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

export const LoginForm = () => {
  const [countries, setCountries] = useState<Country[]>([]);
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

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        const data = await response.json();
        const formattedCountries: Country[] = data
          .map((country: any) => ({
            name: country.name.common,
            code: country.cca2,
            dialCode: country.idd?.root
              ? `${country.idd.root}${country.idd.suffixes?.[0] || ''}`
              : '',
          }))
          .filter((c: Country) => c.dialCode)
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));
        setCountries(formattedCountries);
      } catch (error) {
        toast.error('Failed to load country codes');
      }
    };
    fetchCountries();
  }, []);

  const onPhoneSubmit = (data: PhoneFormData) => {
    setLoading(true);
    setPhoneData(data);

    // Simulate OTP send
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      toast.success('OTP sent to your phone!');
    }, 1500);
  };

  const onOtpSubmit = (data: OtpFormData) => {
    setLoading(true);

    // Simulate OTP validation
    setTimeout(() => {
      setLoading(false);
      if (phoneData) {
        login({
          id: Date.now().toString(),
          phone: phoneData.phone,
          countryCode: phoneData.countryCode,
        });
        toast.success('Successfully logged in!');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-accent/10 to-background">
      <div className="w-full max-w-md space-y-8 animate-slide-up">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text">Gemini Chat</h1>
          <p className="text-muted-foreground">Sign in to start chatting with AI</p>
        </div>

        <div className="bg-card p-8 rounded-2xl shadow-lg border">
          {step === 'phone' ? (
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="countryCode">Country Code</Label>
                <Select
                  value={phoneForm.watch('countryCode')}
                  onValueChange={(value) => phoneForm.setValue('countryCode', value)}
                >
                  <SelectTrigger id="countryCode">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.dialCode}>
                        {country.name} ({country.dialCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {phoneForm.formState.errors.countryCode && (
                  <p className="text-sm text-destructive">
                    {phoneForm.formState.errors.countryCode.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="1234567890"
                  {...phoneForm.register('phone')}
                />
                {phoneForm.formState.errors.phone && (
                  <p className="text-sm text-destructive">
                    {phoneForm.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full gradient-primary" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  {...otpForm.register('otp')}
                  className="text-center text-2xl tracking-widest"
                />
                {otpForm.formState.errors.otp && (
                  <p className="text-sm text-destructive">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground text-center">
                  OTP sent to {phoneData?.countryCode} {phoneData?.phone}
                </p>
              </div>

              <Button type="submit" className="w-full gradient-primary" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep('phone')}
              >
                Change Phone Number
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
