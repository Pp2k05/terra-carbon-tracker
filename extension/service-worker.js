// TERRA Chrome Extension Service Worker
// Manages background tasks and event handling

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PRODUCT_DETECTED') {
    handleProductDetection(message.payload, sender.tab.id)
    sendResponse({ status: 'queued' })
  } else if (message.type === 'FLIGHT_DETECTED') {
    handleFlightDetection(message.payload, sender.tab.id)
    sendResponse({ status: 'queued' })
  } else if (message.type === 'FOOD_DETECTED') {
    handleFoodDetection(message.payload, sender.tab.id)
    sendResponse({ status: 'queued' })
  }
})

// Store detected products for sync with dashboard
async function handleProductDetection(product, tabId) {
  const { name, price, url, store } = product

  // Estimate CO2 for product
  const estimatedCO2 = estimateProductCO2(product)

  // Queue for storage
  const queue = await getQueue()
  queue.push({
    id: generateId(),
    type: 'product',
    category: 'shopping',
    name,
    price,
    url,
    store,
    estimatedCO2,
    timestamp: new Date().toISOString(),
    synced: false,
  })

  await chrome.storage.local.set({ queue })

  // Show badge
  await chrome.action.setBadgeBackgroundColor({ color: '#22c55e' })
  await chrome.action.setBadgeText({ text: '✓', tabId })
  setTimeout(() => chrome.action.setBadgeText({ text: '' }), 3000)
}

// Handle flight detection
async function handleFlightDetection(flight, tabId) {
  const { from, to, price, date, airline } = flight

  // Estimate CO2 for flight (short/medium/long haul)
  const estimatedCO2 = estimateFlightCO2(flight)

  const queue = await getQueue()
  queue.push({
    id: generateId(),
    type: 'flight',
    category: 'transport',
    from,
    to,
    price,
    date,
    airline,
    estimatedCO2,
    timestamp: new Date().toISOString(),
    synced: false,
  })

  await chrome.storage.local.set({ queue })

  await chrome.action.setBadgeBackgroundColor({ color: '#3b82f6' })
  await chrome.action.setBadgeText({ text: '✈', tabId })
  setTimeout(() => chrome.action.setBadgeText({ text: '' }), 3000)
}

// Handle food detection
async function handleFoodDetection(food, tabId) {
  const { items, store, price } = food

  const estimatedCO2 = estimateFoodCO2(food)

  const queue = await getQueue()
  queue.push({
    id: generateId(),
    type: 'food',
    category: 'food',
    items,
    store,
    price,
    estimatedCO2,
    timestamp: new Date().toISOString(),
    synced: false,
  })

  await chrome.storage.local.set({ queue })

  await chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' })
  await chrome.action.setBadgeText({ text: '🍽', tabId })
  setTimeout(() => chrome.action.setBadgeText({ text: '' }), 3000)
}

// Carbon estimation functions (simplified)
function estimateProductCO2(product) {
  // Product CO2 varies by type
  // Electronics: 50-200 kg, Clothing: 5-20 kg, etc.
  const price = product.price || 0
  // Rough estimate: $1 per 0.1 kg CO2
  return (price / 10) * 0.1
}

function estimateFlightCO2(flight) {
  // Simplified: ~0.1 kg CO2 per km per passenger
  // Short haul (0-500 km): ~50 kg
  // Medium haul (500-2000 km): ~200 kg
  // Long haul (>2000 km): ~500 kg
  const distance = flight.distance || 1000
  return distance * 0.1
}

function estimateFoodCO2(food) {
  // Average meal delivery: 2-4 kg CO2
  // Includes food production + packaging + delivery
  return 3.0
}

// Utility functions
async function getQueue() {
  const result = await chrome.storage.local.get('queue')
  return result.queue || []
}

function generateId() {
  return 'terra-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
}

// Periodic sync with dashboard (when user opens extension)
chrome.action.onClicked.addListener(async () => {
  const queue = await getQueue()
  if (queue.length > 0) {
    // Mark as ready to sync
    await chrome.storage.local.set({ pendingSync: true, queue })
  }
})
