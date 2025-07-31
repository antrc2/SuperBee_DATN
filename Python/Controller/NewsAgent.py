import os
import json
import random
import requests
import facebook
import google.generativeai as genai
from bs4 import BeautifulSoup
from googlesearch import search
from urllib.parse import urljoin
from dotenv import load_dotenv
from google.api_core import exceptions as google_exceptions

# --- Load biến môi trường ---
load_dotenv()

# --- Cấu hình toàn cục ---
GEMINI_API_KEYS_LIST = [key.strip() for key in os.getenv("GEMINI_API_KEYS", "").split(',') if key.strip()]
FB_PAGE_ID = os.getenv("FB_PAGE_ID")
FB_PAGE_ACCESS_TOKEN = os.getenv("FB_PAGE_ACCESS_TOKEN")
BACKEND_API_URL_FOR_TOPIC = os.getenv("BACKEND_CATEGORIES_LIST_API_URL")
KEY_INDEX_FILE = 'gemini_key_index.txt'


def get_random_topic_from_api():
    if not BACKEND_API_URL_FOR_TOPIC:
        print("❌ Agent: Biến môi trường BACKEND_CATEGORIES_LIST_API_URL chưa được cấu hình.")
        return None

    try:
        response = requests.get(BACKEND_API_URL_FOR_TOPIC, timeout=10)
        response.raise_for_status()
        data = response.json()

        if isinstance(data, dict) and "name" in data:
            return data.get("name")
        elif isinstance(data, dict) and "data" in data and isinstance(data["data"], list) and data["data"]:
            return random.choice(data["data"]).get("name")

        print(f"❌ Agent: Không thể lấy chủ đề từ JSON: {data}")
        return None
    except Exception as e:
        print(f"❌ Agent: Lỗi gọi API lấy chủ đề: {e}")
        return None


def search_google_and_scrape(query: str, num_results: int = 20):
    print(f"\n🔎 Agent: Bắt đầu cào dữ liệu cho '{query}'...")
    try:
        initial_links = list(search(query, num_results=num_results, lang='vi'))
        if not initial_links:
            return []

        article_links_to_scrape = set()
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...'}

        for link in initial_links:
            if any(keyword in link for keyword in ['.html', '/chi-tiet/', '/post/', '/bai-viet/']):
                article_links_to_scrape.add(link)
                continue

            try:
                response = requests.get(link, headers=headers, timeout=10, verify=False)
                soup = BeautifulSoup(response.text, 'html.parser')
                for a_tag in soup.find_all('a', href=True):
                    potential_article_url = urljoin(link, a_tag['href'])
                    if any(keyword in potential_article_url for keyword in ['.html', '/chi-tiet/', '/post/', '/bai-viet/']):
                        article_links_to_scrape.add(potential_article_url)
            except requests.RequestException:
                pass

        if not article_links_to_scrape:
            return []

        scraped_results = []
        image_extensions = ('.jpg', '.jpeg', '.png', '.gif', '.webp')

        for article_link in list(article_links_to_scrape)[:num_results]:
            try:
                response = requests.get(article_link, headers=headers, timeout=15, verify=False)
                soup = BeautifulSoup(response.text, 'html.parser')
                content = "\n".join(p.get_text().strip() for p in soup.find_all("p") if p.get_text().strip())
                if not content:
                    continue

                image_url = None
                og_tag = soup.find("meta", property="og:image")
                if og_tag and og_tag.get("content"):
                    potential_url = urljoin(article_link, og_tag["content"])
                    if potential_url.lower().endswith(image_extensions):
                        image_url = potential_url

                if not image_url:
                    first_img_tag = soup.find("img")
                    if first_img_tag and first_img_tag.get("src"):
                        potential_url = urljoin(article_link, first_img_tag["src"])
                        if potential_url.lower().endswith(image_extensions):
                            image_url = potential_url

                scraped_results.append({"link": article_link, "content": content, "image_url": image_url})
            except requests.RequestException as error:
                print(f"         -> Lỗi khi cào nội dung: {error}")

        print(f"✅ Agent: Đã cào thành công {len(scraped_results)} bài viết.")
        return scraped_results
    except Exception as error:
        print(f"❌ Agent: Lỗi nghiêm trọng khi cào dữ liệu: {error}")
        return []


def get_start_key_index():
    try:
        with open(KEY_INDEX_FILE, 'r') as f:
            idx = int(f.read().strip())
    except (FileNotFoundError, ValueError):
        idx = 0
    if GEMINI_API_KEYS_LIST:
        with open(KEY_INDEX_FILE, 'w') as f:
            f.write(str((idx + 1) % len(GEMINI_API_KEYS_LIST)))
    return idx


def rewrite_and_decide_with_gemini(article_list, topic):
    if not article_list or not GEMINI_API_KEYS_LIST:
        return None

    combined_info = "\n".join(
        f"\n--- BÀI VIẾT {i+1} ---\nNỘI DUNG: {a['content']}\nẢNH ĐỀ XUẤT: {a.get('image_url', 'Không có')}"
        for i, a in enumerate(article_list)
    )

    prompt = f"""
Bạn là một AI biên tập viên chuyên nghiệp cho Fanpage Facebook.
Dựa trên các bài viết sau về chủ đề '{topic}', hãy thực hiện các nhiệm vụ sau:

1.  **VIẾT BÀI:** Sáng tạo một bài đăng Facebook DUY NHẤT, dài khoảng 250-400 từ, với giọng văn chuyên nghiệp, sâu sắc. Cuối bài thêm 3-5 hashtag liên quan.
2.  **CHỌN ẢNH:** Từ danh sách \"ẢNH ĐỀ XUẤT\", hãy chọn ra **DUY NHẤT MỘT (1)** ảnh mà bạn cho là đẹp và phù hợp nhất để làm ảnh đại diện cho bài viết. Nếu không có ảnh nào phù hợp, hãy trả về một danh sách rỗng `[]`.

**YÊU CẦU ĐẦU RA (RẤT QUAN TRỌNG):**
Trả về kết quả dưới dạng một chuỗi JSON hợp lệ, không có bất kỳ văn bản giải thích nào khác.

**CẤU TRÚC JSON BẮT BUỘC:**
```json
{{
  "facebook_post": "Nội dung bài viết Facebook bạn đã tạo...",
  "chosen_image_urls": ["url_anh_duy_nhat_ban_da_chon.jpg"]
}}
DỮ LIỆU ĐẦU VÀO:
{combined_info}
"""

    start_index = get_start_key_index()
    for i in range(len(GEMINI_API_KEYS_LIST)):
        key_index = (start_index + i) % len(GEMINI_API_KEYS_LIST)
        api_key = GEMINI_API_KEYS_LIST[key_index].strip()
        if not api_key:
            continue

        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            cleaned_response = response.text.strip().lstrip("```json").rstrip("```").strip()
            return cleaned_response
        except google_exceptions.ResourceExhausted:
            print(f"⚠️ Key {key_index+1} hết hạn mức. Thử key khác...")
        except Exception as e:
            print(f"❌ Lỗi AI với key {key_index+1}: {e}")

    return None


def post_to_facebook(message: str, image_urls: list = None):
    if not FB_PAGE_ID or not FB_PAGE_ACCESS_TOKEN:
        return False, "Thiếu cấu hình Facebook."

    try:
        graph = facebook.GraphAPI(access_token=FB_PAGE_ACCESS_TOKEN)

        if image_urls and isinstance(image_urls, list) and len(image_urls) > 0:
            first_image_url = image_urls[0]
            print(f"\n🚀 Agent: Chuẩn bị đăng bài kèm 1 ảnh: {first_image_url}")
            try:
                graph.put_photo(image=requests.get(first_image_url).content, message=message, album_path=f"{FB_PAGE_ID}/photos")
                print("   -> Đăng thành công!")
            except Exception as e:
                print(f"⚠️ Lỗi khi tải và đăng ảnh {first_image_url}: {e}")
                return False, "Lỗi khi đăng ảnh."
        else:
            print("\n🚀 Agent: Chuẩn bị đăng bài viết chữ...")
            graph.put_object(parent_object=FB_PAGE_ID, connection_name="feed", message=message)

        return True, f"https://www.facebook.com/{FB_PAGE_ID}"
    except Exception as e:
        return False, str(e)


def generate_and_post_article():
    try:
        topic = get_random_topic_from_api()
        if not topic:
            return {"status": False, "message": "Không lấy được chủ đề."}

        articles = search_google_and_scrape(topic)
        if not articles:
            return {"status": False, "message": "Không tìm thấy nội dung từ Google."}

        ai_json_string = rewrite_and_decide_with_gemini(articles, topic)
        if not ai_json_string:
            return {"status": False, "message": "AI không trả về nội dung."}

        try:
            parsed_data = json.loads(ai_json_string)
            post_message = parsed_data.get("facebook_post", "")
            image_urls = parsed_data.get("chosen_image_urls", [])
        except json.JSONDecodeError:
            post_message = ai_json_string
            image_urls = []

        if not post_message:
            return {"status": False, "message": "Nội dung AI trả về bị rỗng."}

        is_success, result_message = post_to_facebook(post_message, image_urls)
        return {
            "status": is_success,
            "message": "Đăng thành công!" if is_success else f"Lỗi: {result_message}",
            "post_url": result_message if is_success else None,
            "content": post_message
        }
    except Exception as e:
        return {"status": False, "message": f"Lỗi hệ thống: {e}"}
