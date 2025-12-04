import { useRef, useState } from "react";

export default function ActivityBlock({
  activity,
  columnDate,
  onUpdate,
  onRemove,
  hourHeight = 60,       // height of 1 hour in px
  snapMinutes = 30       // minute snapping interval
}) {
  const blockRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const snap = (minutes) => {
    return Math.round(minutes / snapMinutes) * snapMinutes;
  };

  const parseTime = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (total) => {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  // Convert time → px
  const getTopPx = () => {
    return (parseTime(activity.start) / 60) * hourHeight;
  };

  // Convert duration → px
  const getHeightPx = () => {
    return ((parseTime(activity.end) - parseTime(activity.start)) / 60) * hourHeight;
  };

  const onMouseDownDrag = (e) => {
    e.preventDefault();
    setIsDragging(true);
  
    const startY = e.clientY;
    const initialStartMin = parseTime(activity.start);
    const initialEndMin = parseTime(activity.end);
    const initialDate = activity.date;
  
    const onMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
  
      // MOVES FREELY (NO SNAP DURING DRAG)
      const minutesMoved = (deltaY / hourHeight) * 60;
  
      // Preview new time (float)
      const newStartPreview = initialStartMin + minutesMoved;
      const newEndPreview = initialEndMin + minutesMoved;
  
      // Restrict from going above top
      if (newStartPreview < 0) return;
  
      // Apply TEMPORARY pixel transform to block
      if (blockRef.current) {
        blockRef.current.style.transform = `translateY(${deltaY}px)`;
        blockRef.current.style.opacity = "0.85";
      }
  
      // Horizontal movement detection (full-column jump)
      const columnRect = blockRef.current.parentElement.getBoundingClientRect();
      const cursorX = moveEvent.clientX;
  
      const columnWidth = columnRect.width;
      const colLeft = columnRect.left;
  
      const offsetX = cursorX - colLeft;
      const fraction = offsetX / columnWidth;
  
      let dayShift = 0;
      if (fraction > 0.75) dayShift = 1;
      else if (fraction < 0.25) dayShift = -1;
  
      let newDate = initialDate;
      if (dayShift !== 0) {
        const dt = new Date(initialDate);
        dt.setDate(dt.getDate() + dayShift);
        newDate = dt.toISOString().split("T")[0];
      }
  
      // Store as preview state (NOT final update)
      activity.__preview = {
        newStartPreview,
        newEndPreview,
        newDate
      };
    };
  
    const onUp = () => {
      setIsDragging(false);
  
      // Remove transform
      if (blockRef.current) {
        blockRef.current.style.transform = "none";
        blockRef.current.style.opacity = "1";
      }
  
      // SNAP ONLY NOW — AT RELEASE
      if (activity.__preview) {
        const snappedStart = snap(activity.__preview.newStartPreview);
        const newEnd =
          snappedStart + (initialEndMin - initialStartMin);
  
        onUpdate({
          ...activity,
          start: minutesToTime(snappedStart),
          end: minutesToTime(newEnd),
          date: activity.__preview.newDate,
        });
  
        delete activity.__preview;
      }
  
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };
  

  const onMouseDownResize = (e) => {
    e.preventDefault();
    setIsResizing(true);

    const startY = e.clientY;
    const initialEnd = parseTime(activity.end);

    const onMove = (e) => {
      const deltaY = e.clientY - startY;
      const minutesMoved = (deltaY / hourHeight) * 60;
      const snapped = snap(minutesMoved);

      let newEnd = Math.max(parseTime(activity.start) + 30, initialEnd + snapped);

      onUpdate({
        ...activity,
        end: minutesToTime(newEnd)
      });
    };

    const onUp = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
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
        padding: 4,
        cursor: "grab",
        userSelect: "none"
      }}
    >
      <strong>{activity.title}</strong>
      <div>{activity.start}–{activity.end}</div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        style={{
          background: "rgba(255,0,0,0.8)",
          border: "none",
          color: "white",
          fontSize: "0.7rem",
          borderRadius: 4,
          padding: "2px 4px",
          position: "absolute",
          top: 4,
          right: 4,
          cursor: "pointer",
        }}
      >
        ✕
      </button>

      {/* Resize handle */}
      <div
        onMouseDown={onMouseDownResize}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          background: "rgba(255,255,255,0.8)",
          cursor: "ns-resize"
        }}
      />
    </div>
  );
}
