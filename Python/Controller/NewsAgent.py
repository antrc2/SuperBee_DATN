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
from urllib3.exceptions import InsecureRequestWarning


# Tắt các cảnh báo SSL không cần thiết
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
load_dotenv()


# --- HẰNG SỐ VÀ CẤU HÌNH TOÀN CỤC ---
GEMINI_API_KEYS = [key.strip() for key in os.getenv("GEMINI_API_KEYS", "").split(',') if key.strip()]
FB_PAGE_ID = os.getenv("FB_PAGE_ID")
FB_PAGE_ACCESS_TOKEN = os.getenv("FB_PAGE_ACCESS_TOKEN")
BACKEND_API_URL_FOR_TOPIC = os.getenv("BACKEND_CATEGORIES_LIST_API_URL")
KEY_INDEX_FILE = 'gemini_key_index.txt'
USER_AGENT_HEADER = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
IMAGE_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.gif', '.webp')


def get_random_topic_from_api():
    """Lấy một chủ đề ngẫu nhiên từ API backend."""
    if not BACKEND_API_URL_FOR_TOPIC:
        print("❌ Agent: Biến môi trường BACKEND_CATEGORIES_LIST_API_URL chưa được cấu hình.")
        return None
    try:
        print(f"📞 Agent: Đang gọi API lấy chủ đề từ '{BACKEND_API_URL_FOR_TOPIC}'...")
        response = requests.get(BACKEND_API_URL_FOR_TOPIC, timeout=10)
        response.raise_for_status()
        data = response.json()

        if isinstance(data, dict) and "name" in data:
            topic = data["name"]
        elif isinstance(data, dict) and "data" in data and isinstance(data["data"], list) and data["data"]:
            topic = random.choice(data["data"]).get("name")
        else:
            print(f"❌ Agent: Không thể trích xuất chủ đề từ cấu trúc JSON trả về: {data}")
            return None

        print(f"✅ Agent: Lấy được chủ đề ngẫu nhiên: '{topic}'")
        return topic
    except requests.RequestException as e:
        print(f"❌ Agent: Lỗi khi gọi API lấy chủ đề: {e}")
    except json.JSONDecodeError:
        print("❌ Agent: Phản hồi từ API không phải là JSON hợp lệ.")
    return None


def search_google_and_scrape(query: str, num_results: int = 20):
    """Tìm kiếm trên Google và cào nội dung từ các trang web."""
    print(f"\n🔎 Agent: Bắt đầu tìm kiếm và cào dữ liệu cho truy vấn '{query}'...")
    scraped_results = []
    
    try:
        search_links = list(search(query, num_results=num_results, lang='vi'))
        if not search_links:
            print("   -> ⚠️ Không tìm thấy kết quả nào từ Google.")
            return []

        print(f"   -> Tìm thấy {len(search_links)} kết quả. Bắt đầu cào nội dung...")

        for i, link in enumerate(search_links):
            try:
                print(f"   -> Đang cào link {i+1}/{len(search_links)}: {link}")
                response = requests.get(link, headers=USER_AGENT_HEADER, timeout=15, verify=False)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')
                content_paragraphs = [p.get_text(strip=True) for p in soup.find_all("p")]
                content = "\n".join(p for p in content_paragraphs if len(p.split()) > 10)

                if not content:
                    print("      -> ⚠️ Bỏ qua: Không tìm thấy nội dung văn bản phù hợp.")
                    continue

                image_url = None
                og_tag = soup.find("meta", property="og:image")
                if og_tag and og_tag.get("content"):
                    potential_url = urljoin(link, og_tag["content"])
                    if potential_url.lower().endswith(IMAGE_EXTENSIONS):
                        image_url = potential_url

                if not image_url:
                    first_img_tag = soup.find("img", src=True)
                    if first_img_tag:
                        potential_url = urljoin(link, first_img_tag["src"])
                        if potential_url.lower().endswith(IMAGE_EXTENSIONS):
                            image_url = potential_url

                scraped_results.append({"link": link, "content": content, "image_url": image_url})
            except requests.RequestException as e:
                print(f"      -> ❌ Lỗi khi cào nội dung từ link: {e}")

        print(f"✅ Agent: Đã cào thành công nội dung từ {len(scraped_results)} bài viết.")
        return scraped_results
    except Exception as e:
        import traceback
        print(f"❌ Agent: Lỗi nghiêm trọng trong quá trình tìm kiếm và cào dữ liệu: {e}")
        traceback.print_exc()
        return []


def get_start_key_index():
    """Lấy và cập nhật chỉ mục của API key Gemini."""
    try:
        with open(KEY_INDEX_FILE, 'r') as f:
            idx = int(f.read().strip())
    except (FileNotFoundError, ValueError):
        idx = 0
    
    if GEMINI_API_KEYS:
        next_idx = (idx + 1) % len(GEMINI_API_KEYS)
        with open(KEY_INDEX_FILE, 'w') as f:
            f.write(str(next_idx))
    return idx


def rewrite_and_decide_with_gemini(article_list, topic):
    """
    Sử dụng Gemini AI để tổng hợp, viết lại nội dung và chọn ảnh.
    
    Returns:
        str: Chuỗi JSON chứa bài viết và URL ảnh đã chọn, hoặc None nếu thất bại.
    """
    if not article_list:
        print("❌ AI Agent: Không có bài viết nào để xử lý.")
        return None
    if not GEMINI_API_KEYS:
        print("❌ AI Agent: Không có API key nào được cấu hình.")
        return None

    combined_content = "\n\n---\n\n".join(f"Nội dung từ nguồn {i+1}:\n{a['content']}" for i, a in enumerate(article_list))
    image_urls = [a['image_url'] for a in article_list if a.get('image_url')]

    prompt = f"""
**BỐI CẢNH:**
Bạn là một AI biên tập viên, chuyên gia phân tích và tổng hợp thông tin để tạo ra các bài đăng sâu sắc, chuyên nghiệp cho Fanpage Facebook.

**DỮ LIỆU NGUỒN ĐƯỢC CUNG CẤP:**
1.  **Chủ đề chính:** "{topic}"
2.  **Tổng hợp nội dung từ các bài viết đã cào về (chủ yếu là tin tức mới):**
    ```
    {combined_content}
    ```
3.  **Danh sách URL ảnh đề xuất (từ các bài viết trên):**
    {json.dumps(image_urls, indent=2, ensure_ascii=False)}

**NHIỆM VỤ CỦA BẠN:**
1.  **VIẾT BÀI ĐĂNG (PHÂN TÍCH & SÁNG TẠO):**
    -   Đọc kỹ và hiểu sâu toàn bộ "Tổng hợp nội dung".
    -   Phân tích, xâu chuỗi các ý chính, loại bỏ thông tin trùng lặp hoặc không liên quan (ví dụ: "Đọc thêm", "Nguồn tin", các câu quảng cáo).
    -   Viết một bài đăng Facebook **DUY NHẤT**, là một **đoạn văn xuôi liền mạch, tự nhiên** dài khoảng 250-400 từ. Giọng văn phải chuyên nghiệp, có chiều sâu, mang lại giá trị cho người đọc.
    -   **TUYỆT ĐỐI KHÔNG** sử dụng lại các tiêu đề, đề mục như "Nội dung từ nguồn 1", "Phần 2" từ dữ liệu nguồn.
    -   Cuối bài, thêm 3-5 hashtag liên quan đến "{topic}".

2.  **CHỌN LỌC HÌNH ẢNH MINH HỌA:**
    -   Xem xét "Danh sách URL ảnh đề xuất".
    -   Chọn ra **DUY NHẤT MỘT (1)** URL ảnh có **chất lượng tốt nhất** và **phù hợp nhất** với nội dung bài viết bạn vừa tạo. Tiêu chí: ảnh rõ nét, đúng chủ đề, có tính thẩm mỹ cao.
    -   Nếu không có ảnh nào đạt yêu cầu, trả về một danh sách rỗng `[]`.

**YÊU CẦU ĐỊNH DẠNG ĐẦU RA (CỰC KỲ QUAN TRỌNG):**
Chỉ trả về một chuỗi JSON hợp lệ duy nhất. TUYỆT ĐỐI không thêm bất kỳ lời chào, giải thích, hay ghi chú nào khác ngoài chuỗi JSON này.

**Cấu trúc JSON bắt buộc:**
```json
{{
  "facebook_post": "Nội dung bài viết Facebook đã được tổng hợp và sáng tạo...",
  "chosen_image_urls": ["url_anh_duy_nhat_da_duoc_chon.jpg"]
}}
"""

    print("\n🧠 AI Agent: Đã tạo prompt, đang gửi đến Gemini để xử lý...")
    start_index = get_start_key_index()

    for i in range(len(GEMINI_API_KEYS)):
        key_index = (start_index + i) % len(GEMINI_API_KEYS)
        api_key = GEMINI_API_KEYS[key_index]
        try:
            print(f"   -> Đang thử với API Key #{key_index + 1}...")
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash-latest')
            safety_settings = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]
            response = model.generate_content(prompt, safety_settings=safety_settings)
            cleaned_response = response.text.strip()
            json_start = cleaned_response.find('{')
            json_end = cleaned_response.rfind('}') + 1

            if json_start != -1 and json_end != 0:
                json_string = cleaned_response[json_start:json_end]
                print(f"✅ AI Agent: Đã nhận phản hồi thành công từ Key #{key_index + 1}.")
                return json_string
            else:
                print(f"   -> ⚠️ Phản hồi từ Key #{key_index + 1} không chứa JSON. Thử key khác...")
        except google_exceptions.ResourceExhausted:
            print(f"   -> ⚠️ AI Agent: Key #{key_index + 1} đã hết hạn mức. Thử key khác...")
        except Exception as e:
            print(f"   -> ❌ AI Agent: Lỗi khi gọi API với Key #{key_index + 1}: {e}")
    
    print("❌ AI Agent: Đã thử tất cả các API key nhưng đều thất bại.")
    return None


def post_to_facebook(message: str, image_urls: list = None):
    """Đăng bài viết lên Fanpage Facebook."""
    if not FB_PAGE_ID or not FB_PAGE_ACCESS_TOKEN:
        return False, "Thiếu cấu hình Facebook (FB_PAGE_ID hoặc FB_PAGE_ACCESS_TOKEN)."

    try:
        graph = facebook.GraphAPI(access_token=FB_PAGE_ACCESS_TOKEN)

        if image_urls and isinstance(image_urls, list) and len(image_urls) > 0:
            first_image_url = image_urls[0]
            print(f"\n🚀 Agent: Chuẩn bị đăng bài kèm ảnh: {first_image_url}")
            
            try:
                print(" -> [Bước 1] Thử đăng ảnh trực tiếp từ URL...")
                graph.put_object(parent_object=FB_PAGE_ID, connection_name="photos", url=first_image_url, message=message)
                print(" -> ✅ Đăng bài kèm ảnh từ URL thành công!")
                return True, f"[https://www.facebook.com/](https://www.facebook.com/){FB_PAGE_ID}"
            except Exception as e1:
                print(f" -> ⚠️ Lỗi khi đăng từ URL: {e1}. Chuyển sang phương án 2...")
                try:
                    print(" -> [Bước 2] Thử tải ảnh về và đăng...")
                    image_response = requests.get(first_image_url, timeout=20, verify=False)
                    image_response.raise_for_status()
                    graph.put_photo(image=image_response.content, message=message, album_path=f"{FB_PAGE_ID}/photos")
                    print(" -> ✅ Tải và đăng ảnh trực tiếp thành công!")
                    return True, f"[https://www.facebook.com/](https://www.facebook.com/){FB_PAGE_ID}"
                except Exception as e2:
                    print(f" -> ⚠️ Lỗi khi tải và đăng: {e2}. Chuyển sang phương án cuối...")
                    print(" -> [Bước 3] Đăng bài dạng chữ làm phương án cuối cùng...")
                    graph.put_object(parent_object=FB_PAGE_ID, connection_name="feed", message=message)
                    print(" -> ✅ Đăng bài dạng chữ thành công!")
                    return True, f"[https://www.facebook.com/](https://www.facebook.com/){FB_PAGE_ID}"
        else:
            print("\n🚀 Agent: Chuẩn bị đăng bài viết dạng chữ (không có ảnh)...")
            graph.put_object(parent_object=FB_PAGE_ID, connection_name="feed", message=message)
            print(" -> ✅ Đăng bài dạng chữ thành công!")
            return True, f"[https://www.facebook.com/](https://www.facebook.com/){FB_PAGE_ID}"

    except facebook.GraphAPIError as e:
        return False, f"Lỗi Graph API Facebook: {e}"
    except Exception as e:
        return False, f"Lỗi không xác định khi đăng bài: {e}"


def generate_and_post_article():
    """Quy trình chính: Lấy chủ đề -> Tìm kiếm & cào -> Viết bài với AI -> Đăng Facebook."""
    try:
        topic = get_random_topic_from_api()
        if not topic:
            return {"status": False, "message": "Thất bại: Không lấy được chủ đề."}
        
        search_query = f"tin tức mới nhất về {topic}"
        articles = search_google_and_scrape(search_query)
        
        if not articles:
            return {"status": False, "message": f"Thất bại: Không tìm thấy nội dung cho chủ đề '{topic}'."}

        ai_json_string = rewrite_and_decide_with_gemini(articles, topic)
        if not ai_json_string:
            return {"status": False, "message": "Thất bại: AI không trả về nội dung."}

        try:
            parsed_data = json.loads(ai_json_string)
            post_message = parsed_data.get("facebook_post", "")
            image_urls = parsed_data.get("chosen_image_urls", [])
        except json.JSONDecodeError:
            print("   -> ⚠️ AI trả về không phải JSON, sẽ coi toàn bộ là nội dung bài viết.")
            post_message = ai_json_string
            image_urls = []

        if not post_message:
            return {"status": False, "message": "Thất bại: Nội dung AI trả về bị rỗng."}

        is_success, result_message = post_to_facebook(post_message, image_urls)

        return {
            "status": is_success,
            "message": "Đăng thành công!" if is_success else f"Lỗi khi đăng: {result_message}",
            "post_url": result_message if is_success else None,
            "content_generated": post_message
        }
    except Exception as e:
        return {"status": False, "message": f"Lỗi hệ thống không xác định: {e}"}


if __name__ == '__main__':
    result = generate_and_post_article()
    print("\n" + "=" * 50)
    print("KẾT QUẢ CUỐI CÙNG CỦA QUY TRÌNH:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    print("=" * 50)