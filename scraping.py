from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.service import Service
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import json
import random

CURRENT_TIMESTAMP = "2025-04-26 13:11:01"
CURRENT_USER = "souhail4real"

categories = {
    'web-development': ['web', 'developer', 'development', 'javascript', 'react', 'vue', 'angular', 'node', 'php', 'laravel', 'html', 'css', 'bootstrap', 'tailwind', 'wordpress', 'shopify', 'frontend', 'backend', 'full stack'],
    'mobile-development': ['mobile', 'android', 'ios', 'flutter', 'react native', 'kotlin', 'swift', 'dart', 'xamarin', 'ionic', 'app development', 'pwa', 'mobile app'],
    'data-science-ml': ['data', 'machine learning', 'artificial intelligence', 'ai', 'ml', 'python', 'pandas', 'tensorflow', 'pytorch', 'scikit', 'data analysis', 'data scientist', 'big data', 'nlp', 'deep learning', 'neural network'],
    'cybersecurity': ['security', 'cyber', 'ethical hacking', 'penetration testing', 'pen test', 'infosec', 'firewall', 'cryptography', 'encryption', 'vulnerability', 'security audit', 'siem', 'compliance', 'gdpr'],
    'cloud-devops': ['cloud', 'aws', 'azure', 'gcp', 'google cloud', 'devops', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'terraform', 'ansible', 'infrastructure', 'iaas', 'paas', 'saas', 'microservices', 'serverless']
}

def determine_category(description):
    description = description.lower()
    category_matches = {category: sum(1 for keyword in keywords if keyword in description) for category, keywords in categories.items()}
    max_matches = max(category_matches.values(), default=0)
    if max_matches > 0:
        best_categories = [cat for cat, matches in category_matches.items() if matches == max_matches]
        return random.choice(best_categories)
    return 'web-development'

def estimate_price(rating, reviews):
    base_price = 25
    rating_factor = float(rating) / 5.0
    reviews_int = int(reviews) if reviews.isdigit() else 0
    review_factor = min(reviews_int / 100, 2)
    price = int(base_price * (1 + rating_factor * 0.5 + review_factor * 0.5))
    return max(15, min(50, price))

def save_to_json(categorized_data, filename="freelancers.json"):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(categorized_data, f, indent=2, ensure_ascii=False)
    with open("freelancers_with_metadata.json", 'w', encoding='utf-8') as f:
        json.dump({
            "metadata": {"generated_at": CURRENT_TIMESTAMP, "generated_by": CURRENT_USER},
            "categories": categorized_data
        }, f, indent=2, ensure_ascii=False)

def scrape_freelancers():
    service = Service(r"C:\Users\SOUHAIL\Downloads\edgedriver_win64\msedgedriver.exe")
    driver = webdriver.Edge(service=service)
    
    # Set to track usernames and avoid duplicates
    seen_usernames = set()
    all_freelancer_data = []
    
    try:
        # Loop through pages 1 to 50
        for page in range(1, 40):
            print(f"Scraping page {page} of 39...")
            url = f"https://www.peopleperhour.com/services/technology-programming/programming-coding?page={page}"
            
            driver.get(url)
            WebDriverWait(driver, 10).until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, "a.card__user-link⤍HourlieTileMeta⤚F1h11"))
            )

            last_height = driver.execute_script("return document.body.scrollHeight")
            for _ in range(3):
                driver.find_element(By.TAG_NAME, "body").send_keys(Keys.PAGE_DOWN)
                time.sleep(2)
                new_height = driver.execute_script("return document.body.scrollHeight")
                if new_height == last_height:
                    break
                last_height = new_height

            freelancers = driver.find_elements(By.CSS_SELECTOR, "a.card__user-link⤍HourlieTileMeta⤚F1h11")
            page_freelancer_data = []

            for freelancer in freelancers[:15]:
                try:
                    # Get username first to check for duplicates
                    username = freelancer.find_element(By.CSS_SELECTOR, "span.card__username⤍HourlieTileMeta⤚1hJNR").text.strip()
                    
                    # Skip if we've already seen this username
                    if username in seen_usernames:
                        print(f"Skipping duplicate: {username}")
                        continue
                    
                    # Add to our set of seen usernames
                    seen_usernames.add(username)
                    
                    profile_link = freelancer.get_attribute("href")
                    profile_image = freelancer.find_element(By.CSS_SELECTOR, "img").get_attribute("src")
                    rating = freelancer.find_element(By.CSS_SELECTOR, "span.card__freelancer-ratings⤍HourlieTileMeta⤚1zn5P").text.split()[0]
                    reviews_text = freelancer.find_element(By.CSS_SELECTOR, "span.card__freelancer-reviews⤍HourlieTileMeta⤚HCTu6").text.strip()
                    reviews_count = reviews_text.replace("(", "").replace(")", "").strip()

                    page_freelancer_data.append({
                        "profile_link": profile_link,
                        "profile_image": profile_image,
                        "username": username,
                        "rating": rating,
                        "reviews": reviews_count
                    })
                except:
                    continue

            for freelancer in page_freelancer_data:
                try:
                    driver.get(freelancer["profile_link"])
                    WebDriverWait(driver, 10).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "p.member-job"))
                    )
                    short_description = driver.find_element(By.CSS_SELECTOR, "p.member-job").text.strip()
                    freelancer["short_description"] = short_description
                    freelancer["price"] = str(estimate_price(freelancer["rating"], freelancer["reviews"]))
                except:
                    freelancer["short_description"] = "Professional Freelancer"
                    freelancer["price"] = "25"

            # Add the page's data to the accumulated data
            all_freelancer_data.extend(page_freelancer_data)
            
            # Add a small delay between pages
            time.sleep(random.uniform(1, 3))
                
        # Process all collected data
        categorized_data = {cat: [] for cat in categories}
        for freelancer in all_freelancer_data:
            category = determine_category(freelancer["short_description"])
            categorized_data[category].append(freelancer)

        # Ensure each category has at least one freelancer
        for category, freelancers_list in categorized_data.items():
            if len(freelancers_list) == 0 and all_freelancer_data:
                random_freelancer = random.choice(all_freelancer_data)
                for cat, freelancers in categorized_data.items():
                    if random_freelancer in freelancers:
                        freelancers.remove(random_freelancer)
                        break
                categorized_data[category].append(random_freelancer)

        save_to_json(categorized_data)

    finally:
        driver.quit()

if __name__ == "__main__":
    scrape_freelancers()