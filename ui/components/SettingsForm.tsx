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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Settings, Save, Loader2 } from "lucide-react";

const schema = z.object({
  currencySymbol: z.string().min(1),
  minDonation: z.number().min(0.1),
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
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your crowdfunding platform preferences
        </p>
      </div>
      
      <Card className="mx-auto max-w-xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration
          </CardTitle>
          <CardDescription>
            Adjust your platform settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values) => {
                try {
                  setSaving(true);
                  await updateSettings(values);
                  toast.success("Settings saved!");
                } catch (e: any) {
                  toast.error(e?.message ?? "Failed to save");
                } finally {
                  setSaving(false);
                }
              })}
              className="space-y-4"
            >
              <FormField 
                control={form.control} 
                name="currencySymbol" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency Symbol</FormLabel>
                    <FormControl>
                      <Input className="h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
              
              <FormField 
                control={form.control} 
                name="minDonation" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Donation</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        className="h-12"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0.1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
              
              <FormField 
                control={form.control} 
                name="platformFeePercent" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform Fee (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        className="h-12"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
              
              <Button
                type="submit"
                disabled={saving}
                className="w-full h-12"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
