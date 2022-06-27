import { ChartData } from "chart.js";
import { collection, doc, getDoc } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import { db } from "../../libs/Firebase";
import { getPastMonthsString } from "../utils";

const usePastOrderData = (monthCount: number) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ChartData<"line", any, any>>();
  const pastMonths = getPastMonthsString(monthCount);
  const pastData = useRef<number[]>([]);

  console.log(pastMonths.months);

  const getPastData = useCallback(async () => {
    const data: number[] = [];
    const globalsCollection = collection(db, "appGlobals");
    const orderRes = await getDoc(doc(globalsCollection, "orders"));
    const ordersData: any = orderRes.data();
    const today = new Date();
    for (let i = 0; i < pastMonths.months.length; i++) {
      const month = pastMonths.months[i];
      if (i > pastMonths.enteredLastYear) {
        console.log(`orders${month.indx + 1}-${today.getFullYear()}Count`);
        data.push(
          (ordersData &&
            ordersData[
              `orders${month.indx + 1}-${today.getFullYear()}Count`
            ]) ||
            0
        );
      } else {
        console.log(`orders${month.indx + 1}-${today.getFullYear() - 1}Count`);
        data.push(
          (ordersData &&
            ordersData[
              `orders${month.indx + 1}-${today.getFullYear() - 1}Count`
            ]) ||
            0
        );
      }
    }
    pastData.current = data;
  }, [pastMonths]);
  useEffect(() => {
    setLoading(true);
    (async () => {
      await getPastData();
      setData({
        labels: pastMonths.months.map((m) => m.month),
        datasets: [
          {
            label: "Your Past 5 Months orders",
            data: pastData.current,
            fill: true,
            borderColor: "#dc2626",
            pointBackgroundColor: "#dc2626",
            borderWidth: 1,
            tension: 0.5,
          },
        ],
      });
    })();

    setLoading(false);
  }, []);

  return { loading, data };
};

export default usePastOrderData;
