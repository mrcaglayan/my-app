import express from "express";
import { query } from "../db.js";
import { requirePermission } from "../middleware/rbac.js";
import {
  asyncHandler,
  assertRequiredFields,
  badRequest,
  parsePositiveInt,
  resolveTenantId,
} from "./_utils.js";

const router = express.Router();

const DEFAULT_ACCOUNTS = [
  {
    code: "1000",
    name: "Cash and Cash Equivalents",
    accountType: "ASSET",
    normalSide: "DEBIT",
  },
  {
    code: "1100",
    name: "Accounts Receivable",
    accountType: "ASSET",
    normalSide: "DEBIT",
  },
  {
    code: "2000",
    name: "Accounts Payable",
    accountType: "LIABILITY",
    normalSide: "CREDIT",
  },
  {
    code: "3000",
    name: "Retained Earnings",
    accountType: "EQUITY",
    normalSide: "CREDIT",
  },
  {
    code: "4000",
    name: "Revenue",
    accountType: "REVENUE",
    normalSide: "CREDIT",
  },
  {
    code: "5000",
    name: "Operating Expense",
    accountType: "EXPENSE",
    normalSide: "DEBIT",
  },
];

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

async function getCountryId(countryId, countryIso2) {
  const normalizedCountryId = parsePositiveInt(countryId);
  if (normalizedCountryId) {
    return normalizedCountryId;
  }

  if (!countryIso2) {
    throw badRequest("countryId or countryIso2 is required for legal entity");
  }

  const result = await query(
    `SELECT id
     FROM countries
     WHERE iso2 = ?
     LIMIT 1`,
    [String(countryIso2).trim().toUpperCase()]
  );
  const resolved = parsePositiveInt(result.rows[0]?.id);
  if (!resolved) {
    throw badRequest(`Country not found for iso2=${countryIso2}`);
  }
  return resolved;
}

async function getGroupCompanyId(tenantId, code) {
  const result = await query(
    `SELECT id
     FROM group_companies
     WHERE tenant_id = ?
       AND code = ?
     LIMIT 1`,
    [tenantId, String(code).trim()]
  );
  return parsePositiveInt(result.rows[0]?.id);
}

async function getFiscalCalendarId(tenantId, code) {
  const result = await query(
    `SELECT id
     FROM fiscal_calendars
     WHERE tenant_id = ?
       AND code = ?
     LIMIT 1`,
    [tenantId, String(code).trim()]
  );
  return parsePositiveInt(result.rows[0]?.id);
}

async function getLegalEntityId(tenantId, code) {
  const result = await query(
    `SELECT id
     FROM legal_entities
     WHERE tenant_id = ?
       AND code = ?
     LIMIT 1`,
    [tenantId, String(code).trim()]
  );
  return parsePositiveInt(result.rows[0]?.id);
}

async function getCoaId(tenantId, code) {
  const result = await query(
    `SELECT id
     FROM charts_of_accounts
     WHERE tenant_id = ?
       AND code = ?
     LIMIT 1`,
    [tenantId, String(code).trim()]
  );
  return parsePositiveInt(result.rows[0]?.id);
}

router.post(
  "/company-bootstrap",
  requirePermission("onboarding.company.setup"),
  asyncHandler(async (req, res) => {
    const tenantId = resolveTenantId(req);
    if (!tenantId) {
      throw badRequest("tenantId is required");
    }

    assertRequiredFields(req.body, [
      "groupCompany",
      "fiscalCalendar",
      "fiscalYear",
      "legalEntities",
    ]);

    const groupCompany = req.body.groupCompany || {};
    const fiscalCalendar = req.body.fiscalCalendar || {};
    const fiscalYear = parsePositiveInt(req.body.fiscalYear);
    const legalEntities = Array.isArray(req.body.legalEntities)
      ? req.body.legalEntities
      : [];

    if (!fiscalYear) {
      throw badRequest("fiscalYear must be a positive integer");
    }
    if (legalEntities.length === 0) {
      throw badRequest("legalEntities must be a non-empty array");
    }

    assertRequiredFields(groupCompany, ["code", "name"]);
    assertRequiredFields(fiscalCalendar, [
      "code",
      "name",
      "yearStartMonth",
      "yearStartDay",
    ]);

    const yearStartMonth = parsePositiveInt(fiscalCalendar.yearStartMonth);
    const yearStartDay = parsePositiveInt(fiscalCalendar.yearStartDay);
    if (!yearStartMonth || yearStartMonth > 12) {
      throw badRequest("fiscalCalendar.yearStartMonth must be between 1 and 12");
    }
    if (!yearStartDay || yearStartDay > 31) {
      throw badRequest("fiscalCalendar.yearStartDay must be between 1 and 31");
    }

    await query(
      `INSERT INTO group_companies (tenant_id, code, name)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name)`,
      [tenantId, String(groupCompany.code).trim(), String(groupCompany.name).trim()]
    );
    const groupCompanyId = await getGroupCompanyId(tenantId, groupCompany.code);
    if (!groupCompanyId) {
      throw new Error("Unable to resolve group company id");
    }

    await query(
      `INSERT INTO fiscal_calendars (
          tenant_id, code, name, year_start_month, year_start_day
       )
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         year_start_month = VALUES(year_start_month),
         year_start_day = VALUES(year_start_day)`,
      [
        tenantId,
        String(fiscalCalendar.code).trim(),
        String(fiscalCalendar.name).trim(),
        yearStartMonth,
        yearStartDay,
      ]
    );
    const calendarId = await getFiscalCalendarId(tenantId, fiscalCalendar.code);
    if (!calendarId) {
      throw new Error("Unable to resolve fiscal calendar id");
    }

    for (let i = 0; i < 12; i += 1) {
      const monthOffset = yearStartMonth - 1 + i;
      const start = new Date(Date.UTC(fiscalYear, monthOffset, yearStartDay));
      const nextStart = new Date(Date.UTC(fiscalYear, monthOffset + 1, yearStartDay));
      const end = new Date(nextStart.getTime() - 24 * 60 * 60 * 1000);
      const periodNo = i + 1;
      const periodName = `P${String(periodNo).padStart(2, "0")}`;

      await query(
        `INSERT INTO fiscal_periods (
            calendar_id, fiscal_year, period_no, period_name, start_date, end_date, is_adjustment
         )
         VALUES (?, ?, ?, ?, ?, ?, FALSE)
         ON DUPLICATE KEY UPDATE
           period_name = VALUES(period_name),
           start_date = VALUES(start_date),
           end_date = VALUES(end_date)`,
        [calendarId, fiscalYear, periodNo, periodName, toIsoDate(start), toIsoDate(end)]
      );
    }

    const entitySummaries = [];

    for (const entity of legalEntities) {
      assertRequiredFields(entity, ["code", "name", "functionalCurrencyCode"]);
      const countryId = await getCountryId(entity.countryId, entity.countryIso2);

      const intercompanyEnabled =
        entity.isIntercompanyEnabled === undefined
          ? true
          : Boolean(entity.isIntercompanyEnabled);
      const partnerRequired = Boolean(entity.intercompanyPartnerRequired);

      await query(
        `INSERT INTO legal_entities (
            tenant_id, group_company_id, code, name, tax_id, country_id, functional_currency_code,
            is_intercompany_enabled, intercompany_partner_required
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           tax_id = VALUES(tax_id),
           country_id = VALUES(country_id),
           functional_currency_code = VALUES(functional_currency_code),
           group_company_id = VALUES(group_company_id),
           is_intercompany_enabled = VALUES(is_intercompany_enabled),
           intercompany_partner_required = VALUES(intercompany_partner_required)`,
        [
          tenantId,
          groupCompanyId,
          String(entity.code).trim(),
          String(entity.name).trim(),
          entity.taxId ? String(entity.taxId).trim() : null,
          countryId,
          String(entity.functionalCurrencyCode).toUpperCase(),
          intercompanyEnabled,
          partnerRequired,
        ]
      );

      const legalEntityId = await getLegalEntityId(tenantId, entity.code);
      if (!legalEntityId) {
        throw new Error(`Unable to resolve legal entity id for ${entity.code}`);
      }

      const branches = Array.isArray(entity.branches) ? entity.branches : [];
      for (const branch of branches) {
        assertRequiredFields(branch, ["code", "name"]);
        await query(
          `INSERT INTO operating_units (
              tenant_id, legal_entity_id, code, name, unit_type, has_subledger
           )
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             name = VALUES(name),
             unit_type = VALUES(unit_type),
             has_subledger = VALUES(has_subledger)`,
          [
            tenantId,
            legalEntityId,
            String(branch.code).trim(),
            String(branch.name).trim(),
            String(branch.unitType || "BRANCH").toUpperCase(),
            Boolean(branch.hasSubledger),
          ]
        );
      }

      const coaCode = entity.coaCode
        ? String(entity.coaCode).trim()
        : `COA-${String(entity.code).trim().toUpperCase()}`;
      const coaName = entity.coaName
        ? String(entity.coaName).trim()
        : `${String(entity.name).trim()} CoA`;

      await query(
        `INSERT INTO charts_of_accounts (
            tenant_id, legal_entity_id, scope, code, name
         )
         VALUES (?, ?, 'LEGAL_ENTITY', ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           legal_entity_id = VALUES(legal_entity_id)`,
        [tenantId, legalEntityId, coaCode, coaName]
      );
      const coaId = await getCoaId(tenantId, coaCode);
      if (!coaId) {
        throw new Error(`Unable to resolve CoA for ${coaCode}`);
      }

      const accounts = Array.isArray(entity.defaultAccounts) && entity.defaultAccounts.length
        ? entity.defaultAccounts
        : DEFAULT_ACCOUNTS;

      for (const account of accounts) {
        assertRequiredFields(account, ["code", "name", "accountType", "normalSide"]);
        await query(
          `INSERT INTO accounts (
              coa_id, code, name, account_type, normal_side, allow_posting, parent_account_id
           )
           VALUES (?, ?, ?, ?, ?, ?, NULL)
           ON DUPLICATE KEY UPDATE
             name = VALUES(name),
             account_type = VALUES(account_type),
             normal_side = VALUES(normal_side),
             allow_posting = VALUES(allow_posting)`,
          [
            coaId,
            String(account.code).trim(),
            String(account.name).trim(),
            String(account.accountType).toUpperCase(),
            String(account.normalSide).toUpperCase(),
            account.allowPosting === undefined ? true : Boolean(account.allowPosting),
          ]
        );
      }

      const bookCode = entity.bookCode
        ? String(entity.bookCode).trim()
        : `BOOK-${String(entity.code).trim().toUpperCase()}`;
      const bookName = entity.bookName
        ? String(entity.bookName).trim()
        : `${String(entity.name).trim()} Book`;

      await query(
        `INSERT INTO books (
            tenant_id, legal_entity_id, calendar_id, code, name, book_type, base_currency_code
         )
         VALUES (?, ?, ?, ?, ?, 'LOCAL', ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           calendar_id = VALUES(calendar_id),
           base_currency_code = VALUES(base_currency_code)`,
        [
          tenantId,
          legalEntityId,
          calendarId,
          bookCode,
          bookName,
          String(entity.functionalCurrencyCode).toUpperCase(),
        ]
      );

      entitySummaries.push({
        code: String(entity.code).trim(),
        legalEntityId,
        coaCode,
        coaId,
        branchCount: branches.length,
      });
    }

    return res.status(201).json({
      ok: true,
      tenantId,
      groupCompanyId,
      calendarId,
      fiscalYear,
      periodsGenerated: 12,
      legalEntities: entitySummaries,
    });
  })
);

export default router;
