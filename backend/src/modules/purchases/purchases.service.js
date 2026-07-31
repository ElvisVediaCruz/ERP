const pool = require('../../config/db');
const ApiError = require('../../shared/errors/ApiError');
const { withTransaction } = require('../../shared/utils/transaction');
const { parsePagination } = require('../../shared/utils/pagination');

const repository = require('./purchases.repository');
const suppliersRepository = require('../suppliers/suppliers.repository');
const usersRepository = require('../users/users.repository');
const productsRepository = require('../products/products.repository');
const inventoryMovementsRepository = require('../inventory-movements/inventory-movements.repository');

async function createPurchase(payload) {
  const userId = payload.user_id;

  const userExists = await usersRepository.exists(pool, userId);
  if (!userExists) {
    throw ApiError.badRequest(`El usuario ${userId} no existe o está inactivo`);
  }
  //verifica si existe el proveedor y si esta activo
  if (payload.supplier_id !== undefined){
    const supplierExists = await suppliersRepository.exists(pool, payload.supplier_id);
    if (!supplierExists) {
      throw ApiError.badRequest(`El proveedor ${payload.supplier_id} no existe o está inactivo`);
    }
  }

  return withTransaction(pool, async (conn) => {
    let total = 0;
    const lines = [];

    for (const item of payload.items) {
      const product = await productsRepository.findByIdForUpdate(conn, item.product_id);
      if (!product) {
        throw ApiError.notFound(`Producto ${item.product_id} no existe o está inactivo`);
      }
      const subtotal = item.purchase_price * item.quantity;
      total += subtotal;
      lines.push({ ...item, subtotal });
    }

    const purchaseId = await repository.create(conn, {
      supplier_id: payload.supplier_id,
      user_id: userId,
      invoice_number: payload.invoice_number,
      purchase_date: payload.purchase_date,
      total,
      description: payload.description,
    });

    for (const line of lines) {
      await repository.createDetail(conn, {
        purchase_id: purchaseId,
        product_id: line.product_id,
        quantity: line.quantity,
        purchase_price: line.purchase_price,
        subtotal: line.subtotal,
        description: line.description,
      });

      const incremented = await productsRepository.incrementStock(conn, line.product_id, line.quantity);
      if (!incremented) {
        throw ApiError.conflict(`No se pudo actualizar el stock del producto ${line.product_id}`);
      }

      await inventoryMovementsRepository.create(conn, {
        product_id: line.product_id,
        user_id: userId,
        type: 'purchase',
        quantity: line.quantity,
        reference: `purchase:${purchaseId}`,
      });
    }

    const details = await repository.findDetailsByPurchaseId(conn, purchaseId);
    const purchase = await repository.findById(conn, purchaseId);
    return { ...purchase, details };
  });
}

async function listPurchases(query) {
  const { page, limit, offset } = parsePagination(query);
  const { rows, total } = await repository.findAll(pool, { limit, offset });
  return { rows, meta: { total, page, limit } };
}

async function getPurchase(id) {
  const purchase = await repository.findById(pool, id);
  if (!purchase) throw ApiError.notFound(`Compra ${id} no encontrada`);
  const details = await repository.findDetailsByPurchaseId(pool, id);
  return { ...purchase, details };
}

module.exports = { createPurchase, listPurchases, getPurchase };
