"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#8B5CF6",
          colorBackground: "#0a0a0a",
          colorInputBackground: "#1a1a1a",
          colorInputText: "#fafafa",
          colorText: "#fafafa",
          colorTextSecondary: "#a1a1aa",
          borderRadius: "0.625rem",
        },
        elements: {
          formButtonPrimary:
            "bg-primary hover:bg-primary/90 text-white",
          card: "bg-card border border-border shadow-xl",
          headerTitle: "text-foreground",
          headerSubtitle: "text-muted-foreground",
          socialButtonsBlockButton:
            "bg-secondary border border-border hover:bg-accent",
          formFieldLabel: "text-foreground",
          formFieldInput:
            "bg-secondary border border-border focus:border-primary",
          footerActionLink: "text-primary hover:text-primary/80",
          identityPreviewText: "text-foreground",
          identityPreviewEditButton: "text-primary",
          rootBox: "bg-background",
          cardBox: "bg-card",
        },
      }}
    >
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0a0a0a",
            border: "1px solid #262626",
            color: "#fafafa",
          },
        }}
      />
    </ClerkProvider>
  );
}
