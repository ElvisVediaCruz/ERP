const pool = require('../../config/db');
const ApiError = require('../../shared/errors/ApiError');
const { withTransaction } = require('../../shared/utils/transaction');
const { parsePagination } = require('../../shared/utils/pagination');

const repository = require('./sales.repository');
const usersRepository = require('../users/users.repository');
const customersRepository = require('../customers/customers.repository');
const paymentMethodsRepository = require('../payment-methods/payment-methods.repository');
const productsRepository = require('../products/products.repository');
const inventoryMovementsRepository = require('../inventory-movements/inventory-movements.repository');

async function createSale(payload) {
  const userId = payload.user_id;

  const userExists = await usersRepository.exists(pool, userId);
  if (!userExists) {
    throw ApiError.badRequest(`El usuario ${userId} no existe o está inactivo`);
  }

  const paymentMethodExists = await paymentMethodsRepository.exists(pool, payload.payment_method_id);
  if (!paymentMethodExists) {
    throw ApiError.badRequest(`El método de pago ${payload.payment_method_id} no existe o está inactivo`);
  }

  if (payload.customer_id !== undefined) {
    const customerExists = await customersRepository.exists(pool, payload.customer_id);
    if (!customerExists) {
      throw ApiError.badRequest(`El cliente ${payload.customer_id} no existe o está inactivo`);
    }
  }
  return withTransaction(pool, async (conn) => {
    let total = 0;
    const lines = [];
    for (const item of payload.items) {
      const product = await productsRepository.findByIdForUpdate(conn, item.product_id);
      if (!product || !product.status) {
        throw ApiError.notFound(`Producto ${item.product_id} no existe o está inactivo`);
      }
      if (product.stock < item.quantity) {
        throw ApiError.conflict(
          `Stock insuficiente para el producto ${item.product_id} (disponible ${product.stock}, solicitado ${item.quantity})`
        );
      }

      const originalPrice = product.sale_price;
      const salePrice = item.sale_price ?? originalPrice;
      const subtotal = salePrice * item.quantity;
      total += subtotal;

      lines.push({
        product_id: item.product_id,
        quantity: item.quantity,
        sale_price: salePrice,
        original_price: originalPrice,
        subtotal,
      });
    }

    const saleId = await repository.create(conn, {
      receipt_number: payload.receipt_number,
      user_id: userId,
      customer_id: payload.customer_id,
      total,
      payment_method_id: payload.payment_method_id,
    });

    for (const line of lines) {
      await repository.createDetail(conn, { sale_id: saleId, ...line });

      const decremented = await productsRepository.decrementStock(conn, line.product_id, line.quantity);
      if (!decremented) {
        throw ApiError.conflict(`Stock insuficiente para el producto ${line.product_id}`);
      }

      await inventoryMovementsRepository.create(conn, {
        product_id: line.product_id,
        user_id: userId,
        type: 'sale',
        quantity: line.quantity,
        reference: `sale:${saleId}`,
      });
    }

    const details = await repository.findDetailsBySaleId(conn, saleId);
    const sale = await repository.findById(conn, saleId);
    return { ...sale, details };
  });
}

async function listSales(query) {
  const { page, limit, offset } = parsePagination(query);
  const { rows, total } = await repository.findAll(pool, { limit, offset });
  return { rows, meta: { total, page, limit } };
}

async function getSale(id) {
  const sale = await repository.findById(pool, id);
  if (!sale) throw ApiError.notFound(`Venta ${id} no encontrada`);
  const details = await repository.findDetailsBySaleId(pool, id);
  return { ...sale, details };
}

module.exports = { createSale, listSales, getSale };
