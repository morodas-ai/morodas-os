import TaskManager from "@/components/tasks/TaskManager";

export default function TasksPage() {
    return (
        <div className="min-h-screen bg-foreground text-surface-50 p-6 md:p-8 max-w-[1600px] mx-auto">
            <TaskManager />
        </div>
    );
}
