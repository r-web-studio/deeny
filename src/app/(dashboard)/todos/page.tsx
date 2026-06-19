"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Trash2, Edit, Check, Calendar, Filter, ListTodo } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { TASK_PRIORITIES, TASK_CATEGORIES_DEFAULT } from "@/lib/constants";

const TASKS_STORAGE_KEY = "deenflow-tasks";

interface Task {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
  category: string;
  due_date: string | null;
  completed: boolean;
  created_at: string;
}

export default function TodosPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [category, setCategory] = useState("Personal");
  const [dueDate, setDueDate] = useState("");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(TASKS_STORAGE_KEY);
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(newTasks));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const updated = [
      {
        id: crypto.randomUUID(),
        title: newTask,
        priority,
        category,
        due_date: dueDate || null,
        completed: false,
        created_at: new Date().toISOString(),
      },
      ...tasks,
    ];
    saveTasks(updated);
    setNewTask("");
    setDueDate("");
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    saveTasks(updated);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, title: editTitle } : t));
    saveTasks(updated);
    setEditingId(null);
  };

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "all" || t.category === filterCategory;
    const matchPri = filterPriority === "all" || t.priority === filterPriority;
    return matchSearch && matchCat && matchPri;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const priorityColors = { low: "bg-blue-500", medium: "bg-yellow-500", high: "bg-red-500" };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Tasks</h1>
        <p className="text-muted-foreground">{completedCount} of {tasks.length} completed</p>
        <Progress value={progress} className="mt-2 max-w-md" />
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => {
            localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
            toast.success("Tasks saved!");
          }}
        >
          Save Progress
        </Button>
      </div>

      <Card className="glass">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-3">
            <Input placeholder="Add a new task..." value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} className="flex-1" />
            <Select value={priority} onValueChange={(v) => setPriority((v ?? "medium") as "low" | "medium" | "high")}>
              <SelectTrigger className="w-full md:w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TASK_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={(v) => setCategory(v ?? "Personal")}>
              <SelectTrigger className="w-full md:w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TASK_CATEGORIES_DEFAULT.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full md:w-40" />
            <Button onClick={addTask} className="bg-islamic-green hover:bg-islamic-green/90"><Plus className="h-4 w-4 mr-1" />Add</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v ?? "all")}>
          <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {TASK_CATEGORIES_DEFAULT.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v ?? "all")}>
          <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {TASK_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <Card className="glass">
              <CardContent className="text-center py-12 text-muted-foreground">
                <ListTodo className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tasks yet. Add one above!</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                layout
              >
                <Card className={`glass ${task.completed ? "opacity-60" : ""}`}>
                  <CardContent className="py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${task.completed ? "bg-islamic-green border-islamic-green" : "border-muted-foreground hover:border-islamic-green"}`}
                      >
                        {task.completed && <Check className="h-3 w-3 text-white" />}
                      </button>
                      {editingId === task.id ? (
                        <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onBlur={() => saveEdit(task.id)} onKeyDown={(e) => e.key === "Enter" && saveEdit(task.id)} className="flex-1 h-8" autoFocus />
                      ) : (
                        <span className={`flex-1 min-w-0 ${task.completed ? "line-through text-muted-foreground" : ""}`}>{task.title}</span>
                      )}
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: task.priority === "high" ? "#ef4444" : task.priority === "medium" ? "#eab308" : "#3b82f6" }} />
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => startEdit(task)}><Edit className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => deleteTask(task.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2 md:hidden">
                      <Badge variant="secondary" className="text-xs">{task.category}</Badge>
                      {task.due_date && (
                        <Badge variant="outline" className="text-xs"><Calendar className="h-3 w-3 mr-1" />{task.due_date}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
