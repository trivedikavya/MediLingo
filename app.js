// Wait for the page to be fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DEFINE VARIABLES ---
    
    // Get all the important elements from the page
    const langSwitcher = document.getElementById('lang-switcher');
    const checkboxContainer = document.getElementById('checkbox-container');
    const generateBtn = document.getElementById('generate-btn');
    const instructionList = document.getElementById('instruction-list');
    const printSheet = document.getElementById('print-sheet');

    // This is a cache to store all loaded translations (en.json, es.json, etc.)
    const allTranslations = {};

    // --- 2. DEFINE FUNCTIONS ---

    /**
     * Loads all language files (en.json, es.json, etc.) into the cache.
     * This runs only once when the page loads.
     */
    async function loadAllTranslations() {
        // Get all language codes from the dropdown
        const languages = Array.from(langSwitcher.options).map(opt => opt.value);

        // Fetch each language file
        for (const lang of languages) {
            try {
                const response = await fetch(`./translations/${lang}.json`);
                if (!response.ok) {
                    throw new Error(`Could not load ${lang}.json`);
                }
                allTranslations[lang] = await response.json();
            } catch (error) {
                console.error(error);
                // If a language fails, at least load English
                if (lang === 'en' && !allTranslations.en) {
                    alert("Error: Could not load base language file 'en.json'.");
                    return;
                }
            }
        }
        
        // After loading, set the default language (English)
        setLanguage('en');
    }

    /**
     * Updates the page text to the selected language.
     * Reads from the 'allTranslations' cache (doesn't re-fetch).
     */
    function setLanguage(lang) {
        if (!allTranslations[lang]) {
            console.error(`Translations for '${lang}' not found.`);
            return;
        }

        const translations = allTranslations[lang];

        // 1. Update all static text (like titles, buttons)
        document.querySelectorAll('[data-key]').forEach(elem => {
            const key = elem.getAttribute('data-key');
            // 'key' will be "ui.title". We split it into "ui" and "title"
            const [section, subkey] = key.split('.');
            
            if (translations[section] && translations[section][subkey]) {
                elem.textContent = translations[section][subkey];
            }
        });

        // 2. Re-create the instruction checkboxes
        checkboxContainer.innerHTML = ''; // Clear old ones
        const instructionKeys = Object.keys(translations.instructions);

        instructionKeys.forEach(key => {
            const text = translations.instructions[key];
            
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = key; // The value is the key (e.g., "inst_1")
            
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(text)); // Add the translated text
            checkboxContainer.appendChild(label);
        });
        
        // 3. Update the <html> tag's lang attribute
        document.documentElement.lang = lang;
        
        // 4. Clear the generated list (since language changed)
        instructionList.innerHTML = '';
    }

    /**
     * Generates the final instruction list when the button is clicked.
     */
    function generateSheet() {
        // Get the currently selected language
        const currentLang = langSwitcher.value;
        const translations = allTranslations[currentLang];

        instructionList.innerHTML = ''; // Clear the old list
        
        const checkedBoxes = checkboxContainer.querySelectorAll('input:checked');
        
        if (checkedBoxes.length === 0) {
            // Show a message if nothing is selected
            const li = document.createElement('li');
            li.textContent = "No instructions selected.";
            li.style.color = "#888";
            instructionList.appendChild(li);
            return;
        }

        // Add each selected instruction to the list
        checkedBoxes.forEach(box => {
            const key = box.value; // e.g., "inst_1"
            const text = translations.instructions[key]; // Get the translated text
            
            const li = document.createElement('li');
            li.textContent = text;
            instructionList.appendChild(li);
        });
    }

    // --- 3. ADD EVENT LISTENERS ---

    // When the user changes the language in the dropdown
    langSwitcher.addEventListener('change', (e) => {
        setLanguage(e.target.value);
    });

    // When the user clicks the "Generate" button
    generateBtn.addEventListener('click', generateSheet);

    // --- 4. INITIALIZE THE APP ---
    
    // Load all translations as soon as the page starts
    loadAllTranslations();
});