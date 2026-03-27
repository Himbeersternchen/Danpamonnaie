export interface TutorialStep {
  title: string;
  description: string[];
}

const baseUrl = "http://localhost:8000";
const frontendBaseUrl = "http://localhost:5173";
const innerPackagePath = "./backend/parse_invoice_letter/";
const configPath = innerPackagePath + "config/";
const configFilePath = configPath + "config.json";
const dataPath = innerPackagePath + "data/";
const invoicesPath = dataPath + "invoices/";
const examplePurposeMapPath = configPath + "transfer_purpose_map.example.json";

export const tutorialSteps: TutorialStep[] = [
  {
    title: "1. Start Danpamonnaie & access the admin panel",
    description: [
      `Start Danpamonnaie with Docker — the app is accessible at ${baseUrl}.`,
      `Log into the admin panel with your superuser account at ${baseUrl}/admin.`,
    ],
  },
  {
    title: "2. Create user accounts",
    description: [
      `Create one or more new users under ${baseUrl}/admin/dinoapi/dinoholder/.`,
      "Each user must have a unique nickname — this is required for the system to work correctly.",
    ],
  },
  {
    title: "3. Configure your banks",
    description: [
      `Add your bank information under ${baseUrl}/admin/dinoapi/bank/.`,
      "The bank name must be set and unique.",
      "The date order controls how transactions are sorted in your exported .csv files from your bank.",
      'Use the default process function unless your bank has a specific format — ING is supported via the "ing" preprocess function.',
      "Contributions for other banks are welcome!",
    ],
  },
  {
    title: "4. Create column mappings for your from bank exported .csv files",
    description: [
      `Create column mappings for your bank's .csv files under ${baseUrl}/admin/dinoapi/invoicecolumnmap/.`,
      "Enter the column names as they appear in your .csv files according to the field names.",
      "For csv files from ING, there are no repeated rows for information about iban, account name, etc. — these values are only present in the first few lines of the file.",
      "You just need to specify the column name before the semicolon,",
      'e.g. for "IBAN;XX12 3456 7890 1234 5678 90" you would enter "IBAN" as the iban field.',
      "In the Bank field, specify which bank this mapping applies to.",
      "If you have multiple banks, you can create multiple column mappings.",
    ],
  },
  {
    title: "5. Create bank account for your users",
    description: [
      `Create bank account for your users under ${baseUrl}/admin/dinoapi/bankaccount/ according to your ibans.`,
      "You need to create bank account for every iban number.",
      "A bank account can have multiple users, like a join account.",
    ],
  },
  {
    title:
      "6. Extract descriptions of transactions from your bank exported .csv files",
    description: [
      "Now you need to create transaction purpose patterns to classify the transactions.",
      "Though that to find purpose pattern according the whole transactions is not easy so there a several little tools to help you to create it.",
      "First of all, you need to extract the descriptions of transactions from your bank exported .csv files.",
      `Please create ${configFilePath}, which initially should be copied from config.example.json.`,
      'Then you need to specify "extract_descriptions" in this config file.',
      'For each bank you need to create an element in "INVOICE_FOLDER_PATHS".',
      `"sub_path" is the relative path to ${invoicesPath}, all csv files exported from one bank need to be placed under "sub_path"`,
      '"bank_name" is the name of the bank which is given in the exported csv file under "sub_path", this should not be altered',
      '"OUTPUT_SUBDIR" is the directory where the extracted descriptions will be saved.',
      'After the configuration, you can run a python script under ./backend with "python -m parse_invoice_letter.utils.save_invoice_descriptions" to extract the descriptions of transactions and save them in a new .csv file.',
    ],
  },
  {
    title:
      "7. Create or update purpose patterns according to the descriptions of transactions",
    description: [
      `You could build purpose patterns from the extracted description of transactions with the same structure in ${examplePurposeMapPath}.`,
      "The key is the purpose which will be assigned to the transactions with descriptions matching the regex pattern, and the value is the regex pattern to match the description of transactions.",
      `To determine the number and details of unmatched descriptions, you need to edit ${configFilePath} and specify "find_unmatched".`,
      'The "INVOICE_DESCRIPTIONS_SUBDIR" is the relative path to the directory where the extracted descriptions are saved.',
      '"TRANSFER_PURPOSE_MAP_PATH" is the path to the purpose pattern file.',
      '"OUTPUT_PATH" is the path where the unmatched descriptions will be saved after running the python script with "python -m parse_invoice_letter.utils.find_unmatched_descriptions".',
      "You can iterate this process until you are satisfied with the number and details of unmatched descriptions.",
    ],
  },
  {
    title: "8. Save the prepared purpose patterns into database",
    description: [
      "After you have created the purpose patterns, you have to save them into the database, so that Danpamonnaie can use it.",
      `First of all you still need to edit the ${configFilePath} and specify "process_purpose".`,
      'Set "INIT_PURPOSE" to true, so this script can create/update the purpose patterns in database.',
      'The "TRANSFER_PURPOSE_MAP_PATH" is the path to the purpose pattern file.',
      'After the configuration, you can run a python script under ./backend with "python -m parse_invoice_letter.utils.save_purpose_pattern" to save the purpose patterns into database.',
    ],
  },
  {
    title: "9. Specify unique colors to your purpose patterns",
    description: [
      `After you have saved the purpose patterns into database, you can specify unique colors to your purpose patterns under ${baseUrl}/admin/dinoapi/expenditurepurpose/.`,
      'Check the checkbox of any row, and then select the Action "Asign unique color to every purpose" in the dropdown list over the data table.',
      'Then click the "Go" button right to the dropdown list.',
      "This step helps you to easily identify the transactions with different purposes in bubble plot about your expenditures.",
    ],
  },
  {
    title: "10. Create categories and match them to purposes",
    description: [
      `Now you should create categories with url ${baseUrl}/admin/dinoapi/expenditurecategory/, which can be matched to several purposes.`,
      `After creation of categories, you should go back to ${baseUrl}/admin/dinoapi/expenditurepurpose/ and click into every purpose to choose a right category, which you just created.`,
      "If a purpose does not have a category, then it's category is just a unknown category, which is not considered to be an error.",
      "This step helps you to easily identify the transactions with different categories in sankey plot about your expenditures.",
    ],
  },
  {
    title: "11. login and upload your csv files",
    description: [
      `Now you can go to the ${frontendBaseUrl} to login and upload your csv files with the format you have specified in the column mapping to the selected bank.`,
      "Note: The all csv files in an upload has to be belonged to the same bank.",
      "After uploading, the transactions in your csv files will be processed and classified according to the purpose patterns, and then you can see the transactions with different purposes and categories in the dashboard.",
    ],
  },
  {
    title: "12. Tipps to the repeatable steps",
    description: [
      "The steps 1. to 5. are almost needed to be done once, unless you need to create new users and bank accounts.",
      "You can repeat steps 6. to 10. to update the purpose patterns according to the new transactions with unmatched descriptions.",
      "Mostly you need to repeat the step 11 to keep the dashboard can plot with your recent transaction data",
    ],
  },
];
