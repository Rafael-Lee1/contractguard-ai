# UI Component Library - Usage Guide

## Overview

The new reusable UI component library in `src/components/ui/` provides production-ready components for building the ContractGuard AI interface.

## Components

### 1. Button

**Features**: Gradient backgrounds, loading state, multiple variants and sizes

```typescript
import { Button } from "@/components/ui";

// Basic usage
<Button onClick={() => {}}>Click me</Button>

// With variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Delete</Button>
<Button variant="outline">Outline</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With loading state
<Button isLoading>Uploading...</Button>

// With icon
<Button icon={<Zap className="w-5 h-5" />}>Start</Button>

// All together
<Button 
  variant="primary" 
  size="lg" 
  isLoading={isProcessing}
  icon={<Zap className="w-5 h-5" />}
  disabled={!isReady}
>
  Process Contract
</Button>
```

**Props**:
- `variant`: "primary" | "secondary" | "danger" | "outline"
- `size`: "sm" | "md" | "lg"
- `isLoading`: boolean
- `disabled`: boolean
- `icon`: ReactNode
- `onClick`: () => void
- `className`: string

---

### 2. Card

**Features**: Glass effect, hover animations, gradient support

```typescript
import { Card } from "@/components/ui";

// Basic card
<Card>
  <h3>Content</h3>
  <p>Card content here</p>
</Card>

// With gradient background
<Card gradient>
  Gradient card content
</Card>

// Without hover effect
<Card hover={false}>
  Static card
</Card>

// With delay animation
<Card delay={0.1}>
  Animated card
</Card>

// Complete example
<Card gradient delay={0.2} className="space-y-4">
  <h2>Analysis Results</h2>
  <p>Your contract analysis is ready</p>
</Card>
```

**Props**:
- `children`: ReactNode
- `className`: string
- `hover`: boolean (default: true)
- `gradient`: boolean (default: false)
- `delay`: number (in seconds)

---

### 3. Badge

**Features**: Status indicators with severity variants

```typescript
import { Badge } from "@/components/ui";

// Variants
<Badge variant="default">Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Danger</Badge>
<Badge variant="info">Info</Badge>

// Use cases
<Badge variant="success">Low Risk</Badge>
<Badge variant="warning">Medium Risk</Badge>
<Badge variant="danger">High Risk</Badge>
<Badge variant="info">Analyzed</Badge>
```

**Props**:
- `children`: ReactNode
- `variant`: "default" | "success" | "warning" | "danger" | "info"
- `className`: string

---

### 4. LoadingSpinner

**Features**: Animated spinner with optional text

```typescript
import { LoadingSpinner } from "@/components/ui";

// Basic spinner
<LoadingSpinner />

// Different sizes
<LoadingSpinner size="sm" />  {/* 16px */}
<LoadingSpinner size="md" />  {/* 24px */}
<LoadingSpinner size="lg" />  {/* 32px */}

// With text
<LoadingSpinner text="Loading..." />
<LoadingSpinner size="lg" text="Analyzing contract..." />
```

**Props**:
- `size`: "sm" | "md" | "lg"
- `text`: string (optional)

---

### 5. Header

**Features**: Sticky navigation with mobile menu

```typescript
import { Header } from "@/components/ui";

// Used in layout.tsx globally - no props needed
// Auto-includes:
// - Logo with brain icon
// - Navigation links
// - Mobile hamburger menu
// - CTA button to /upload

// Usage in layout
import { Header } from "@/components/ui";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

**Features**:
- Sticky positioning
- Mobile responsive menu
- Logo with animation
- Navigation links
- CTA button
- Glass effect

---

### 6. FileInput

**Features**: Modern drag-and-drop file input

```typescript
import { FileInput } from "@/components/ui";

function MyUploader() {
  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  return (
    <FileInput
      accept=".pdf"
      onChange={handleChange}
      disabled={isUploading}
      fileName={fileName}
    />
  );
}
```

**Props**:
- `accept`: string (file types, e.g., ".pdf")
- `onChange`: (event: ChangeEvent<HTMLInputElement>) => void
- `disabled`: boolean
- `fileName`: string (optional, displays selected file)

---

### 7. Alert

**Features**: Animated alert messages with dismissible option

```typescript
import { Alert } from "@/components/ui";

// Types
<Alert type="success" message="Contract uploaded!" />
<Alert type="error" message="Upload failed. Try again." />
<Alert type="info" message="Processing your request..." />
<Alert type="warning" message="Please review before submitting." />

// Dismissible
<Alert 
  type="error"
  message="Something went wrong"
  onClose={() => setError(null)}
/>

// Custom icon
<Alert
  type="success"
  message="Analysis complete"
  icon={<CheckCircle2 className="w-5 h-5" />}
/>

// Complex content
<Alert
  type="error"
  message={
    <div className="space-y-2">
      <p className="font-bold">Error Details</p>
      <p>The file could not be processed</p>
    </div>
  }
/>
```

**Props**:
- `type`: "success" | "error" | "info" | "warning"
- `message`: string | ReactNode
- `onClose`: () => void (optional)
- `icon`: ReactNode (optional)

---

## Complete Example: Contract Upload Form

```typescript
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import {
  Button,
  Card,
  Badge,
  FileInput,
  Alert,
  LoadingSpinner,
} from "@/components/ui";

export function ContractForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Upload logic here
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSuccess(true);
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card gradient>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Upload Contract</h2>
            {success && <Badge variant="success">Uploaded</Badge>}
          </div>

          {!success ? (
            <>
              <FileInput
                accept=".pdf"
                onChange={handleFileChange}
                disabled={isLoading}
                fileName={file?.name}
              />

              {error && (
                <Alert
                  type="error"
                  message={error}
                  onClose={() => setError(null)}
                />
              )}

              <Button
                onClick={handleUpload}
                disabled={!file || isLoading}
                isLoading={isLoading}
                icon={<Zap className="w-5 h-5" />}
                className="w-full"
              >
                {isLoading ? "Uploading..." : "Upload & Analyze"}
              </Button>
            </>
          ) : (
            <>
              <Alert type="success" message="Contract uploaded successfully!" />
              <Button variant="secondary" onClick={() => setSuccess(false)}>
                Upload Another
              </Button>
            </>
          )}
        </div>
      </Card>

      {isLoading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" text="Processing your contract..." />
        </div>
      )}
    </motion.div>
  );
}
```

---

## Styling Notes

### Tailwind CSS Utilities

Available custom utilities in `globals.css`:

```css
.glass                 /* Glass effect with backdrop blur */
.glass-light          /* Lighter glass effect */
.gradient-text        /* Gradient text effect */
.animate-fade-in      /* Fade in animation */
.animate-fade-in-up   /* Fade in with slide up */
.animate-fade-in-down /* Fade in with slide down */
.animate-scale-in     /* Scale and fade in */
.animate-slide-in-right /* Slide from right */
.animate-pulse-glow   /* Pulsing glow effect */
```

### Adding to Components

```typescript
<div className="glass rounded-2xl p-6">
  <h1 className="gradient-text">Styled Content</h1>
</div>
```

---

## Best Practices

1. **Use TypeScript**: Components are fully typed
2. **Combine components**: Stack components for complex layouts
3. **Leverage Framer Motion**: Use motion features for animations
4. **Keep it simple**: Let components do the heavy lifting
5. **Respect accessibility**: Components maintain a11y standards
6. **Mobile first**: All components are mobile-responsive

---

## Migration Guide

If updating existing components:

1. Replace old button styles with `<Button>`
2. Replace card `<div>` with `<Card>`
3. Replace badge `<span>` with `<Badge>`
4. Add `LoadingSpinner` to async operations
5. Use `Alert` instead of custom error messages

---

## Component Architecture

- All components use Framer Motion for animations
- CSS is handled via Tailwind + globals.css
- Components accept className for customization
- All animations use cubic-bezier easing functions
- Animations respect prefers-reduced-motion

---

**Ready to build!** These components are production-tested and ready for scaling.
