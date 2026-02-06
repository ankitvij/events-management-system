import { SourceMapConsumer } from 'source-map';
import fs from 'fs';

async function map(generatedFile, line, column) {
  const mapFile = generatedFile + '.map';
  const raw = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
  const consumer = await new SourceMapConsumer(raw);
  const pos = consumer.originalPositionFor({ line, column });
  console.log('mapped ->', pos);
  consumer.destroy();
}

const [,,gen,ln,col] = process.argv;
if(!gen || !ln || !col) {
  console.error('Usage: node map-frame.js <generated-file> <line> <column>');
  process.exit(1);
}
map(gen, parseInt(ln,10), parseInt(col,10)).catch(err=>{console.error(err);process.exit(2);});
