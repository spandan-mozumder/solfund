"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { toast } from "sonner";

const schema = z.object({
  currencySymbol: z.string().min(1),
  minDonation: z.number().min(0),
  platformFeePercent: z.number().min(0).max(100),
});

type Values = z.infer<typeof schema>;

export function SettingsForm() {
  const { state, updateSettings } = useStore();
  const [saving, setSaving] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: state.settings,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          try {
            setSaving(true);
            await updateSettings(values);
            toast.success("Settings saved.");
          } catch (e: any) {
            toast.error(e?.message ?? "Failed to save settings");
          } finally {
            setSaving(false);
          }
        })}
        className="space-y-4"
      >
        <FormField control={form.control} name="currencySymbol" render={({ field }) => (
          <FormItem>
            <FormLabel>Currency Symbol</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="minDonation" render={({ field }) => (
          <FormItem>
            <FormLabel>Minimum Donation (SOL)</FormLabel>
            <FormControl>
              <Input type="number" step="0.1" min={0.1} value={field.value ?? 0.1} onChange={(e) => field.onChange(parseFloat(e.currentTarget.value) || 0.1)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="platformFeePercent" render={({ field }) => (
          <FormItem>
            <FormLabel>Platform Fee (%)</FormLabel>
            <FormControl>
              <Input type="number" value={field.value ?? 0} onChange={(e) => field.onChange(parseInt(e.currentTarget.value || "0", 10))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Button>
        </div>
      </form>
    </Form>
  );
}
