import { SelectHTMLAttributes, forwardRef } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
  label?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, label, className = '', ...props }, ref) => {
    return (
      <div className="relative">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`appearance-none w-full bg-white dark:bg-gray-800 
                     border border-gray-300 dark:border-gray-600 
                     text-gray-700 dark:text-gray-200 rounded-lg 
                     pl-4 pr-10 py-2 
                     focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
                     hover:border-violet-500 dark:hover:border-violet-400
                     transition-colors duration-200 cursor-pointer
                     disabled:opacity-50 disabled:cursor-not-allowed
                     ${className}`}
            {...props}
          >
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="py-2 px-4"
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Select;