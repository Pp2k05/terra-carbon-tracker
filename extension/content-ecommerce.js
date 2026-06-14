// TERRA Content Script - E-commerce Product Detection
// Injects carbon emission chips near product prices on e-commerce sites

// Configuration for different sites
const SITE_CONFIG = {
  'amazon.com': {
    productSelector: '[data-component-type="s-search-result"]',
    priceSelector: '.a-price-whole',
    nameSelector: 'h2 a span',
  },
  'bestbuy.com': {
    productSelector: '[data-sku-id]',
    priceSelector: '.priceView-customer-price',
    nameSelector: '.sku-title',
  },
  'walmart.com': {
    productSelector: '[data-item-id]',
    priceSelector: '[data-automation-id="product-price"]',
    nameSelector: '[data-automation-id="product-title"]',
  },
  'target.com': {
    productSelector: '[data-test="ProductCardWrapper"]',
    priceSelector: '[data-test="@web/ProductPrice"]',
    nameSelector: '[data-test="product-title"]',
  },
  'ebay.com': {
    productSelector: '.s-item',
    priceSelector: '.s-item__price',
    nameSelector: '.s-item__title',
  },
}

// Initialize
function initProductDetection() {
  const hostname = window.location.hostname
  const config = SITE_CONFIG[hostname]

  if (!config) return

  // Detect products
  const products = document.querySelectorAll(config.productSelector)
  products.forEach((product) => {
    const priceElement = product.querySelector(config.priceSelector)
    const nameElement = product.querySelector(config.nameSelector)

    if (priceElement && nameElement) {
      const price = parsePrice(priceElement.textContent)
      const name = nameElement.textContent.trim()

      if (price > 0) {
        injectCarbonChip(product, { name, price }, hostname)
        detectProduct(name, price, hostname)
      }
    }
  })

  // Watch for new products loaded dynamically
  observeNewProducts(config, hostname)
}

// Inject a carbon chip near the price
function injectCarbonChip(productElement, product, store) {
  // Avoid duplicate chips
  if (productElement.querySelector('.terra-carbon-chip')) return

  const estimatedCO2 = (product.price / 10) * 0.1 // Simplified estimate

  const chip = document.createElement('div')
  chip.className = 'terra-carbon-chip'
  chip.innerHTML = `
    <div style="
      display: inline-block;
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      margin-top: 4px;
      cursor: pointer;
      border: none;
    ">
      🌱 ${estimatedCO2.toFixed(2)} kg CO₂
    </div>
  `

  chip.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'PRODUCT_DETECTED',
      payload: {
        name: product.name,
        price: product.price,
        estimatedCO2,
        url: window.location.href,
        store,
      },
    })

    chip.style.backgroundColor = '#10b981'
    chip.textContent = '✓ Added to TERRA'
    setTimeout(() => (chip.textContent = `🌱 ${estimatedCO2.toFixed(2)} kg CO₂`), 2000)
  })

  // Insert after price
  const priceElement = productElement.querySelector('[class*="price"]')
  if (priceElement) {
    priceElement.parentNode.insertBefore(chip, priceElement.nextSibling)
  } else {
    productElement.appendChild(chip)
  }
}

// Detect and report product
function detectProduct(name, price, store) {
  // Only send to service worker if significant price
  if (price > 5) {
    chrome.runtime.sendMessage(
      {
        type: 'PRODUCT_DETECTED',
        payload: {
          name,
          price,
          url: window.location.href,
          store,
        },
      },
      (response) => {
        console.log('[TERRA] Product queued:', { name, price })
      }
    )
  }
}

// Observe dynamically loaded products (infinite scroll)
function observeNewProducts(config, store) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        const products = document.querySelectorAll(config.productSelector)
        products.forEach((product) => {
          if (!product.dataset.terraProcessed) {
            const priceElement = product.querySelector(config.priceSelector)
            const nameElement = product.querySelector(config.nameSelector)

            if (priceElement && nameElement) {
              const price = parsePrice(priceElement.textContent)
              const name = nameElement.textContent.trim()

              if (price > 0) {
                injectCarbonChip(product, { name, price }, store)
                detectProduct(name, price, store)
                product.dataset.terraProcessed = 'true'
              }
            }
          }
        })
      }
    })
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
  })
}

// Helper to parse price from various formats
function parsePrice(priceText) {
  const match = priceText.match(/[\d,]+\.?\d*/g)
  if (match) {
    return parseFloat(match[0].replace(',', ''))
  }
  return 0
}

// Start detection when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProductDetection)
} else {
  initProductDetection()
}

// Re-run detection on page updates
window.addEventListener('load', () => {
  setTimeout(initProductDetection, 1000)
})
