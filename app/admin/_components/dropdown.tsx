"use client";

interface Option {
  label: string;
  value: string;
}

interface DropdownProps {
  options: Option[];
  onChange?: (value: string) => void;
  placeholder?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  onChange,
  placeholder,
}) => {
  return (
    <div className="relative inline-block w-full">
      <select
        onChange={(e) => onChange && onChange(e.target.value)}
        className="font-medium w-full appearance-none border border-[#1F1F1F] rounded-lg bg-transparent px-4 py-2 cursor-pointer text-center"
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-white text-black"
          >
            {option.label}
          </option>
        ))}
      </select>

      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg
          width="9"
          height="7"
          viewBox="0 0 9 7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.5 7L0.602887 0.249999L8.39711 0.25L4.5 7Z"
            fill="#1F1F1F"
          />
        </svg>
      </div>
    </div>
  );
};

export default Dropdown;
