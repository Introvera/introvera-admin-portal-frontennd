import { Card, CardContent } from "@/components/ui/card";
import { Settings2, Palette, Shield, Bell, Database, Globe } from "lucide-react";

const sections = [
  {
    title: "General",
    description: "Application settings, default values, and core preferences.",
    icon: Settings2,
    iconBg: "bg-blue-500/10 dark:bg-blue-400/10",
    iconColor: "text-blue-500 dark:text-blue-400",
  },
  {
    title: "Appearance",
    description: "Theme, colors, and display settings. Use the header toggle to switch themes.",
    icon: Palette,
    iconBg: "bg-violet-500/10 dark:bg-violet-400/10",
    iconColor: "text-violet-500 dark:text-violet-400",
  },
  {
    title: "Security",
    description: "Password policies, session management, and two-factor authentication.",
    icon: Shield,
    iconBg: "bg-emerald-500/10 dark:bg-emerald-400/10",
    iconColor: "text-emerald-500 dark:text-emerald-400",
  },
  {
    title: "Notifications",
    description: "Email alerts, push notifications, and event subscriptions.",
    icon: Bell,
    iconBg: "bg-amber-500/10 dark:bg-amber-400/10",
    iconColor: "text-amber-500 dark:text-amber-400",
  },
  {
    title: "Data & Storage",
    description: "Backup configuration, data export, and storage management.",
    icon: Database,
    iconBg: "bg-rose-500/10 dark:bg-rose-400/10",
    iconColor: "text-rose-500 dark:text-rose-400",
  },
  {
    title: "Integrations",
    description: "Third-party services, API keys, and webhook configuration.",
    icon: Globe,
    iconBg: "bg-cyan-500/10 dark:bg-cyan-400/10",
    iconColor: "text-cyan-500 dark:text-cyan-400",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Settings</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Configure your portal preferences</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="cursor-pointer transition-all duration-150 hover:shadow-md hover:border-primary/20 group">
              <CardContent className="p-5">
                <div className="flex items-start gap-3.5">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${section.iconBg} transition-transform duration-150 group-hover:scale-105`}>
                    <Icon className={`h-5 w-5 ${section.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[13.5px] font-semibold">{section.title}</h3>
                    <p className="mt-0.5 text-[12px] text-muted-foreground leading-relaxed">{section.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
