// @flow

const R = require('ramda');
const searchguardClient = require('../../clients/searchguardClient');
const sqlClient = require('../../clients/sqlClient');
const {
  ifNotAdmin,
  inClause,
  inClauseOr,
  isPatchEmpty,
  prepare,
  query,
  whereAnd,
} = require('../../util/db');
const logger = require('../../logger');
const Helpers = require('./helpers');
const Sql = require('./sql');

/* ::

import type {ResolversObj} from '../';

*/

const updateSearchGuardWithCustomers = async () => {
  const customerNames = await Helpers.getAllCustomerNames();

  const tenants = R.reduce(
    (acc, elem) => {
      acc[elem] = 'RW';
      return acc;
    },
    { admin_tenant: 'RW' },
    customerNames,
  );

  try {
    // Create or Update the lagoonadmin role which has access to all tenants (all customers)
    await searchguardClient.put('roles/lagoonadmin', {
      body: {
        cluster: ['UNLIMITED'],
        indices: {
          '*': {
            '*': ['UNLIMITED'],
          },
        },
        tenants,
      },
    });
  } catch (err) {
    logger.error(`SearchGuard Error while creating lagoonadmin role: ${err}`);
    throw new Error(
      `SearchGuard Error while creating lagoonadmin role: ${err}`,
    );
  }
};

const addCustomer = async (root, { input }, { credentials: { role } }) => {
  if (role !== 'admin') {
    throw new Error('Unauthorized.');
  }

  const prep = prepare(
    sqlClient,
    `CALL CreateCustomer(
        :id,
        :name,
        ${input.comment ? ':comment' : 'NULL'},
        ${input.privateKey ? ':private_key' : 'NULL'}
      );
    `,
  );
  const rows = await query(sqlClient, prep(input));
  const customer = R.path([0, 0], rows);

  await updateSearchGuardWithCustomers();

  return customer;
};

const getCustomerByProjectId = async (
  { id: pid },
  args,
  {
    credentials: {
      role,
      permissions: { customers, projects },
    },
  },
) => {
  const str = `
      SELECT
        c.id,
        c.name,
        c.comment,
        c.private_key,
        c.created
      FROM project p
      JOIN customer c ON p.customer = c.id
      WHERE p.id = :pid
      ${ifNotAdmin(
    role,
    `AND (${inClauseOr([['c.id', customers], ['p.id', projects]])})`,
  )}
    `;
  const prep = prepare(sqlClient, str);

  const rows = await query(sqlClient, prep({ pid }));
  return rows ? rows[0] : null;
};

const deleteCustomer = async (root, { input }, { credentials: { role } }) => {
  if (role !== 'admin') {
    throw new Error('Unauthorized');
  }
  const prep = prepare(sqlClient, 'CALL deleteCustomer(:name)');

  await query(sqlClient, prep(input));

  await updateSearchGuardWithCustomers();

  // TODO: maybe check rows for changed values
  return 'success';
};

const getAllCustomers = async (
  root,
  args,
  {
    credentials: {
      role,
      permissions: { customers },
    },
  },
) => {
  const where = whereAnd([
    args.createdAfter ? 'created >= :created_after' : '',
    ifNotAdmin(role, `${inClause('id', customers)}`),
  ]);
  const prep = prepare(sqlClient, `SELECT * FROM customer ${where}`);
  const rows = await query(sqlClient, prep(args));
  return rows;
};

const updateCustomer = async (
  root,
  { input },
  {
    credentials: {
      role,
      permissions: { customers },
    },
  },
) => {
  if (role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const cid = input.id.toString();

  if (isPatchEmpty(input)) {
    throw new Error('input.patch requires at least 1 attribute');
  }

  await query(
    sqlClient,
    Sql.updateCustomer(
      { credentials: { role, permissions: { customers } } },
      input,
    ),
  );

  const rows = await query(sqlClient, Sql.selectCustomer(cid));

  return R.prop(0, rows);
};

const getCustomerByName = async (
  root,
  args,
  {
    credentials: {
      role,
      permissions: { customers },
    },
  },
) => {
  const rows = await query(
    sqlClient,
    Sql.selectCustomerByName(
      { credentials: { role, permissions: { customers } } },
      args.name,
    ),
  );
  return rows ? rows[0] : null;
};

const deleteAllCustomers = async (root, args, { credentials: { role } }) => {
  if (role !== 'admin') {
    throw new Error('Unauthorized.');
  }

  await query(sqlClient, Sql.truncateCustomer());

  // TODO: Check rows for success
  return 'success';
};

const Resolvers /* : ResolversObj */ = {
  addCustomer,
  deleteCustomer,
  getAllCustomers,
  getCustomerByProjectId,
  updateCustomer,
  getCustomerByName,
  deleteAllCustomers,
};

module.exports = Resolvers;
