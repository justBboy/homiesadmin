import React, { ReactElement, useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { GrNext, GrPrevious } from "react-icons/gr";
import ConfirmModal from "./ConfirmModal";

export type actionType = {
  id: string;
  name: string;
  onGo: (selected: string[] | undefined) => void;
};

interface props {
  title?: string | number | ReactElement;
  Bottom?: ReactElement;
  titles: string[];
  data: (string | ReactElement | number)[][];
  hasSideAction?: boolean;
  hasDelete?: boolean;
  hasEdit?: boolean;
  onEditPressed?: (id: string) => void;
  onDeletePressed?: (id: string) => void;
  selected?: string[];
  setSelected?: (selected: string[]) => void;
  actions?: actionType[];
  hasPagination?: boolean;
  onPaginationNext?: (page: number) => void;
  onPaginationPrev?: (page: number) => void;
  page?: number;
  totalPages?: number;
  actionLoading?: boolean;
  search?: string;
  setSearch?: (s: string) => void;
  onSearchSubmit?: () => void;
  searchPlaceHolder?: string;
}
const Table: React.FC<props> = ({
  selected,
  setSelected,
  title,
  Bottom,
  titles,
  hasSideAction,
  data,
  hasDelete,
  hasEdit,
  onEditPressed,
  onDeletePressed,
  actions,
  actionLoading,
  hasPagination,
  onPaginationNext,
  onPaginationPrev,
  page,
  totalPages,
  search,
  setSearch,
  onSearchSubmit,
  searchPlaceHolder,
}) => {
  const [action, setAction] = useState<actionType | "">("");
  const [showActionConfirm, setShowActionConform] = useState(false);

  const handleSetAction = (id: string) => {
    if (!id) setAction("");
    setShowActionConform(false);
    if (actions) {
      const ac = actions.find((a) => a.id === id);
      if (ac) setAction(ac);
    }
  };

  return (
    <div className="flex flex-col max-w-2xl my-2 animate__animated animate__fadeIn w-full relative">
      {actions && (
        <div className="flex flex-col sm:flex-row items-center relative">
          {search !== undefined && setSearch && (
            <form
              onSubmit={onSearchSubmit && onSearchSubmit}
              className={`sm:w-[60%] w-[100%]`}
            >
              <label
                htmlFor="searchOrder"
                className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-gray-300"
              >
                Search
              </label>
              <div className="relative">
                <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                </div>
                <input
                  type="search"
                  className="block p-4 pl-10 w-full text-sm text-gray-900 bg-gray-50 outline-slate-200 rounded-lg border border-slate-300"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                  placeholder={searchPlaceHolder && searchPlaceHolder}
                  required
                />
                {onSearchSubmit && (
                  <button
                    type="button"
                    className="text-white absolute right-2.5 bottom-2.5 bg-slate-400 hover:bg-slate-600 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-4 py-2 "
                  >
                    Search
                  </button>
                )}
              </div>
            </form>
          )}
          <div className={`flex items-center`}>
            <select
              className={`p-3 border border-slate-200 m-2 rounded outline-none`}
              onChange={(e) => handleSetAction(e.target.value)}
              value={action ? action.id : ""}
              name="action"
            >
              <option value="">Select An Action</option>
              {actions.map((a, indx) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <button
              onClick={(e) => {
                e.preventDefault();
                if (selected && Boolean(selected.length) && action)
                  setShowActionConform(true);
              }}
              className="text-white bg-slate-400 hover:bg-slate-600 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-4 py-2"
            >
              Go
            </button>
          </div>

          {action && (
            <ConfirmModal
              onConfirm={() => action.onGo(selected)}
              confirmText="Are you sure you want to perform action on selected?"
              loading={actionLoading}
              show={showActionConfirm}
              setShow={setShowActionConform}
            />
          )}
        </div>
      )}
      <div className="w-full bg-white shadow-lg rounded-sm border border-gray-200">
        <header className="px-5 py-4 border-b border-gray-100">
          {title && title}
        </header>

        <div className="overflow-x-auto sm:p-3 relative">
          <table className="table-auto w-full">
            <thead className="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
              <tr>
                {hasSideAction && <th></th>}
                {titles.map((t, indx) => {
                  if (t === "id") return null;
                  return (
                    <th key={indx} className="p-2">
                      <div className="font-semibold text-left">{t}</div>
                    </th>
                  );
                })}
                {hasDelete && <th></th>}
              </tr>
            </thead>

            <tbody className="text-sm divide-y divide-gray-100">
              {data.map((d, indx) => {
                return (
                  <tr key={indx}>
                    {hasSideAction && selected && setSelected && (
                      <td className="p-2">
                        <input
                          type="checkbox"
                          className="w-5 h-5"
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (selected.indexOf(d[0] as string) === -1) {
                                setSelected([
                                  ...selected,
                                  d[0].toString() as string,
                                ]);
                              }
                            } else {
                              if (selected.indexOf(d[0] as string) !== -1) {
                                setSelected(
                                  selected.filter((id) => id !== d[0])
                                );
                              }
                            }
                          }}
                          value={d[0] as string}
                        />
                      </td>
                    )}
                    {d.map((item, indx) => {
                      if (indx === 0) return null;
                      return (
                        <td key={indx} className="p-2">
                          <div className="font-medium text-gray-800">
                            {item}
                          </div>
                        </td>
                      );
                    })}

                    {(hasDelete || hasEdit) && (
                      <td className="p-2">
                        <div className="flex justify-center">
                          {hasEdit && onEditPressed && (
                            <button
                              onClick={() => {
                                onEditPressed(d[0] as string);
                              }}
                              className="hover:text-blue-300"
                            >
                              <AiOutlineEdit className="text-2xl" />
                            </button>
                          )}
                          {hasDelete && onDeletePressed && (
                            <button
                              onClick={() => {
                                onDeletePressed(d[0] as string);
                              }}
                            >
                              <svg
                                className="w-8 h-8 hover:text-red-600 rounded-full hover:bg-gray-100 p-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                ></path>
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {hasPagination &&
          onPaginationNext &&
          onPaginationPrev &&
          page &&
          totalPages && (
            <div className={`w-full flex justify-between`}>
              <div
                className={`flex-1 flex flex-col justify-center pl-5 font-bold text-md`}
              >
                <h3
                  className={`text-sm font-gothamThin flex flex-col justify-center`}
                >
                  {page} of {totalPages}
                </h3>
              </div>
              <div className={`p-3 flex items-center`}>
                <button
                  type="button"
                  onClick={() => {
                    onPaginationPrev(page);
                  }}
                  disabled={page <= 1}
                  className={`rounded-md p-2 border  ${
                    page <= 1 && "opacity-50 cursor-not-allowed"
                  } border-slate-200 hover:shadow`}
                >
                  <GrPrevious
                    className={`text-xs hover:text-black`}
                    color="#333"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onPaginationNext(page);
                  }}
                  disabled={page === totalPages}
                  className={`rounded-md p-2 border ${
                    page === totalPages && "opacity-50 cursor-not-allowed"
                  } border-slate-200 hover:shadow`}
                >
                  <GrNext className={`text-xs hover:text-black`} color="#333" />
                </button>
              </div>
            </div>
          )}
        {Bottom && Bottom}
      </div>
    </div>
  );
};

export default Table;
