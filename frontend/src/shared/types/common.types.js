/**
 * @typedef {Object} ApiError
 * @property {number|null} status
 * @property {string} code
 * @property {string} message
 * @property {Object|null} details
 */

/**
 * @typedef {Object} PaginationMeta
 * @property {number} total
 * @property {number} page
 * @property {number} limit
 */

/**
 * @typedef {Object} ApiListResponse
 * @property {Array<any>} data
 * @property {PaginationMeta} meta
 */

export {};
