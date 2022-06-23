export const getPastMonthsString = (mCount: number) => {
  const today = new Date();
  const months: { month: string; indx: number }[] = [];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const m = today.getMonth();
  let enteredLastYear = -1;
  let enteredLastYearSet = false;
  for (let i = m - (mCount - 1); i <= m; i++) {
    months.push({
      month: monthNames[i < 0 ? 12 + i : i],
      indx: i < 0 ? 12 + i : i,
    });
    if (i < 0 && !enteredLastYearSet) {
      enteredLastYear = months.length - 1;
      enteredLastYearSet = true;
    }
  }
  return { months, enteredLastYear };
};
