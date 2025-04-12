import { useState, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertAssetSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

// Extend the insert schema with validation rules
const uploadSchema = insertAssetSchema.extend({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(100, "Price must be at least $1.00"),
  file: z.any().refine((file) => file && file.length > 0, "File is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  categories: z.array(z.string()).min(1, "At least one category is required"),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

const UploadForm = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "photo",
      price: 999, // $9.99
      licenseType: "standard",
      tags: [],
      categories: [],
    },
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Set file in form
      form.setValue("file", e.target.files);
      
      // Generate preview
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
        
        // If it's an image, try to get dimensions
        if (file.type.startsWith("image/")) {
          const img = new Image();
          img.onload = () => {
            form.setValue("width", img.width);
            form.setValue("height", img.height);
          };
          img.src = reader.result as string;
        }
        
        // Set file size
        form.setValue("fileSize", file.size);
        
        // Auto detect type based on file type
        if (file.type.startsWith("image/")) {
          if (file.type.includes("svg")) {
            form.setValue("type", "vector");
          } else {
            form.setValue("type", "photo");
          }
        } else if (file.type.startsWith("video/")) {
          form.setValue("type", "video");
        } else if (file.type.startsWith("audio/")) {
          form.setValue("type", "music");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = () => {
    if (tagInput.trim()) {
      const currentTags = form.getValues("tags") || [];
      if (!currentTags.includes(tagInput.trim())) {
        form.setValue("tags", [...currentTags, tagInput.trim()]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const addCategory = () => {
    if (categoryInput.trim()) {
      const currentCategories = form.getValues("categories") || [];
      if (!currentCategories.includes(categoryInput.trim())) {
        form.setValue("categories", [...currentCategories, categoryInput.trim()]);
        setCategoryInput("");
      }
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    const currentCategories = form.getValues("categories") || [];
    form.setValue(
      "categories",
      currentCategories.filter((category) => category !== categoryToRemove)
    );
  };

  const onSubmit = async (values: UploadFormValues) => {
    try {
      // In a real implementation, we would upload the file to a storage service
      // and then save the asset with the file URL
      
      // Mock the file upload
      const fileUrl = filePreview || "https://placeholder.com/image.jpg";
      const thumbnailUrl = filePreview || "https://placeholder.com/image-thumbnail.jpg";
      
      // Create the asset without the file field
      const { file, ...assetData } = values;
      
      const assetToSubmit = {
        ...assetData,
        url: fileUrl,
        thumbnailUrl: thumbnailUrl,
      };
      
      // Send to the server
      await apiRequest("POST", "/api/assets", assetToSubmit);
      
      // Invalidate queries to refetch the data
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      
      toast({
        title: "Asset uploaded",
        description: "Your asset has been uploaded and is pending approval.",
      });
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading your asset.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* File upload section */}
        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
          {filePreview ? (
            <div className="relative">
              <div className="relative overflow-hidden rounded-md">
                {filePreview.startsWith("data:image") ? (
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="mx-auto max-h-64 object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center bg-neutral-100 h-64 rounded-md">
                    <span className="text-neutral-600">File uploaded</span>
                  </div>
                )}
                {/* Watermark overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-primary text-opacity-70 text-3xl font-bold transform rotate-[-30deg]">
                    JawaStock
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setFilePreview(null);
                  form.setValue("file", null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <FormField
                control={form.control}
                name="file"
                render={({ field: { ref, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel className="cursor-pointer flex flex-col items-center">
                      <div className="p-4 rounded-full bg-primary/10 mb-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary h-6 w-6"
                        >
                          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                          <path d="M12 12v9"></path>
                          <path d="m16 16-4-4-4 4"></path>
                        </svg>
                      </div>
                      <span className="text-lg font-medium mb-1">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-sm text-neutral-500 mb-4">
                        SVG, PNG, JPG, MP4 or MOV (max. 50MB)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        className="hidden"
                        accept="image/*,video/*"
                        ref={ref}
                        {...field}
                        onChange={(e) => {
                          onChange(e);
                          handleFileChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        {/* Asset details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter asset title" {...field} />
                </FormControl>
                <FormDescription>
                  A descriptive title for your asset.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asset Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="photo">Photo</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="vector">Vector</SelectItem>
                    <SelectItem value="illustration">Illustration</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Type of asset you are uploading.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter a detailed description of your asset"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide details about your asset to help users find it.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (cents)</FormLabel>
                <FormControl>
                  <Input type="number" min="100" step="1" {...field} />
                </FormControl>
                <FormDescription>
                  Price in cents (e.g., 999 = $9.99)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="licenseType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select license type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="extended">Extended</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Type of license for your asset.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tags input */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {field.value?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 text-neutral-500 hover:text-red-500"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>
                  Add
                </Button>
              </div>
              <FormDescription>
                Keywords that describe your asset. Press Enter or click Add to add each tag.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Categories input */}
        <FormField
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categories</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {field.value?.map((category) => (
                  <Badge key={category} variant="outline" className="flex items-center gap-1">
                    {category}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 text-neutral-500 hover:text-red-500"
                      onClick={() => removeCategory(category)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a category"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                />
                <Button type="button" onClick={addCategory}>
                  Add
                </Button>
              </div>
              <FormDescription>
                Categories that your asset belongs to. Press Enter or click Add to add each category.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-primary text-white"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Uploading..." : "Upload Asset"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UploadForm;
