"use client";

import React, { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type Appointment = {
  id: string;
  service_name: string | null;
  scheduled_at: string;
  duration_minutes: number | null;
  status: string;
  patient_name?: string | null;
  patient_phone?: string | null;
};

type TimeBlock = {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  all_day: boolean;
  notes: string | null;
};

type Props = {
  appointments: Appointment[];
  timeBlocks: TimeBlock[];
  tenantId: string;
  userId: string;
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7am-7pm

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function statusColor(status: string) {
  switch (status) {
    case "confirmed": return "bg-emerald-500";
    case "proposed": return "bg-blue-500";
    case "cancelled": return "bg-red-400";
    case "completed": return "bg-slate-400";
    default: return "bg-indigo-400";
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "confirmed": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "proposed": return "bg-blue-100 text-blue-700 border-blue-200";
    case "cancelled": return "bg-red-100 text-red-600 border-red-200";
    case "completed": return "bg-slate-100 text-slate-600 border-slate-200";
    default: return "bg-indigo-100 text-indigo-700 border-indigo-200";
  }
}

export function AppointmentCalendar({ appointments, timeBlocks: initialBlocks, tenantId, userId }: Props) {
  const today = new Date();
  const [view, setView] = useState<"month" | "week">("month");
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(initialBlocks);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockTitle, setBlockTitle] = useState("Unavailable");
  const [blockStartTime, setBlockStartTime] = useState("09:00");
  const [blockEndTime, setBlockEndTime] = useState("17:00");
  const [blockAllDay, setBlockAllDay] = useState(false);
  const [blockNotes, setBlockNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [deletingBlock, setDeletingBlock] = useState<string | null>(null);
  const supabase = createClient();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };
  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const calendarDays: (Date | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  const getWeekDays = () => {
    const start = new Date(currentDate);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };
  const weekDays = getWeekDays();

  const appointmentsOnDay = useCallback((d: Date) =>
    appointments.filter(a => isSameDay(new Date(a.scheduled_at), d)),
    [appointments]
  );

  const blocksOnDay = useCallback((d: Date) =>
    timeBlocks.filter((b: TimeBlock) => {
      const start = new Date(b.start_at);
      const end = new Date(b.end_at);
      return d >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
             d <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
    }),
    [timeBlocks]
  );

  const handleDayClick = (d: Date) => {
    setSelectedDay(d);
    setShowBlockModal(true);
    setBlockTitle("Unavailable");
    setBlockStartTime("09:00");
    setBlockEndTime("17:00");
    setBlockAllDay(false);
    setBlockNotes("");
  };

  const saveBlock = async () => {
    if (!selectedDay) return;
    setSaving(true);
    const dateStr = selectedDay.toISOString().split("T")[0];
    const startAt = blockAllDay ? `${dateStr}T00:00:00+02:00` : `${dateStr}T${blockStartTime}:00+02:00`;
    const endAt = blockAllDay ? `${dateStr}T23:59:59+02:00` : `${dateStr}T${blockEndTime}:00+02:00`;
    const { data, error } = await supabase
      .from("time_blocks")
      .insert({ tenant_id: tenantId, created_by: userId, title: blockTitle, start_at: startAt, end_at: endAt, all_day: blockAllDay, notes: blockNotes || null })
      .select()
      .single();
    if (!error && data) {
      setTimeBlocks((prev: TimeBlock[]) => [...prev, data as TimeBlock]);
    }
    setSaving(false);
    setShowBlockModal(false);
  };

  const deleteBlock = async (id: string) => {
    setDeletingBlock(id);
    await supabase.from("time_blocks").delete().eq("id", id);
    setTimeBlocks((prev: TimeBlock[]) => prev.filter((b: TimeBlock) => b.id !== id));
    setDeletingBlock(null);
  };

  const dayEventsForWeek = (d: Date) => {
    const appts = appointmentsOnDay(d);
    const blocks = blocksOnDay(d);
    const items: { type: "appointment" | "block"; data: Appointment | TimeBlock; top: number; height: number }[] = [];
    for (const a of appts as Appointment[]) {
      const start = new Date(a.scheduled_at);
      const topPct = ((start.getHours() - 7) + start.getMinutes() / 60) / 13 * 100;
      const heightPct = ((a.duration_minutes ?? 30) / 60) / 13 * 100;
      items.push({ type: "appointment", data: a, top: Math.max(0, topPct), height: Math.max(3, heightPct) });
    }
    for (const b of blocks as TimeBlock[]) {
      if (b.all_day) {
        items.push({ type: "block", data: b, top: 0, height: 100 });
      } else {
        const start = new Date(b.start_at);
        const end = new Date(b.end_at);
        const topPct = ((start.getHours() - 7) + start.getMinutes() / 60) / 13 * 100;
        const durationH = (end.getTime() - start.getTime()) / 3600000;
        const heightPct = (durationH / 13) * 100;
        items.push({ type: "block", data: b, top: Math.max(0, topPct), height: Math.max(3, heightPct) });
      }
    }
    return items;
  };

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={view === "month" ? prevMonth : prevWeek} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-lg font-bold text-slate-900 min-w-[200px] text-center">
            {view === "month"
              ? `${MONTHS[month]} ${year}`
              : `${weekDays[0].getDate()} ${MONTHS[weekDays[0].getMonth()]} – ${weekDays[6].getDate()} ${MONTHS[weekDays[6].getMonth()]} ${weekDays[6].getFullYear()}`
            }
          </h2>
          <button onClick={view === "month" ? nextMonth : nextWeek} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          <button onClick={goToday} className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">Today</button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
            <button onClick={() => setView("month")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${view === "month" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>Month</button>
            <button onClick={() => setView("week")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${view === "week" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>Week</button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-1">
        {[["confirmed","bg-emerald-500","Confirmed"],["proposed","bg-blue-500","Proposed"],["cancelled","bg-red-400","Cancelled"],["blocked","bg-slate-300","Blocked"]].map(([,color,label]) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
            {label}
          </div>
        ))}
      </div>

      {/* Month View */}
      {view === "month" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-200">
            {DAYS.map(d => (
              <div key={d} className="py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((day: Date | null, i: number) => {
              if (!day) return <div key={i} className="min-h-[110px] bg-slate-50/50 border-b border-r border-slate-100" />;
              const isToday = isSameDay(day, today);
              const appts = appointmentsOnDay(day as Date);
              const blocks = blocksOnDay(day as Date);
              const isPast = day < new Date(today.getFullYear(), today.getMonth(), today.getDate());
              return (
                <div
                  key={i}
                  onClick={() => handleDayClick(day)}
                  className={`min-h-[110px] p-2 border-b border-r border-slate-100 cursor-pointer group transition-all ${
                    isPast ? "bg-slate-50/60" : "bg-white hover:bg-blue-50/30"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium mb-1.5 transition ${
                    isToday ? "bg-blue-600 text-white shadow" : "text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700"
                  }`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {blocks.map((b: TimeBlock) => (
                      <div key={b.id} className="text-xs px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 truncate font-medium">
                        🚫 {b.title}
                      </div>
                    ))}
                    {appts.slice(0, 3).map((a: Appointment) => (
                      <div
                        key={a.id}
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSelectedAppointment(a); }}
                        className={`text-xs px-1.5 py-0.5 rounded text-white truncate font-medium cursor-pointer hover:opacity-90 ${statusColor(a.status)}`}
                      >
                        {formatTime(new Date(a.scheduled_at))} {a.service_name || "Appt"}
                      </div>
                    ))}
                    {appts.length > 3 && (
                      <div className="text-xs text-slate-400 font-medium px-1">+{appts.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {view === "week" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-8 border-b border-slate-200">
            <div className="py-3 text-xs text-slate-400 text-center" />
            {weekDays.map(d => {
              const isToday = isSameDay(d, today);
              return (
                <div key={d.toISOString()} className={`py-3 text-center ${isToday ? "bg-blue-50" : ""}`}>
                  <p className="text-xs font-medium text-slate-400 uppercase">{DAYS[d.getDay()]}</p>
                  <div className={`mx-auto mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isToday ? "bg-blue-600 text-white" : "text-slate-700"}`}>
                    {d.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-8 overflow-y-auto max-h-[600px]">
            {/* Time gutter */}
            <div className="border-r border-slate-100">
              {HOURS.map(h => (
                <div key={h} className="h-14 flex items-start justify-end pr-2 pt-1 border-b border-slate-50">
                  <span className="text-xs text-slate-400">{h}:00</span>
                </div>
              ))}
            </div>
            {weekDays.map(d => {
              const isToday = isSameDay(d, today);
              const items = dayEventsForWeek(d);
              return (
                <div
                  key={d.toISOString()}
                  onClick={() => handleDayClick(d)}
                  className={`relative border-r border-slate-100 cursor-pointer ${isToday ? "bg-blue-50/20" : "hover:bg-slate-50/50"}`}
                >
                  {HOURS.map(h => (
                    <div key={h} className="h-14 border-b border-slate-50" />
                  ))}
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        if (item.type === "appointment") setSelectedAppointment(item.data as Appointment);
                      }}
                      style={{ top: `${item.top}%`, height: `${item.height}%` }}
                      className={`absolute inset-x-0.5 rounded text-white text-xs px-1 py-0.5 overflow-hidden font-medium z-10 ${
                        item.type === "block" ? "bg-slate-300 text-slate-600" : statusColor((item.data as Appointment).status)
                      }`}
                    >
                      {item.type === "appointment"
                        ? <>{formatTime(new Date((item.data as Appointment).scheduled_at))} {(item.data as Appointment).service_name}</>
                        : <>🚫 {(item.data as TimeBlock).title}</>
                      }
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Block Time Modal */}
      {showBlockModal && selectedDay && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Block Time Slot</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {selectedDay.toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                <input
                  type="text"
                  value={blockTitle}
                  onChange={e => setBlockTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Unavailable, Lunch, Training"
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="allday" checked={blockAllDay} onChange={e => setBlockAllDay(e.target.checked)} className="rounded text-blue-600" />
                <label htmlFor="allday" className="text-sm text-slate-700 font-medium">Block entire day</label>
              </div>
              {!blockAllDay && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Start time</label>
                    <input type="time" value={blockStartTime} onChange={e => setBlockStartTime(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">End time</label>
                    <input type="time" value={blockEndTime} onChange={e => setBlockEndTime(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
                <textarea
                  value={blockNotes}
                  onChange={e => setBlockNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Additional details..."
                />
              </div>

              {blocksOnDay(selectedDay).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Existing blocks</p>
                  <div className="space-y-1.5">
                    {blocksOnDay(selectedDay).map(b => (
                      <div key={b.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{b.title}</p>
                          <p className="text-xs text-slate-400">{b.all_day ? "All day" : `${formatTime(new Date(b.start_at))} – ${formatTime(new Date(b.end_at))}`}</p>
                        </div>
                        <button
                          onClick={() => deleteBlock(b.id)}
                          disabled={deletingBlock === b.id}
                          className="text-red-500 hover:text-red-700 p-1 rounded transition disabled:opacity-40"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button onClick={() => setShowBlockModal(false)} className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition">Cancel</button>
              <button onClick={saveBlock} disabled={saving || !blockTitle} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50">
                {saving ? "Saving..." : "Block time"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedAppointment.service_name || "Appointment"}</h3>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge(selectedAppointment.status)}`}>
                  {selectedAppointment.status}
                </span>
              </div>
              <button onClick={() => setSelectedAppointment(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {new Date(selectedAppointment.scheduled_at).toLocaleString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
              {selectedAppointment.duration_minutes && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {selectedAppointment.duration_minutes} minutes
                </div>
              )}
              {(selectedAppointment.patient_name || selectedAppointment.patient_phone) && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  {selectedAppointment.patient_name || selectedAppointment.patient_phone}
                </div>
              )}
            </div>
            <div className="p-6 pt-0">
              <button onClick={() => setSelectedAppointment(null)} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
