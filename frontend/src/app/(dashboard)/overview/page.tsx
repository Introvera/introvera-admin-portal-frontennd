import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Zap, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

const stats: {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    label: "Total Users",
    value: "0",
    change: "+0%",
    trend: "up",
    icon: Users,
    iconBg: "bg-blue-500/10 dark:bg-blue-400/10",
    iconColor: "text-blue-500 dark:text-blue-400",
  },
  {
    label: "Active Sessions",
    value: "0",
    change: "+0%",
    trend: "up",
    icon: Zap,
    iconBg: "bg-amber-500/10 dark:bg-amber-400/10",
    iconColor: "text-amber-500 dark:text-amber-400",
  },
  {
    label: "Revenue",
    value: "$0",
    change: "+0%",
    trend: "up",
    icon: DollarSign,
    iconBg: "bg-emerald-500/10 dark:bg-emerald-400/10",
    iconColor: "text-emerald-500 dark:text-emerald-400",
  },
  {
    label: "Growth",
    value: "0%",
    change: "0%",
    trend: "neutral",
    icon: TrendingUp,
    iconBg: "bg-violet-500/10 dark:bg-violet-400/10",
    iconColor: "text-violet-500 dark:text-violet-400",
  },
];

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Overview</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Your dashboard at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="relative overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-[12.5px] font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold tracking-tight tabular-nums">{stat.value}</p>
                    <div className="flex items-center gap-1">
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                      ) : stat.trend === "down" ? (
                        <ArrowDownRight className="h-3 w-3 text-red-400" />
                      ) : null}
                      <span className="text-[11.5px] font-medium text-muted-foreground">{stat.change}</span>
                    </div>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg}`}>
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity section placeholder */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-1">Recent Activity</h3>
            <p className="text-xs text-muted-foreground mb-6">Your latest transactions and updates</p>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <Zap className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Activity will appear here as you use the portal</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-1">Quick Stats</h3>
            <p className="text-xs text-muted-foreground mb-6">Summary of your portal usage</p>
            <div className="space-y-4">
              {[
                { label: "Total Payments", value: "0", color: "bg-primary/20" },
                { label: "Active Projects", value: "0", color: "bg-emerald-500/20" },
                { label: "Pending Tasks", value: "0", color: "bg-amber-500/20" },
                { label: "Team Members", value: "0", color: "bg-violet-500/20" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${item.color}`} />
                    <span className="text-[13px] text-muted-foreground">{item.label}</span>
                  </div>
                  <span className="text-[13px] font-semibold tabular-nums">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
