// combine.ts
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync'; // We use the synchronous parser for simplicity in scripts

const sourceDir = path.join(__dirname, 'src/lib/data/sections/csv_source');
const outputFile = path.join(__dirname, 'sections_for_import.csv');

// This will hold all the final, clean rows
const finalCsvRows: string[][] = [];

// 1. Add the header row for our final CSV file. This is the structure our DB expects.
finalCsvRows.push(['id', 'region_name', 'town', 'address', 'video']);

try {
    // 2. Read all filenames from the source directory
    const files = fs.readdirSync(sourceDir);

    for (const file of files) {
        // Process only .csv files
        if (path.extname(file) === '.csv') {
            console.log(`Processing ${file}...`);

            // 3. Extract the region name from the filename.
            // This assumes a format like "01-Благоевград.csv".
            // It takes the part between the first '-' and the '.csv'.
            const baseName = path.basename(file, '.csv'); // e.g., "04-Велико-Търново"
            const firstHyphenIndex = baseName.indexOf('-');
            const regionName = firstHyphenIndex === -1 ? baseName : baseName.substring(firstHyphenIndex + 1);

            const filePath = path.join(sourceDir, file);
            const fileContent = fs.readFileSync(filePath, 'utf8');

            // 4. Parse the CSV content using the library
            const records = parse(fileContent, {
                from_line: 2, // IMPORTANT: Skip the header row of each source file
                skip_empty_lines: true
            });

            // 5. Process each row from the source file
            for (const record of records) {
                // The source CSV has weird extra columns, we only take what we need.
                const id = record[0];
                const town = record[1];
                const address = record[2];
                const video = record[3];

                // Add a new, clean row to our final list with the region name included
                finalCsvRows.push([id, regionName, town, address, video]);
            }
        }
    }

    // 6. Convert the array of arrays back into a proper CSV string
    const outputCsvString = finalCsvRows.map(row =>
        row.map(field => `"${(field || '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    // 7. Write the final string to our output file
    fs.writeFileSync(outputFile, outputCsvString, 'utf8');

    console.log(`\n✅ Success! Combined ${finalCsvRows.length - 1} records into ${outputFile}`);

} catch (error) {
    console.error('An error occurred:', error);
}