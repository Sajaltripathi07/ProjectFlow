import Select from "../common/Select";
import Button from "../common/Button";
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "../../constants";

const ALL_STATUS = [{ value: "", label: "All Statuses" }, ...STATUS_OPTIONS];
const ALL_PRIORITY = [{ value: "", label: "All Priorities" }, ...PRIORITY_OPTIONS];

const TaskFilters = ({ filters, onChange, onReset }) => {
  const hasActiveFilter = filters.status || filters.priority;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Select
        value={filters.status || ""}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        options={ALL_STATUS}
        className="w-40 !py-1.5 !text-xs"
      />
      <Select
        value={filters.priority || ""}
        onChange={(e) => onChange({ ...filters, priority: e.target.value })}
        options={ALL_PRIORITY}
        className="w-40 !py-1.5 !text-xs"
      />
      {hasActiveFilter && (
        <Button variant="ghost" size="sm" onClick={onReset} className="text-xs text-slate-500">
          Clear filters
        </Button>
      )}
    </div>
  );
};

export default TaskFilters;
