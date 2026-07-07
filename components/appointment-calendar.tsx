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
    case "confirmed": return "bg-primary";
    case "proposed": return "bg-secondary-container text-primary";
    case "cancelled": return "bg-error";
    case "completed": return "bg-outline";
    default: return "bg-tertiary";
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "confirmed": return "bg-primary/10 text-primary border-primary/20";
    case "proposed": return "bg-secondary-container text-primary border-primary/10";
    case "cancelled": return "bg-error-container text-on-error-container border-error/10";
    case "completed": return "bg-surface-container-high text-outline border-outline-variant/30";
    default: return "bg-tertiary-container text-on-tertiary-container border-tertiary/10";
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
    <div className="space-y-6">
      {/* Header controls */}
      <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-container p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={view === "month" ? prevMonth : prevWeek} className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-all">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <h2 className="text-xl font-bold text-primary min-w-[200px] text-center">
            {view === "month"
              ? `${MONTHS[month]} ${year}`
              : `${weekDays[0].getDate()} ${MONTHS[weekDays[0].getMonth()]} – ${weekDays[6].getDate()} ${MONTHS[weekDays[6].getMonth()]} ${weekDays[6].getFullYear()}`
            }
          </h2>
          <button onClick={view === "month" ? nextMonth : nextWeek} className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-all">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
          <button onClick={goToday} className="px-5 py-2 text-sm font-bold text-primary bg-secondary-container hover:bg-secondary-container/80 rounded-full transition-all uppercase tracking-widest">Today</button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-surface-container-high rounded-full p-1 gap-1">
            <button onClick={() => setView("month")} className={`px-6 py-2 rounded-full text-sm font-bold transition-all uppercase tracking-widest ${view === "month" ? "bg-surface-container-lowest shadow text-primary" : "text-outline hover:text-on-surface-variant"}`}>Month</button>
            <button onClick={() => setView("week")} className={`px-6 py-2 rounded-full text-sm font-bold transition-all uppercase tracking-widest ${view === "week" ? "bg-surface-container-lowest shadow text-primary" : "text-outline hover:text-on-surface-variant"}`}>Week</button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-2">
        {[["confirmed","bg-primary","Confirmed"],["proposed","bg-secondary-container border border-primary/20","Proposed"],["cancelled","bg-error","Cancelled"],["blocked","bg-outline-variant","Blocked"]].map(([,color,label]) => (
          <div key={label} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-outline">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            {label}
          </div>
        ))}
      </div>

      {/* Month View */}
      {view === "month" && (
        <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-container overflow-hidden">
          <div className="grid grid-cols-7 border-b border-surface-container bg-surface-container-low/30">
            {DAYS.map(d => (
              <div key={d} className="py-4 text-center text-[10px] font-bold text-outline uppercase tracking-widest">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((day: Date | null, i: number) => {
              if (!day) return <div key={i} className="min-h-[120px] bg-surface-container-low/10 border-b border-r border-surface-container/50" />;
              const isToday = isSameDay(day, today);
              const appts = appointmentsOnDay(day as Date);
              const blocks = blocksOnDay(day as Date);
              const isPast = day < new Date(today.getFullYear(), today.getMonth(), today.getDate());
              return (
                <div
                  key={i}
                  onClick={() => handleDayClick(day)}
                  className={`min-h-[120px] p-2 border-b border-r border-surface-container/50 cursor-pointer group transition-all ${
                    isPast ? "bg-surface-container-low/5 opacity-60" : "bg-white hover:bg-secondary-container/10"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-all ${
                    isToday ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-on-surface-variant group-hover:bg-primary-container/20 group-hover:text-primary"
                  }`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {blocks.map((b: TimeBlock) => (
                      <div key={b.id} className="text-[10px] px-2 py-0.5 rounded-full bg-outline-variant text-on-surface-variant truncate font-bold uppercase tracking-tighter">
                        🚫 {b.title}
                      </div>
                    ))}
                    {appts.slice(0, 3).map((a: Appointment) => (
                      <div
                        key={a.id}
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSelectedAppointment(a); }}
                        className={`text-[10px] px-2 py-0.5 rounded-full truncate font-bold uppercase tracking-tighter cursor-pointer hover:shadow-sm transition-shadow ${
                          a.status === "confirmed" ? "bg-primary text-on-primary" : "bg-secondary-container text-primary border border-primary/10"
                        }`}
                      >
                        {formatTime(new Date(a.scheduled_at))} {a.service_name || "Appt"}
                      </div>
                    ))}
                    {appts.length > 3 && (
                      <div className="text-[10px] text-outline font-bold px-2 uppercase">+{appts.length - 3} more</div>
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
        <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-container overflow-hidden flex flex-col">
          <div className="grid grid-cols-8 border-b border-surface-container bg-surface-container-low/30">
            <div className="py-4 border-r border-surface-container/50" />
            {weekDays.map(d => {
              const isToday = isSameDay(d, today);
              return (
                <div key={d.toISOString()} className={`py-4 text-center border-r border-surface-container/50 ${isToday ? "bg-primary-container/5" : ""}`}>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-widest">{DAYS[d.getDay()]}</p>
                  <div className={`mx-auto mt-1 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${isToday ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-on-surface"}`}>
                    {d.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-8 overflow-y-auto max-h-[600px] custom-scrollbar">
            {/* Time gutter */}
            <div className="border-r border-surface-container/50 bg-surface-container-low/10">
              {HOURS.map(h => (
                <div key={h} className="h-16 flex items-start justify-end pr-3 pt-2 border-b border-surface-container/30">
                  <span className="text-[10px] font-bold text-outline uppercase">{h}:00</span>
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
                  className={`relative border-r border-surface-container/50 cursor-pointer transition-all ${isToday ? "bg-primary-container/5" : "hover:bg-secondary-container/5"}`}
                >
                  {HOURS.map(h => (
                    <div key={h} className="h-16 border-b border-surface-container/30" />
                  ))}
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        if (item.type === "appointment") setSelectedAppointment(item.data as Appointment);
                      }}
                      style={{ top: `${item.top}%`, height: `${item.height}%` }}
                      className={`absolute inset-x-1 rounded-xl shadow-sm text-[10px] px-2 py-1.5 overflow-hidden font-bold uppercase tracking-tighter z-10 transition-all hover:scale-[1.02] hover:shadow-md ${
                        item.type === "block" 
                          ? "bg-outline-variant text-on-surface-variant border-l-4 border-outline" 
                          : item.data.status === "confirmed" 
                            ? "bg-primary text-on-primary border-l-4 border-primary-fixed" 
                            : "bg-secondary-container text-primary border-l-4 border-primary border border-primary/10"
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
        <div className="fixed inset-0 bg-on-background/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-md border border-surface-container overflow-hidden">
            <div className="p-8 border-b border-surface-container bg-surface-container-low/30">
              <h3 className="text-xl font-bold text-primary">Block Time Slot</h3>
              <p className="text-sm text-outline font-medium mt-1">
                {selectedDay.toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Reason</label>
                <input
                  type="text"
                  value={blockTitle}
                  onChange={e => setBlockTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-2xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="e.g. Unavailable, Lunch, Training"
                />
              </div>
              <div className="flex items-center gap-3 bg-secondary-container/20 p-4 rounded-2xl border border-primary/10">
                <input type="checkbox" id="allday" checked={blockAllDay} onChange={e => setBlockAllDay(e.target.checked)} className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" />
                <label htmlFor="allday" className="text-sm text-primary font-bold uppercase tracking-wider cursor-pointer">Block entire day</label>
              </div>
              {!blockAllDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Start time</label>
                    <input type="time" value={blockStartTime} onChange={e => setBlockStartTime(e.target.value)} className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-2xl text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-2">End time</label>
                    <input type="time" value={blockEndTime} onChange={e => setBlockEndTime(e.target.value)} className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-2xl text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Notes (optional)</label>
                <textarea
                  value={blockNotes}
                  onChange={e => setBlockNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-2xl text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                  placeholder="Additional details..."
                />
              </div>

              {blocksOnDay(selectedDay).length > 0 && (
                <div className="pt-4 border-t border-surface-container">
                  <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-4">Existing blocks</p>
                  <div className="space-y-3">
                    {blocksOnDay(selectedDay).map(b => (
                      <div key={b.id} className="flex items-center justify-between bg-surface-container-low/50 rounded-2xl px-4 py-3 border border-outline-variant/20">
                        <div>
                          <p className="text-sm font-bold text-on-surface">{b.title}</p>
                          <p className="text-xs text-outline font-medium uppercase tracking-tighter">{b.all_day ? "All day" : `${formatTime(new Date(b.start_at))} – ${formatTime(new Date(b.end_at))}`}</p>
                        </div>
                        <button
                          onClick={() => deleteBlock(b.id)}
                          disabled={deletingBlock === b.id}
                          className="text-error hover:bg-error-container/50 p-2 rounded-full transition-all disabled:opacity-40"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-8 pt-0 flex gap-4 bg-surface-container-low/10">
              <button onClick={() => setShowBlockModal(false)} className="flex-1 py-4 border border-outline-variant text-outline rounded-full text-xs font-bold uppercase tracking-widest hover:bg-surface-container-high transition-all">Cancel</button>
              <button onClick={saveBlock} disabled={saving || !blockTitle} className="flex-1 py-4 bg-primary text-on-primary rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                {saving ? "Saving..." : "Block time"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-on-background/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-sm border border-surface-container overflow-hidden">
            <div className="p-8 border-b border-surface-container bg-surface-container-low/30 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-primary leading-tight">{selectedAppointment.service_name || "Appointment"}</h3>
                <span className={`inline-block mt-2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${statusBadge(selectedAppointment.status)}`}>
                  {selectedAppointment.status}
                </span>
              </div>
              <button onClick={() => setSelectedAppointment(null)} className="text-outline hover:text-on-surface-variant p-2 rounded-full hover:bg-surface-container-high transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4 text-sm font-medium text-on-surface-variant">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">calendar_today</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Scheduled At</p>
                  <p className="text-on-surface mt-0.5">
                    {new Date(selectedAppointment.scheduled_at).toLocaleString("en-ZA", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
              {selectedAppointment.duration_minutes && (
                <div className="flex items-center gap-4 text-sm font-medium text-on-surface-variant">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">schedule</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Duration</p>
                    <p className="text-on-surface mt-0.5">{selectedAppointment.duration_minutes} minutes</p>
                  </div>
                </div>
              )}
              {(selectedAppointment.patient_name || selectedAppointment.patient_phone) && (
                <div className="flex items-center gap-4 text-sm font-medium text-on-surface-variant">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Patient</p>
                    <p className="text-on-surface mt-0.5 font-bold">{selectedAppointment.patient_name || "Unknown Name"}</p>
                    <p className="text-xs text-outline">{selectedAppointment.patient_phone}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-8 pt-0">
              <button onClick={() => setSelectedAppointment(null)} className="w-full py-4 bg-primary text-on-primary rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
