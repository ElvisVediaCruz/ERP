import { useEffect, useState } from 'react';
import { searchProducts } from '@modules/products/services/products.service';

export default function ProductAutocomplete({ value, onSelect, type, placeholder = 'Buscar producto...' }) {
  const [query, setQuery] = useState(value ?? '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(value ?? '');
  }, [value]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const handle = setTimeout(() => {
      searchProducts(query.trim(), type)
        .then(setSuggestions)
        .catch(() => setSuggestions([]));
    }, 300);
    return () => clearTimeout(handle);
  }, [query, type]);

  const handleSelect = (product) => {
    setQuery(product.name);
    setSuggestions([]);
    setOpen(false);
    onSelect(product);
  };

  return (
    <div className="autocomplete">
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
      />
      {open && suggestions.length > 0 && (
        <ul className="autocomplete-list">
          {suggestions.map((p) => (
            <li
              key={p.id}
              className="autocomplete-item"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(p)}
            >
              {p.name}
              {p.code ? ` — ${p.code}` : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
