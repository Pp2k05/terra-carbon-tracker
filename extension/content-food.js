// TERRA Content Script - Food Delivery Detection
// Detects food orders on delivery platforms and calculates carbon impact

function initFoodDetection() {
  // Monitor for food orders/cart items
  const observer = new MutationObserver((mutations) => {
    detectFoodOrders()
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  // Initial detection
  detectFoodOrders()
}

function detectFoodOrders() {
  // Look for cart/order items
  const cartElements = document.querySelectorAll(
    '[class*="cart"], [class*="order"], [class*="item"], [class*="meal"]'
  )

  cartElements.forEach((element) => {
    if (element.dataset.terraFoodProcessed) return

    const foodData = extractFoodData(element)
    if (foodData && foodData.items.length > 0) {
      injectFoodCarbonChip(element, foodData)
      element.dataset.terraFoodProcessed = 'true'
    }
  })
}

function extractFoodData(element) {
  const text = element.textContent
  const pricePattern = /\$?\s*([\d,]+(?:\.\d{2})?)/g
  const priceMatches = text.match(pricePattern)

  if (!priceMatches || priceMatches.length === 0) return null

  // Extract restaurant/store name
  const store = document.querySelector('[class*="restaurant"], [class*="vendor"], h1')
  const storeName = store?.textContent.trim() || 'Food Delivery'

  // Count menu items in cart
  const items = document.querySelectorAll('[class*="item"], li')
  const itemCount = Math.min(items.length, 10) // Cap at 10

  // Calculate total order value
  const totalPrice = priceMatches
    .map((p) => parseFloat(p.replace(/[$,]/g, '')))
    .reduce((a, b) => a + b, 0)

  // Food delivery CO2 estimate
  // Average meal: 2-4 kg CO2 (production + packaging + delivery)
  const co2PerMeal = 3.0
  const totalCO2 = co2PerMeal * itemCount

  return {
    store: storeName,
    items: Array(itemCount).fill(null).map((_, i) => `Item ${i + 1}`),
    itemCount,
    price: totalPrice,
    estimatedCO2: Math.round(totalCO2 * 100) / 100,
  }
}

function injectFoodCarbonChip(element, foodData) {
  // Create compact chip
  const chip = document.createElement('div')
  chip.className = 'terra-food-chip'
  chip.innerHTML = `
    <div style="
      display: inline-block;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      margin: 10px 0;
      cursor: pointer;
      border: none;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    ">
      🍽 Order: ${foodData.estimatedCO2} kg CO₂<br>
      <small>${foodData.itemCount} items from ${foodData.store}</small>
    </div>
  `

  // Click to add to TERRA
  chip.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'FOOD_DETECTED',
      payload: {
        store: foodData.store,
        items: foodData.items,
        itemCount: foodData.itemCount,
        price: foodData.price,
        estimatedCO2: foodData.estimatedCO2,
        date: new Date().toISOString(),
        url: window.location.href,
      },
    })

    // Show feedback
    chip.style.backgroundColor = '#059669'
    chip.innerHTML = '✓ Order added to TERRA'
    setTimeout(
      () =>
        (chip.innerHTML = `🍽 Order: ${foodData.estimatedCO2} kg CO₂<br><small>${foodData.itemCount} items from ${foodData.store}</small>`),
      2000
    )
  })

  // Insert near order total or checkout button
  const checkoutBtn = document.querySelector('[class*="checkout"], [class*="submit"], button')
  if (checkoutBtn) {
    checkoutBtn.parentNode.insertBefore(chip, checkoutBtn)
  } else {
    element.appendChild(chip)
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFoodDetection)
} else {
  initFoodDetection()
}

// Re-detect on cart updates
window.addEventListener('load', () => {
  setTimeout(detectFoodOrders, 1000)
})
