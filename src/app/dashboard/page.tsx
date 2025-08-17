"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  User,
  LogOut,
  Moon,
  Sun,
  Shield,
  Trash2,
  Edit,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { DataEntry, getAvailableDevices } from "@/lib/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { getAiSuggestions } from "../actions";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

type Filters = {
  animalId: string;
  deviceId: string;
  weightMin: string;
  weightMax: string;
  dateRange: DateRange | undefined;
};

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = React.useState<DataEntry[]>([]);
  const [filteredData, setFilteredData] = React.useState<DataEntry[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filters, setFilters] = React.useState<Filters>({
    animalId: "",
    deviceId: "",
    weightMin: "",
    weightMax: "",
    dateRange: undefined,
  });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [searchHistory, setSearchHistory] = React.useState<string[]>([]);
  const [theme, setTheme] = React.useState("light");
  const [currentUser, setCurrentUser] = React.useState<{ username: string; role: string; permissions: { devices: string[] | 'all' } } | null>(null);
  const [editingEntry, setEditingEntry] = React.useState<DataEntry | null>(null);

  const itemsPerPage = 10;
  
  const fetchData = React.useCallback(async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error('获取数据失败');
      }
      let jsonData = await response.json();
      const user = JSON.parse(localStorage.getItem("currentUser") || "{}");

      // Filter data based on user permissions
      if (user?.role !== 'admin' && user?.permissions?.devices) {
        jsonData = jsonData.filter((item: DataEntry) => 
          user.permissions.devices.includes(item.deviceId)
        );
      }

      setData(jsonData);
      setFilteredData(jsonData);
    } catch (error) {
      console.error("获取数据时出错:", error);
      toast({
        title: "错误",
        description: "无法加载数据。",
        variant: "destructive",
      });
    }
  }, [toast]);


  React.useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      setCurrentUser(JSON.parse(user));
    } else {
      router.push("/login");
      toast({
        title: "会话无效",
        description: "请重新登录。",
        variant: "destructive",
      });
      return;
    }
    fetchData();
  }, [router, toast, fetchData]);
  
  React.useEffect(() => {
    const html = document.documentElement;
    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);
    html.classList.toggle("dark", storedTheme === "dark");
  }, []);

  React.useEffect(() => {
    const fetchSuggestions = async () => {
      const historyString = searchHistory.join(", ");
      const newSuggestions = await getAiSuggestions(historyString);
      setSuggestions(newSuggestions);
    };
    fetchSuggestions();
  }, [searchHistory]);

  const applyFilters = React.useCallback(() => {
    let tempData = data;

    // General search term
    if (searchTerm) {
      tempData = tempData.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Advanced filters
    if (filters.animalId) {
      tempData = tempData.filter((item) =>
        item.animalId.toLowerCase().includes(filters.animalId.toLowerCase())
      );
    }
    if (filters.deviceId) {
      tempData = tempData.filter((item) => item.deviceId === filters.deviceId);
    }
    if (filters.weightMin) {
      tempData = tempData.filter(
        (item) => item.animalWeight >= parseFloat(filters.weightMin)
      );
    }
    if (filters.weightMax) {
      tempData = tempData.filter(
        (item) => item.animalWeight <= parseFloat(filters.weightMax)
      );
    }
    if (filters.dateRange?.from) {
      tempData = tempData.filter(
        (item) => new Date(item.timestamp) >= filters.dateRange!.from!
      );
    }
    if (filters.dateRange?.to) {
      const toDate = new Date(filters.dateRange.to);
      toDate.setHours(23, 59, 59, 999); // Include the whole day
      tempData = tempData.filter(
        (item) => new Date(item.timestamp) <= toDate
      );
    }

    setFilteredData(tempData);
    setCurrentPage(1); // Reset to first page on new filter
  }, [data, searchTerm, filters]);

  React.useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, data, applyFilters]);

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  
  const handleClearFilters = () => {
    setFilters({
        animalId: "",
        deviceId: "",
        weightMin: "",
        weightMax: "",
        dateRange: undefined,
    });
    setSearchTerm("");
  }

  const handleSearch = () => {
    if (searchTerm && !searchHistory.includes(searchTerm)) {
      setSearchHistory(prev => [searchTerm, ...prev].slice(0, 5));
    }
    applyFilters();
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    if (!searchHistory.includes(suggestion)) {
      setSearchHistory(prev => [suggestion, ...prev].slice(0, 5));
    }
    applyFilters();
  }
  
  const handleDelete = async (idsToDelete: string[]) => {
    try {
      const response = await fetch('/api/data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToDelete }),
      });
      if (response.ok) {
        toast({ title: '成功', description: '数据已删除。' });
        fetchData(); // Refetch data after deletion
      } else {
        const error = await response.json();
        toast({
          title: '删除失败',
          description: error.message || '无法删除数据。',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '删除出错',
        description: '发生网络错误。',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteFiltered = () => {
    const ids = filteredData.map(item => item.id);
    if (ids.length > 0) {
      handleDelete(ids);
    } else {
      toast({
        title: '无数据可删',
        description: '当前筛选条件下没有数据。',
      });
    }
  };

  const handleEditClick = (entry: DataEntry) => {
    setEditingEntry({ ...entry });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingEntry) {
      const { name, value } = e.target;
      setEditingEntry({ ...editingEntry, [name]: name === 'animalWeight' ? parseFloat(value) || 0 : value });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    try {
      const response = await fetch(`/api/data`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEntry),
      });

      if (response.ok) {
        toast({ title: '成功', description: '数据更新成功。' });
        setEditingEntry(null);
        fetchData();
      } else {
        const error = await response.json();
        toast({
          title: '更新失败',
          description: error.message || '无法更新数据。',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '更新出错',
        description: '发生网络错误。',
        variant: 'destructive',
      });
    }
  };


  const handleExport = () => {
    if (paginatedData.length === 0) return;
    const headers = Object.keys(paginatedData[0]).join(",");
    const rows = paginatedData.map((row) => Object.values(row).join(","));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "datasift_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/login");
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const availableDevices = getAvailableDevices(data);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Logo />
        <div className="relative ml-auto flex-1 md:grow-0">
          {/* Search bar can be moved here if needed */}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
              <User />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              个人资料
            </DropdownMenuItem>
            {currentUser?.role === 'admin' && (
              <DropdownMenuItem onClick={() => router.push('/admin')}>
                <Shield className="mr-2 h-4 w-4" />
                管理员面板
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
              切换主题
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              登出
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
            <p className="text-muted-foreground">
                这是来自您的物联网设备的最新数据。
            </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="按任意字段搜索..."
                  className="w-full rounded-lg bg-background pl-8 md:w-[300px] lg:w-[400px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                 <Button onClick={handleSearch} className="w-full md:w-auto">
                    <Search className="mr-2 h-4 w-4" /> 搜索
                 </Button>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full md:w-auto">
                      <Filter className="mr-2 h-4 w-4" />
                      高级筛选
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>高级筛选</SheetTitle>
                      <SheetDescription>
                        使用更具体的条件优化您的数据视图。
                      </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="animalId" className="text-right">动物ID</Label>
                        <Input id="animalId" value={filters.animalId} onChange={(e) => handleFilterChange('animalId', e.target.value)} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="deviceId" className="text-right">设备ID</Label>
                        <Select value={filters.deviceId} onValueChange={(val) => handleFilterChange('deviceId', val)}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="选择设备" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDevices.map(dev => <SelectItem key={dev} value={dev}>{dev}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">体重</Label>
                        <div className="col-span-3 grid grid-cols-2 gap-2">
                          <Input id="weightMin" type="number" placeholder="最小" value={filters.weightMin} onChange={(e) => handleFilterChange('weightMin', e.target.value)} />
                          <Input id="weightMax" type="number" placeholder="最大" value={filters.weightMax} onChange={(e) => handleFilterChange('weightMax', e.target.value)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">日期范围</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="date"
                              variant={"outline"}
                              className={cn(
                                "col-span-3 justify-start text-left font-normal",
                                !filters.dateRange && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {filters.dateRange?.from ? (
                                filters.dateRange.to ? (
                                  <>
                                    {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                                    {format(filters.dateRange.to, "LLL dd, y")}
                                  </>
                                ) : (
                                  format(filters.dateRange.from, "LLL dd, y")
                                )
                              ) : (
                                <span>选择一个日期范围</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              initialFocus
                              mode="range"
                              defaultMonth={filters.dateRange?.from}
                              selected={filters.dateRange}
                              onSelect={(range) => handleFilterChange('dateRange', range)}
                              numberOfMonths={2}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <SheetFooter>
                        <Button variant="secondary" onClick={handleClearFilters}>清除</Button>
                        <SheetClose asChild>
                            <Button onClick={applyFilters}>应用筛选</Button>
                        </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full md:w-auto" disabled={filteredData.length === 0}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      删除已筛选
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认删除？</AlertDialogTitle>
                      <AlertDialogDescription>
                        此操作将删除当前筛选出的 {filteredData.length} 条数据。此操作无法撤销。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteFiltered}>
                        确认删除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
             {suggestions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-muted-foreground">AI建议:</span>
                {suggestions.map((s, i) => (
                  <Badge key={i} variant="secondary" className="cursor-pointer hover:bg-primary/20" onClick={() => handleSuggestionClick(s)}>{s}</Badge>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间戳</TableHead>
                    <TableHead>设备ID</TableHead>
                    <TableHead>来源单位</TableHead>
                    <TableHead>动物ID</TableHead>
                    <TableHead className="text-right">体重 (kg)</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
                        <TableCell><Badge variant="outline">{item.deviceId}</Badge></TableCell>
                        <TableCell>{item.sourceUnit}</TableCell>
                        <TableCell>{item.animalId}</TableCell>
                        <TableCell className="text-right font-medium">{item.animalWeight.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                           <Dialog open={!!editingEntry && editingEntry.id === item.id} onOpenChange={(isOpen) => !isOpen && setEditingEntry(null)}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <form onSubmit={handleUpdate}>
                                <DialogHeader>
                                  <DialogTitle>编辑数据记录</DialogTitle>
                                  <DialogDescription>
                                    修改以下字段并保存。
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="timestamp" className="text-right">时间戳</Label>
                                        <Input id="timestamp" name="timestamp" value={editingEntry?.timestamp} onChange={handleEditChange} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="deviceId" className="text-right">设备ID</Label>
                                        <Input id="deviceId" name="deviceId" value={editingEntry?.deviceId} onChange={handleEditChange} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="sourceUnit" className="text-right">来源单位</Label>
                                        <Input id="sourceUnit" name="sourceUnit" value={editingEntry?.sourceUnit} onChange={handleEditChange} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="animalId" className="text-right">动物ID</Label>
                                        <Input id="animalId" name="animalId" value={editingEntry?.animalId} onChange={handleEditChange} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="animalWeight" className="text-right">体重 (kg)</Label>
                                        <Input id="animalWeight" name="animalWeight" type="number" value={editingEntry?.animalWeight} onChange={handleEditChange} className="col-span-3" />
                                    </div>
                                </div>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button type="button" variant="secondary">取消</Button>
                                  </DialogClose>
                                  <Button type="submit">保存更改</Button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认删除？</AlertDialogTitle>
                                <AlertDialogDescription>
                                  此操作无法撤销。您确定要删除这条数据吗？
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete([item.id])}
                                >
                                  删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        未找到结果。
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between mt-4">
              <Button onClick={handleExport} variant="outline" size="sm" disabled={paginatedData.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                导出本页CSV
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  第 {currentPage} 页，共 {totalPages} 页
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
