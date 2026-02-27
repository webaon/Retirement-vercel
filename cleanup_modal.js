const fs = require('fs');
const path = 'c:/Node/retirement-planner/app/page.tsx';

try {
    const content = fs.readFileSync(path, 'utf8');
    const lines = content.split('\n');

    let startIdx = -1;
    let endIdx = -1;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('{/* OLD CONTENT MASKED */}')) {
            startIdx = i;
        }
        if (lines[i].trim() === '*/ }') {
            endIdx = i;
        }
    }

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        // Remove lines from startIdx to endIdx inclusive
        lines.splice(startIdx, endIdx - startIdx + 1);

        fs.writeFileSync(path, lines.join('\n'), 'utf8');
        console.log(`Successfully removed lines ${startIdx + 1} to ${endIdx + 1}`);
    } else {
        console.log('Could not find marker lines.');
        console.log('Start:', startIdx, 'End:', endIdx);
    }
} catch (e) {
    console.error(e);
}
