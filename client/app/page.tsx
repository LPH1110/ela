import { OnboardingModal } from "@/components/modals";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, UserMinus, Network, Plus, RefreshCw } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <h2 className="text-2xl font-semibold text-foreground mb-1">Welcome back, Admin.</h2>
        <p className="text-sm text-muted-foreground">Here is the latest overview of your HR and IT operations.</p>
      </div>

      {/* Bento Grid - Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <MetricCard title="Total Employees" value="1,248" subValue="+12 this month" subValueColor="text-primary" icon={<Users size={20} />} />
        <MetricCard title="Pending Onboarding" value="12" subValue="3 require attention" subValueColor="text-muted-foreground" icon={<UserPlus size={20} />} />
        <MetricCard title="Recent Offboards" value="5" subValue="In last 30 days" subValueColor="text-muted-foreground" icon={<UserMinus size={20} />} />
        <MetricCard title="Active Integrations" value="18" subValue="All systems operational" subValueColor="text-muted-foreground" icon={<Network size={20} />} />
      </div>

      {/* Asymmetric Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Panel (Spans 2 cols) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl flex flex-col shadow-sm">
          <div className="border-b border-border p-5 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Activity Feed</h3>
            <button className="text-primary text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="p-5 flex-1">
            {/* Vertical Timeline */}
            <div className="relative pl-6 border-l border-border ml-2 space-y-6">
              <TimelineItem time="10:42 AM" user="John Doe" action="GitHub access revoked for" status="Access removal confirmed" statusColor="text-destructive" dotColor="bg-destructive" />
              <TimelineItem time="09:15 AM" user="Jane Smith" action="Slack account provisioned for" status="Provisioning successful" statusColor="text-emerald-500" dotColor="bg-emerald-500" />
              <TimelineItem time="Yesterday, 4:30 PM" user="Alex Johnson" action="Google Workspace account created for" status="Provisioning successful" statusColor="text-emerald-500" dotColor="bg-emerald-500" />
              <TimelineItem time="Yesterday, 2:00 PM" user="" action="System sync initiated across all integrations." status="Routine maintenance" statusColor="text-muted-foreground" dotColor="bg-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Secondary Panel (Spans 1 col) */}
        <div className="bg-card border border-border rounded-xl flex flex-col p-5 gap-4 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <OnboardingModal>
              <Button className="w-full flex items-center gap-2">
                <Plus size={18} /> Start Onboarding
              </Button>
            </OnboardingModal>
            <Button variant="outline" className="w-full flex items-center gap-2">
              <RefreshCw size={18} /> Force Sync Integrations
            </Button>
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">System Status</h4>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-foreground">API Gateway (Operational)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-foreground">Webhook Services (Operational)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Components cho Dashboard
function MetricCard({ title, value, subValue, subValueColor, icon }: any) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-2 shadow-sm">
      <div className="flex justify-between items-center text-muted-foreground mb-2">
        <span className="text-xs uppercase tracking-wider font-medium">{title}</span>
        {icon}
      </div>
      <div className="text-3xl font-semibold text-foreground tracking-tight">{value}</div>
      <div className={`text-xs font-medium ${subValueColor}`}>{subValue}</div>
    </div>
  );
}

function TimelineItem({ time, action, user, status, statusColor, dotColor }: any) {
  return (
    <div className="relative">
      <div className={`absolute -left-[31px] top-1.5 w-3 h-3 ${dotColor} rounded-full border-2 border-card`}></div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground font-medium">{time}</span>
        <p className="text-sm text-foreground">
          {action} {user && <span className="font-semibold">{user}</span>}
        </p>
        <span className={`text-xs font-medium ${statusColor}`}>{status}</span>
      </div>
    </div>
  );
}