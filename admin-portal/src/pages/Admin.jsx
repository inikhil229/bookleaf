import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";
import {
  FaCircleExclamation,
  FaClock,
  FaTicket,
  FaUsers,
  FaBolt,
} from "react-icons/fa6";
import { api, shortDate } from "../lib/api.js";
import {
  AppShell,
  Badge,
  Button,
  EmptyState,
  PageHeader,
  PriorityBadge,
  StatusBadge,
} from "../components/UI.jsx";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    const load = () =>
      api("/tickets")
        .then((d) => setTickets(d.tickets))
        .catch((e) => setError(e.message));
    load();
    const socket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
      { withCredentials: true },
    );
    socket.on("ticket:updated", load);
    return () => socket.disconnect();
  }, []);
  const active = tickets.filter(
    (t) => !["Resolved", "Closed"].includes(t.status),
  );
  const critical = active.filter((t) =>
    ["Critical", "High"].includes(t.priority),
  );
  const stats = [
    {
      label: "Total tickets",
      value: tickets.length,
      hint: "All author conversations",
      icon: FaTicket,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Needs attention",
      value: active.length,
      hint: "Open or in progress",
      icon: FaClock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "High priority",
      value: critical.length,
      hint: "Critical and high priority",
      icon: FaCircleExclamation,
      color: "bg-rose-50 text-rose-600",
    },
    {
      label: "AI classified",
      value: tickets.filter((t) => t.aiClassified).length,
      hint: "Classified successfully",
      icon: FaBolt,
      color: "bg-violet-50 text-violet-600",
    },
  ];
  const sorted = [...active].sort(
    (a, b) =>
      ({ Critical: 0, High: 1, Medium: 2, Low: 3 })[a.priority] -
        { Critical: 0, High: 1, Medium: 2, Low: 3 }[b.priority] ||
      new Date(a.createdAt) - new Date(b.createdAt),
  );
  return (
    <AppShell admin>
      <PageHeader
        eyebrow="Operations workspace"
        title="Support overview"
        description="A clear view of incoming requests and the conversations that need your attention."
        action={
          <Link to="/admin/tickets">
            <Button>
              Open ticket queue
            </Button>
          </Link>
        }
      />
      {error && <FaCircleExclamation className="mb-4 text-rose-600" />}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{s.label}</p>
              <span
                className={`grid h-10 w-10 place-items-center rounded-xl ${s.color}`}
              >
                <s.icon size={19} />
              </span>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-slate-900">
              {s.value}
            </p>
            <p className="mt-1 text-xs text-slate-400">{s.hint}</p>
          </div>
        ))}
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900">Priority inbox</h2>
              <p className="mt-1 text-xs text-slate-500">
                Urgent and oldest unresolved tickets first
              </p>
            </div>
            <Badge tone="red">{critical.length} urgent</Badge>
          </div>
          {!sorted.length ? (
            <EmptyState
              icon={FaTicket}
              title="Queue is clear"
              description="New author support tickets will appear here."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {sorted.slice(0, 7).map((t) => (
                <Link
                  key={t._id}
                  to={`/admin/tickets/${t._id}`}
                  className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${t.priority === "Critical" ? "bg-rose-500" : t.priority === "High" ? "bg-orange-400" : "bg-slate-300"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {t.subject}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {t.author?.name} · {t.category}
                    </p>
                    <p className="mt-2 text-[11px] text-slate-400">
                      {shortDate(t.createdAt)} · {t.bookTitle}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="font-extrabold text-slate-900">Workflow snapshot</h2>
            <p className="mt-1 text-xs text-slate-500">
              How the queue is moving
            </p>
          </div>
          {[
            [
              "Open",
              tickets.filter((t) => t.status === "Open").length,
              "bg-amber-400",
            ],
            [
              "In Progress",
              tickets.filter((t) => t.status === "In Progress").length,
              "bg-blue-500",
            ],
            [
              "Resolved",
              tickets.filter((t) => t.status === "Resolved").length,
              "bg-emerald-500",
            ],
            [
              "Closed",
              tickets.filter((t) => t.status === "Closed").length,
              "bg-slate-400",
            ],
          ].map(([label, value, color]) => (
            <div key={label} className="mb-5 last:mb-0">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">
                  {label}
                </span>
                <span className="text-sm font-extrabold text-slate-800">
                  {value}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${color}`}
                  style={{
                    width: `${tickets.length ? (value / tickets.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
          <div className="mt-7 rounded-xl bg-indigo-50 p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-indigo-800">
              <FaBolt size={16} /> AI-assisted support
            </p>
            <p className="mt-2 text-xs leading-5 text-indigo-700/80">
              New tickets are classified automatically when AI is configured.
              Draft a suggested reply on any ticket, then review and edit it
              before sending.
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
