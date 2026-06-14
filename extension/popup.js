// TERRA Popup Script
// Manages the extension popup UI and interactions

// DOM Elements
const queueItemsContainer = document.getElementById('queueItems')
const queueEmptyState = document.getElementById('queueEmpty')
const badgeCount = document.getElementById('badgeCount')
const totalCO2 = document.getElementById('totalCO2')
const queueCount = document.getElementById('queueCount')
const syncBtn = document.getElementById('syncBtn')
const openDashboard = document.getElementById('openDashboard')
const dashboardLink = document.getElementById('dashboardLink')

// Initialize popup
async function initPopup() {
  await updateQueueDisplay()
  setupEventListeners()
}

// Update the queue display
async function updateQueueDisplay() {
  const result = await chrome.storage.local.get('queue')
  const queue = result.queue || []

  // Update counts
  const totalCO2Value = queue.reduce((sum, item) => sum + (item.estimatedCO2 || 0), 0)
  totalCO2.textContent = totalCO2Value.toFixed(1)
  queueCount.textContent = queue.length
  badgeCount.textContent = queue.length

  // Update queue display
  if (queue.length === 0) {
    queueEmptyState.style.display = 'block'
    queueItemsContainer.innerHTML = ''
  } else {
    queueEmptyState.style.display = 'none'
    queueItemsContainer.innerHTML = queue
      .slice(-5) // Show last 5 items
      .reverse()
      .map(
        (item, index) => `
      <div class="queue-item">
        <div class="queue-item-name">
          ${getItemEmoji(item.type)} ${item.name || item.store || 'Item'}
        </div>
        <div class="queue-item-co2">
          ${item.estimatedCO2.toFixed(1)} kg
        </div>
      </div>
    `
      )
      .join('')
  }
}

// Get emoji for item type
function getItemEmoji(type) {
  switch (type) {
    case 'product':
      return '🛍'
    case 'flight':
      return '✈'
    case 'food':
      return '🍽'
    default:
      return '🌱'
  }
}

// Setup event listeners
function setupEventListeners() {
  syncBtn.addEventListener('click', syncToCloud)
  openDashboard.addEventListener('click', openDashboardTab)
  dashboardLink.addEventListener('click', (e) => {
    e.preventDefault()
    openDashboardTab()
  })
}

// Sync queue to cloud/dashboard
async function syncToCloud() {
  const result = await chrome.storage.local.get('queue')
  const queue = result.queue || []

  if (queue.length === 0) {
    alert('No items to sync')
    return
  }

  // Prepare sync data
  const syncData = {
    items: queue,
    syncedAt: new Date().toISOString(),
  }

  // Mark items as synced
  const syncedQueue = queue.map((item) => ({
    ...item,
    synced: true,
  }))

  await chrome.storage.local.set({
    queue: syncedQueue,
    lastSync: new Date().toISOString(),
  })

  // Update UI
  syncBtn.textContent = '✓ Synced!'
  syncBtn.disabled = true

  // Log sync (in production, would send to server)
  console.log('[TERRA] Synced items:', syncData)

  // Store sync event
  await chrome.storage.local.set({
    pendingSync: true,
    syncQueue: queue,
  })

  // Reset button
  setTimeout(() => {
    syncBtn.textContent = 'Sync to Dashboard'
    syncBtn.disabled = false
    updateQueueDisplay()
  }, 2000)
}

// Open dashboard in new tab
async function openDashboardTab() {
  const dashboardUrl = 'http://localhost:3000' // Update to your deployed URL

  chrome.tabs.create({ url: dashboardUrl }, (tab) => {
    // The dashboard can check for sync data and import it
    console.log('[TERRA] Opened dashboard tab:', tab.id)
  })
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'QUEUE_UPDATED') {
    updateQueueDisplay()
    sendResponse({ status: 'updated' })
  }
})

// Update display when storage changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.queue) {
    updateQueueDisplay()
  }
})

// Initialize on load
document.addEventListener('DOMContentLoaded', initPopup)
