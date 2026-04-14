import { Users, CheckCircle, MessageCircle, FileText, Clock, Hash, Zap } from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  users: <Users size={18} />,
  check: <CheckCircle size={18} />,
  message: <MessageCircle size={18} />,
  text: <FileText size={18} />,
  clock: <Clock size={18} />,
  hash: <Hash size={18} />,
  zap: <Zap size={18} />,
};

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: string;
}

export default function StatCard({
  label,
  value,
  sub,
  color = "text-blue-600",
  icon,
}: StatCardProps) {
  return (
    <div className="dashboard-card flex flex-col justify-between">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        {icon && (
          <span className="text-slate-300">{ICONS[icon]}</span>
        )}
      </div>
      <div>
        <p className={`text-3xl font-bold tracking-tight ${color}`}>{value}</p>
        {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}
