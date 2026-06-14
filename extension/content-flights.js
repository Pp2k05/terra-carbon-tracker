// TERRA Content Script - Flight Booking Detection
// Detects flight searches and bookings, calculates carbon footprint

function initFlightDetection() {
  // Monitor flight result containers
  const observer = new MutationObserver((mutations) => {
    detectFlightResults()
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  // Initial detection
  detectFlightResults()
}

function detectFlightResults() {
  // Generic flight result detection
  const flightCards = document.querySelectorAll('[class*="flight"], [class*="result"]')

  flightCards.forEach((card) => {
    if (card.dataset.terraFlightProcessed) return

    // Extract flight info
    const flightData = extractFlightData(card)
    if (flightData) {
      injectFlightCarbonChip(card, flightData)
      card.dataset.terraFlightProcessed = 'true'
    }
  })
}

function extractFlightData(element) {
  // Look for common flight info patterns
  const text = element.textContent.toLowerCase()

  // Extract airports/cities
  const airportPattern = /([A-Z]{3})\s*[-–]\s*([A-Z]{3})/
  const match = element.textContent.match(airportPattern)

  if (!match) return null

  const from = match[1]
  const to = match[2]

  // Extract price
  const pricePattern = /\$?\s*([\d,]+(?:\.\d{2})?)/
  const priceMatch = element.textContent.match(pricePattern)
  const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0

  // Estimate distance (simplified - would use real API in production)
  const distance = estimateFlightDistance(from, to)
  const co2 = estimateFlightCO2(distance)

  return {
    from,
    to,
    distance,
    price,
    co2,
    date: new Date().toISOString(),
  }
}

function injectFlightCarbonChip(element, flightData) {
  const chip = document.createElement('div')
  chip.className = 'terra-flight-chip'
  chip.innerHTML = `
    <div style="
      display: inline-block;
      background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
      color: white;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      margin: 8px 0;
      cursor: pointer;
      border: none;
      text-align: center;
    ">
      ✈ ${flightData.co2} kg CO₂<br>
      <small>${flightData.from} → ${flightData.to}</small>
    </div>
  `

  chip.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'FLIGHT_DETECTED',
      payload: {
        from: flightData.from,
        to: flightData.to,
        price: flightData.price,
        distance: flightData.distance,
        estimatedCO2: flightData.co2,
        date: flightData.date,
        url: window.location.href,
      },
    })

    chip.style.backgroundColor = '#0284c7'
    chip.innerHTML = '✓ Flight added to TERRA'
    setTimeout(
      () =>
        (chip.innerHTML = `✈ ${flightData.co2} kg CO₂<br><small>${flightData.from} → ${flightData.to}</small>`),
      2000
    )
  })

  element.appendChild(chip)
}

// Estimate flight distance (in km) between two airport codes
function estimateFlightDistance(from, to) {
  // Simplified distance estimation
  // In production, would use actual airport coordinates
  const distances = {
    'NYC-LAX': 3944,
    'LAX-NYC': 3944,
    'LDN-LAX': 8616,
    'LDN-NYC': 5570,
    'SFO-LAX': 559,
    'LAX-SFO': 559,
  }

  const key = `${from}-${to}`
  return distances[key] || 1500 // Default 1500 km
}

// Estimate CO2 from flight distance
function estimateFlightCO2(distance) {
  // ~0.1 kg CO2 per km per passenger
  // Plus radiative forcing multiplier of ~1-2
  const co2 = (distance * 0.1 * 1.5) / 1000 // Convert to kg
  return Math.round(co2 * 100) / 100 // Round to 2 decimals
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFlightDetection)
} else {
  initFlightDetection()
}
