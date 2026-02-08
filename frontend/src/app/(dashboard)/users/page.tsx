import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Users, UserPlus } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Users</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Manage your team members</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center py-16">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8">
            <Users className="h-7 w-7 text-primary/70" />
          </div>
          <h3 className="text-[15px] font-semibold">No users yet</h3>
          <p className="mt-1.5 max-w-xs text-center text-sm text-muted-foreground">
            Add your first team member to start collaborating on projects and managing tasks together.
          </p>
          <Button className="mt-6 gap-2">
            <UserPlus className="h-4 w-4" />
            Add your first user
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
