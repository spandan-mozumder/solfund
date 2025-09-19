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

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  imageUrl: z.string().url().optional().or(z.literal("")),
  targetAmount: z.number().positive(),
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
        toast.success("Campaign created.");
        router.push(`/campaigns/${created.id}`);
      } else if (mode === "edit" && defaultValues?.id) {
        await updateCampaign({ id: defaultValues.id, ...input });
        toast.success("Campaign updated.");
        router.push(`/campaigns/${defaultValues.id}`);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save campaign");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input placeholder="Build a School in XYZ" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Tell the story and impact..." rows={5} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="imageUrl" render={({ field }) => (
          <FormItem>
            <FormLabel>Image URL</FormLabel>
            <FormControl>
              <Input placeholder="https://..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="targetAmount" render={({ field }) => (
          <FormItem>
            <FormLabel>Target Amount (SOL)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0.01}
                step="0.01"
                value={field.value ?? 0}
                onChange={(e) => {
                  const v = parseFloat(e.currentTarget.value);
                  field.onChange(Number.isFinite(v) ? v : 0);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="deadline" render={({ field }) => (
          <FormItem>
            <FormLabel>Deadline (optional)</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : (mode === "create" ? "Create" : "Save Changes")}</Button>
          <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
        </div>
      </form>
    </Form>
  );
}
