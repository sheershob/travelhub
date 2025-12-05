console.log("Booking JS loaded!");
document.addEventListener("DOMContentLoaded", function () {
    flatpickr("#bookingDates", {
        mode: "range",
        dateFormat: "Y-m-d",
        minDate: new Date().fp_incr(1), // Tomorrow
        maxDate: new Date().fp_incr(180), // 180 days from now
        showMonths: 1,
        disableMobile: true, // Force calendar on mobile
        onChange: function (selectedDates, dateStr) {
            document.getElementById("datesField").value = dateStr;
            var totalDays = 1;
            if (selectedDates.length === 2) {
                const start = selectedDates[0];
                const end = selectedDates[1];

                const diffTime = end - start;
                totalDays = 1 + Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }
                const pricePerNight = parseInt(
                    document.querySelector("#bookingDates").dataset.price
                );            
            const total = totalDays * pricePerNight;

            document.getElementById("totalPrice").innerText = total;
            document.getElementById("totalPriceField").value = total;  
            
            bookBtn.disabled = false;
        }
    });
});