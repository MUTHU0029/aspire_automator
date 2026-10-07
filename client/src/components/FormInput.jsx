const FormInput = ({ label, type = 'text', value, onChange, name, placeholder, required = false, min, max }) => (
  <div className="form-field">
    {label && <label htmlFor={name}>{label}</label>}
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      min={min}
      max={max}
    />
  </div>
);

export default FormInput;
