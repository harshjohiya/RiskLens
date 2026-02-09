import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  UserCheck,
  FileStack,
  BarChart3,
  Brain,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

const features = [
  {
    icon: UserCheck,
    title: "Single Applicant Scoring",
    description:
      "Instantly assess credit risk for individual applicants with real-time PD calculation and decision recommendations.",
  },
  {
    icon: FileStack,
    title: "Batch Scoring",
    description:
      "Process thousands of applications efficiently with CSV upload and asynchronous job processing.",
  },
  {
    icon: BarChart3,
    title: "Portfolio Risk Dashboard",
    description:
      "Monitor your entire portfolio with aggregated risk metrics, distribution charts, and expected loss analysis.",
  },
  {
    icon: Brain,
    title: "Explainable Decisions",
    description:
      "Understand every decision with clear reason codes and risk factor breakdowns for regulatory compliance.",
  },
];

const benefits = [
  "Reduce manual review time by 70%",
  "Consistent, unbiased credit decisions",
  "Full audit trail for compliance",
  "Real-time API integration",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="RiskLens" className="w-10 h-10" />
            <span className="text-xl font-semibold text-foreground">
              RiskLens
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/app/docs">
              <Button variant="ghost" size="sm">
                API Docs
              </Button>
            </Link>
            <Link to="/login">
              <Button size="sm">
                Sign In
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <CheckCircle2 className="w-4 h-4" />
            Enterprise-Grade Credit Risk Platform
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            Smarter Credit Decisions.
            <br />
            <span className="text-primary">Lower Risk.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            End-to-end probability of default calculation, intelligent
            scorecards, expected loss modeling, and fully explainable AI
            decisions for modern lenders.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/app/docs">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View API Docs
                <ExternalLink className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="py-8 bg-secondary/50 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-2 text-sm font-medium text-foreground"
              >
                <CheckCircle2 className="w-5 h-5 text-decision-approve" />
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Complete Risk Assessment Suite
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to make informed credit decisions, from
              individual assessments to portfolio-wide analytics.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 bg-card border border-border rounded-xl hover:shadow-elevated transition-all duration-300 hover:border-primary/20"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 gradient-hero">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Transform Your Credit Decisions?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Start using RiskLens today and experience the power of intelligent
            credit risk assessment.
          </p>
          <Link to="/app">
            <Button
              size="lg"
              variant="secondary"
              className="text-primary font-semibold"
            >
              Launch Application
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-card border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="RiskLens" className="w-10 h-10" />
              <span className="text-lg font-semibold text-foreground">
                RiskLens
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link
                to="/app/docs"
                className="hover:text-foreground transition-colors"
              >
                Documentation
              </Link>
              <a href="#" className="hover:text-foreground transition-colors">
                Security
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Contact
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                GitHub
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} RiskLens. Built for enterprise credit
            risk management.
          </div>
        </div>
      </footer>
    </div>
  );
}
