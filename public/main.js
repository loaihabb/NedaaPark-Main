document.addEventListener("DOMContentLoaded", () => {
  const addForm = document.getElementById("add-form");
  const appointmentList = document.getElementById("appointment-list");
  const dateoneInput = document.getElementById("dateone");
  const nameInput = document.getElementById("name");
  const datetwoInput = document.getElementById("datetwo");
  const numberInput = document.getElementById("number");
  const timeInput = document.getElementById("time");
  const timetwoInput = document.getElementById("timetwo");
  const depositInput = document.getElementById("deposit");
  const rentInput = document.getElementById("rent");
  const sortNewestButton = document.getElementById('sort-newest');
  const sortOldestButton = document.getElementById('sort-oldest');
  const sortNormalButton = document.getElementById('sort-normal');
  const monthSelect = document.getElementById("month");
  const timeOptions = ["10:00", "22:00"];
  const timetwoOptions = ["9:00", "21:00"];
  const appointments = [];

  const VERCEL_API = "https://nedaa-park-server.vercel.app"
  

  const today = new Date();
  const currentMonth = today.getMonth() + 1; // JavaScript'te aylar 0-11 arasında olduğu için +1 ekliyoruz
  const selectedMonth = parseInt(currentMonth) - 1; // Seçilen ayı al ve 0-11 aralığına çevir
  updateAppointmentList(selectedMonth)

  timeInput.innerHTML = timeOptions.map(option => `<option value="${option}">${option}</option>`).join("");
  timetwoInput.innerHTML = timetwoOptions.map(option => `<option value="${option}">${option}</option>`).join("");

  monthSelect.addEventListener("change", async () => {
    const selectedMonth = parseInt(monthSelect.value) - 1; // Seçilen ayı al ve 0-11 aralığına çevir
  await updateAppointmentList(selectedMonth);
  await updateTotal(selectedMonth);
  await updateCalendar(selectedMonth);
});

  dateoneInput.addEventListener("change", () => {
    checkSelectedDates();
  });

  datetwoInput.addEventListener("change", () => {
    checkSelectedDates();
  });

  function checkSelectedDates() {
    const today = new Date();
    const selectedDateone = new Date(dateoneInput.value);
    const selectedDatetwo = new Date(datetwoInput.value);
  
    today.setHours(0, 0, 0, 0); 
    selectedDateone.setHours(0, 0, 0, 0);
    selectedDatetwo.setHours(0, 0, 0, 0);
  
    if (selectedDateone < today || selectedDatetwo < today) {
      showNotification("لا تختار تاريخ قبل اليوم.", "error");
      dateoneInput.value = "";
      datetwoInput.value = "";
    }
  }

  function showNotification(message, type) {
    const container = document.getElementById("notification-container");
    
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    if (type === "success") {
      notification.classList.add("notification-success");
    } else if (type === "error") {
      notification.classList.add("notification-error");
    } else if (type === "warning") {
      notification.classList.add("notification-warning");
    }
    container.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add("show");
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        container.removeChild(notification);
      }, 500);
    }, 5000);
  }
  
  let isNormalSort = false;
  let isReverseSort = true; // Başlangıçta ters sıralama durumu
  
  function sortAppointments() {
    if (isReverseSort) {
      appointments.sort((a, b) => new Date(b.datetwo) - new Date(a.datetwo)); // Ters sıralama
    } else {
      appointments.sort((a, b) => new Date(a.datetwo) - new Date(b.datetwo)); // Normal sıralama
    }
  }
  
  function sortNormalAppointments() {
    appointments.reverse();
  }

  sortNewestButton.addEventListener("click", () => {
    if (isReverseSort) {
      isReverseSort = false;
      isNormalSort = false;
      sortAppointments(selectedMonth);
      updateAppointmentList(selectedMonth);
      updateCalendar(selectedMonth);
    }
  });

  sortOldestButton.addEventListener("click", () => {
    if (!isReverseSort) {
      isReverseSort = true;
      isNormalSort = false;
      sortAppointments(selectedMonth);
      updateAppointmentList(selectedMonth);
      updateCalendar(selectedMonth);
    }
  });

  sortNormalButton.addEventListener("click", () => {
  isNormalSort = true;
  isReverseSort = false;
  sortNormalAppointments(selectedMonth);
  updateAppointmentList(selectedMonth);
  updateCalendar(selectedMonth);
});

  
addForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const selectedDate = new Date(datetwoInput.value);
  const selectedDateString = selectedDate.toISOString().split("T")[0];
  const selectedStartTime = timeInput.value; // Seçilen başlangıç saatini al
  const selectedEndTime = timetwoInput.value; // Seçilen bitiş saatini al

  const conflictingAppointments = appointments.filter(
    (appointment) => appointment.datetwo === selectedDateString
  );

  if (conflictingAppointments.length > 0) {
    const isDateAlreadyBooked = conflictingAppointments.some(
      (appointment) => {
        const isSameStartTime = appointment.time === selectedStartTime;
        const isSameEndTime = appointment.timetwo === selectedEndTime;
        const is11HoursAppointment =
          (appointment.time === "10:00" && appointment.timetwo === "21:00") ||
          (appointment.time === "22:00" && appointment.timetwo === "9:00");
  
        if (is11HoursAppointment) {
          if (isSameStartTime || isSameEndTime) {
            return true; // Saatler çakışıyorsa
          } else {
            const sameDayAppointments = appointments.filter(
              (a) => a.datetwo === selectedDateString
            );
  
            const hasAnother11HoursAppointment = sameDayAppointments.some(
              (a) =>
                (a.time === "10:00" && a.timetwo === "9:00") ||
                (a.time === "22:00" && a.timetwo === "21:00")
            );
  
            return hasAnother11HoursAppointment;
          }
        } else {
          return (
            (isSameStartTime && isSameEndTime) ||
            (appointment.time === "22:00" && appointment.timetwo === "21:00") ||
            (appointment.time === "10:00" && appointment.timetwo === "9:00")
          );
        }
      }
    );
  
    if (isDateAlreadyBooked) {
      showNotification(
        "نفس الوقت في نفس اليوم محجوز بالفعل. اختر وقتًا آخر.",
        "error"
      );
      return;
    }
  }

  const appointment = {
    dateone: dateoneInput.value,
    name: nameInput.value,
    datetwo: datetwoInput.value,
    number: numberInput.value,
    time: timeInput.value,
    timetwo: timetwoInput.value,
    deposit: depositInput.value,
    rent: rentInput.value,
  };

  if (
    !appointment.dateone ||
    !appointment.name ||
    !appointment.datetwo ||
    !appointment.number ||
    !appointment.time ||
    !appointment.timetwo ||
    !appointment.deposit ||
    !appointment.rent
  ) {
    console.error("Eksik alanlar var");
    return;
  }

  try {
    const response = await fetch(`${VERCEL_API}/api/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(appointment),
    });
    await response.json();
    if (response.ok) {
      appointments.push(appointment);
      const selectedMonth = parseInt(monthSelect.value) - 1;
      await updateAppointmentList(selectedMonth);
      await updateCalendar(selectedMonth);
      await updateTotal(selectedMonth);
      clearInputs();
    } else {
      console.log("hata:", response.data);
      console.error("Veri eklenemedi");
    }
  } catch (error) {
    console.error("Hata:", error);
  }
});


  async function updateAppointmentList(selectedMonth) {
    appointmentList.innerHTML = "";

    // Verileri sunucudan al
    const response = await fetch(`${VERCEL_API}/api/appointments`);
    const data = await response.json();
    appointments.length = 0;
    appointments.push(...data);
    sortAppointments(selectedMonth);

    const sameDayAppointments = new Map(); // Aynı gün içindeki randevuları saklamak için harita

    appointments.forEach((appointment, index) => {
      const appointmentDate = new Date(appointment.datetwo);
    
      if (appointmentDate.getMonth() === selectedMonth) {

      const appointmentDiv = document.createElement("div");
      appointmentDiv.className = "appointment";

      const startTime = parseInt(appointment.time.split(":")[0]); // Giriş saati
      const endTime = parseInt(appointment.timetwo.split(":")[0]); // Çıkış saati

      // Çıkış saati - Giriş saati hesabı
      const hoursDiff =
        endTime >= startTime ? endTime - startTime : endTime + (24 - startTime);

      // Renkleri belirle
      let backgroundColor = "";
      const currentDate = new Date(appointment.datetwo).toDateString();

      if (!sameDayAppointments.has(currentDate)) {
        sameDayAppointments.set(currentDate, []);
      }

      sameDayAppointments.get(currentDate).push(appointment);

      if (sameDayAppointments.get(currentDate).length > 1) {
        backgroundColor = "#5DADE2"; // İki randevu olduğunda mavi yap
      } else if (hoursDiff > 11 || hoursDiff === 23) {
        backgroundColor = "#99E575"; // Yeşil
      } else {
        backgroundColor = "#E9F063"; // Sarı
      }

      appointmentDiv.style.backgroundColor = backgroundColor;
      appointmentDiv.innerHTML = `
        <p>الايجار : <strong>${appointment.rent}</strong></p>
        <p>العربون : <strong>${appointment.deposit}</strong></p>
        <p>تاريخ الايجار : <strong>${appointment.datetwo}</strong> </p>
        <p>تاريخ تسجيل الموعد : <strong>${appointment.dateone}</strong></p>   
        <p>وقت الخروج : <strong>${appointment.timetwo}</strong></p>
        <p>رقم الهاتف : <strong>${appointment.number}</strong></p>
        <p>وقت الدخول : <strong>${appointment.time}</strong></p>
        <p>اسم المستأجر : <strong>${appointment.name}</strong></p>
        <button class="remove-button" data-id="${appointment._id}">حذف</button>
      `;
      appointmentDiv
        .querySelector(".remove-button")
        .addEventListener("click", async (event) => {
          const idToDelete = event.target.getAttribute("data-id");

          // Veriyi sunucudan sil ve MongoDB'den de kaldır
          const deleteResponse = await fetch(
            `${VERCEL_API}/api/appointments/${idToDelete}`,
            {
              method: "DELETE",
            }
          );

          if (deleteResponse.ok) {
            appointments.splice(index, 1);
            updateAppointmentList(selectedMonth);
            updateCalendar(selectedMonth);
            updateTotal(selectedMonth);
          }
        });
      appointmentList.appendChild(appointmentDiv);
      }
    });
  }

  function clearInputs() {
    dateoneInput.value = "";
    nameInput.value = "";
    datetwoInput.value = "";
    timeInput.value = "";
    timetwoInput.value = "";
    numberInput.value = "";
    depositInput.value = "";
    rentInput.value = "";
  }

  updateAppointmentList();
});

async function updateTotal(selectedMonth) {
  const totalRentSpan = document.getElementById("total-amount");
  const totalDepositSpan = document.getElementById("total-deposit-amount"); // Değiştirildi
  const VERCEL_API = "https://nedaa-park-server.vercel.app"
  fetch(`${VERCEL_API}/api/appointments`)
    .then((response) => response.json())
    .then((data) => {
      console.log("Total : " , data)
      const filteredData = data.filter(appointment =>
        new Date(appointment.datetwo).getMonth() === selectedMonth
      );

      const totalRent = filteredData.reduce((sum, appointment) => {
        return sum + (appointment.rent || 0);
      }, 0);

      const totalDeposit = filteredData.reduce((sum, appointment) => {
        return sum + (appointment.deposit || 0);
      }, 0);

      totalRentSpan.textContent = totalRent;
      totalDepositSpan.textContent = totalDeposit;
    })
    .catch((error) => {
      console.error("Veriler getirilemedi:", error);
    });
}
updateTotal();  

async function updateCalendar(selectedMonth) {
  const calendar = document.querySelector(".calendar");
  calendar.innerHTML = "";
  const currentYear = new Date().getFullYear();
  const daysInMonth = new Date(currentYear, selectedMonth + 1, 0).getDate(); // Ayın gün sayısını al

  try {
    const VERCEL_API = "https://nedaa-park-server.vercel.app"
    const response = await fetch(`${VERCEL_API}/api/appointments`);
    const data = await response.json();
    console.log("Calendar : " , data)
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement("div");
      dayElement.classList.add("day");
      dayElement.textContent = day;

      const currentDate = new Date(currentYear, selectedMonth, day);
      const appointmentsOnDay = data.filter((appointment) => {
        const appointmentDate = new Date(appointment.datetwo);
        return (
          currentDate.toDateString() === appointmentDate.toDateString() &&
          appointmentDate.getMonth() === selectedMonth
        );
      });

      let backgroundColor = "";

      if (appointmentsOnDay.length > 0) {
        const hoursDiff = calculateHoursDiff(appointmentsOnDay[0]);

        if (appointmentsOnDay.length > 1) {
          backgroundColor = "#5DADE2"; // İki randevu olduğunda mavi yap
        } else if (hoursDiff > 11) {
          backgroundColor = "#99E575"; // Yeşil
        } else {
          backgroundColor = "#E9F063"; // Sarı
        }
      }

      dayElement.style.backgroundColor = backgroundColor;
      calendar.appendChild(dayElement);
    }
  } catch (error) {
    console.error("Veriler getirilemedi:", error);
  }
}
updateCalendar();

function calculateHoursDiff(appointment) {
  const startTime = parseInt(appointment.time.split(":")[0]);
  const endTime = parseInt(appointment.timetwo.split(":")[0]);
  return endTime >= startTime
    ? endTime - startTime
    : endTime + (24 - startTime);
}


