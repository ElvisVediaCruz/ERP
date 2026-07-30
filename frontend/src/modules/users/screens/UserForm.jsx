import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUser, listUsers, updateUser } from '../services/users.service';
import ErrorBanner from '@shared/components/common/ErrorBanner';
import LoadingSpinner from '@shared/components/common/LoadingSpinner';
import { useNotifications } from '@shared/context/NotificationContext';

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pushToast } = useNotifications();

  const [form, setForm] = useState(null);
  // El backend no tiene GET /roles (solo POST /), así que las opciones de rol
  // se derivan de los role_id/role_name ya observados en el listado de
  // usuarios en vez de hardcodearse a ciegas. Si solo existe un rol entre los
  // usuarios actuales, aquí solo aparecerá esa opción.
  const [roleOptions, setRoleOptions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([getUser(id), listUsers()])
      .then(([user, users]) => {
        setForm({
          name: user.name ?? '',
          last_name: user.last_name ?? '',
          username: user.username ?? '',
          role_id: user.role_id,
        });
        const seen = new Map();
        users.forEach((u) => seen.set(u.role_id, u.role_name));
        if (!seen.has(user.role_id)) seen.set(user.role_id, user.role_name);
        setRoleOptions(Array.from(seen.entries()).map(([roleId, name]) => ({ id: roleId, name })));
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await updateUser(id, form);
      pushToast('Usuario actualizado', 'success');
      navigate('/users');
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2>Editar usuario</h2>
      <ErrorBanner error={error} />

      {form && (
        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Nombre</label>
            <input value={`${form.name} ${form.last_name}`} disabled />
            <span className="hint">El nombre y usuario no se editan desde aquí.</span>
          </div>
          <div className="field">
            <label>Usuario</label>
            <input value={form.username} disabled />
          </div>
          <div className="field">
            <label htmlFor="role_id">Rol</label>
            <select
              id="role_id"
              value={form.role_id}
              onChange={(e) => setForm({ ...form, role_id: Number(e.target.value) })}
              required
            >
              {roleOptions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <span className="hint">
              El backend no expone un listado de roles: solo se muestran los roles que ya tienen
              al menos un usuario asignado.
            </span>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" className="btn" onClick={() => navigate('/users')}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
