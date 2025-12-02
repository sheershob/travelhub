console.log("Booking JS loaded!");
document.addEventListener("DOMContentLoaded", function () {
    flatpickr("#bookingDates", {
        mode: "range",
        dateFormat: "Y-m-d",
        minDate: new Date().fp_incr(1), // Tomorrow
        maxDate: new Date().fp_incr(180), // 180 days from now
        showMonths: 1,
        disableMobile: true, // Force calendar on mobile
        onChange: function (selectedDates) {
            if (selectedDates.length === 2) {
                const start = selectedDates[0];
                const end = selectedDates[1];

                const diffTime = end - start;
                const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                const pricePerNight = parseInt(
                    document.getElementById("pricePerNight").value
                );

                document.getElementById("totalPrice").innerText =
                    totalDays * pricePerNight;
            }
        }
    });
});