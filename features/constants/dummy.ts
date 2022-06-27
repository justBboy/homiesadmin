import { ChartData } from "chart.js";

export const dummyOrders: ChartData<"line", any, any> = {
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [
    {
      label: "Your Past 5 Months orders",
      data: [0, 0, 0, 0, 0, 0, 0],
      fill: true,
      borderColor: "#dc2626",
      pointBackgroundColor: "#dc2626",
      borderWidth: 1,
      tension: 0.5,
    },
  ],
};
