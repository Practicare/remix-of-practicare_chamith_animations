import { APP_BRAND } from "@/config/branding";
import { Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const tasks = [
  { id: 1, title: "Order medical supplies", category: "Inventory", color: "bg-primary" },
  { id: 2, title: "Staff meeting prep", category: "Admin", color: "bg-accent" },
  { id: 3, title: "Update patient records", category: "Compliance", color: "bg-success" },
];

const checklistItems = [
  { id: 1, text: "Open reception desk", completed: false },
  { id: 2, text: "Check appointment schedule", completed: false },
  { id: 3, text: "Verify equipment ready", completed: false },
  { id: 4, text: "Stock treatment rooms", completed: false },
  { id: 5, text: "Review urgent messages", completed: false },
];

const newTaskText = "Schedule team training";

const AnimatedDashboardPreview = () => {
  const [visibleTasks, setVisibleTasks] = useState<number[]>([]);
  const [completedItems, setCompletedItems] = useState<number[]>([]);
  const [showTyping, setShowTyping] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const runAnimation = () => {
      setVisibleTasks([]);
      setCompletedItems([]);
      setShowTyping(false);
      setTypedText("");
      setAnimationPhase(0);

      const taskTimers = tasks.map((_, index) =>
        setTimeout(() => {
          setVisibleTasks((prev) => [...prev, index]);
        }, 500 + index * 400)
      );

      setTimeout(() => {
        setShowTyping(true);
        setAnimationPhase(1);
      }, 2200);

      let charIndex = 0;
      const typeInterval = setInterval(() => {
        if (charIndex <= newTaskText.length) {
          setTypedText(newTaskText.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typeInterval);
        }
      }, 80);

      setTimeout(() => clearInterval(typeInterval), 4500);

      setTimeout(() => {
        setVisibleTasks((prev) => [...prev, 3]);
        setShowTyping(false);
        setAnimationPhase(2);
      }, 4500);

      const checklistTimers = checklistItems.map((_, index) =>
        setTimeout(() => {
          setCompletedItems((prev) => [...prev, index]);
        }, 5500 + index * 600)
      );

      const resetTimer = setTimeout(runAnimation, 12000);

      return () => {
        taskTimers.forEach(clearTimeout);
        checklistTimers.forEach(clearTimeout);
        clearTimeout(resetTimer);
        clearInterval(typeInterval);
      };
    };

    const cleanup = runAnimation();
    return cleanup;
  }, []);

  return (
    <div className="grid grid-cols-12 gap-4 h-full">
      {/* Sidebar */}
      <div className="col-span-2 bg-card rounded-xl shadow-soft p-4 flex flex-col gap-3">
        {["Dashboard", "Tasks", "Checklists", "Staff", "Compliance", "Reports"].map((item, i) => (
          <motion.div
            key={item}
            className={`h-8 rounded-lg flex items-center px-2 text-xs ${i === 1 && animationPhase >= 1 ? "bg-primary/20 text-primary" : i === 2 && animationPhase >= 2 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
          >
            <span className="hidden lg:block truncate">{item}</span>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="col-span-10 flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Tasks", value: visibleTasks.length, color: "text-foreground" },
            { label: "Pending", value: 3 - completedItems.length > 0 ? 3 - completedItems.length : 0, color: "text-warning" },
            { label: "Completed", value: completedItems.length, color: "text-success" },
            { label: "Compliance", value: "98%", color: "text-success" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="bg-card rounded-xl shadow-soft p-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-[10px] text-muted-foreground mb-1">{stat.label}</div>
              <motion.div
                className={`text-lg font-bold ${stat.color}`}
                key={String(stat.value)}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                {stat.value}
              </motion.div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1">
          {/* Tasks Panel */}
          <div className="bg-card rounded-xl shadow-soft p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-medium text-foreground">Active Tasks</div>
              <motion.div
                className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center"
                animate={{ scale: showTyping ? [1, 1.1, 1] : 1 }}
                transition={{ repeat: showTyping ? Infinity : 0, duration: 0.5 }}
              >
                <Plus className="w-3 h-3 text-primary" />
              </motion.div>
            </div>

            <AnimatePresence>
              {showTyping && (
                <motion.div
                  className="mb-3 p-2 bg-muted/50 rounded-lg border border-primary/30"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-xs text-foreground">{typedText}</span>
                    <motion.span
                      className="w-0.5 h-3 bg-primary"
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <AnimatePresence>
                {tasks.map(
                  (task, index) =>
                    visibleTasks.includes(index) && (
                      <motion.div
                        key={task.id}
                        className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      >
                        <div className={`w-2 h-2 rounded-full ${task.color}`} />
                        <div className="flex-1">
                          <div className="text-xs text-foreground">{task.title}</div>
                          <div className="text-[10px] text-muted-foreground">{task.category}</div>
                        </div>
                      </motion.div>
                    )
                )}
                {visibleTasks.includes(3) && (
                  <motion.div
                    className="flex items-center gap-2 p-2 bg-success/10 rounded-lg border border-success/30"
                    initial={{ opacity: 0, x: -20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <div className="flex-1">
                      <div className="text-xs text-foreground">{newTaskText}</div>
                      <div className="text-[10px] text-muted-foreground">Training</div>
                    </div>
                    <Check className="w-3 h-3 text-success" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Checklist Panel */}
          <div className="bg-card rounded-xl shadow-soft p-4">
            <div className="text-xs font-medium text-foreground mb-3">Morning Checklist</div>
            <div className="space-y-2">
              {checklistItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="flex items-center gap-2"
                  animate={{ opacity: completedItems.includes(index) ? 0.6 : 1 }}
                >
                  <motion.div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      completedItems.includes(index) ? "bg-success border-success" : "border-muted-foreground/30"
                    }`}
                    animate={{ scale: completedItems.includes(index) ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AnimatePresence>
                      {completedItems.includes(index) && (
                        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}>
                          <Check className="w-2.5 h-2.5 text-success-foreground" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <span className={`text-xs ${completedItems.includes(index) ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>Progress</span>
                <span>
                  {completedItems.length}/{checklistItems.length}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-success rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedItems.length / checklistItems.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardPreview = () => {
  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="absolute inset-0 gradient-hero opacity-20 blur-3xl rounded-3xl" />
      <div className="relative bg-card rounded-2xl shadow-elevated border border-border overflow-hidden">
        <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-warning/60" />
            <div className="w-3 h-3 rounded-full bg-success/60" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 bg-background rounded-md text-xs text-muted-foreground">
              {APP_BRAND.dashboardUrl}
            </div>
          </div>
        </div>
        <div className="aspect-[16/9] bg-gradient-to-b from-background to-muted/30 p-8">
          <AnimatedDashboardPreview />
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;
