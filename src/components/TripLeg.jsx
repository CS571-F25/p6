import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import ActivityBlock from "../components/ActivityBlock";
import AddCustomActivityModal from "../components/AddCustomActivityModal";

// =====================================================
// TIME HELPERS
// =====================================================
const parseTime = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const minutesToTime = (total) => {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const makeLocalDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const toISODate = (date) => date.toLocaleDateString("en-CA");

// =====================================================
// COMPONENT
// =====================================================
export default function TripLeg() {
  const { legName } = useParams();
  const navigate = useNavigate();

  const [leg, setLeg] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [allDates, setAllDates] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // =====================================================
  // LOAD LEG (ACCESSIBLE ALERT IF NOT FOUND)
  // =====================================================
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("tripLegs")) || [];
    const found = stored.find(
      (l) => l.name.toLowerCase().replace(/\s+/g, "-") === legName
    );

    if (!found) {
      alert("Trip leg not found.");
      navigate("/builder");
      return;
    }

    if (!found.activities) found.activities = [];

    const migrated = (found.plannedActivities || []).map((a) => {
      if (a.duration != null) return a;
      const s = parseTime(a.start);
      const e = parseTime(a.end);
      return {
        ...a,
        duration: Math.min(Math.max(e - s, 30), 480)
      };
    });

    found.plannedActivities = migrated;

    setLeg(found);
    setSchedule(migrated);

    if (found.startDate && found.endDate) {
      setAllDates(generateDateRange(found.startDate, found.endDate));
    }
  }, [legName, navigate]);

  // =====================================================
  // GENERATE DATE RANGE
  // =====================================================
  const generateDateRange = (start, end) => {
    const arr = [];
    let d = makeLocalDate(start);
    const stop = makeLocalDate(end);

    while (d <= stop) {
      arr.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return arr;
  };

  // =====================================================
  // GROUP DATES INTO WEEKS
  // =====================================================
  const groupDatesIntoWeeks = (dates) => {
    const weeks = [];
    let current = [];

    dates.forEach((date) => {
      if (current.length === 0) {
        const dow = (date.getDay() + 6) % 7;
        current = new Array(dow).fill(null);
      }

      current.push(date);

      if (current.length === 7) {
        weeks.push(current);
        current = [];
      }
    });

    if (current.length > 0) {
      while (current.length < 7) current.push(null);
      weeks.push(current);
    }

    return weeks;
  };

  // =====================================================
  // UPDATE LEG (ACCESSIBLE DATE LABELS)
  // =====================================================
  const updateLeg = (updated) => {
    const corrected = { ...updated };

    // Prevent reversed dates
    if (corrected.startDate && corrected.endDate) {
      if (corrected.startDate > corrected.endDate)
        corrected.endDate = corrected.startDate;
      if (corrected.endDate < corrected.startDate)
        corrected.startDate = corrected.endDate;
    }

    // Clean schedule out of range
    let cleaned = schedule;
    if (corrected.startDate && corrected.endDate) {
      cleaned = schedule.filter(
        (a) => a.date && a.date >= corrected.startDate && a.date <= corrected.endDate
      );
      setSchedule(cleaned);

      const stored = JSON.parse(localStorage.getItem("tripLegs")) || [];
      const updatedLegs = stored.map((l) =>
        l.name === corrected.name
          ? { ...l, ...corrected, plannedActivities: cleaned }
          : l
      );
      localStorage.setItem("tripLegs", JSON.stringify(updatedLegs));
    }

    // Save corrected leg
    const stored = JSON.parse(localStorage.getItem("tripLegs")) || [];
    const replaced = stored.map((l) =>
      l.name === corrected.name ? { ...l, ...corrected } : l
    );
    localStorage.setItem("tripLegs", JSON.stringify(replaced));

    setLeg(corrected);

    if (corrected.startDate && corrected.endDate) {
      setAllDates(generateDateRange(corrected.startDate, corrected.endDate));
      setCurrentWeekIndex(0);
    }
  };

  // =====================================================
  // SAVE SCHEDULE
  // =====================================================
  const saveSchedule = (updated) => {
    const stored = JSON.parse(localStorage.getItem("tripLegs")) || [];
    const newLegs = stored.map((l) =>
      l.name === leg.name ? { ...l, plannedActivities: updated } : l
    );
    localStorage.setItem("tripLegs", JSON.stringify(newLegs));
    setSchedule(updated);
  };

  const updateActivity = (index, updated) => {
    const copy = [...schedule];
    copy[index] = updated;
    saveSchedule(copy);
  };

  const removeActivity = (index) => {
    saveSchedule(schedule.filter((_, i) => i !== index));
  };

  // =====================================================
  // EARLIEST TIME CALCULATOR
  // =====================================================
  const findEarliestStart = (date, duration) => {
    const acts = schedule
      .filter((a) => a.date === date)
      .sort((a, b) => parseTime(a.start) - parseTime(b.start));

    let earliest = 6 * 60;

    for (let i = 0; i < acts.length; i++) {
      const a = acts[i];
      const aStart = parseTime(a.start);
      const aEnd = aStart + a.duration;

      if (earliest + duration <= aStart) {
        return minutesToTime(earliest);
      }
      earliest = aEnd;
    }

    return minutesToTime(earliest);
  };

  // =====================================================
  // CALENDAR CONFIG
  // =====================================================
  const HOURS = Array.from({ length: 17 }, (_, i) => 6 + i);
  const hourHeight = 60;
  
  const weeks = groupDatesIntoWeeks(allDates);
  const currentWeek = weeks[currentWeekIndex] || [];

  const actsByDate = {};
  schedule.forEach((a) => {
    if (!actsByDate[a.date]) actsByDate[a.date] = [];
    actsByDate[a.date].push(a);
  });

  // =====================================================
  // ACCESSIBLE RENDER
  // =====================================================
  if (!leg) return null;

  const handleSaveCustomActivity = (activity) => {
    const updatedLeg = {
      ...leg,
      activities: [...(leg.activities || []), activity]
    };

    setLeg(updatedLeg);

    const stored = JSON.parse(localStorage.getItem("tripLegs")) || [];
    const updatedStorage = stored.map((l) =>
      l.name === leg.name ? updatedLeg : l
    );
    localStorage.setItem("tripLegs", JSON.stringify(updatedStorage));
  };

  const deleteCustomActivity = (title) => {
    const filtered = leg.activities.filter((a) => a.title !== title);

    const updatedLeg = {
      ...leg,
      activities: filtered
    };

    setLeg(updatedLeg);

    const cleanedSchedule = schedule.filter((a) => a.title !== title);
    saveSchedule(cleanedSchedule);

    const stored = JSON.parse(localStorage.getItem("tripLegs")) || [];
    const updatedStorage = stored.map((l) =>
      l.name === leg.name ? updatedLeg : l
    );
    localStorage.setItem("tripLegs", JSON.stringify(updatedStorage));
  };

  return (
    <Container className="mt-4" role="main" aria-label="Trip leg scheduler">
      {/* Back Button */}
      <Button
        variant="secondary"
        onClick={() => navigate("/builder")}
        aria-label="Go back to Itinerary Builder"
      >
        ← Back to Itinerary Builder
      </Button>

      <h1 className="mt-3">{leg.name} — Trip Schedule</h1>

      {/* --------------------- DATE RANGE ---------------------- */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h2>Trip Date Range</h2>

          <Row>
            {/* START DATE */}
            <Col md={4}>
              <Form.Label htmlFor="startDateInput">Start Date</Form.Label>

              <div className="d-flex align-items-center" style={{ gap: "8px" }}>
                <i
                  className="bi bi-calendar-event"
                  role="button"
                  tabIndex="0"
                  aria-label="Open start date picker"
                  onClick={() =>
                    document.getElementById("startDateInput").showPicker()
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      document.getElementById("startDateInput").showPicker();
                    }
                  }}
                  style={{
                    fontSize: "1.4rem",
                    color: "#9a0404",
                    cursor: "pointer"
                  }}
                ></i>

                <Form.Control
                  id="startDateInput"
                  type="date"
                  value={leg.startDate || ""}
                  aria-describedby="startDateHelp"
                  onChange={(e) =>
                    updateLeg({ ...leg, startDate: e.target.value })
                  }
                />
              </div>
            </Col>

            {/* END DATE */}
            <Col md={4}>
              <Form.Label htmlFor="endDateInput">End Date</Form.Label>

              <div className="d-flex align-items-center" style={{ gap: "8px" }}>
                <i
                  className="bi bi-calendar-event"
                  role="button"
                  tabIndex="0"
                  aria-label="Open end date picker"
                  onClick={() =>
                    document.getElementById("endDateInput").showPicker?.()
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      document.getElementById("endDateInput").showPicker?.();
                    }
                  }}
                  style={{
                    fontSize: "1.4rem",
                    color: "#c5050c",
                    cursor: "pointer"
                  }}
                ></i>

                <Form.Control
                  id="endDateInput"
                  type="date"
                  value={leg.endDate || ""}
                  aria-describedby="endDateHelp"
                  onChange={(e) =>
                    updateLeg({ ...leg, endDate: e.target.value })
                  }
                />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row>
        {/* --------------------- AVAILABLE ACTIVITIES ---------------------- */}
        <Col md={4}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h2>Available Activities</h2>

              <div role="list">
                {(leg.activities || []).map((act, i) => {
                  const recMin = parseTime(act.end) - parseTime(act.start);
                  const duration = Math.min(Math.max(recMin, 30), 480);

                  return (
                    <Card key={i} className="mb-3" role="listitem">
                      <Card.Body>
                        <Card.Title as="h3">
                          <span>{act.title}</span>

                          {act.isCustom && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              aria-label={`Delete custom activity "${act.title}"`}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Delete custom activity "${act.title}"?`
                                  )
                                ) {
                                  deleteCustomActivity(act.title);
                                }
                              }}
                            >
                              ×
                            </Button>
                          )}
                        </Card.Title>

                        <Card.Subtitle className="mb-2 text-muted">
                          ({Math.round((duration / 60) * 10) / 10} hours
                          recommended)
                        </Card.Subtitle>

                        <Card.Text>{act.description}</Card.Text>

                        <Form.Label htmlFor={`assign-${i}`}>
                          Assign Date
                        </Form.Label>

                        <Form.Select
                          id={`assign-${i}`}
                          aria-label={`Assign ${act.title} to date`}
                          onChange={(e) => {
                            const selected = e.target.value;
                            if (!selected) return;

                            const start = findEarliestStart(
                              selected,
                              duration
                            );

                            const newAct = {
                              title: act.title,
                              description: act.description,
                              start,
                              duration,
                              date: selected
                            };

                            saveSchedule([...schedule, newAct]);
                          }}
                        >
                          <option value="">Select Date</option>
                          {allDates.map((d) => {
                            const iso = toISODate(d);
                            return (
                              <option key={iso} value={iso}>
                                {iso}
                              </option>
                            );
                          })}
                        </Form.Select>
                      </Card.Body>
                    </Card>
                  );
                })}
              </div>

              <Button
                variant="success"
                className="mt-2"
                aria-label="Add a custom activity"
                onClick={() => setShowAddModal(true)}
              >
                ➕ Add Custom Activity
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* --------------------- WEEKLY CALENDAR ---------------------- */}
        <Col md={8}>
          <Card className="shadow-sm p-3">
            <h2>Weekly Calendar</h2>

            {/* Pagination */}
            <div
              className="d-flex justify-content-between mb-3"
              aria-label="Week navigation"
            >
              <Button
                variant="outline-secondary"
                disabled={currentWeekIndex === 0}
                aria-label="View previous week"
                onClick={() => setCurrentWeekIndex(currentWeekIndex - 1)}
              >
                ← Previous Week
              </Button>

              <strong aria-live="polite">
                Week {currentWeekIndex + 1}
              </strong>

              <Button
                variant="outline-secondary"
                disabled={currentWeekIndex === weeks.length - 1}
                aria-label="View next week"
                onClick={() => setCurrentWeekIndex(currentWeekIndex + 1)}
              >
                Next Week →
              </Button>
            </div>
            {/* Header row ABOVE the calendar */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "80px repeat(7, 1fr)",
                marginBottom: "4px"
              }}
            >
              {/* Empty spacer above the hour labels */}
              <div></div>

              {currentWeek.map((date, idx) => (
                <div
                  key={idx}
                  className="text-center fw-bold"
                  style={{ fontSize: "0.9rem", padding: "4px 0" }}
                >
                  {date
                    ? date.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric"
                      })
                    : "-"}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div
              role="grid"
              aria-label="Weekly schedule grid"
              style={{
                display: "grid",
                gridTemplateColumns: "80px repeat(7, 1fr)",
                gridTemplateRows: `repeat(${HOURS.length}, ${hourHeight}px)`,
                gap: 4            
              }}
            >
              {/* Hour labels (left column) */}
              <div
                className="calendar-hours"
                style={{
                  gridColumn: 1,
                  position: "relative",
                  "--hour-height": `${hourHeight}px`,
                  minHeight: HOURS.length * hourHeight,

                  /* Same repeating grid background as day columns */
                  backgroundImage: `
                    repeating-linear-gradient(
                      to bottom,
                      rgba(0,0,0,0.08) 0px,
                      rgba(0,0,0,0.08) 1px,
                      transparent 1px,
                      transparent var(--hour-height)
                    )
                  `,
                  backgroundSize: "100% calc(var(--hour-height) * 17)",
                  backgroundRepeat: "no-repeat",
                }}
              >

                {/* Hour labels */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    style={{
                      height: hourHeight,
                      display: "flex",
                      alignItems: "center",
                      fontWeight: 500,
                      fontSize: "0.9rem",
                      paddingLeft: "4px",
                      background: "white",
                      position: "relative",
                      zIndex: 3
                    }}
                  >
                    {String(h).padStart(2, "0")}:00
                  </div>
                ))}
              </div>




              {/* Day columns */}
              {currentWeek.map((date, idx) => {
                const iso = date ? toISODate(date) : null;
                const dayActs = iso ? actsByDate[iso] || [] : [];

                return (
                  <div
                    key={idx}
                    role="gridcell"
                    className="calendar-day-column"
                    style={{
                      position: "relative",
                      borderLeft: "1px solid #ccc",
                      borderRight: "1px solid #ccc",
                      minHeight: HOURS.length * hourHeight,
                      "--hour-height": `${hourHeight}px`,
                      backgroundImage: `
                        repeating-linear-gradient(
                          to bottom,
                          rgba(0,0,0,0.08) 0px,
                          rgba(0,0,0,0.08) 1px,
                          transparent 1px,
                          transparent var(--hour-height)
                        )
                      `,
                      backgroundSize: "100% calc(var(--hour-height) * 17)",
                      backgroundRepeat: "no-repeat"
                    }}
                  >

                    {/* Activities (absolute-positioned inside this column) */}
                    {dayActs.map((activity) => {
                      const index = schedule.indexOf(activity);

                      return (
                        <ActivityBlock
                          key={`${activity.title}-${activity.start}-${activity.date}`}
                          activity={{
                            ...activity,
                            tripStartDate: leg.startDate,
                            tripEndDate: leg.endDate
                          }}
                          columnDate={date}
                          hourHeight={hourHeight}
                          snapMinutes={30}
                          onUpdate={(updated) => updateActivity(index, updated)}
                          onRemove={() => removeActivity(index)}
                        />
                      );
                    })}
                  </div>
                )
              })}
            </div>
          </Card>
        </Col>
      </Row>

      <AddCustomActivityModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveCustomActivity}
      />
    </Container>
  );
}
