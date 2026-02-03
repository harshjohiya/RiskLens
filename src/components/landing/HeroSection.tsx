import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HeroDashboard } from "./HeroDashboard";
import { ArrowRight, Play } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen gradient-hero overflow-hidden pt-16">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center pt-16 md:pt-24 pb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-8 animate-fade-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-sm font-medium text-foreground">
              Trusted by 500+ Financial Institutions
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center max-w-4xl mb-6 animate-fade-up leading-tight">
            Make Smarter Lending Decisions with{" "}
            <span className="text-primary">AI-Driven Risk Intelligence</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl mb-10 animate-fade-up-delayed">
            Instantly assess credit risk, predict default probability, and quantify expected loss — all in one platform.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up-delayed">
            <Link to="/signup">
              <Button variant="hero" size="xl" className="gap-2 group">
                Get Started
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button variant="heroOutline" size="xl" className="gap-2">
              <Play className="w-5 h-5" />
              View Demo
            </Button>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 md:mt-24 w-full animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <HeroDashboard />
          </div>
        </div>
      </div>
    </section>
  );
};
