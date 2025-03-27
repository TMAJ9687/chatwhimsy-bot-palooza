
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Calendar, MapPin, Heart, Save, Check } from 'lucide-react';
import { countries } from '@/data/countries';
import { validateUsername } from '@/utils/messageUtils';

const profileFormSchema = z.object({
  gender: z.enum(['male', 'female'], {
    required_error: "Please select a gender",
  }),
  age: z.string().min(1, "Age is required"),
  country: z.string().min(1, "Country is required"),
  interests: z.array(z.string()).max(4, "You can select up to 4 interests"),
  isVisible: z.boolean(),
  avatarId: z.string(),
  nickname: z.string().min(3, "Nickname must be at least 3 characters").max(22, "Nickname must be 22 characters or less"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const avatarOptions = [
  { id: 'avatar1', src: '/placeholder.svg' },
  { id: 'avatar2', src: '/placeholder.svg' },
  { id: 'avatar3', src: '/placeholder.svg' },
  { id: 'avatar4', src: '/placeholder.svg' },
  { id: 'avatar5', src: '/placeholder.svg' },
  { id: 'avatar6', src: '/placeholder.svg' },
  { id: 'avatar7', src: '/placeholder.svg' },
  { id: 'avatar8', src: '/placeholder.svg' },
];

const interestOptions = [
  { id: 'music', label: 'Music' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'travel', label: 'Travel' },
  { id: 'movies', label: 'Movies' },
  { id: 'sports', label: 'Sports' },
  { id: 'food', label: 'Food & Cooking' },
  { id: 'technology', label: 'Technology' },
  { id: 'arts', label: 'Arts & Crafts' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'reading', label: 'Reading' },
  { id: 'photography', label: 'Photography' },
  { id: 'fitness', label: 'Fitness' },
];

interface VipProfileFormProps {
  onChange: () => void;
  onSave: () => void;
}

const VipProfileForm: React.FC<VipProfileFormProps> = ({ onChange, onSave }) => {
  const { user, updateUserProfile } = useUser();
  const { toast } = useToast();
  const [selectedAvatar, setSelectedAvatar] = useState('avatar1');
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      gender: user?.gender || 'male',
      age: user?.age?.toString() || '25',
      country: user?.country || 'us',
      interests: user?.interests || [],
      isVisible: true,
      avatarId: 'avatar1',
      nickname: user?.nickname || 'VIP User',
    },
  });

  useEffect(() => {
    const loadUserData = async () => {
      const storedData = localStorage.getItem('vipUserProfile');
      
      if (storedData) {
        const userData = JSON.parse(storedData);
        form.reset({
          gender: userData.gender || 'male',
          age: userData.age?.toString() || '25',
          country: userData.country || 'us',
          interests: userData.interests || [],
          isVisible: userData.isVisible !== undefined ? userData.isVisible : true,
          avatarId: userData.avatarId || 'avatar1',
          nickname: userData.nickname || 'VIP User',
        });
        setSelectedAvatar(userData.avatarId || 'avatar1');
      } else {
        const sessionData = sessionStorage.getItem('vipUserProfile');
        
        if (sessionData) {
          const userData = JSON.parse(sessionData);
          form.reset({
            gender: userData.gender || 'male',
            age: userData.age?.toString() || '25',
            country: userData.country || 'us',
            interests: userData.interests || [],
            isVisible: userData.isVisible !== undefined ? userData.isVisible : true,
            avatarId: userData.avatarId || 'avatar1',
            nickname: userData.nickname || 'VIP User',
          });
          setSelectedAvatar(userData.avatarId || 'avatar1');
        }
      }
    };
    
    loadUserData();
  }, [form]);

  const validateVipNickname = (nickname: string) => {
    const validation = validateUsername(nickname, true);
    if (!validation.valid) {
      setNicknameError(validation.message);
      return false;
    }
    
    setNicknameError(null);
    return true;
  };

  const onSubmit = (data: ProfileFormValues) => {
    // Validate VIP nickname
    if (!validateVipNickname(data.nickname)) {
      return;
    }
    
    updateUserProfile({
      nickname: data.nickname,
      gender: data.gender,
      age: parseInt(data.age),
      country: data.country,
      interests: data.interests,
      isVip: true,
    });
    
    const profileData = {
      ...data,
      age: parseInt(data.age),
      avatarId: selectedAvatar,
      isVip: true,
    };
    
    localStorage.setItem('vipUserProfile', JSON.stringify(profileData));
    sessionStorage.setItem('vipUserProfile', JSON.stringify(profileData));
    
    toast({
      title: "Profile Updated",
      description: "Your VIP profile has been saved successfully.",
      variant: "default",
    });
    
    onSave();
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md border-amber-100 dark:border-amber-900/40">
      <CardContent className="p-6">
        <div className="flex items-center mb-6">
          <User className="w-5 h-5 text-amber-500 mr-2" />
          <h2 className="text-xl font-semibold">Profile Information</h2>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} onChange={onChange} className="space-y-6">
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium flex items-center">
                    <span className="text-red-500 mr-1">*</span> VIP Nickname
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="font-semibold border-amber-200 bg-white/50"
                      onBlur={(e) => {
                        validateVipNickname(e.target.value);
                        field.onBlur();
                      }}
                      onChange={(e) => {
                        field.onChange(e);
                        setNicknameError(null);
                      }}
                    />
                  </FormControl>
                  {nicknameError && (
                    <div className="text-red-500 text-xs">{nicknameError}</div>
                  )}
                  <div className="text-xs text-gray-500">
                    As a VIP, you can use up to 22 characters. Consecutive repeated characters are limited.
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-sm font-medium flex items-center">
                    <span className="text-red-500 mr-1">*</span> Gender
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <FormLabel htmlFor="male" className="font-normal">Male</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <FormLabel htmlFor="female" className="font-normal">Female</FormLabel>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center">
                    <span className="text-red-500 mr-1">*</span> Age
                    <Calendar className="w-4 h-4 ml-1 text-gray-400" />
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your age" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[...Array(63)].map((_, i) => (
                        <SelectItem key={i} value={(i + 18).toString()}>
                          {i + 18}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel className="text-sm font-medium block">Choose Your Avatar</FormLabel>
              <div className="grid grid-cols-4 gap-4">
                {avatarOptions.map((avatar) => (
                  <div 
                    key={avatar.id} 
                    className={`relative cursor-pointer rounded-lg p-1 ${
                      selectedAvatar === avatar.id 
                        ? 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => {
                      setSelectedAvatar(avatar.id);
                      form.setValue('avatarId', avatar.id);
                      onChange();
                    }}
                  >
                    <Avatar className="w-full h-auto aspect-square">
                      <AvatarImage src={avatar.src} alt="Avatar option" />
                      <AvatarFallback>VIP</AvatarFallback>
                    </Avatar>
                    {selectedAvatar === avatar.id && (
                      <div className="absolute bottom-1 right-1 bg-amber-500 rounded-full p-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center">
                    <span className="text-red-500 mr-1">*</span> Country
                    <MapPin className="w-4 h-4 ml-1 text-gray-400" />
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country">
                          {field.value && (
                            <div className="flex items-center">
                              {countries.find(c => c.code === field.value) && (
                                <img 
                                  src={`https://flagcdn.com/w20/${field.value.toLowerCase()}.png`}
                                  alt={countries.find(c => c.code === field.value)?.name || ''}
                                  className="h-4 w-auto mr-2"
                                />
                              )}
                              {countries.find(c => c.code === field.value)?.name}
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          <div className="flex items-center">
                            <img 
                              src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`} 
                              alt={country.name} 
                              className="h-4 w-auto mr-2" 
                            />
                            {country.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <div className="space-y-2">
                    <FormLabel className="text-sm font-medium flex items-center">
                      Interests <span className="text-xs text-gray-500 ml-2">(Select up to 4)</span>
                      <Heart className="w-4 h-4 ml-1 text-gray-400" />
                    </FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {interestOptions.map((interest) => (
                        <div key={interest.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={interest.id}
                            checked={field.value?.includes(interest.id)}
                            onCheckedChange={(checked) => {
                              const currentInterests = field.value || [];
                              
                              if (checked) {
                                if (currentInterests.length < 4) {
                                  field.onChange([...currentInterests, interest.id]);
                                  onChange();
                                }
                              } else {
                                field.onChange(
                                  currentInterests.filter((value) => value !== interest.id)
                                );
                                onChange();
                              }
                            }}
                            className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                          />
                          <label
                            htmlFor={interest.id}
                            className="text-sm"
                          >
                            {interest.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isVisible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium">Profile Visibility</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Allow others to see when you are online
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        onChange();
                      }}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default VipProfileForm;
