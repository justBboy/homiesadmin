import React, { ReactElement, useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import ConfirmModal from "./ConfirmModal";

export type actionType = {
  id: string;
  name: string;
  onGo: () => void;
};

interface props {
  title?: string | number | ReactElement;
  Bottom?: ReactElement;
  titles: string[];
  data: string[][];
  hasSideAction?: boolean;
  hasDelete?: boolean;
  hasEdit?: boolean;
  onEditPressed?: (id: string) => void;
  selected?: string[];
  setSelected?: (selected: string[]) => void;
  actions?: actionType[];
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
  actions,
  actionLoading,
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
    <div className="flex flex-col max-w-2xl my-2 animate__animated animate__fadeIn w-full">
      {actions && (
        <div className="flex flex-col sm:flex-row items-center">
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
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
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
              {actions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <button
              onClick={(e) => {
                e.preventDefault();
                if (selected && selected.length) setShowActionConform(true);
              }}
              className="text-white bg-slate-400 hover:bg-slate-600 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-4 py-2"
            >
              Go
            </button>
          </div>

          {action && (
            <ConfirmModal
              onConfirm={action.onGo}
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

        <div className="overflow-x-auto sm:p-3">
          <table className="table-auto w-full">
            <thead className="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
              <tr>
                {hasSideAction && <th></th>}
                {titles.map((t) => {
                  if (t === "id") return null;
                  return (
                    <th className="p-2">
                      <div className="font-semibold text-left">{t}</div>
                    </th>
                  );
                })}
                {hasDelete && <th></th>}
              </tr>
            </thead>

            <tbody className="text-sm divide-y divide-gray-100">
              {data.map((d) => {
                return (
                  <tr>
                    {hasSideAction && selected && setSelected && (
                      <td className="p-2">
                        <input
                          type="checkbox"
                          className="w-5 h-5"
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (selected.indexOf(d[0]) === -1) {
                                setSelected([...selected, d[0]]);
                              }
                            } else {
                              if (selected.indexOf(d[0]) !== -1) {
                                setSelected(
                                  selected.filter((id) => id !== d[0])
                                );
                              }
                            }
                          }}
                          value={d[0]}
                        />
                      </td>
                    )}
                    {d.map((item, indx) => {
                      console.log(indx);
                      if (indx === 0) return null;
                      return (
                        <td className="p-2">
                          <div className="font-medium text-gray-800">
                            {item}
                          </div>
                        </td>
                      );
                    })}

                    {hasDelete && (
                      <td className="p-2">
                        <div className="flex justify-center">
                          {hasEdit && onEditPressed && (
                            <button
                              onClick={() => {
                                onEditPressed(d[0]);
                              }}
                              className="hover:text-blue-300"
                            >
                              <AiOutlineEdit className="text-2xl" />
                            </button>
                          )}

                          <button>
                            <svg
                              className="w-8 h-8 hover:text-red-600 rounded-full hover:bg-gray-100 p-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              ></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {Bottom && Bottom}
      </div>
    </div>
  );
};

export default Table;
