interface Option {
  label: string;
  value: string;
}

interface Props {
  label: string;
  value: string;
  options: Option[];
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
}

export default function FormSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Select an option"
}: Props) {
  return (
    <div
      className="space-y-1.5"
    >
      <label
        className="
          block
          text-xs
          font-medium
          text-gray-700
        "
      >
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className="
          w-full
          border
          border-gray-200
          rounded-lg
          px-3
          py-2.5
          text-sm
          text-gray-900
          bg-white
          focus:outline-none
          focus:ring-2
          focus:ring-black
          focus:border-transparent
          transition-all
          cursor-pointer
        "
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {
          options.map(option => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))
        }
      </select>
    </div>
  );
}
