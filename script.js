const weddingDate = new Date("2026-06-20T11:00:00+03:00");
const phoneNumber = "+256 793 709243";
const phoneNumberDigits = "256793709243";
const defaultGuestName = "Mugenyi Waffe";
const guestList = window.INVITE_GUESTS || {};

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  const now = new Date();
  const remaining = Math.max(0, weddingDate.getTime() - now.getTime());
  const seconds = Math.floor(remaining / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const finalSeconds = seconds % 60;

  document.querySelector("[data-days]").textContent = pad(days);
  document.querySelector("[data-hours]").textContent = pad(hours);
  document.querySelector("[data-minutes]").textContent = pad(minutes);
  document.querySelector("[data-seconds]").textContent = pad(finalSeconds);
}

function getGuestCode() {
  return new URLSearchParams(window.location.search)
    .get("guest")
    ?.trim()
    .toLowerCase() || "";
}

function getGuestName() {
  const guestCode = getGuestCode();

  if (guestCode && Object.prototype.hasOwnProperty.call(guestList, guestCode)) {
    const guestName = guestList[guestCode];

    if (typeof guestName === "string" && guestName.trim()) {
      return guestName.trim();
    }
  }

  return defaultGuestName;
}

function buildRsvpLink(guestName) {
  const message = `Hello Gilgal Events, I would like to RSVP for Enoch and Sylivia's wedding. My invite name is ${guestName}.`;

  return `https://wa.me/${phoneNumberDigits}?text=${encodeURIComponent(message)}`;
}

function personalizeInvite() {
  const guestName = getGuestName();

  document.querySelectorAll("[data-guest-name]").forEach((element) => {
    element.textContent = guestName;
  });

  document.querySelectorAll("[data-rsvp-whatsapp]").forEach((link) => {
    link.href = buildRsvpLink(guestName);
  });

  document.title = `${guestName} | Enoch & Sylivia Wedding Invitation`;
}

function buildCalendarFile() {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Enoch and Sylvia Wedding//Invitation//EN",
    "BEGIN:VEVENT",
    "UID:enoch-sylvia-wedding-20260620@example.com",
    "DTSTAMP:20260520T100000Z",
    "DTSTART:20260620T080000Z",
    "DTEND:20260620T140000Z",
    "SUMMARY:Enoch and Sylvia Wedding",
    "LOCATION:Watoto Church Downtown and Naguru Gardens",
    "DESCRIPTION:Church ceremony at 11:00 AM at Watoto Church Downtown. Reception at 3:00 PM at Naguru Gardens. RSVP via Gilgal Events on +256 793 709243.",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "enoch-and-sylvia-wedding.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function setCardVersion(version) {
  const preview = document.querySelector("[data-card-preview]");
  const download = document.querySelector("[data-download-card]");
  const source =
    version === "plain"
      ? "assets/invitation-card-no-photo.png"
      : "assets/invitation-card.png";

  preview.src = source;
  download.href = source;
  preview.alt =
    version === "plain"
      ? "Digital invitation card without couple photo"
      : "Digital invitation card with couple photo";

  document.querySelectorAll("[data-card-choice]").forEach((button) => {
    const isActive = button.dataset.cardChoice === version;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
}

async function copyPhoneNumber() {
  const status = document.querySelector("[data-copy-status]");
  try {
    await navigator.clipboard.writeText(phoneNumber);
    status.textContent = "RSVP number copied.";
  } catch {
    status.textContent = `RSVP number: ${phoneNumber}`;
  }
}

personalizeInvite();
updateCountdown();
setInterval(updateCountdown, 1000);

document.querySelector("[data-calendar]").addEventListener("click", buildCalendarFile);
document.querySelector("[data-copy-phone]").addEventListener("click", copyPhoneNumber);

document.querySelectorAll("[data-card-choice]").forEach((button) => {
  button.addEventListener("click", () => setCardVersion(button.dataset.cardChoice));
});
