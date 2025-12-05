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

  // -----------------------------
  // TIME HELPERS
  // -----------------------------
  const parseTime = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
// Check if a date is within allowed range
  const isDateWithinRange = (dateISO, startDate, endDate) => {
    return dateISO >= startDate && dateISO <= endDate;
  };
  
  const minutesToTime = (total) => {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const SCHEDULE_START_MINUTES = 6 * 60; // Your calendar begins at 06:00

  // -----------------------------
  // POSITIONING HELPERS
  // -----------------------------
  const getTopPx = () => {
    const minutesFromStart = parseTime(activity.start) - SCHEDULE_START_MINUTES;
    return (minutesFromStart / 60) * hourHeight;
  };

  const getHeightPx = () => {
    return (activity.duration / 60) * hourHeight;
  };

  const snap = (min) => Math.round(min / snapMinutes) * snapMinutes;

  // -----------------------------
  // DRAG HANDLER (Start time only)
  // -----------------------------
  const onMouseDownDrag = (e) => {
    e.preventDefault();
    setIsDragging(true);

    const startY = e.clientY;
    const initialStart = parseTime(activity.start);
    const initialDateISO = activity.date;

    const onMove = (ev) => {
      const deltaY = ev.clientY - startY;

      // translate px → minutes
      const minutesMoved = (deltaY / hourHeight) * 60;
      const previewStart = initialStart + minutesMoved;
      if (previewStart < SCHEDULE_START_MINUTES) return;

      // visual feedback
      if (blockRef.current) {
        blockRef.current.style.transform = `translateY(${deltaY}px)`;
        blockRef.current.style.opacity = 0.9;
      }

      // detect day shift
      const colRect = blockRef.current.parentElement.getBoundingClientRect();
      const relativeX = ev.clientX - colRect.left;
      const fraction = relativeX / colRect.width;

      let dayShift = 0;
      if (fraction > 0.75) dayShift = 1;
      else if (fraction < 0.25) dayShift = -1;

      let newDate = initialDateISO;
      if (dayShift !== 0 && columnDate) {
        const d = new Date(columnDate);
        d.setDate(d.getDate() + dayShift);
        const proposedDate = d.toLocaleDateString("en-CA");
      
        // ❗ Only allow a shift if it is inside trip range
        if (
          isDateWithinRange(
            proposedDate,
            activity.tripStartDate,   // we will inject these
            activity.tripEndDate
          )
        ) {
          newDate = proposedDate;
        } else {
          // ❌ Out of range → ignore sideways drag
          newDate = initialDateISO;
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
        let snappedStart = snap(activity.__preview.newStartMinutes);

        if (snappedStart < SCHEDULE_START_MINUTES) {
          snappedStart = SCHEDULE_START_MINUTES;
        }

        onUpdate({
          ...activity,
          start: minutesToTime(snappedStart),
          date: activity.__preview.newDate
        });

        delete activity.__preview;
      }

      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // -----------------------------
  // RENDER UI
  // -----------------------------
  const computedEnd = minutesToTime(
    parseTime(activity.start) + activity.duration
  );

  const buttonStyle = {
    flex: 1,
    fontSize: "0.65rem",
    padding: "2px 3px",
    borderRadius: 4,
    border: "none",
    cursor: "pointer",
    background: "rgba(255,255,255,0.2)",
    color: "white",
    whiteSpace: "nowrap"
  };

  return (
    <div
      ref={blockRef}
      onMouseDown={onMouseDownDrag}
      style={{
        position: "absolute",
        top: getTopPx(),
        height: getHeightPx(),
        left: "5%",
        right: "5%",
        background: isDragging ? "#2b6cb0" : "#4a90e2",
        color: "white",
        borderRadius: 6,
        padding: 6,
        cursor: "grab",
        userSelect: "none",

        // 🧠 MAIN FIXES FOR TEXT + BUTTONS SHRINKING
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",

        boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
      }}
    >
      {/* TOP CONTENT — shrinks gracefully */}
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
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        style={{
          background: "rgba(220,0,0,0.85)",
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

      {/* BOTTOM: duration controls (never float away / never disappear) */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginTop: 4,
          flexShrink: 0 // prevents buttons from collapsing
        }}
      >
        <button
          style={buttonStyle}
          onClick={(e) => {
            e.stopPropagation();
            const newDur = Math.min(activity.duration + 30, 480);
            onUpdate({ ...activity, duration: newDur });
          }}
        >
          +30m
        </button>

        <button
          style={buttonStyle}
          onClick={(e) => {
            e.stopPropagation();
            const newDur = Math.max(activity.duration - 30, 30);
            onUpdate({ ...activity, duration: newDur });
          }}
        >
          -30m
        </button>
      </div>
    </div>
  );
}
