import os
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Get the absolute path to the HTML file
    # The script is in jules-scratch/verification, so we need to go up two levels
    # to the repo root, then into public/games/rpg/battle.html
    base_path = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_path, '..', '..', 'public', 'games', 'rpg', 'battle.html')

    # Check if the file exists before navigating
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Could not find the battle.html file at the expected path: {file_path}")

    page.goto(f'file://{file_path}')

    # Wait for at least one character card to be rendered by the script
    # The `displayCharacters` function in battle.js creates these.
    # It relies on localStorage, but will create placeholder data if it's empty.
    # We will assume that since localStorage is empty, it will create a card for the player.
    # Let's create some mock data in local storage to ensure cards are created.

    player_char_data = {
        "name": "Jules the Valiant",
        "image": "/images/RPG/Charakter/Krieger_m.png",
        "hp": 85,
        "maxHp": 100,
        "mana": 60,
        "maxMana": 100
    }

    npc_party_data = [
        {
            "name": "Seraphina",
            "image": "/images/RPG/Charakter/Heiler_w.png",
            "hp": 70,
            "maxHp": 80,
            "mana": 90,
            "maxMana": 120
        }
    ]

    page.evaluate(f"localStorage.setItem('selectedCharacter', JSON.stringify({player_char_data}));")
    page.evaluate(f"localStorage.setItem('npcParty', JSON.stringify({npc_party_data}));")

    # Reload the page to apply localStorage changes
    page.reload()

    # Now wait for the cards to be visible
    expect(page.locator('.char-card')).to_have_count(2)

    # Wait for the drop zone to be visible and have the correct size
    drop_zone = page.locator('.char-drop-zone').first
    expect(drop_zone).to_be_visible()

    bounding_box = drop_zone.bounding_box()
    assert bounding_box['width'] == 130, f"Drop zone width is {bounding_box['width']}, expected 130"
    assert bounding_box['height'] == 130, f"Drop zone height is {bounding_box['height']}, expected 130"


    # Take a screenshot
    screenshot_path = os.path.join(base_path, 'verification.png')
    page.screenshot(path=screenshot_path)
    print(f"Screenshot saved to {screenshot_path}")

    browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)
