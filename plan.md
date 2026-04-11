# Landing Page Implementation Plan

This plan outlines the steps to implement the BizRent landing page according to the provided brand identity, tech stack, and detailed section specifications.

## Overall Approach

The landing page will be built as a new React component, likely `src/pages/LandingPage.tsx`, leveraging the specified tech stack (React, TypeScript, shadcn/ui, Tailwind CSS, Framer Motion, Lucide React). Existing `index.html` will be updated to mount this new React component.

## Dependencies and Setup

1.  **Verify `src/pages/super-admin/Users.tsx` fix**: Confirm `ShieldSlash` is replaced with `ShieldOff` (already confirmed).
2.  **Clean up existing landing page artifacts**: Remove all old landing page related files (already done).
3.  **Install necessary libraries**: Ensure `framer-motion` and `lucide-react` are installed.
4.  **Tailwind CSS configuration**: Verify Tailwind CSS is correctly configured to handle new utility classes.
5.  **Font Loading**: Ensure Inter font is loaded via Google Fonts.

## Section 1: Navigation Bar

1.  **Component Creation**: Create a `NavigationBar.tsx` component.
2.  **Layout and Styling**:
    *   Fixed, full-width, transparent on load → blur-glass on scroll (backdrop-blur-xl bg-white/80 border-b border-gray-100/50)
    *   Left: BizRent logo with icon and wordmark (`Biz` navy, `Rent` green #00C853, 32px height).
    *   Center: Nav links (`Features`, `How It Works`, `Pricing`, `About`) with specified styling and underline animation on hover.
    *   Right CTAs: "Log in" (ghost button) and "Get early access" (filled pill button with green background and subtle shadow).
3.  **Mobile Menu**: Implement a hamburger menu that toggles a full-screen slide-down panel with stacked links and CTAs.
4.  **Animations**: Staggered fade-up animation for nav items on page load using Framer Motion (0.05s delay increments).

## Section 2: Hero — The Hook

1.  **Component Creation**: Create a `HeroSection.tsx` component.
2.  **Layout**: Full viewport height, centered content.
3.  **Background**: Integrate the `BackgroundPaths` animated SVG component with floating curved paths (navy `rgba(13,27,62,0.08)` on white).
4.  **Eyebrow Label**: Implement the `[ 🇷🇼 Rwanda's First MoMo-First Platform ]` pill badge with specified styling.
5.  **Main Headline**:
    *   `Stop chasing.`
    *   `Start collecting.`
    *   Apply letter-by-letter spring animation (`Framer Motion`, `type: "spring", stiffness: 150, damping: 25`).
    *   `collecting.` will have a green underline flourish that draws in on load.
    *   Font: 80px–96px, extra-bold, tight tracking, navy `#0D1B3E`.
6.  **Subheadline**: Implement the 20px, weight 400, `text-gray-600` subheadline.
7.  **Hero CTAs**: Side-by-side on desktop, stacked on mobile.
    *   Primary: "Get early access — it's free" (large green pill button).
    *   Secondary: "See how it works ↓" (ghost, navy text, smooth scroll anchor).
8.  **Trust Microcopy**: Implement three items (`✓ No WhatsApp chaos`, `✓ MTN MoMo native`, `✓ Instant receipts`) with green checkmarks.
9.  **Hero Image**: Generate and integrate a photorealistic 3D product mockup of a MacBook Pro displaying the BizRent dashboard, following the detailed description. Ensure WebP format and lazy loading.

## Section 3: Social Proof Ticker

1.  **Component Creation**: Create a `TickerSection.tsx` component.
2.  **Layout**: Full-width, `bg-gray-50`, 80px height, subtle top/bottom border.
3.  **Left Label**: "Trusted by landlords managing" in gray text.
4.  **Scrolling Numbers**: Implement an infinite, slow, pausable slider with the specified stats (1,200+ units tracked, RWF 45M+ collected, etc.). Use monospace font, `text-[#0D1B3E]` font-bold, `text-lg`, with separator dots.

## Section 4: The Problem — Emotional Pain Section

1.  **Component Creation**: Create a `ProblemSection.tsx` component.
2.  **Section Header**: Implement the "Rent collection is a monthly administrative nightmare." headline with red underline flourish on "nightmare."
3.  **Subtext**: Implement the accompanying subtext.
4.  **Problem Cards Grid**: Create a 2x2 grid (desktop) / 1-column (mobile) of cards. Each card will have specific icons (Lucide React: `MessageSquare`, `AlertTriangle`, `FileX`, `Globe`), titles, and body text.
5.  **Testimonial Pull-quote**: Integrate the pull-quote from Mutoni Claudette, with large italic navy text, bold author, small avatar circle, and a left border in `#00C853`.
6.  **Problem Section Image**: Generate and integrate a stylized split illustration showing contrasting scenes of "The Problem" and "The Solution" (partially revealed).

## Section 5: How It Works — 3-Step Flow

1.  **Component Creation**: Create a `HowItWorksSection.tsx` component.
2.  **Section Header & Subtext**: Implement the specified header and subtext.
3.  **Steps Layout**: Horizontal (3 columns with connecting line/arrow) on desktop, vertical stack on mobile.
4.  **Step Cards**: Implement three cards (Step 01, 02, 03) with large faded navy background numbers, centered icons (Smartphone with MTN yellow/green circle, `CheckCircle` in green, `FileText` in gold), titles, and descriptions. Cards animate in sequentially on scroll.
5.  **How It Works Visual**: Generate and integrate a 3-panel UI mockup sequence showing BizRent's workflow across three smartphone screens, following the detailed description.

## Section 6: Features — The Arsenal

1.  **Component Creation**: Create a `FeaturesSection.tsx` component.
2.  **Section Header & Subtext**: Implement the specified header and subtext.
3.  **Feature Grid**: Create a grid (3 columns desktop, 2 tablet, 1 mobile) of feature cards. Each card will have an icon in a colored circle (Lucide React: `LayoutDashboard`, `ShieldCheck`, `FileText`, `Users`, `BarChart3`, `Bell`), bold title, 2-3 line description. Core features will have a "Core feature" badge in green.
4.  **Feature Section Dashboard Visual**: Generate and integrate a widescreen dashboard screenshot mockup, following the detailed description.

## Section 7: Comparison Table — The Knockout

1.  **Component Creation**: Create a `ComparisonTableSection.tsx` component.
2.  **Section Header**: Implement "The old way vs. the BizRent way."
3.  **Table Design**: Create a clean, bordered table with alternating row backgrounds. BizRent column will have a green header and subtle green column highlight. "Old Way" column will be muted gray.
4.  **Market Stats Bar**: Implement 4 stats (5.8M, $95B, 30%, 0) with large navy/green gradient numbers and gray labels below. Numbers will count up from 0 on scroll.

## Section 8: Testimonials — Social Proof

1.  **Component Creation**: Create a `TestimonialsSection.tsx` component.
2.  **Section Header**: Implement "What Kigali property owners are saying."
3.  **Testimonial Cards**: Create a 3-column desktop layout for testimonial cards. Each card will include a star rating, quote, avatar circle with initials, name, and role/unit count.
4.  **Testimonial Section Visual**: Generate three circular avatar portrait illustrations for use as testimonial profile photos, following the detailed description. Implement horizontal drag-scroll for mobile.

## Section 9: Pricing

1.  **Component Creation**: Create a `PricingSection.tsx` component.
2.  **Section Header & Subtext**: Implement the specified header and subtext.
3.  **Pricing Cards**: Implement three pricing tiers (Starter, Growth, Portfolio) using a `ModernPricingPage` component with a WebGL animated background. Adapt colors to BizRent brand (navy/green gradient).

## Section 10: Final CTA — The Close

1.  **Component Creation**: Create a `FinalCtaSection.tsx` component.
2.  **Background**: Deep navy `#0D1B3E` full-width section. Integrate a hero background texture with abstract Kigali skyline silhouette and subtle green/gold particle points.
3.  **Headline**: Implement "Your rent collection. Finally organised." with white text and "organised." in `#00C853`.
4.  **Subtext**: Implement the accompanying subtext.
5.  **Email Capture Form**: Implement an email input with a "Join the early access waitlist" button.
6.  **Trust Signals**: Implement three trust signals below the form.

## Section 11: Footer

1.  **Component Creation**: Create a `FooterSection.tsx` component.
2.  **Layout**: 4-column grid on desktop, stacked mobile. Dark background (`#0B1630`).
3.  **Content**: Implement BizRent logo, tagline, geographic label, founded by note, product links, company links, legal links, and the bottom bar copyright information with co-founder attribution.

## Global Animations and Responsiveness

1.  **Framer Motion**: Apply on-scroll reveal, staggered children, hero headline letter-by-letter, stats counter, nav blur, and CTA button subtle scale pulse animations as specified.
2.  **Responsive Breakpoints**: Ensure responsiveness for mobile (< 768px), tablet (768px–1024px), and desktop (> 1024px) with specified layout adjustments.
3.  **Performance**: Lazy-load hero image (WebP), use `display=swap` for fonts, use `will-change: transform` for animated elements, respect `reduced-motion` media query, and render WebGL pricing background only when in viewport.

## Quality Checklist

Before completing, verify all points from the user's "FINAL QUALITY CHECKLIST".

This plan provides a structured approach to implementing the BizRent landing page. I will proceed with creating the necessary React components and integrating them into the main application.