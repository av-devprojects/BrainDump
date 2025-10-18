// Initialize SortableJS on the container

const elementsContainer = document.getElementById('elementsContainer');

Sortable.create(elementsContainer, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    dragClass: 'sortable-drag',
    onEnd: function (/**Event*/evt) {
        console.log('Element moved from index', evt.oldIndex, 'to', evt.newIndex);
    }
});


//
const currentDate = document.querySelector(".current-date");
const daysTag = document.querySelector(".days");
const prevNextIcon = document.querySelectorAll(".calendar-header span");

let date = new Date();
let currYear = date.getFullYear();
let currMonth = date.getMonth();

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const renderCalendar = () => {
  const firstDayOfMonth = new Date(currYear, currMonth, 1).getDay(); // 0=Sun, 1=Mon...
  const lastDateOfMonth = new Date(currYear, currMonth + 1, 0).getDate();
  const lastDayOfMonth = new Date(currYear, currMonth, lastDateOfMonth).getDay();
  const lastDateOfLastMonth = new Date(currYear, currMonth, 0).getDate();

  let liTag = "";

  // Adjust start so Monday is first day (convert Sunday=0 to 7)
  const adjustedFirstDay = firstDayOfMonth === 0 ? 7 : firstDayOfMonth;

  // Previous month's tail days
  for (let i = adjustedFirstDay - 1; i > 0; i--) {
    liTag += `<li class="inactive">${lastDateOfLastMonth - i + 1}</li>`;
  }

  // Current month's days
  for (let i = 1; i <= lastDateOfMonth; i++) {
    const isToday = 
      i === date.getDate() &&
      currMonth === date.getMonth() &&
      currYear === date.getFullYear()
        ? "active"
        : "";
    liTag += `<li class="${isToday}">${i}</li>`;
  }

  // Next month's leading days to fill the week
  const adjustedLastDay = lastDayOfMonth === 0 ? 7 : lastDayOfMonth;
  for (let i = adjustedLastDay; i < 7; i++) {
    liTag += `<li class="inactive">${i - adjustedLastDay + 1}</li>`;
  }

  currentDate.innerText = `${months[currMonth]} ${currYear}`;
  daysTag.innerHTML = liTag;
};

renderCalendar();

// Navigation
prevNextIcon.forEach(icon => {
  icon.addEventListener("click", () => {
    currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;
    if (currMonth < 0) {
      currMonth = 11;
      currYear--;
    } else if (currMonth > 11) {
      currMonth = 0;
      currYear++;
    }
    renderCalendar();
  });
});






const container = document.querySelector('.image');

// Create an <img> element
const img = document.createElement('img');
  img.src = 'https://picsum.photos/600/400?random=' + Math.floor(Math.random() * 1000);
  img.alt = 'Random image from Picsum';

// Append it to the container
container.appendChild(img);