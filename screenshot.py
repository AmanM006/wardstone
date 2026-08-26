from playwright.sync_api import sync_playwright
import time
import os

html_path = f"file:///{os.path.abspath('devpost_diagrams/architecture.html')}"

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1920, "height": 1080})
    page.goto(html_path)
    time.sleep(2)  # Wait for mermaid to render
    
    # Select the pre tag and screenshot it to get just the diagram
    element = page.query_selector("pre.mermaid svg")
    if element:
        element.screenshot(path="devpost_diagrams/architecture_diagram.png")
    else:
        # Fallback to full page
        page.screenshot(path="devpost_diagrams/architecture_diagram.png")
    
    browser.close()

print("Screenshot captured successfully!")
