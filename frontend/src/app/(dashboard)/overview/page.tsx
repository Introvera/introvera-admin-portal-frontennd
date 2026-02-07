import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Zap, DollarSign, TrendingUp } from "lucide-react";

const stats = [
  { label: "Total Users", value: "0", icon: Users, color: "text-blue-500" },
  { label: "Active Sessions", value: "0", icon: Zap, color: "text-amber-500" },
  { label: "Revenue", value: "$0", icon: DollarSign, color: "text-emerald-500" },
  { label: "Growth", value: "0%", icon: TrendingUp, color: "text-violet-500" },
];

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Overview</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your dashboard at a glance</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
