"use client";

import { useEffect, useState } from "react";
import { OnboardingModal } from "@/components/modals";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, UserMinus, Network, Plus, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export default function Home() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    pendingOnboarding: 0,
    recentOffboards: 0,
    activeIntegrations: 0
  });
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [metricsRes, logsRes] = await Promise.all([
          api.get('/orgs/metrics'),
          api.get('/orgs/audit-logs?limit=4')
        ]);

        if (metricsRes.ok) {
          const metricsData = await metricsRes.json();
          setMetrics(metricsData.data);
        }
        if (logsRes.ok) {
          const logsData = await logsRes.json();
          setLogs(logsData.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <h2 className="text-2xl font-semibold text-foreground mb-1">
          Welcome back{user ? `, ${user.fullName.split(' ')[0]}` : ""}.
        </h2>
        <p className="text-sm text-muted-foreground">Here is the latest overview of your HR and IT operations.</p>
      </div>

      {/* Bento Grid - Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <MetricCard title="Total Employees" value={metrics.totalEmployees} subValue="Active in system" subValueColor="text-primary" icon={<Users size={20} />} />
        <MetricCard title="Pending Onboarding" value={metrics.pendingOnboarding} subValue="Require attention" subValueColor="text-muted-foreground" icon={<UserPlus size={20} />} />
        <MetricCard title="Recent Offboards" value={metrics.recentOffboards} subValue="In last 30 days" subValueColor="text-muted-foreground" icon={<UserMinus size={20} />} />
        <MetricCard title="Active Integrations" value={metrics.activeIntegrations} subValue="Systems operational" subValueColor="text-muted-foreground" icon={<Network size={20} />} />
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
              {logs.length > 0 ? logs.map(log => {
                let statusColor = "text-muted-foreground";
                let dotColor = "bg-muted-foreground";
                
                if (log.status === "SUCCESS") {
                  statusColor = "text-emerald-500";
                  dotColor = "bg-emerald-500";
                } else if (log.status === "FAILED") {
                  statusColor = "text-destructive";
                  dotColor = "bg-destructive";
                } else if (log.status === "PROCESSING") {
                  statusColor = "text-blue-500";
                  dotColor = "bg-blue-500";
                }
                
                const timeStr = formatDistanceToNow(new Date(log.createdAt), { addSuffix: true });
                
                return (
                  <TimelineItem 
                    key={log.id}
                    time={timeStr} 
                    user={log.employee?.fullName} 
                    action={`${log.action} on ${log.provider} for`} 
                    status={log.status} 
                    statusColor={statusColor} 
                    dotColor={dotColor} 
                  />
                );
              }) : (
                <div className="text-sm text-muted-foreground">No recent activity</div>
              )}
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