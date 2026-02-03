import { TrendingUp, AlertTriangle, DollarSign, Gauge } from "lucide-react";

export const HeroDashboard = () => {
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Main Dashboard Card */}
      <div className="relative bg-card rounded-2xl shadow-card border border-border/50 p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Credit Risk Assessment</h3>
            <p className="text-sm text-muted-foreground">Applicant ID: #2847391</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" />
            <span className="text-sm font-medium text-accent">Live Analysis</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Gauge className="w-5 h-5 text-primary" />}
            label="Risk Score"
            value="742"
            subtext="Good"
            color="primary"
          />
          <StatCard
            icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
            label="PD Rate"
            value="2.3%"
            subtext="Low Risk"
            color="amber"
          />
          <StatCard
            icon={<DollarSign className="w-5 h-5 text-accent" />}
            label="Expected Loss"
            value="$1,240"
            subtext="Monthly"
            color="accent"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-primary" />}
            label="Confidence"
            value="94%"
            subtext="High"
            color="primary"
          />
        </div>

        {/* Risk Gauge */}
        <div className="bg-secondary/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Risk Level Distribution</span>
            <span className="text-xs text-muted-foreground">Updated 2s ago</span>
          </div>
          <div className="flex gap-1 h-3 rounded-full overflow-hidden">
            <div className="w-[15%] bg-accent transition-all duration-1000" style={{ animation: 'progressFill 1s ease-out' }} />
            <div className="w-[25%] bg-primary/80 transition-all duration-1000" style={{ animation: 'progressFill 1.2s ease-out' }} />
            <div className="w-[35%] bg-amber-400 transition-all duration-1000" style={{ animation: 'progressFill 1.4s ease-out' }} />
            <div className="w-[15%] bg-orange-500 transition-all duration-1000" style={{ animation: 'progressFill 1.6s ease-out' }} />
            <div className="w-[10%] bg-destructive transition-all duration-1000" style={{ animation: 'progressFill 1.8s ease-out' }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Very Low</span>
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
            <span>Critical</span>
          </div>
        </div>
      </div>

      {/* Floating Cards */}
      <div className="absolute -left-6 top-1/4 animate-float hidden lg:block">
        <FloatingCard
          icon={<TrendingUp className="w-4 h-4 text-accent" />}
          title="LGD Analysis"
          value="38%"
        />
      </div>

      <div className="absolute -right-6 top-1/3 animate-float-delayed hidden lg:block">
        <FloatingCard
          icon={<DollarSign className="w-4 h-4 text-primary" />}
          title="EAD"
          value="$54,200"
        />
      </div>

      <div className="absolute -right-4 bottom-8 animate-float-slow hidden lg:block">
        <FloatingCard
          icon={<Gauge className="w-4 h-4 text-amber-500" />}
          title="DTI Ratio"
          value="28%"
        />
      </div>
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  color: "primary" | "amber" | "accent";
}) => {
  const bgColors = {
    primary: "bg-primary/5",
    amber: "bg-amber-500/5",
    accent: "bg-accent/5",
  };

  return (
    <div className={`${bgColors[color]} rounded-xl p-4 border border-border/30`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{subtext}</div>
    </div>
  );
};

const FloatingCard = ({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) => (
  <div className="bg-card rounded-xl shadow-card border border-border/50 p-4 backdrop-blur-sm">
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-xs text-muted-foreground">{title}</span>
    </div>
    <div className="text-lg font-bold text-foreground">{value}</div>
  </div>
);
