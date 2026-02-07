import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Users } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Users</h2>
          <p className="mt-1 text-sm text-muted-foreground">Manage your team members</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center py-14">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-[15px] font-semibold">No users yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Add your first user to get started.</p>
          <Button className="mt-5 gap-2">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
