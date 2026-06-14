import os
import re

base_dir = '/Volumes/WorkLife/work/alsaalim/alsaalimperfume.shop'
new_whatsapp_html = '''
<div id="shopify-block-AU0krZXZzNkZxNXNZZ__5394799768760407377" class="shopify-block shopify-app-block"><style>
  .rq-whatsapp-chat-container {
    font-size: 60px;
    bottom: 15px;

      right: 15px;

  }

  .rq-whatsapp-chat-container span {
    background-color: #68d549;
    color: #ffffff;
  }

  /* Define the bounce animation */
  @keyframes custom-bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-20px);
    }
    60% {
      transform: translateY(-10px);
    }
  }

  /* Apply the animation to the container */
  .bounce-effect {
    animation: custom-bounce 2s infinite !important;
  }

  @media screen and (max-width: 768px){
    .rq-whatsapp-chat-container {
      font-size: 60px;
      bottom: 73px;

        right: 30px;

    }
  }
</style>


<div class="align-right rq-whatsapp-chat-container bounce bounce-effect" style="position: fixed !important; bottom: 15px !important; right: 15px !important; width: auto !important; height: auto !important; z-index: 99999 !important;">
  <a target="_blank" href="https://api.whatsapp.com/send?phone=919528394331&amp;text=Hello" data-source="whatsapp_number_v2_metafield" style="display: flex !important; flex-direction: row !important; align-items: center !important; gap: 10px !important; text-decoration: none !important;">

      <span style="background: rgb(104, 213, 73) !important; color: rgb(255, 255, 255) !important; padding: 8px 16px !important; border-radius: 25px !important; font-weight: bold !important; box-shadow: none !important; border-width: medium !important; border-style: none !important; border-color: currentcolor !important; border-image: initial !important; font-size: 16px !important; line-height: 1 !important;">Contact Us</span>

    <div style="--pulse-color: #68d549 !important;">
      <svg viewBox="0 0 69.45 69.45" xmlns="http://www.w3.org/2000/svg" style="width: 60px !important; height: 60px !important;">
        <g data-name="Layer 2">
          <g data-name="Layer 1">
            <circle cx="34.72" cy="34.72" r="34.72" fill="#68d549" stroke="none"></circle>
            <path d="M53.8 33.76a18.74 18.74 0 0 0-37.45-.34v.81A18.49 18.49 0 0 0 19 43.84l-3.37 10L26 50.52a18.77 18.77 0 0 0 27.81-16.29c0-.16 0-.31-.01-.47ZM35.07 49.87a15.71 15.71 0 0 1-8.67-2.59l-6 1.93 2-5.81a15.53 15.53 0 0 1-3-9.17c0-.51 0-1 .08-1.52a15.76 15.76 0 0 1 31.38.3c0 .41.06.81.06 1.22a15.71 15.71 0 0 1-15.85 15.64Z" fill="#ffffff" fill-rule="evenodd" stroke="none"></path>
            <path d="M43.66 38c-.47-.23-2.72-1.34-3.14-1.49s-.73-.22-1 .23-1.23 1.48-1.52 1.77-.54.35-1 .12a12.36 12.36 0 0 1-3.7-2.27 13.37 13.37 0 0 1-2.55-3.15c-.26-.45 0-.7.2-.93s.46-.53.69-.79a2.65 2.65 0 0 0 .17-.22 4 4 0 0 0 .29-.55.83.83 0 0 0 0-.8c-.12-.22-1-2.47-1.43-3.38s-.76-.76-1-.76h-.88a1.68 1.68 0 0 0-1.23.57 5.12 5.12 0 0 0-1.6 3.81 5.45 5.45 0 0 0 .24 1.55 10.11 10.11 0 0 0 1.64 3.16c.22.3 3.17 5.05 7.84 6.89s4.68 1.21 5.52 1.13a4.56 4.56 0 0 0 3.09-2.17 3.82 3.82 0 0 0 .28-2.17c-.15-.22-.45-.33-.91-.55Z" fill="#ffffff" fill-rule="evenodd" stroke="none"></path>
          </g>
        </g>


          <g>
            <ellipse style="fill: rgb(255, 0, 0) !important;" cx="57.823" cy="10.376" rx="9.334" ry="9.334"></ellipse>
            <text style="fill: rgb(255, 255, 255); font-family: Arial, sans-serif; font-size: 25.7px; font-weight: 700;" transform="matrix(0.5111660361289978, 0, 0, 0.5167409777641296, 27.742210388183594, 0.011047000996767586)" x="50.845" y="34.764" dx="1.147" dy="-4.901">
              1
            </text>
          </g>

</svg>
    </div>
  </a>
</div>
<script>
(function () {

  // Prevent running in Shopify Admin or Theme Editor
  try {
    if (
      window.top !== window &&
      window.top.location.hostname.includes('admin.shopify.com')
    ) {
      return;
    }
  } catch (e) {
    return;
  }

  const COOKIE_NAME = 'rq_whatsapp_analytics';
  const SHOP_DOMAIN = '5rqcg6-td.myshopify.com';
  const today = new Date().toISOString().slice(0, 10);

  /* --------------------------
     Cookie Helpers
  ---------------------------*/
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  function setCookie(name, value) {
    const expires = new Date();
    expires.setTime(expires.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days
    document.cookie =
      `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  }

  /* --------------------------
     Initialize analytics object
  ---------------------------*/
  let analytics = {};
  try {
    analytics = JSON.parse(getCookie(COOKIE_NAME) || '{}');
  } catch (e) {
    analytics = {};
  }

  if (!analytics[today]) {
    analytics[today] = { impression: false, clicks: 0 };
  }

  function saveAnalytics() {
    setCookie(COOKIE_NAME, JSON.stringify(analytics));
  }

  /* --------------------------
     IMPRESSION LOGIC (DELAY + USER INTERACTION)
  ---------------------------*/

  let interactionDetected = false;
  let impressionTriggered = false;

  // Called after interaction + delay
  function fireImpression() {
    if (impressionTriggered) return;
    impressionTriggered = true;
    console.log("🔥 Firing impression for:", SHOP_DOMAIN, "Date:", today);
    analytics[today].impression = true;
    saveAnalytics();

    fetch(`https://app.retentionly.io/whatsapp/default/call/json/registerStore?type=33dgfa&sh=${SHOP_DOMAIN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: SHOP_DOMAIN })
    });
  }

  // When user interacts (scroll, click, mousemove, touchstart)
  function userInteracted() {
    if (interactionDetected) return;
    interactionDetected = true;
    //console.log("🟢 User interaction detected — starting 10s delay");
    // Delay 10 seconds BEFORE firing impression
    setTimeout(() => {
      //console.log("⏳ 10 seconds passed — preparing to fire impression");
      if (!analytics[today].impression) {
        fireImpression();
      }
    }, 10000);
  }

  // Attach interaction listeners
  ["click", "scroll", "mousemove", "touchstart"].forEach(evt => {
    window.addEventListener(evt, userInteracted, { once: true, passive: true });
  });

  /* --------------------------
     CLICK TRACKING
  ---------------------------*/
  function trackClick() {
    analytics[today].clicks += 1;
    saveAnalytics();

    fetch(`https://app.retentionly.io/whatsapp/default/call/json/registerStore?type=23xmxs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: "5rqcg6-td.myshopify.com" })
    });
  }

  //console.log("🔍 WhatsApp Debug");
  //console.log("Current Path:", "/");
  //console.log("Hide Paths Raw:", "");
  //console.log("Should Hide Button:", false);


  /* --------------------------
     Initialize WhatsApp Widget
  ---------------------------*/
  function initWhatsAppWidget() {
    const whatsappLink = document.querySelector('.rq-whatsapp-chat-container a');
    if (!whatsappLink) return;

    let updatedMessage = `Hello, `;
    if (true) {
      updatedMessage = updatedMessage.trim();
    }

    const encodedMessage = encodeURIComponent(updatedMessage);
    whatsappLink.href = `https://api.whatsapp.com/send?phone=919528394331&text=${encodedMessage}`;

    whatsappLink.setAttribute('data-source', "whatsapp_number_v2_metafield");

    whatsappLink.addEventListener('click', function () {
      trackClick();
      window.open(whatsappLink.href, '_blank');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhatsAppWidget);
  } else {
    initWhatsAppWidget();
  }

})();
</script>

</div>
'''

def replace_whatsapp_widget(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Try to find the block based on the current state (with or without bounce-effect)
        # We look for the main div block and replace it entirely
        pattern = re.compile(r'<div id="shopify-block-AU0krZXZzNkZxNXNZZ__5394799768760407377".*?<\/script>\s*<\/div>', re.DOTALL)

        new_content, count = re.subn(pattern, new_whatsapp_html, content)

        if count > 0:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Replaced WhatsApp widget in {os.path.relpath(filepath, base_dir)}')
        else:
             # Just in case the id is missing, we use a broader pattern
             pattern2 = re.compile(r'<div[^>]*?rq-whatsapp-chat-container.*?(<script>.*?<\/script>)\s*<\/div>', re.DOTALL)
             new_content, count = re.subn(pattern2, new_whatsapp_html, content)
             if count > 0:
                 with open(filepath, 'w', encoding='utf-8') as f:
                     f.write(new_content)
                 print(f'Replaced WhatsApp widget (fallback regex) in {os.path.relpath(filepath, base_dir)}')

    except Exception as e:
        print(f"Failed to process {filepath}: {e}")

# Walk through the project and apply the fix
for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.html'):
            replace_whatsapp_widget(os.path.join(root, file))

print("Done replacing WhatsApp widget.")