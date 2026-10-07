const SelectInput = ({ label, name, value, onChange, options = [], placeholder = 'Select option' }) => (
  <div className="form-field">
    {label && <label htmlFor={name}>{label}</label>}
    <select id={name} name={name} value={value} onChange={onChange}>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={String(option.value)} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

export default SelectInput;
