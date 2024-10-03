const puppeteer = require('puppeteer');
const fs = require('fs');
const { setTimeout } = require('node:timers/promises');

(async () => {
    // Uruchom przeglądarkę
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Przejdź do strony
    await page.goto('https://ch.tetr.io/u/ribssleep/league', { waitUntil: 'networkidle2' });

    // Object to store opponent appearance counts
    const opponentCounts = {};

    for (let i = 1; i < 1500; i++) {
        // Search for a row with the specified `data-position` attribute
        const element = await page.$(`tr[data-position="${i}"]`);

        if (element) { // Check if the element with the given data-position exists
            // Extract the opponent's username
            const opponentUsername = await element.$eval('.lb.important .user', el => el.textContent.trim());

            // Increment the opponent count in the object
            if (opponentCounts[opponentUsername]) {
                opponentCounts[opponentUsername]++;
            } else {
                opponentCounts[opponentUsername] = 1;
            }

            // Log the opponent's username and current count
            console.log(`Opponent Username: ${opponentUsername}, Count: ${opponentCounts[opponentUsername]}`, `${i}`);
        } else {
            console.log(`No element found with data-position="${i}"`);
        }

        // Scroll down every 50 iterations
        if (i % 50 === 0) {
            await page.evaluate(() => {
                window.scrollBy(0, 10000); // Scroll down by 10000 pixels
            });

            // Wait for 3 seconds before continuing the loop
            await setTimeout(3000);
        }
    }

    // Sort the opponent counts by number of appearances (descending) right before writing to the file
    const sortedResults = Object.entries(opponentCounts)
        .sort(([, countA], [, countB]) => countB - countA) // Sort by count in descending order
        .map(([opponent, count]) => `${opponent}: ${count}`) // Format each entry as 'opponent: count'
        .join('\n');

    // Write the sorted results to a text file
    fs.writeFileSync('opponent_counts_sorted.txt', sortedResults, 'utf8');
    console.log('Opponent counts written to opponent_counts_sorted.txt');

    await browser.close();
})();
