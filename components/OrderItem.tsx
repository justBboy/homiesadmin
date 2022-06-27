import React, { useEffect, useState } from "react";
import useMountTransition from "../features/hooks/useMountTransition";

interface props {
  isOpened: boolean;
  items: { foodName: string; price: number }[];
}

const OrderItem: React.FC<props> = ({ isOpened, items }) => {
  const hasTransitionedIn = useMountTransition(Boolean(isOpened), 180);
  const [slideAnimComplete, setSlideAnimComplete] = useState(false);

  useEffect(() => {
    let timeout: any;
    if (hasTransitionedIn) {
      timeout = setTimeout(() => {
        setSlideAnimComplete(true);
      }, 1000);
    } else {
      setSlideAnimComplete(false);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [hasTransitionedIn]);

  return (
    <>
      {(hasTransitionedIn || isOpened) && (
        <div
          className={`w-full transition-all  ${
            slideAnimComplete ? "overflow-y-auto" : "overflow-hidden"
          } duration-500 ${
            isOpened
              ? "animate-[slide-down_0.2s_ease-in]"
              : "animate-[slide-up_0.2s_ease-out]"
          }`}
        >
          <div className={`flex flex-col items-center p-2 sm:p-5 w-full`}>
            <div
              className={`flex shadow-sm w-full justify-between items-center py-5 px-3`}
            >
              <h4 className={`font-gotham text-slate-800 w-1/2 text-center`}>
                Banku and okro stew
              </h4>
              <h5
                className={`font-gothamMedium text-slate-700 w-1/2 text-center`}
              >
                Ghs20
              </h5>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderItem;
