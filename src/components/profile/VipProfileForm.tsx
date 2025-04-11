import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
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
import { User, Calendar, MapPin, Heart, Save, Check, Image } from 'lucide-react';
import { countries } from '@/data/countries';
import { uploadProfileImage } from '@/utils/storageUtils';

const profileFormSchema = z.object({
  gender: z.enum(['male', 'female'], {
    required_error: "Please select a gender",
  }),
  age: z.string().min(1, "Age is required"),
  country: z.string().min(1, "Country is required"),
  interests: z.array(z.string()).max(4, "You can select up to 4 interests"),
  isVisible: z.boolean(),
  avatarId: z.string(),
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

export interface VipProfileFormRef {
  saveForm: () => Promise<boolean>;
}

interface VipProfileFormProps {
  onChange: () => void;
  onSave: () => void;
}

const VipProfileForm = forwardRef<VipProfileFormRef, VipProfileFormProps>(({ onChange, onSave }, ref) => {
  const { user, updateUserProfile } = useUser();
  const { toast } = useToast();
  const [selectedAvatar, setSelectedAvatar] = useState('avatar1');
  const [isSaving, setIsSaving] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [nickname, setNickname] = useState<string>(user?.nickname || 'VIP User');
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      gender: user?.gender || 'male',
      age: user?.age?.toString() || '25',
      country: user?.country || 'us',
      interests: user?.interests || [],
      isVisible: true,
      avatarId: 'avatar1',
    },
  });

  useEffect(() => {
    if (user?.nickname) {
      setNickname(user.nickname);
    }
  }, [user]);

  useImperativeHandle(ref, () => ({
    saveForm: async () => {
      const isValid = await form.trigger();
      if (!isValid) return false;
      
      setIsSaving(true);
      try {
        const formValues = form.getValues();
        const result = await handleFormSubmit(formValues);
        return result;
      } catch (error) {
        console.error("Error saving form:", error);
        return false;
      } finally {
        setIsSaving(false);
      }
    }
  }));

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
        });
        setSelectedAvatar(userData.avatarId || 'avatar1');
        
        // Load custom avatar if available
        if (userData.customAvatarUrl) {
          setCustomAvatarUrl(userData.customAvatarUrl);
        }
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
          });
          setSelectedAvatar(userData.avatarId || 'avatar1');
          
          // Load custom avatar if available
          if (userData.customAvatarUrl) {
            setCustomAvatarUrl(userData.customAvatarUrl);
          }
        }
      }
    };
    
    loadUserData();
  }, [form]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Show loading state
      toast({
        title: "Uploading...",
        description: "Your profile image is being uploaded",
      });
      
      // Upload to Firebase if user ID is available
      if (user?.id) {
        const downloadUrl = await uploadProfileImage(file, user.id);
        setCustomAvatarUrl(downloadUrl);
        setSelectedAvatar('custom');
        form.setValue('avatarId', 'custom');
        onChange();
        
        toast({
          title: "Upload complete",
          description: "Your profile image has been updated",
        });
      } else {
        // Fallback to local preview if no user ID
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setCustomAvatarUrl(result);
          setSelectedAvatar('custom');
          form.setValue('avatarId', 'custom');
          onChange();
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFormSubmit = async (data: ProfileFormValues): Promise<boolean> => {
    try {
      updateUserProfile({
        nickname: nickname,
        gender: data.gender,
        age: parseInt(data.age),
        country: data.country,
        interests: data.interests,
        isVip: true,
      });
      
      const profileData = {
        ...data,
        nickname: nickname,
        age: parseInt(data.age),
        avatarId: selectedAvatar,
        customAvatarUrl: customAvatarUrl,
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
      return true;
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const onSubmit = (data: ProfileFormValues) => {
    handleFormSubmit(data);
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
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Your VIP Nickname</FormLabel>
              <div className="mt-1 flex items-center">
                <Input 
                  value={nickname} 
                  onChange={(e) => {
                    setNickname(e.target.value);
                    onChange();
                  }}
                  className="font-semibold border-amber-200 bg-white/50"
                  placeholder="Enter your VIP nickname"
                />
              </div>
            </div>

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
              
              {/* Custom avatar upload button */}
              <div className="mb-4">
                <input
                  type="file" 
                  className="hidden"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleUploadClick}
                  className="w-full border-dashed border-2 h-auto py-4 flex flex-col items-center gap-2"
                >
                  <Image className="h-5 w-5 text-amber-500" />
                  <span>Upload custom avatar</span>
                  <span className="text-xs text-gray-500">VIP exclusive feature</span>
                </Button>
              </div>
              
              {/* Custom avatar preview if uploaded */}
              {customAvatarUrl && (
                <div 
                  className={`relative cursor-pointer rounded-lg p-1 mb-4 ${
                    selectedAvatar === 'custom' 
                      ? 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    setSelectedAvatar('custom');
                    form.setValue('avatarId', 'custom');
                    onChange();
                  }}
                >
                  <p className="text-xs text-center text-gray-500 mb-2">Your custom avatar</p>
                  <Avatar className="w-24 h-24 mx-auto">
                    <AvatarImage src={customAvatarUrl} alt="Custom avatar" />
                    <AvatarFallback>VIP</AvatarFallback>
                  </Avatar>
                  {selectedAvatar === 'custom' && (
                    <div className="absolute bottom-1 right-1 bg-amber-500 rounded-full p-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              )}
              
              {/* Standard avatar options */}
              <p className="text-xs text-gray-500 my-2">Or select from our collection:</p>
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
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
});

VipProfileForm.displayName = 'VipProfileForm';

export default VipProfileForm;
