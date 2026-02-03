import { Brain, TrendingUp, Eye, Building } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Based Credit Scoring",
    description: "Probability of Default, risk bands, and scorecards powered by advanced machine learning models.",
  },
  {
    icon: TrendingUp,
    title: "Expected Loss Forecasting",
    description: "PD × LGD × EAD calculations with comprehensive portfolio insights and trend analysis.",
  },
  {
    icon: Eye,
    title: "Explainable Decisions",
    description: "Transparent AI with clear risk drivers and decision explanations for regulatory compliance.",
  },
  {
    icon: Building,
    title: "Enterprise-Ready",
    description: "Built for compliance, governance, and scale with SOC 2 Type II certification.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Features</span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-foreground">
            Everything you need for intelligent credit decisions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Our platform combines cutting-edge AI with financial expertise to deliver accurate, explainable risk assessments.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) => {
  const Icon = feature.icon;

  return (
    <div
      className="group relative bg-card rounded-2xl p-6 border border-border/50 shadow-card hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-shadow">
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>

      {/* Hover accent */}
      <div className="absolute inset-x-0 bottom-0 h-1 rounded-b-2xl gradient-primary opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};
