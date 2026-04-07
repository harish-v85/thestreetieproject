import ExcelJS from "exceljs";
import { BULK_DOG_HEADERS } from "@/lib/dogs/bulk-dog-import";

/** exceljs Worksheet includes dataValidations at runtime; types may be incomplete. */
type WorksheetDv = ExcelJS.Worksheet & {
  dataValidations: { add: (range: string, opts: object) => void };
};

const GENDER_LIST = "male,female,unknown";
const STERILISATION_LIST = "neutered,not_neutered,unknown";
const AGE_CONF_LIST = "vet_assessed,best_guess,unknown";

type LocNb = { localityNames: string[]; neighbourhoodNames: string[] };

export async function buildBulkDogTemplateBuffer(locations: LocNb): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Streetie";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Dogs", {
    views: [{ state: "frozen", ySplit: 1 }],
  }) as WorksheetDv;

  sheet.addRow([...BULK_DOG_HEADERS]);
  const hr = sheet.getRow(1);
  hr.font = { bold: true };
  for (let i = 0; i < BULK_DOG_HEADERS.length; i++) {
    sheet.getColumn(i + 1).width = Math.max(16, BULK_DOG_HEADERS[i].length + 3);
  }

  const lists = workbook.addWorksheet("Lists", { state: "hidden" });
  locations.localityNames.forEach((name, i) => {
    lists.getCell(i + 1, 1).value = name;
  });
  locations.neighbourhoodNames.forEach((name, i) => {
    lists.getCell(i + 1, 2).value = name;
  });

  const lastDataRow = 500;
  const locEnd = Math.max(1, locations.localityNames.length);
  const nbEnd = Math.max(1, locations.neighbourhoodNames.length);

  sheet.dataValidations.add(`D2:D${lastDataRow}`, {
    type: "list",
    allowBlank: false,
    formulae: [`"${GENDER_LIST}"`],
    showErrorMessage: true,
    errorStyle: "error",
    errorTitle: "Invalid value",
    error: "Choose male, female, or unknown.",
  });

  sheet.dataValidations.add(`E2:E${lastDataRow}`, {
    type: "list",
    allowBlank: false,
    formulae: [`=Lists!$A$1:$A$${locEnd}`],
    showErrorMessage: true,
    errorStyle: "error",
    errorTitle: "Invalid locality",
    error: "Pick a locality from the list.",
  });

  sheet.dataValidations.add(`F2:F${lastDataRow}`, {
    type: "list",
    allowBlank: false,
    formulae: [`=Lists!$B$1:$B$${nbEnd}`],
    showErrorMessage: true,
    errorStyle: "error",
    errorTitle: "Invalid neighbourhood",
    error: "Pick a neighbourhood from the list.",
  });

  sheet.dataValidations.add(`H2:H${lastDataRow}`, {
    type: "list",
    allowBlank: false,
    formulae: [`"${STERILISATION_LIST}"`],
    showErrorMessage: true,
    errorStyle: "error",
    errorTitle: "Invalid value",
    error: "Choose neutered, not_neutered, or unknown.",
  });

  sheet.dataValidations.add(`K2:K${lastDataRow}`, {
    type: "list",
    allowBlank: false,
    formulae: [`"${AGE_CONF_LIST}"`],
    showErrorMessage: true,
    errorStyle: "error",
    errorTitle: "Invalid value",
    error: "Choose vet_assessed, best_guess, or unknown.",
  });

  const buf = await workbook.xlsx.writeBuffer();
  return Buffer.from(buf);
}
