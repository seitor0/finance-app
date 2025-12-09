"use client";

export type FilterField =
  | {
      key: string;
      label: string;
      type?: "text" | "search" | "number";
      placeholder?: string;
      className?: string;
    }
  | {
      key: string;
      label: string;
      type: "date";
      placeholder?: string;
      className?: string;
    }
  | {
      key: string;
      label: string;
      type: "select";
      options: { value: string; label: string }[];
      emptyOptionLabel?: string;
      className?: string;
    };

interface TableFiltersProps {
  fields: FilterField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear?: () => void;
  className?: string;
}

export function TableFilters({
  fields,
  values,
  onChange,
  onClear,
  className,
}: TableFiltersProps) {
  if (!fields.length) return null;

  return (
    <div className={cx("rounded-2xl border border-slate-200 bg-white p-4 shadow-sm", className)}>
      <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
        {fields.map((field) => {
          const value = values[field.key] ?? "";
          const label = (
            <label
              key={field.key}
              className={cx(
                "flex flex-col text-xs font-semibold uppercase tracking-wide text-slate-500",
                field.className
              )}
            >
              {field.label}
            </label>
          );

          if (field.type === "select") {
            return (
              <div key={field.key} className="flex flex-col gap-1 text-sm">
                {label}
                <select
                  className="rounded-xl border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-slate-400"
                  value={value}
                  onChange={(event) => onChange(field.key, event.target.value)}
                >
                  <option value="">{field.emptyOptionLabel ?? "Todos"}</option>
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          const inputType =
            field.type === "date"
              ? "date"
              : field.type === "number"
                ? "number"
                : field.type === "search"
                  ? "search"
                  : "text";

          return (
            <div key={field.key} className="flex flex-col gap-1 text-sm">
              {label}
              <input
                type={inputType}
                value={value}
                onChange={(event) => onChange(field.key, event.target.value)}
                placeholder={field.placeholder}
                className="rounded-xl border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-slate-400"
              />
            </div>
          );
        })}

        {onClear && (
          <div className="flex items-end">
            <button
              type="button"
              onClick={onClear}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}
