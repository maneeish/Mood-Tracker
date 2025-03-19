const currentDateElement = document.getElementById("current-date")
const moodButtons = document.querySelectorAll(".mood-btn")
const saveMoodButton = document.getElementById("save-mood")
const moodNoteInput = document.getElementById("mood-note-input")
const viewButtons = document.querySelectorAll(".view-btn")
const calendarDaysContainer = document.getElementById("calendar-days")
const calendarTitle = document.getElementById("calendar-title")
const prevMonthButton = document.getElementById("prev-month")
const nextMonthButton = document.getElementById("next-month")
const timelineContainer = document.getElementById("timeline-container")
const moodDetailsModal = document.getElementById("mood-details")
const closeDetailsButton = document.getElementById("close-details")
const detailDateElement = document.getElementById("detail-date")
const detailMoodElement = document.getElementById("detail-mood")
const detailNoteElement = document.getElementById("detail-note")


let selectedMood = null
const currentViewDate = new Date()
let currentView = "day" 


const moodEmojis = {
  happy: "😊",
  excited: "🤩",
  neutral: "😐",
  sad: "😔",
  angry: "😡",
}


function init() {
  updateCurrentDate()
  renderCalendar()
  loadMoodHistory()

  
  moodButtons.forEach((button) => {
    button.addEventListener("click", () => selectMood(button))
  })

  saveMoodButton.addEventListener("click", saveMood)

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => changeView(button.dataset.view))
  })

  prevMonthButton.addEventListener("click", () => navigateMonth(-1))
  nextMonthButton.addEventListener("click", () => navigateMonth(1))

  closeDetailsButton.addEventListener("click", closeMoodDetails)
}


function updateCurrentDate() {
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  currentDateElement.textContent = new Date().toLocaleDateString("en-US", options)
}


function selectMood(button) {
  moodButtons.forEach((btn) => btn.classList.remove("selected"))
  button.classList.add("selected")
  selectedMood = button.dataset.mood
}


function saveMood() {
  if (!selectedMood) {
    alert("Please select a mood first!")
    return
  }

  const today = new Date()
  const dateKey = formatDateKey(today)
  const moodData = {
    date: today.toISOString(),
    mood: selectedMood,
    note: moodNoteInput.value.trim(),
    timestamp: today.getTime(),
  }

  
  const moods = JSON.parse(localStorage.getItem("moodData")) || {}
  moods[dateKey] = moodData

 
  localStorage.setItem("moodData", JSON.stringify(moods))

 
  moodButtons.forEach((btn) => btn.classList.remove("selected"))
  moodNoteInput.value = ""
  selectedMood = null

  // Update views
  renderCalendar()
  loadMoodHistory()

  alert("Mood saved successfully!")
}


function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}


function changeView(view) {
  currentView = view
  viewButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view)
  })

  const calendarView = document.querySelector(".calendar-view")
  const timelineView = document.querySelector(".timeline-view")

  if (view === "month") {
    calendarView.style.display = "block"
    timelineView.style.display = "none"
    renderCalendar()
  } else {
    calendarView.style.display = "none"
    timelineView.style.display = "block"
    loadMoodHistory()
  }
}


function navigateMonth(direction) {
  currentViewDate.setMonth(currentViewDate.getMonth() + direction)
  renderCalendar()
}

// Render the calendar
function renderCalendar() {
  const year = currentViewDate.getFullYear()
  const month = currentViewDate.getMonth()

 
  calendarTitle.textContent = new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })


  calendarDaysContainer.innerHTML = ""

 
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

 
  const firstDayIndex = firstDay.getDay()

  
  const daysInMonth = lastDay.getDate()


  const prevMonthLastDay = new Date(year, month, 0).getDate()

  
  const moodData = JSON.parse(localStorage.getItem("moodData")) || {}

  
  const today = new Date()
  const todayFormatted = formatDateKey(today)

 
  let days = ""

  
  for (let i = firstDayIndex; i > 0; i--) {
    const day = prevMonthLastDay - i + 1
    const date = new Date(year, month - 1, day)
    const dateKey = formatDateKey(date)
    const dayMood = moodData[dateKey]

    days += `
            <div class="calendar-day other-month" data-date="${dateKey}">
                <div class="date">${day}</div>
                ${dayMood ? `<div class="mood">${moodEmojis[dayMood.mood]}</div>` : ""}
            </div>
        `
  }

  
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i)
    const dateKey = formatDateKey(date)
    const dayMood = moodData[dateKey]
    const isToday = dateKey === todayFormatted

    days += `
            <div class="calendar-day ${isToday ? "today" : ""}" data-date="${dateKey}">
                <div class="date">${i}</div>
                ${dayMood ? `<div class="mood">${moodEmojis[dayMood.mood]}</div>` : ""}
            </div>
        `
  }


  const totalDaysDisplayed = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7
  const nextMonthDays = totalDaysDisplayed - (firstDayIndex + daysInMonth)

  for (let i = 1; i <= nextMonthDays; i++) {
    const date = new Date(year, month + 1, i)
    const dateKey = formatDateKey(date)
    const dayMood = moodData[dateKey]

    days += `
            <div class="calendar-day other-month" data-date="${dateKey}">
                <div class="date">${i}</div>
                ${dayMood ? `<div class="mood">${moodEmojis[dayMood.mood]}</div>` : ""}
            </div>
        `
  }

  calendarDaysContainer.innerHTML = days

 
  document.querySelectorAll(".calendar-day").forEach((day) => {
    day.addEventListener("click", () => showMoodDetails(day.dataset.date))
  })
}


function loadMoodHistory() {
  const moodData = JSON.parse(localStorage.getItem("moodData")) || {}
  const entries = Object.values(moodData)

 
  entries.sort((a, b) => b.timestamp - a.timestamp)

 
  let filteredEntries = []
  const today = new Date()

  if (currentView === "day") {
   
    const todayKey = formatDateKey(today)
    filteredEntries = entries.filter((entry) => formatDateKey(new Date(entry.date)) === todayKey)
  } else if (currentView === "week") {
   
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    filteredEntries = entries.filter((entry) => new Date(entry.date) >= weekAgo)
  } else {
    
    filteredEntries = entries
  }

 
  renderTimeline(filteredEntries)
}


function renderTimeline(entries) {
  timelineContainer.innerHTML = ""

  if (entries.length === 0) {
    timelineContainer.innerHTML = `<p class="no-data">No mood data available for this period.</p>`
    return
  }

  entries.forEach((entry) => {
    const date = new Date(entry.date)
    const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

    const timelineItem = document.createElement("div")
    timelineItem.className = "timeline-item"
    timelineItem.dataset.date = formatDateKey(date)

    timelineItem.innerHTML = `
            <div class="timeline-date">${formattedDate}</div>
            <div class="timeline-mood">${moodEmojis[entry.mood]}</div>
            <div class="timeline-note">${entry.note || "No note"}</div>
        `

    timelineItem.addEventListener("click", () => showMoodDetails(formatDateKey(date)))

    timelineContainer.appendChild(timelineItem)
  })
}


function showMoodDetails(dateKey) {
  const moodData = JSON.parse(localStorage.getItem("moodData")) || {}
  const entry = moodData[dateKey]

  if (!entry) {
    return
  }

  const date = new Date(entry.date)
  detailDateElement.textContent = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  detailMoodElement.textContent = moodEmojis[entry.mood]
  detailNoteElement.textContent = entry.note || "No note for this day."

  moodDetailsModal.style.display = "flex"
}


function closeMoodDetails() {
  moodDetailsModal.style.display = "none"
}

document.addEventListener("DOMContentLoaded", init)

