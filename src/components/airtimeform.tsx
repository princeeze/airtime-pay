"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

// Define the form schema with Zod
const formSchema = z.object({
  phone: z
    .string()
    .min(11, { message: "Phone number must be at least 11 digits" })
    .max(11, { message: "Phone number must not exceed 11 digits" })
    .regex(/^[0-9]+$/, { message: "Phone number must contain only digits" }),
  network: z.string().min(1, { message: "Please select a network" }),
  amount: z
    .string()
    .min(1, { message: "Amount is required" })
    .refine((val) => !isNaN(Number(val)), {
      message: "Amount must be a number",
    })
    .refine((val) => Number(val) >= 50, {
      message: "Amount must be at least 50",
    }),
});

type FormValues = z.infer<typeof formSchema>;

// Fetch available networks
const fetchNetworks = async () => {
  const response = await fetch("/api/airtime");
  if (!response.ok) {
    throw new Error("Failed to fetch networks");
  }
  return response.json();
};

export default function AirtimeForm() {
  const [submissionStatus, setSubmissionStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
      network: "",
      amount: "",
    },
  });

  // Query for fetching networks
  const { data: networks, isLoading: isLoadingNetworks } = useQuery({
    queryKey: ["networks"],
    queryFn: fetchNetworks,
  });

  // Mutation for submitting the form
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await fetch("/api/airtime", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: data.phone,
          firstLevel: data.network,
          amount: data.amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to purchase airtime");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setSubmissionStatus({
        type: "success",
        message: data.message || "Airtime purchased successfully!",
      });
      form.reset();
    },
    onError: (error: Error) => {
      setSubmissionStatus({
        type: "error",
        message:
          error.message || "Failed to purchase airtime. Please try again.",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    setSubmissionStatus({ type: null, message: "" });
    mutate(data);
  };

  return (
    <Card className="shadow-none border-0">
      <CardContent>
        {submissionStatus.type && (
          <Alert
            variant={
              submissionStatus.type === "success" ? "default" : "destructive"
            }
            className="mb-6"
          >
            <AlertTitle>
              {submissionStatus.type === "success" ? "Success" : "Error"}
            </AlertTitle>
            <AlertDescription>{submissionStatus.message}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="08012345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between items-center gap-2">
              <FormField
                control={form.control}
                name="network"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Network</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select network" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingNetworks ? (
                          <SelectItem value="loading" disabled>
                            Loading networks...
                          </SelectItem>
                        ) : (
                          networks &&
                          Object.keys(networks).map((network) => (
                            <SelectItem key={network} value={network}>
                              {network}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₦)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
                        min="50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Purchase Airtime"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
