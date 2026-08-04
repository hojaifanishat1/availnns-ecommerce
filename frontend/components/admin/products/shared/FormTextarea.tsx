interface Props {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
  rows?: number;
}

export default function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 5
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

      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        rows={rows}
        className="
          w-full
          border
          border-gray-200
          rounded-lg
          p-3
          text-sm
          text-gray-900
          bg-white
          placeholder:text-gray-400
          focus:outline-none
          focus:ring-2
          focus:ring-black
          focus:border-transparent
          transition-all
        "
      />
    </div>
  );
}
