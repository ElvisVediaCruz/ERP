const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const env = require('./config/env');
const notFound = require('./shared/middlewares/notFound');
const errorHandler = require('./shared/middlewares/errorHandler');
const authenticate = require('./shared/middlewares/authenticate');

const authRoutes = require('./modules/auth/auth.routes');
const categoriesRoutes = require('./modules/categories/categories.routes');
const suppliersRoutes = require('./modules/suppliers/suppliers.routes');
const productsRoutes = require('./modules/products/products.routes');
const paymentMethodsRoutes = require('./modules/payment-methods/payment-methods.routes');
const purchasesRoutes = require('./modules/purchases/purchases.routes');
const salesRoutes = require('./modules/sales/sales.routes');
const usersRoutes = require('./modules/users/users.routes');
const rolesRoutes = require('./modules/roles/roles.routes');

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => res.json({ data: { status: 'ok' } }));

app.use('/api/auth', authRoutes);
app.use('/api', authenticate);

app.use('/api/categories', categoriesRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/payment-methods', paymentMethodsRoutes);
app.use('/api/purchases', purchasesRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/roles', rolesRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
