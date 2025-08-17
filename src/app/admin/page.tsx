"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Trash2,
  PlusCircle,
  Home,
  Users,
  HardDrive,
  Save,
  Check,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "@/lib/users";
import { Logo } from "@/components/logo";

type Device = string;

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = React.useState<User[]>([]);
  const [devices, setDevices] = React.useState<Device[]>([]);
  const [newDevice, setNewDevice] = React.useState("");

  const fetchAdminData = React.useCallback(async () => {
    try {
      const [usersRes, devicesRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/devices"),
      ]);
      if (!usersRes.ok || !devicesRes.ok) {
        throw new Error("获取管理数据失败");
      }
      const usersData = await usersRes.json();
      const devicesData = await devicesRes.json();
      setUsers(usersData);
      setDevices(devicesData);
    } catch (error) {
      console.error("获取管理数据时出错:", error);
      toast({
        title: "错误",
        description: "无法加载管理数据。",
        variant: "destructive",
      });
    }
  }, [toast]);

  React.useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.role !== "admin") {
        router.push("/dashboard");
        toast({
          title: "访问被拒绝",
          description: "您没有权限访问此页面。",
          variant: "destructive",
        });
      } else {
        fetchAdminData();
      }
    } else {
      router.push("/login");
    }
  }, [router, toast, fetchAdminData]);

  const handleAddDevice = async () => {
    if (!newDevice.trim()) {
      toast({ title: "错误", description: "设备ID不能为空。" });
      return;
    }
    try {
      const response = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: newDevice }),
      });
      if (response.ok) {
        toast({ title: "成功", description: "设备已添加。" });
        setNewDevice("");
        fetchAdminData();
      } else {
        const error = await response.json();
        toast({
          title: "错误",
          description: error.message || "添加设备失败。",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "错误",
        description: "发生网络错误。",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/devices`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });
      if (response.ok) {
        toast({ title: "成功", description: "设备已删除。" });
        fetchAdminData();
      } else {
        const error = await response.json();
        toast({
          title: "错误",
          description: error.message || "删除设备失败。",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "错误",
        description: "发生网络错误。",
        variant: "destructive",
      });
    }
  };

  const handlePermissionsChange = (
    username: string,
    deviceId: string,
    checked: boolean | string
  ) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (user.username === username) {
          const currentPermissions = Array.isArray(user.permissions.devices)
            ? user.permissions.devices
            : [];
          const newPermissions = checked
            ? [...currentPermissions, deviceId]
            : currentPermissions.filter((d) => d !== deviceId);
          return {
            ...user,
            permissions: { ...user.permissions, devices: newPermissions },
          };
        }
        return user;
      })
    );
  };

  const handleSavePermissions = async (username: string) => {
    const user = users.find((u) => u.username === username);
    if (!user) return;
    try {
      const response = await fetch(`/api/users/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          permissions: user.permissions,
        }),
      });
      if (response.ok) {
        toast({
          title: "成功",
          description: `${username}的权限已更新。`,
        });
        fetchAdminData();
      } else {
        const error = await response.json();
        toast({
          title: "错误",
          description: error.message || "更新权限失败。",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "错误",
        description: "发生网络错误。",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6">
        <Logo />
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
          <Home className="h-5 w-5" />
          <span className="sr-only">返回仪表盘</span>
        </Button>
      </header>

      <main className="flex-1 p-4 sm:px-6 sm:py-0 md:p-8 space-y-8">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">管理员面板</h1>
            <p className="text-muted-foreground">
                管理用户和设备。
            </p>
        </div>

        {/* Device Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive /> 设备管理
                </CardTitle>
                <CardDescription>添加或删除物联网设备。</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Input
                placeholder="新设备ID, 例如 DEV-006"
                value={newDevice}
                onChange={(e) => setNewDevice(e.target.value)}
              />
              <Button onClick={handleAddDevice}>
                <PlusCircle className="mr-2 h-4 w-4" /> 添加设备
              </Button>
            </div>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>设备ID</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device}>
                      <TableCell>
                        <Badge variant="outline">{device}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>确认删除？</DialogTitle>
                              <DialogDescription>
                                此操作无法撤销。您确定要删除设备 {device} 吗？
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="destructive"
                                onClick={() => handleDeleteDevice(device)}
                              >
                                删除
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* User Permissions Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users /> 用户权限
            </CardTitle>
            <CardDescription>
              为每个用户分配可访问的设备。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户名</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>设备权限</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.username}>
                      <TableCell className="font-medium">
                        {user.username}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin" ? "default" : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.role === "admin" ? (
                          <span className="text-muted-foreground italic">
                            全部权限
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-4">
                            {devices.map((device) => (
                              <div
                                key={device}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`${user.username}-${device}`}
                                  checked={
                                    Array.isArray(user.permissions.devices) &&
                                    user.permissions.devices.includes(device)
                                  }
                                  onCheckedChange={(checked) =>
                                    handlePermissionsChange(
                                      user.username,
                                      device,
                                      checked
                                    )
                                  }
                                />
                                <Label htmlFor={`${user.username}-${device}`}>
                                  {device}
                                </Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.role !== "admin" && (
                          <Button
                            size="sm"
                            onClick={() => handleSavePermissions(user.username)}
                          >
                            <Save className="mr-2 h-4 w-4" />
                            保存权限
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
