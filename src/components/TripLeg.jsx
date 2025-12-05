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

// Convert "YYYY-MM-DD" to *local* Date safely
const makeLocalDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// Format Date → "YYYY-MM-DD" in local time (NO UTC SHIFT)
const toISODate = (date) => {
  return date.toLocaleDateString("en-CA");
};

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
  // LOAD LEG + MIGRATE OLD START/END INTO DURATION MODEL
  // =====================================================
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("tripLegs")) || [];
    const found = stored.find(
      (l) => l.name.toLowerCase().replace(/\s+/g, "-") === legName
    );
    if (!found.activities) {
        found.activities = [];
    }

    if (!found) {
      navigate("/builder");
      return;
    }

    const migrated = (found.plannedActivities || []).map((a) => {
      if (a.duration != null) return a;

      const s = parseTime(a.start);
      const e = parseTime(a.end);
      return {
        ...a,
        duration: Math.min(Math.max(e - s, 30), 480),
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
  // GENERATE SAFE LOCAL DATE RANGE
  // =====================================================
  const generateDateRange = (start, end) => {
    const dates = [];
    let cur = makeLocalDate(start);
    const endDate = makeLocalDate(end);

    while (cur <= endDate) {
      dates.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  };

  // =====================================================
  // GROUP DATES INTO WEEKS
  // =====================================================
  const groupDatesIntoWeeks = (dates) => {
    const weeks = [];
    let currentWeek = [];

    dates.forEach((date) => {
      if (currentWeek.length === 0) {
        const dow = (date.getDay() + 6) % 7;
        currentWeek = new Array(dow).fill(null);
      }

      currentWeek.push(date);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }

    return weeks;
  };

  // =====================================================
  // UPDATE LEG + CLEAN ACTIVITIES OUTSIDE RANGE
  // =====================================================
  const updateLeg = (updated) => {
    const corrected = { ...updated };

    // Fix reversed dates
    if (corrected.startDate && corrected.endDate) {
      if (corrected.startDate > corrected.endDate)
        corrected.endDate = corrected.startDate;
      if (corrected.endDate < corrected.startDate)
        corrected.startDate = corrected.endDate;
    }

    // Clean schedule
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
    const newS = [...schedule];
    newS[index] = updated;
    saveSchedule(newS);
  };

  const removeActivity = (index) => {
    saveSchedule(schedule.filter((_, i) => i !== index));
  };

  // =====================================================
  // EARLIEST POSSIBLE NON-CONFLICTING START TIME
  // =====================================================
  const findEarliestStart = (date, duration) => {
    const acts = schedule
      .filter((a) => a.date === date)
      .sort((a, b) => parseTime(a.start) - parseTime(b.start));

    let earliest = 6 * 60; // start of calendar day

    for (let i = 0; i < acts.length; i++) {
      const a = acts[i];
      const aStart = parseTime(a.start);
      const aEnd = aStart + a.duration;

      // If this activity fits before the next one:
      if (earliest + duration <= aStart) {
        return minutesToTime(earliest);
      }

      earliest = aEnd;
    }

    // If no gap, place after last activity
    return minutesToTime(earliest);
  };

  // =====================================================
  // CALENDAR CONFIG
  // =====================================================
  const HOURS = Array.from({ length: 17 }, (_, i) => 6 + i);
  const hourHeight = 60;

  // =====================================================
  // GROUP ACTIVITIES BY DATE
  // =====================================================
  const weeks = groupDatesIntoWeeks(allDates);
  const currentWeek = weeks[currentWeekIndex] || [];

  const actsByDate = {};
  schedule.forEach((a) => {
    if (!actsByDate[a.date]) actsByDate[a.date] = [];
    actsByDate[a.date].push(a);
  });

  // =====================================================
  // RENDER
  // =====================================================
  if (!leg) return null;
  const handleSaveCustomActivity = (activity) => {
    const updatedLeg = {
      ...leg,
      activities: [...(leg.activities || []), activity]
    };
  
    setLeg(updatedLeg);
  
    // Update stored tripLegs
    const stored = JSON.parse(localStorage.getItem("tripLegs")) || [];
    const updatedStorage = stored.map((l) =>
      l.name === leg.name ? updatedLeg : l
    );
  
    localStorage.setItem("tripLegs", JSON.stringify(updatedStorage));
  };
  const deleteCustomActivity = (activityTitle) => {
    const filtered = leg.activities.filter(a => a.title !== activityTitle);
  
    const updatedLeg = {
      ...leg,
      activities: filtered
    };
  
    setLeg(updatedLeg);
  
    // Clean schedule of that activity title
    const cleanedSchedule = schedule.filter(a => a.title !== activityTitle);
    saveSchedule(cleanedSchedule);
  
    // Persist
    const stored = JSON.parse(localStorage.getItem("tripLegs")) || [];
    const updatedStorage = stored.map((l) =>
      l.name === leg.name ? updatedLeg : l
    );
  
    localStorage.setItem("tripLegs", JSON.stringify(updatedStorage));
  };
  
  
  return (
    <Container className="mt-4">
      <Button variant="secondary" onClick={() => navigate("/builder")}>
        ← Back to Itinerary Builder
      </Button>

      <h2 className="mt-3">{leg.name} — Trip Schedule</h2>

      {/* DATE RANGE */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h4>Trip Date Range</h4>

          <Row>
          <Col md={4}>
            <Form.Label>Start Date</Form.Label>

            <div className="d-flex align-items-center" style={{ gap: "8px" }}>
                <i
                    className="bi bi-calendar-event"
                    style={{ fontSize: "1.4rem", color: "#c5050c", cursor: "pointer" }}
                    onClick={() => document.getElementById("startDateInput").showPicker()}
                ></i>

                <Form.Control
                    id="startDateInput"
                    type="date"
                    value={leg.startDate || ""}
                    onChange={(e) =>
                    updateLeg({ ...leg, startDate: e.target.value })
                    }
                />
            </div>

            </Col>


            <Col md={4}>
                <Form.Label>End Date</Form.Label>

                <div className="d-flex align-items-center" style={{ gap: "8px" }}>
                    <i
                    className="bi bi-calendar-event"
                    style={{ fontSize: "1.4rem", color: "#c5050c", cursor: "pointer" }}
                    onClick={() => document.getElementById("endDateInput").showPicker?.()}
                    ></i>

                    <Form.Control
                    id="endDateInput"
                    type="date"
                    value={leg.endDate || ""}
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
        {/* AVAILABLE ACTIVITIES */}
        <Col md={4}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h4>Available Activities</h4>

              {(leg.activities || []).map((act, i) => {
                const recMin = parseTime(act.end) - parseTime(act.start);
                const duration = Math.min(Math.max(recMin, 30), 480);

                return (
                    <Card key={i} className="mb-3">
                        <Card.Body>
                        <Card.Title className="d-flex justify-content-between align-items-center">
                            {act.title}

                            {/* SHOW DELETE ONLY FOR CUSTOM ACTIVITIES */}
                            {act.isCustom && (
                                <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => {
                                    if (window.confirm(`Delete custom activity "${act.title}"?`)) {
                                    deleteCustomActivity(act.title);
                                    }
                                }}
                                >
                                X
                                </button>
                            )}
                        </Card.Title>
                    
                        <Card.Subtitle className="mb-2 text-muted">
                            ({Math.round((duration / 60) * 10) / 10} hours recommended)
                        </Card.Subtitle>
                    
                        <Card.Text>{act.description}</Card.Text>
                    
                        <Form.Label>Assign Date</Form.Label>
                        <Form.Select
                            onChange={(e) => {
                            const selected = e.target.value;
                            if (!selected) return;
                    
                            const start = findEarliestStart(selected, duration);
                    
                            const newAct = {
                                title: act.title,
                                description: act.description,
                                start,
                                duration,
                                date: selected,
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
              <Button 
                variant="success"
                className="mb-3"
                onClick={() => setShowAddModal(true)}
                >
                ➕ Add Custom Activity
                </Button>

            </Card.Body>
          </Card>
        </Col>

        {/* WEEKLY CALENDAR */}
        <Col md={8}>
          <Card className="shadow-sm p-3">
            <h4 className="mb-3">Weekly Calendar</h4>

            {/* Pagination */}
            <div className="d-flex justify-content-between mb-3">
              <Button
                variant="outline-secondary"
                disabled={currentWeekIndex === 0}
                onClick={() => setCurrentWeekIndex(currentWeekIndex - 1)}
              >
                ← Previous Week
              </Button>

              <strong>Week {currentWeekIndex + 1}</strong>

              <Button
                variant="outline-secondary"
                disabled={currentWeekIndex === weeks.length - 1}
                onClick={() => setCurrentWeekIndex(currentWeekIndex + 1)}
              >
                Next Week →
              </Button>
            </div>

            {/* GRID */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "80px repeat(7, 1fr)",
                gap: 4,
              }}
            >
              {/* HOURS */}
              <div>
                {HOURS.map((h) => (
                  <div
                    key={h}
                    style={{
                      height: hourHeight,
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    {String(h).padStart(2, "0")}:00
                  </div>
                ))}
              </div>

              {/* DAYS */}
              {currentWeek.map((date, idx) => {
                const iso = date ? toISODate(date) : null;
                const dayActs = iso ? actsByDate[iso] || [] : [];

                return (
                  <div
                    key={idx}
                    style={{
                      position: "relative",
                      borderLeft: "1px solid #ccc",
                      borderRight: "1px solid #ccc",
                      minHeight: HOURS.length * hourHeight,
                    }}
                  >
                    <div className="text-center fw-bold mb-2">
                      {date
                        ? date.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })
                        : "-"}
                    </div>

                    {/* Hour grid */}
                    {HOURS.map((h) => (
                      <div
                        key={h}
                        style={{
                          height: hourHeight,
                          borderBottom: "1px solid #eee",
                        }}
                      ></div>
                    ))}

                    {/* Activities */}
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
                );
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
