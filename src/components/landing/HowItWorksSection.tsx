import { UserPlus, Cpu, FileCheck } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Enter Applicant Details",
    description: "Input customer financial data, credit history, and loan requirements through our intuitive interface.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Analyzes Risk",
    description: "Our machine learning models process the data in real-time, evaluating hundreds of risk factors.",
  },
  {
    icon: FileCheck,
    step: "03",
    title: "Get Score & Decision",
    description: "Receive a comprehensive risk score, approval recommendation, and clear explanation of key factors.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-secondary/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">How It Works</span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-foreground">
            From application to decision in seconds
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Our streamlined process makes credit risk assessment fast, accurate, and transparent.
          </p>
        </div>

        {/* Steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 -translate-y-1/2" />

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <StepCard key={step.title} step={step} index={index} isLast={index === steps.length - 1} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const StepCard = ({
  step,
  index,
  isLast,
}: {
  step: (typeof steps)[0];
  index: number;
  isLast: boolean;
}) => {
  const Icon = step.icon;

  return (
    <div className="relative flex flex-col items-center text-center group">
      {/* Step number bubble */}
      <div className="relative z-10 mb-6">
        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:-translate-y-1">
          <Icon className="w-8 h-8 text-primary-foreground" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-card border-2 border-primary flex items-center justify-center text-xs font-bold text-primary shadow-md">
          {step.step}
        </div>
      </div>

      {/* Content */}
      <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-card hover:shadow-lg transition-all w-full">
        <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
      </div>

      {/* Arrow (hidden on last item and mobile) */}
      {!isLast && (
        <div className="hidden lg:block absolute top-10 -right-6 text-primary/40">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-pulse-slow">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  );
};
