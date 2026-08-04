interface Props {
  label: string;
  value: string | number;
  onChange: (
    value: string
  ) => void;
  type?: string;
  placeholder?: string;
  error?: string;
}

export default function FormInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  error
}: Props) {
  return (
    <div
      className="
        space-y-1.5
      "
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

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className={`
          w-full
          border
          rounded-lg
          px-3
          py-2.5
          text-sm
          text-gray-900
          bg-white
          placeholder:text-gray-400
          focus:outline-none
          focus:ring-2
          transition-all
          ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-200 focus:ring-black focus:border-transparent"
          }
        `}
      />

      {
        error && (
          <p
            className="
              text-xs
              text-red-500
              font-medium
            "
          >
            {error}
          </p>
        )
      }
    </div>
  );
}
