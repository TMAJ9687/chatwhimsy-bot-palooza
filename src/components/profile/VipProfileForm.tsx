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
import { countriesData } from '@/data/countries';

// Define form schema with validation
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

// Sample avatar options for users to choose from
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

// Sample interest options
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
  
  // Initialize form with existing user data or defaults
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

  // Load user data from storage on component mount
  useEffect(() => {
    const loadUserData = async () => {
      // First try localStorage
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
      } else {
        // Fallback to sessionStorage
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
        }
      }
    };
    
    loadUserData();
  }, [form]);

  // Handle form submission
  const onSubmit = (data: ProfileFormValues) => {
    // Update user context
    updateUserProfile({
      gender: data.gender,
      age: parseInt(data.age),
      country: data.country,
      interests: data.interests,
      isVip: true, // Make sure we keep the VIP status
    });
    
    // Store form data in localStorage and sessionStorage for persistence
    const profileData = {
      ...data,
      age: parseInt(data.age),
      avatarId: selectedAvatar,
      isVip: true, // Keep VIP status
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
            {/* Nickname display (read-only) */}
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Your VIP Nickname</FormLabel>
              <div className="mt-1 flex items-center">
                <Input 
                  value={user?.nickname || 'VIP User'} 
                  className="font-semibold border-amber-200 bg-white/50"
                  readOnly 
                />
                <div className="ml-2 bg-amber-100 dark:bg-amber-800 px-2 py-1 rounded text-xs font-medium text-amber-800 dark:text-amber-200">
                  Cannot be changed
                </div>
              </div>
            </div>

            {/* Gender selection - Male and Female only */}
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

            {/* Age selection */}
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

            {/* Avatar selection grid */}
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

            {/* Country selection with flags from flagpedia.net - updated with all countries */}
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
                              {countriesData.find(c => c.value === field.value) && (
                                <img 
                                  src={`https://flagcdn.com/w20/${countriesData.find(c => c.value === field.value)?.code}.png`}
                                  alt={countriesData.find(c => c.value === field.value)?.label || ''}
                                  className="h-4 w-auto mr-2"
                                />
                              )}
                              {countriesData.find(c => c.value === field.value)?.label}
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
                      {countriesData.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          <div className="flex items-center">
                            <img 
                              src={`https://flagcdn.com/w20/${country.code}.png`} 
                              alt={country.label} 
                              className="h-4 w-auto mr-2" 
                            />
                            {country.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Interests selection */}
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
                                // If less than 4 interests are selected, add the new one
                                if (currentInterests.length < 4) {
                                  field.onChange([...currentInterests, interest.id]);
                                  onChange();
                                }
                              } else {
                                // Remove interest if unchecked
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

            {/* Profile visibility toggle */}
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
