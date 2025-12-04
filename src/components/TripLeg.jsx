import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import ActivityBlock from "../components/ActivityBlock";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function TripLeg() {
  const { legName } = useParams();
  const navigate = useNavigate();

  // -------------------------------
  // HOOKS
  // -------------------------------
  const [leg, setLeg] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [allDates, setAllDates] = useState([]);

  // -------------------------------
  // LOAD LEG
  // -------------------------------
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("tripLegs")) || [];
    const found = stored.find(
      (l) => l.name.toLowerCase().replace(/\s+/g, "-") === legName
    );

    if (!found) {
      navigate("/builder");
      return;
    }

    setLeg(found);
    setSchedule(found.plannedActivities || []);

    if (found.startDate && found.endDate) {
      setAllDates(generateDateRange(found.startDate, found.endDate));
    }
  }, [legName, navigate]);

  // -------------------------------
  // DATE RANGE GENERATION (DST SAFE)
  // -------------------------------
  const generateDateRange = (start, end) => {
    const dates = [];
    let cur = new Date(start + "T00:00:00Z");
    const endDate = new Date(end + "T00:00:00Z");

    while (cur <= endDate) {
      dates.push(new Date(cur));
      cur.setUTCDate(cur.getUTCDate() + 1);
    }

    return dates;
  };

  // -------------------------------
  // GROUP DATES INTO MON–SUN WEEKS
  // -------------------------------
  const groupDatesIntoWeeks = (dates) => {
    const weeks = [];
    let currentWeek = [];

    dates.forEach((date) => {
      if (currentWeek.length === 0) {
        const dow = (date.getDay() + 6) % 7; // Monday=0
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

  // -------------------------------
  // UPDATE LEG (AUTO CORRECT DATES)
  // -------------------------------
  const updateLeg = (updatedLeg) => {
    const corrected = { ...updatedLeg };
  
    if (corrected.startDate && corrected.endDate) {
      if (corrected.startDate > corrected.endDate) {
        corrected.endDate = corrected.startDate;
      }
      if (corrected.endDate < corrected.startDate) {
        corrected.startDate = corrected.endDate;
      }
    }
  
    // REMOVE ACTIVITIES OUTSIDE THE NEW DATE RANGE
    let cleanedSchedule = schedule;
  
    if (corrected.startDate && corrected.endDate) {
      const start = corrected.startDate;
      const end = corrected.endDate;
  
      cleanedSchedule = schedule.filter((act) => {
        if (!act.date) return false; // unscheduled activities shouldn't persist
        return act.date >= start && act.date <= end;
      });
  
      // Save cleaned schedule
      const stored = JSON.parse(localStorage.getItem("tripLegs")) || [];
      const updatedLegs = stored.map((l) =>
        l.name === corrected.name
          ? { ...l, ...corrected, plannedActivities: cleanedSchedule }
          : l
      );
  
      localStorage.setItem("tripLegs", JSON.stringify(updatedLegs));
      setSchedule(cleanedSchedule);
    }
  
    // Save the corrected leg normally
    const stored = JSON.parse(localStorage.getItem("tripLegs")) || [];
    const updated = stored.map((l) =>
      l.name === corrected.name ? { ...l, ...corrected } : l
    );
    localStorage.setItem("tripLegs", JSON.stringify(updated));
    setLeg(corrected);
  
    // Regenerate date range
    if (corrected.startDate && corrected.endDate) {
      setAllDates(generateDateRange(corrected.startDate, corrected.endDate));
      setCurrentWeekIndex(0);
    }
  };
  

  // -------------------------------
  // UPDATE SCHEDULE
  // -------------------------------
  const saveSchedule = (updated) => {
    const stored = JSON.parse(localStorage.getItem("tripLegs")) || [];
    const updatedLegs = stored.map((l) =>
      l.name === leg.name ? { ...l, plannedActivities: updated } : l
    );
    localStorage.setItem("tripLegs", JSON.stringify(updatedLegs));
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

  // -------------------------------
  // CALENDAR CONFIG
  // -------------------------------
  const HOURS = Array.from({ length: 17 }, (_, i) => 6 + i);
  const hourHeight = 60; // px per hour

  // -------------------------------
  // WEEK + ACTIVITY MAPPING
  // -------------------------------
  const weeks = groupDatesIntoWeeks(allDates);
  const currentWeek = weeks[currentWeekIndex] || [];

  const activitiesByDate = {};
  schedule.forEach((act) => {
    if (!activitiesByDate[act.date]) activitiesByDate[act.date] = [];
    activitiesByDate[act.date].push(act);
  });

  // -------------------------------
  // RENDER
  // -------------------------------
  if (!leg) return null;

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
              <DatePicker
                selected={leg.startDate ? new Date(leg.startDate) : null}
                onChange={(date) => {
                    const iso = date.toISOString().split("T")[0];
                    updateLeg({ ...leg, startDate: iso });
                }}
                selectsStart
                startDate={leg.startDate ? new Date(leg.startDate) : null}
                endDate={leg.endDate ? new Date(leg.endDate) : null}
                className="form-control"
                placeholderText="Select start date"
                />
            </Col>

            <Col md={4}>
              <Form.Label>End Date</Form.Label>
              <DatePicker
                selected={leg.endDate ? new Date(leg.endDate) : null}
                onChange={(date) => {
                    const iso = date.toISOString().split("T")[0];
                    updateLeg({ ...leg, endDate: iso });
                }}
                selectsEnd
                startDate={leg.startDate ? new Date(leg.startDate) : null}
                endDate={leg.endDate ? new Date(leg.endDate) : null}
                minDate={leg.startDate ? new Date(leg.startDate) : null}
                className="form-control"
                placeholderText="Select end date"
                />
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

              {leg.activities.map((act, i) => (
                <Card key={i} className="mb-3">
                  <Card.Body>
                    <Card.Title>{act.title}</Card.Title>
                    <Card.Subtitle>{act.start} – {act.end}</Card.Subtitle>
                    <Card.Text>{act.description}</Card.Text>

                    <Form.Label>Assign Date</Form.Label>
                    <Form.Select
                      onChange={(e) => {
                        const newAct = { ...act, date: e.target.value };
                        saveSchedule([...schedule, newAct]);
                      }}
                    >
                      <option value="">Select Date</option>
                      {allDates.map((d) => {
                        const iso = d.toISOString().split("T")[0];
                        return (
                          <option key={iso} value={iso}>
                            {iso}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </Card.Body>
                </Card>
              ))}
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
                gap: 4
              }}
            >
              {/* HOURS COLUMN */}
              <div>
                {HOURS.map((h) => (
                  <div
                    key={h}
                    style={{
                      height: hourHeight,
                      borderBottom: "1px solid #ddd"
                    }}
                  >
                    {String(h).padStart(2, "0")}:00
                  </div>
                ))}
              </div>

              {/* DAY COLUMNS */}
              {currentWeek.map((date, dayIndex) => {
                const iso = date ? date.toISOString().split("T")[0] : null;
                const acts = iso ? activitiesByDate[iso] || [] : [];

                return (
                  <div
                    key={dayIndex}
                    style={{
                      position: "relative",
                      borderLeft: "1px solid #ccc",
                      borderRight: "1px solid #ccc",
                      minHeight: HOURS.length * hourHeight
                    }}
                  >
                    {/* HEADER */}
                    <div className="text-center fw-bold mb-2">
                      {date
                        ? date.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric"
                          })
                        : "-"}
                    </div>

                    {/* HOUR GRID */}
                    {HOURS.map((h) => (
                      <div
                        key={h}
                        style={{
                          height: hourHeight,
                          borderBottom: "1px solid #eee"
                        }}
                      ></div>
                    ))}

                    {/* ACTIVITY BLOCKS */}
                    {acts.map((activity) => {
                      const index = schedule.indexOf(activity);

                      return (
                        <ActivityBlock
                          key={`${activity.title}-${activity.start}-${activity.date}`}
                          activity={activity}
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
    </Container>
  );
}
