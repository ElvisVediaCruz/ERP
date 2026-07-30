export default function ToggleSwitch({ checked, onChange, disabled, label }) {
  return (
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
      />
      <span className="toggle-slider" />
    </label>
  );
}
