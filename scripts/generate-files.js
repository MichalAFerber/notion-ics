import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Example function to generate a file
function generateFile() {
  const dirPath = join(__dirname, '../src');
  const filePath = join(dirPath, 'generated-file.txt');
  const content = 'This is a generated file.';

  // Ensure the directory exists
  mkdirSync(dirPath, { recursive: true });

  // Write the file
  writeFileSync(filePath, content, 'utf8');
  console.log(`File generated at ${filePath}`);
}

// Call the function to generate the file
generateFile();
