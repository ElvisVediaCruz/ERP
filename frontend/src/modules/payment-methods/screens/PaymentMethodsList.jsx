import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { listPaymentMethods, updatePaymentMethodStatus } from '../services/payment-methods.service';
import ErrorBanner from '@shared/components/common/ErrorBanner';
import LoadingSpinner from '@shared/components/common/LoadingSpinner';
import EmptyState from '@shared/components/common/EmptyState';
import ToggleSwitch from '@shared/components/common/ToggleSwitch';
import { useNotifications } from '@shared/context/NotificationContext';

export default function PaymentMethodsList() {
  const navigate = useNavigate();
  const { pushToast } = useNotifications();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const load = () => {
    setLoading(true);
    listPaymentMethods()
      .then(setPaymentMethods)
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleToggleStatus = async (paymentMethod) => {
    setTogglingId(paymentMethod.id);
    try {
      await updatePaymentMethodStatus(paymentMethod.id, !paymentMethod.status);
      pushToast(paymentMethod.status ? 'Método de pago desactivado' : 'Método de pago activado', 'success');
      load();
    } catch (err) {
      pushToast('No se pudo actualizar el estado del método de pago', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Métodos de pago</h2>
        <Link className="btn btn-primary" to="/payment-methods/new">
          Nuevo método de pago
        </Link>
      </div>

      <ErrorBanner error={error} />
      {loading && <LoadingSpinner />}

      {!loading && paymentMethods.length === 0 && (
        <EmptyState
          icon={CreditCard}
          title="Aún no hay métodos de pago registrados"
          description="Los métodos de pago que registres aparecerán aquí."
          actionLabel="Nuevo método de pago"
          onAction={() => navigate('/payment-methods/new')}
        />
      )}

      {!loading && paymentMethods.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paymentMethods.map((paymentMethod) => (
              <tr key={paymentMethod.id}>
                <td>{paymentMethod.name}</td>
                <td>{paymentMethod.description}</td>
                <td>
                  <ToggleSwitch
                    checked={paymentMethod.status}
                    disabled={togglingId === paymentMethod.id}
                    onChange={() => handleToggleStatus(paymentMethod)}
                    label={paymentMethod.status ? 'Desactivar método de pago' : 'Activar método de pago'}
                  />
                </td>
                <td className="actions">
                  <Link className="btn-link" to={`/payment-methods/${paymentMethod.id}/edit`}>
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
