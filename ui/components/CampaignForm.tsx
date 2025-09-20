"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useStore } from "@/lib/store";
import { CreateCampaignInput, Campaign } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ImageIcon, Target, FileText, Calendar, Loader2 } from "lucide-react";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageUrl: z.string().url().optional().or(z.literal("")),
  targetAmount: z.number().positive("Target amount must be positive"),
  deadline: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export function CampaignForm({ defaultValues, mode }: { defaultValues?: Partial<Campaign>; mode: "create" | "edit" }) {
  const { createCampaign, updateCampaign } = useStore();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      imageUrl: defaultValues?.imageUrl ?? "",
      targetAmount: defaultValues?.targetAmount ?? 1,
      deadline: defaultValues?.deadline ?? "",
    },
  });

  const onSubmit = async (values: Values) => {
    const input: CreateCampaignInput = {
      title: values.title,
      description: values.description,
      imageUrl: values.imageUrl || undefined,
      targetAmount: values.targetAmount,
      deadline: values.deadline || undefined,
    };
    
    try {
      setSubmitting(true);
      if (mode === "create") {
        const created = await createCampaign(input);
        toast.success("Campaign created successfully!");
        router.push(`/campaigns/${created.id}`);
      } else if (mode === "edit" && defaultValues?.id) {
        await updateCampaign({ id: defaultValues.id, ...input });
        toast.success("Campaign updated successfully!");
        router.push(`/campaigns/${defaultValues.id}`);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save campaign");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto max-w-2xl shadow-lg">
      <CardHeader className="text-center border-b">
        <CardTitle className="text-2xl font-bold">
          {mode === "create" ? "Create New Campaign" : "Edit Campaign"}
        </CardTitle>
        <CardDescription className="text-base">
          {mode === "create" 
            ? "Fill in the details to create your crowdfunding campaign"
            : "Update your campaign details and settings"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField 
              control={form.control} 
              name="title" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Campaign Title
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Build a School in Rural Community" 
                      className="h-12 text-base" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            
            <FormField 
              control={form.control} 
              name="description" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell your story and explain the impact..." 
                      rows={6}
                      className="resize-none text-base"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField 
                control={form.control} 
                name="imageUrl" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Image URL
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://..." 
                        className="h-12"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
              
              <FormField 
                control={form.control} 
                name="targetAmount" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Target (SOL)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        placeholder="10.0"
                        className="h-12"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
            </div>
            
            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 h-12"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 h-12"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "create" ? "Creating..." : "Updating..."}
                  </>
                ) : (
                  mode === "create" ? "Create Campaign" : "Update Campaign"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
