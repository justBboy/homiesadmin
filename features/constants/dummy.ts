import { ChartData } from "chart.js";

export const dummyOrders: ChartData<"line", any, any> = {
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [
    {
      label: "Your Past 5 Monts orders",
      data: [1003, 894, 2042, 2835, 3004, 2039, 2395],
      fill: true,
      borderColor: "#dc2626",
      pointBackgroundColor: "#dc2626",
      borderWidth: 1,
      tension: 0.5,
    },
  ],
};
