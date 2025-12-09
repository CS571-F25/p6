import { useRef, useState } from "react";

export default function ActivityBlock({
  activity,
  columnDate,
  onUpdate,
  onRemove,
  hourHeight = 60,
  snapMinutes = 30
}) {
  const blockRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [keyboardGrab, setKeyboardGrab] = useState(false);

  // ======================================================
  // TIME HELPERS
  // ======================================================
  const parseTime = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (total) => {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const isDateWithinRange = (dateISO, startDate, endDate) =>
    dateISO >= startDate && dateISO <= endDate;

  const SCHEDULE_START_MINUTES = 6 * 60;
  const SCHEDULE_END_MINUTES = 22 * 60;

  // ======================================================
  // POSITIONING
  // ======================================================
  const getTopPx = () => {
    const startMin = parseTime(activity.start);
    const px = ((startMin - SCHEDULE_START_MINUTES) / 60) * hourHeight;
    return Math.round(px);   // ⬅ Pixel snap
  };
  
  const getHeightPx = () => {
    const px = (activity.duration / 60) * hourHeight;
    return Math.round(px);   // ⬅ Pixel snap
  };

  const snap = (min) => Math.round(min / snapMinutes) * snapMinutes;

  // ======================================================
  // MOUSE DRAG HANDLER
  // ======================================================
  const onMouseDownDrag = (e) => {
    e.preventDefault();
    setIsDragging(true);

    const startY = e.clientY;
    const initialStart = parseTime(activity.start);
    const initialDateISO = activity.date;

    const onMove = (ev) => {
      const deltaY = ev.clientY - startY;
      const minutesMoved = (deltaY / hourHeight) * 60;
      let previewStart = initialStart + minutesMoved;

      // Clamp movement
      const latestStart = SCHEDULE_END_MINUTES - activity.duration;

      if (previewStart < SCHEDULE_START_MINUTES) previewStart = SCHEDULE_START_MINUTES;
      if (previewStart > latestStart) previewStart = latestStart;

      // Visual preview
      if (blockRef.current) {
        blockRef.current.style.transform = `translateY(${
          Math.round(((previewStart - initialStart) / 60) * hourHeight)
        }px)`;        
        blockRef.current.style.opacity = 0.9;
      }

      // Detect day shift
      const colRect = blockRef.current?.parentElement?.getBoundingClientRect();
      const relativeX = ev.clientX - colRect.left;
      let dayShift = 0;

      if (relativeX / colRect.width > 0.75) dayShift = 1;
      else if (relativeX / colRect.width < 0.25) dayShift = -1;

      let newDate = initialDateISO;

      if (dayShift !== 0) {
        const d = new Date(columnDate);
        d.setDate(d.getDate() + dayShift);
        const iso = d.toLocaleDateString("en-CA");

        if (isDateWithinRange(iso, activity.tripStartDate, activity.tripEndDate)) {
          newDate = iso;
        }
      }

      activity.__preview = {
        newStartMinutes: previewStart,
        newDate
      };
    };

    const onUp = () => {
      setIsDragging(false);

      if (blockRef.current) {
        blockRef.current.style.transform = "none";
        blockRef.current.style.opacity = 1;
      }

      if (activity.__preview) {
        let newStart = snap(activity.__preview.newStartMinutes);

        // Final clamp
        const latest = SCHEDULE_END_MINUTES - activity.duration;
        if (newStart < SCHEDULE_START_MINUTES) newStart = SCHEDULE_START_MINUTES;
        if (newStart > latest) newStart = latest;

        onUpdate({
          ...activity,
          start: minutesToTime(newStart),
          date: activity.__preview.newDate
        });
      }

      delete activity.__preview;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // ======================================================
  // KEYBOARD ACCESSIBILITY
  // ======================================================
  const handleKeyDown = (e) => {
    const startMin = parseTime(activity.start);

    // Toggle grab mode
    if (e.key === " " || (e.key === "Enter" && e.target === blockRef.current)) {
      e.preventDefault();
      setKeyboardGrab((prev) => !prev);
      return;
    }

    if (!keyboardGrab) return;

    // Move up
    if (e.key === "ArrowUp") {
      const newStart = Math.max(SCHEDULE_START_MINUTES, startMin - snapMinutes);
      onUpdate({ ...activity, start: minutesToTime(newStart) });
    }

    // Move down (clamped)
    if (e.key === "ArrowDown") {
      const latest = SCHEDULE_END_MINUTES - activity.duration;
      const newStart = Math.min(latest, startMin + snapMinutes);
      onUpdate({ ...activity, start: minutesToTime(newStart) });
    }

    // Move left/right days
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const shift = e.key === "ArrowRight" ? 1 : -1;
      const d = new Date(columnDate);
      d.setDate(d.getDate() + shift);
      const iso = d.toLocaleDateString("en-CA");

      if (isDateWithinRange(iso, activity.tripStartDate, activity.tripEndDate)) {
        onUpdate({ ...activity, date: iso });
      }
    }
  };

  // ======================================================
  // CALCULATED END TIME
  // ======================================================
  const computedEnd = minutesToTime(parseTime(activity.start) + activity.duration);

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <div
      ref={blockRef}
      role="button"
      tabIndex={0}
      aria-grabbed={isDragging || keyboardGrab}
      aria-label={`${activity.title}. Scheduled from ${activity.start} to ${computedEnd}. Duration ${activity.duration} minutes.`}
      onKeyDown={handleKeyDown}
      onMouseDown={onMouseDownDrag}
      style={{
        position: "absolute",
        top: getTopPx(),
        height: getHeightPx(),
        left: "5%",
        right: "5%",
        background: isDragging || keyboardGrab ? "#245B92" : "#1E4A7A",
        color: "white",
        borderRadius: 6,
        padding: 6,
        cursor: "grab",
        userSelect: "none",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        outline: keyboardGrab ? "3px solid #FFD700" : "none",
        boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
      }}
    >
      {/* TITLE & TIME */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <strong style={{ fontSize: "0.75rem", lineHeight: 1 }}>
          {activity.title}
        </strong>
        <div style={{ fontSize: "0.7rem", opacity: 0.9 }}>
          {activity.start} — {computedEnd}
        </div>
      </div>

      {/* DELETE BUTTON */}
      <button
        aria-label={`Delete activity ${activity.title}`}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        style={{
          background: "#B00020",
          border: "none",
          color: "white",
          fontSize: "0.7rem",
          borderRadius: 4,
          padding: "2px 6px",
          position: "absolute",
          top: 4,
          right: 4,
          cursor: "pointer"
        }}
      >
        ✕
      </button>

      {/* DURATION ADJUSTERS */}
      <div style={{ display: "flex", gap: 4, marginTop: 4, flexShrink: 0 }}>
        <button
          aria-label={`Increase duration of ${activity.title} by 30 minutes`}
          onClick={(e) => {
            e.stopPropagation();

            const startMin = parseTime(activity.start);
            const proposed = activity.duration + 30;
            const maxDur = SCHEDULE_END_MINUTES - startMin;

            const newDur = Math.min(Math.min(proposed, maxDur), 480);

            onUpdate({ ...activity, duration: newDur });
          }}
          style={{
            flex: 1,
            fontSize: "0.65rem",
            padding: "2px 3px",
            borderRadius: 4,
            border: "none",
            cursor: "pointer",
            background: "rgba(255,255,255,0.2)",
            color: "white",
            whiteSpace: "nowrap"
          }}
        >
          +30m
        </button>

        <button
          aria-label={`Decrease duration of ${activity.title} by 30 minutes`}
          onClick={(e) => {
            e.stopPropagation();
            const newDur = Math.max(activity.duration - 30, 30);
            onUpdate({ ...activity, duration: newDur });
          }}
          style={{
            flex: 1,
            fontSize: "0.65rem",
            padding: "2px 3px",
            borderRadius: 4,
            border: "none",
            cursor: "pointer",
            background: "rgba(255,255,255,0.2)",
            color: "white",
            whiteSpace: "nowrap"
          }}
        >
          -30m
        </button>
      </div>
    </div>
  );
}
