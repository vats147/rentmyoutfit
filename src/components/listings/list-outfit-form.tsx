'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, ChevronLeft, ChevronRight, X, Plus, MapPin,
  DollarSign, Package, Truck, Check, Info, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useAuthStore } from '@/stores';
import { CATEGORIES, EVENT_TAGS, SIZES, FABRICS, CONDITIONS, COLORS, PLATFORM_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ListOutfitFormProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

const STEPS = [
  { id: 1, title: 'Photos', description: 'Upload images of your outfit' },
  { id: 2, title: 'Details', description: 'Title and description' },
  { id: 3, title: 'Category', description: 'Category and occasions' },
  { id: 4, title: 'Size', description: 'Size and measurements' },
  { id: 5, title: 'Pricing', description: 'Set your rental price' },
  { id: 6, title: 'Delivery', description: 'Delivery options' },
];

export function ListOutfitForm({ onComplete, onCancel }: ListOutfitFormProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [gender, setGender] = useState<'women' | 'men' | 'kids'>('women');
  const [category, setCategory] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [size, setSize] = useState('');
  const [measurements, setMeasurements] = useState({ waist: '', chest: '', length: '' });
  const [color, setColor] = useState('');
  const [fabric, setFabric] = useState('');
  const [condition, setCondition] = useState<'like_new' | 'good' | 'fair'>('good');
  const [pricePerDay, setPricePerDay] = useState('');
  const [pricePerWeek, setPricePerWeek] = useState('');
  const [deposit, setDeposit] = useState('');
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery' | 'both'>('pickup');
  const [serviceRadius, setServiceRadius] = useState([5]);
  const [deliveryCharge, setDeliveryCharge] = useState('');

  const progress = ((currentStep - 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(e => e !== eventId)
        : [...prev, eventId]
    );
  };

  const addCustomTag = () => {
    if (newTag && !customTags.includes(newTag) && customTags.length < 10) {
      setCustomTags([...customTags, newTag.toLowerCase().trim()]);
      setNewTag('');
    }
  };

  const removeCustomTag = (tag: string) => {
    setCustomTags(customTags.filter(t => t !== tag));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In a real app, you'd upload to a storage service
      // For demo, we'll use placeholder URLs
      const newImages = Array.from(files).map((_, i) =>
        `https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&t=${Date.now() + i}`
      );
      setImages(prev => [...prev, ...newImages].slice(0, 10));
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          gender,
          eventTags: selectedEvents,
          customTags,
          size,
          measurements: {
            waist: parseFloat(measurements.waist) || undefined,
            chest: parseFloat(measurements.chest) || undefined,
            length: parseFloat(measurements.length) || undefined,
          },
          color,
          fabric,
          condition,
          pricePerDay,
          pricePerWeek,
          deposit,
          deliveryType,
          serviceRadius: serviceRadius[0],
          deliveryCharge,
          images,
        }),
      });

      if (response.ok) {
        onComplete?.();
      }
    } catch (error) {
      console.error('Error creating listing:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return images.length >= 2;
      case 2:
        return title.length >= 5 && description.length >= 20;
      case 3:
        return category !== '' && selectedEvents.length > 0;
      case 4:
        return size !== '';
      case 5:
        return pricePerDay !== '' && parseFloat(deposit) >= PLATFORM_CONFIG.minDeposit;
      case 6:
        return true;
      default:
        return false;
    }
  }, [currentStep, images, title, description, category, selectedEvents, size, pricePerDay, deposit]);

  const categories = gender === 'women' ? CATEGORIES.women :
    gender === 'men' ? CATEGORIES.men : CATEGORIES.kids;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <p className="text-xs text-gray-500">Step {currentStep} of {STEPS.length}</p>
            <p className="font-semibold text-sm">{STEPS[currentStep - 1].title}</p>
          </div>
          <div className="w-10" />
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </header>

      {/* Content */}
      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="p-4">
          <AnimatePresence mode="wait">
            {/* Step 1: Photos */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Add Photos</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Upload at least 2 photos. First photo will be the cover.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={img}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <Badge className="absolute bottom-1 left-1 text-xs">Cover</Badge>
                      )}
                    </div>
                  ))}

                  {images.length < 10 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#1B4332] hover:bg-[#1B4332]/5 transition-colors">
                      <Camera className="w-8 h-8 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>

                {images.length < 2 && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg text-amber-800 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>Add at least 2 photos to continue</p>
                  </div>
                )}

                <div className="flex items-center gap-2 p-3 bg-[#1B4332]/5 rounded-lg text-sm text-gray-600">
                  <Info className="w-5 h-5 shrink-0 text-[#1B4332]" />
                  <p>Tip: Use natural lighting and show the outfit from multiple angles.</p>
                </div>
              </motion.div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Describe Your Outfit</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Help renters understand what makes your outfit special.
                  </p>
                </div>

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Beautiful Red Bridal Lehenga"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1.5"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">{title.length}/100 characters</p>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the outfit, its condition, when it was worn, any special details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1.5 min-h-[120px]"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters (min 20)</p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Category */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Category & Occasions</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Help renters find your outfit easily.
                  </p>
                </div>

                <div>
                  <Label>Gender</Label>
                  <ToggleGroup
                    type="single"
                    value={gender}
                    onValueChange={(v) => v && setGender(v as typeof gender)}
                    className="justify-start gap-2 mt-2"
                  >
                    <ToggleGroupItem value="women" className="px-6">Women</ToggleGroupItem>
                    <ToggleGroupItem value="men" className="px-6">Men</ToggleGroupItem>
                    <ToggleGroupItem value="kids" className="px-6">Kids</ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <div>
                  <Label>Category</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {categories.map((cat) => (
                      <Button
                        key={cat.id}
                        variant={category === cat.id ? 'default' : 'outline'}
                        className={cn(
                          "h-auto py-3 justify-start",
                          category === cat.id && "bg-[#1B4332] hover:bg-[#2D6A4F]"
                        )}
                        onClick={() => setCategory(cat.id)}
                      >
                        {cat.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Occasions</Label>
                  <p className="text-xs text-gray-500 mb-2">Select all that apply</p>
                  <div className="flex flex-wrap gap-2">
                    {EVENT_TAGS.map((event) => (
                      <Badge
                        key={event.id}
                        variant={selectedEvents.includes(event.id) ? 'default' : 'outline'}
                        className={cn(
                          "cursor-pointer transition-all px-3 py-1.5",
                          selectedEvents.includes(event.id)
                            ? "bg-[#1B4332] text-white hover:bg-[#2D6A4F]"
                            : "hover:bg-[#1B4332]/10"
                        )}
                        onClick={() => toggleEvent(event.id)}
                      >
                        {event.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Custom Tags</Label>
                  <p className="text-xs text-gray-500 mb-2">Add tags like "handicraft", "embroidery"</p>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add a tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                    />
                    <Button variant="outline" onClick={addCustomTag}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {customTags.map((tag) => (
                      <Badge key={tag} className="bg-[#C9A84C]/20 text-[#1B4332]">
                        {tag}
                        <button onClick={() => removeCustomTag(tag)} className="ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Size */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Size & Details</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Help renters choose the right fit.
                  </p>
                </div>

                <div>
                  <Label>Size</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {SIZES.map((s) => (
                      <Button
                        key={s}
                        variant={size === s ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                          "px-4",
                          size === s && "bg-[#1B4332] hover:bg-[#2D6A4F]"
                        )}
                        onClick={() => setSize(s)}
                      >
                        {s}
                      </Button>
                    ))}
                    <Button
                      variant={size === 'Free' ? 'default' : 'outline'}
                      size="sm"
                      className={cn(
                        "px-4",
                        size === 'Free' && "bg-[#1B4332] hover:bg-[#2D6A4F]"
                      )}
                      onClick={() => setSize('Free')}
                    >
                      Free Size
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Measurements (in inches) - Optional</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <div>
                      <Input
                        placeholder="Waist"
                        value={measurements.waist}
                        onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
                        type="number"
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Chest"
                        value={measurements.chest}
                        onChange={(e) => setMeasurements({ ...measurements, chest: e.target.value })}
                        type="number"
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Length"
                        value={measurements.length}
                        onChange={(e) => setMeasurements({ ...measurements, length: e.target.value })}
                        type="number"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {COLORS.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setColor(c.name)}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all",
                          color === c.name ? "border-[#C9A84C] scale-110" : "border-gray-200"
                        )}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                  {color && <p className="text-sm text-gray-600 mt-2">Selected: {color}</p>}
                </div>

                <div>
                  <Label>Fabric</Label>
                  <Select value={fabric} onValueChange={setFabric}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select fabric" />
                    </SelectTrigger>
                    <SelectContent>
                      {FABRICS.map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Condition</Label>
                  <div className="space-y-2 mt-2">
                    {CONDITIONS.map((c) => (
                      <Card
                        key={c.id}
                        className={cn(
                          "cursor-pointer transition-all",
                          condition === c.id ? "border-[#1B4332] bg-[#1B4332]/5" : ""
                        )}
                        onClick={() => setCondition(c.id as typeof condition)}
                      >
                        <CardContent className="p-3 flex items-center gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                            condition === c.id ? "border-[#1B4332] bg-[#1B4332]" : "border-gray-300"
                          )}>
                            {condition === c.id && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{c.name}</p>
                            <p className="text-xs text-gray-500">{c.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Pricing */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Set Your Price</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    You can update prices anytime.
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="pricePerDay" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price per Day (₹)</Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                      <Input
                        id="pricePerDay"
                        type="number"
                        placeholder="800"
                        value={pricePerDay}
                        onChange={(e) => setPricePerDay(e.target.value)}
                        className="pl-8 h-12 border-gray-200 focus:ring-[#1B4332]/10"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="pricePerWeek" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price per Week (₹) - Optional</Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                      <Input
                        id="pricePerWeek"
                        type="number"
                        placeholder="4500"
                        value={pricePerWeek}
                        onChange={(e) => setPricePerWeek(e.target.value)}
                        className="pl-8 h-12 border-gray-200 focus:ring-[#1B4332]/10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="deposit" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Security Deposit (₹)</Label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                    <Input
                      id="deposit"
                      type="number"
                      placeholder="2000"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      className="pl-8 h-12 border-gray-200 focus:ring-[#1B4332]/10"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Minimum deposit: ₹{PLATFORM_CONFIG.minDeposit}
                  </p>
                </div>

                <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                  <h4 className="font-bold text-sm text-[#1B4332] mb-4">How Pricing Works</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "You set the rental price and deposit amount",
                      "Deposit is held by platform and released after return",
                      `Platform fee: ${PLATFORM_CONFIG.platformFeePercent}% per booking`,
                      "Payout within 24 hours of completed rental"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-amber-200">
                          <Check className="w-3 h-3 text-[#1B4332] stroke-[3]" />
                        </div>
                        <span className="leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {pricePerDay && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h4 className="font-semibold text-sm text-gray-900 mb-3">Earnings Preview</h4>
                    <div className="space-y-3 text-sm">
                      <div className="pb-3 border-b border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Rental Price (per day)</span>
                          <span className="font-medium text-gray-900">₹{pricePerDay || '0'}</span>
                        </div>
                        <div className="flex justify-between items-center text-red-500 italic">
                          <span className="text-[11px]">Platform Fee ({PLATFORM_CONFIG.platformFeePercent}%)</span>
                          <span className="text-[11px]">-₹{(parseFloat(pricePerDay || '0') * (PLATFORM_CONFIG.platformFeePercent / 100)).toFixed(0)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <span className="font-bold text-gray-900">Total Net Earning</span>
                        <div className="text-right">
                          <span className="font-bold text-[#1B4332] text-lg">₹{(parseFloat(pricePerDay || '0') * (1 - PLATFORM_CONFIG.platformFeePercent / 100)).toFixed(0)}</span>
                          <span className="text-[10px] text-gray-500 block">per day</span>
                        </div>
                      </div>

                      <div className="pt-2 grid grid-cols-2 gap-3">
                        <div className="p-2.5 bg-white rounded-lg border border-gray-100 shadow-sm">
                          <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">3-Day Estimated</p>
                          <p className="text-sm font-bold text-gray-900">₹{(parseFloat(pricePerDay || '0') * 3 * (1 - PLATFORM_CONFIG.platformFeePercent / 100)).toFixed(0)}</p>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-gray-100 shadow-sm">
                          <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">Weekly Estimated</p>
                          <p className="text-sm font-bold text-gray-900">₹{((parseFloat(pricePerWeek) || parseFloat(pricePerDay || '0') * 7) * (1 - PLATFORM_CONFIG.platformFeePercent / 100)).toFixed(0)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-start gap-2 p-2 bg-blue-50/50 rounded-md">
                      <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5" />
                      <p className="text-[10px] text-blue-700 leading-tight">
                        Earnings are automatically credited to your wallet within 24 hours after the rental is completed.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 6: Delivery */}
            {currentStep === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Delivery Options</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    How will renters receive the outfit?
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'pickup', label: 'Pickup Only', icon: Package },
                    { id: 'delivery', label: 'Delivery Only', icon: Truck },
                    { id: 'both', label: 'Both', icon: MapPin },
                  ].map((option) => (
                    <Card
                      key={option.id}
                      className={cn(
                        "cursor-pointer transition-all",
                        deliveryType === option.id ? "border-[#1B4332] bg-[#1B4332]/5" : ""
                      )}
                      onClick={() => setDeliveryType(option.id as typeof deliveryType)}
                    >
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        <option.icon className={cn(
                          "w-6 h-6 mb-2",
                          deliveryType === option.id ? "text-[#1B4332]" : "text-gray-400"
                        )} />
                        <p className="text-sm font-medium">{option.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {(deliveryType === 'delivery' || deliveryType === 'both') && (
                  <>
                    <div>
                      <Label>Serviceable Radius: {serviceRadius[0]} km</Label>
                      <Slider
                        value={serviceRadius}
                        onValueChange={setServiceRadius}
                        min={1}
                        max={20}
                        step={1}
                        className="mt-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Renters within this radius can request delivery
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="deliveryCharge">Delivery Charge (₹)</Label>
                      <div className="relative mt-1.5">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="deliveryCharge"
                          type="number"
                          placeholder="50"
                          value={deliveryCharge}
                          onChange={(e) => setDeliveryCharge(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="p-4 bg-[#1B4332]/5 rounded-lg">
                  <h4 className="font-semibold text-sm text-gray-900 mb-2">Ready to Publish!</h4>
                  <p className="text-sm text-gray-600">
                    Your listing will be reviewed and published within 24 hours. You can edit or pause it anytime from your profile.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          {currentStep < STEPS.length ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 bg-[#1B4332] hover:bg-[#2D6A4F]"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="flex-1 bg-[#1B4332] hover:bg-[#2D6A4F]"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Listing'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
